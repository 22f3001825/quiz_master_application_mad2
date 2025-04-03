from celery import shared_task
from backend.models import Quiz, Score, User, Notification, db
import csv
from datetime import datetime, timedelta, timezone
from backend.celery.mail import send_email
from sqlalchemy import func
from flask import render_template_string
import calendar

@shared_task(ignore_result=False)
def create_csv(user_id):
    scores = Score.query.filter_by(user_id=user_id).all()
    csv_data = [
        ['quiz_id', 'chapter_id', 'date_of_quiz', 'score', 'remarks', 'total_scored', 'total_questions', 'total_marks_scored', 'total_possible_marks', 'percentage', 'time_taken_seconds', 'passed']
    ]

    for score in scores:
        quiz = Quiz.query.get(score.quiz_id)
        csv_data.append([
            quiz.id, quiz.chapter_id, quiz.date_of_quiz, score.total_scored, quiz.remarks,
            score.total_scored, score.total_questions, score.total_marks_scored,
            score.total_possible_marks, score.percentage, score.time_taken_seconds, score.passed
        ])

    file_path = f'./backend/celery/user-downloads/quiz-details-{datetime.now().strftime("%Y%m%d%H%M%S")}.csv'
    with open(file_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(csv_data)

    return file_path

@shared_task(ignore_result=False)
def email_reminder(to, subject, body):
    send_email(to, subject, body)

@shared_task(ignore_result=False)
def send_daily_quiz_reminders():
    """
    Daily job to send reminder emails to users who:
    1. Have new quizzes available that they haven't taken
    """
    # Current time
    current_time = datetime.now(timezone.utc)
    
    # New quizzes from the last 24 hours
    one_day_ago = current_time - timedelta(days=1)
    new_quizzes = Quiz.query.filter(
        Quiz.created_at > one_day_ago,
        Quiz.is_active == True
    ).all()
    
    # Get all users
    users = User.query.all()
    
    # For every user, checking if they have any new quizzes to take
    for user in users:
        # Get quizzes this user hasn't taken yet
        existing_quiz_ids = [score.quiz_id for score in user.scores]
        untaken_quizzes = []
        
        # Check existing new quizzes
        if new_quizzes:
            untaken_quizzes = [quiz for quiz in new_quizzes if quiz.id not in existing_quiz_ids]
        
        # If no new quizzes, check for any quizzes they haven't taken yet
        if not untaken_quizzes:
            all_active_quizzes = Quiz.query.filter_by(is_active=True).all()
            untaken_quizzes = [quiz for quiz in all_active_quizzes if quiz.id not in existing_quiz_ids]
            
            # Limit to 3 quizzes for recommendation
            untaken_quizzes = untaken_quizzes[:3]
        
        if untaken_quizzes:
            # Use user's full name or a fallback if not available
            user_name = user.full_name if user.full_name else user.email
            
            # Create HTML for the email body
            quiz_list_html = ""
            for quiz in untaken_quizzes:
                chapter_name = quiz.chapter.name
                subject_name = quiz.chapter.subject.name
                quiz_list_html += f"<li><strong>{quiz.name}</strong> - {chapter_name} ({subject_name})</li>"
            
            email_body = f"""
            <html>
                <body>
                    <h2>Hello {user_name},</h2>
                    <p>You have {len(untaken_quizzes)} new or pending quizzes available to take:</p>
                    <ul>
                        {quiz_list_html}
                    </ul>
                    <p>Login to your account to attempt these quizzes!</p>
                    <p>Best regards,<br>Qvizz Team</p>
                </body>
            </html>
            """
            
            # Send email reminder
            email_reminder.delay(
                user.email, 
                "Quiz Reminder: New content available for you!", 
                email_body
            )
            
            # Create a notification record
            notification = Notification(
                user_id=user.id,
                type='reminder',
                title='Quiz Reminder',
                message=f'You have {len(untaken_quizzes)} new quizzes available',
                related_id=untaken_quizzes[0].id if untaken_quizzes else None,
                is_sent=True
            )
            
            
            
            # Save to database 
            from flask import current_app
            with current_app.app_context():
                from backend.models import db
                db.session.add(notification)
                db.session.commit()
    
    return f"Processed {len(users)} users for daily reminders"

@shared_task(ignore_result=False)
def generate_monthly_activity_report():
    """
    Generate and send monthly activity reports to all users on the first day of each month.
    The report summarizes the previous month's quiz activity.
    """
    # Only run this task on the first day of the month
    today = datetime.now()
    if today.day != 1:
        return "Not the first day of the month, skipping monthly report generation"
    
    # Calculate previous month's date range
    first_day_prev_month = datetime(today.year, today.month, 1) - timedelta(days=1)
    first_day_prev_month = datetime(first_day_prev_month.year, first_day_prev_month.month, 1)
    last_day_prev_month = datetime(today.year, today.month, 1) - timedelta(days=1)
    
    month_name = calendar.month_name[first_day_prev_month.month]
    year = first_day_prev_month.year
    
    # Process for each user
    users = User.query.filter_by(active=True).all()
    
    for user in users:
        # Get scores for the previous month
        monthly_scores = Score.query.filter(
            Score.user_id == user.id,
            Score.timestamp >= first_day_prev_month,
            Score.timestamp <= last_day_prev_month
        ).all()
        
        if not monthly_scores:
            # Skip users with no activity
            continue
        
        # Calculate statistics
        total_quizzes = len(monthly_scores)
        quizzes_passed = sum(1 for score in monthly_scores if score.passed)
        avg_score = sum(score.percentage for score in monthly_scores) / total_quizzes if total_quizzes > 0 else 0
        best_score = max((score.percentage for score in monthly_scores), default=0)
        total_time = sum(score.time_taken_seconds for score in monthly_scores)
        
        # Format time (seconds to minutes:seconds)
        hours, remainder = divmod(total_time, 3600)
        minutes, seconds = divmod(remainder, 60)
        formatted_time = f"{hours}h {minutes}m {seconds}s"
        
        # Get user ranking 
        # This is a placeholder for the concept
        all_users_avg = {}
        for u in users:
            u_scores = Score.query.filter(
                Score.user_id == u.id,
                Score.timestamp >= first_day_prev_month,
                Score.timestamp <= last_day_prev_month
            ).all()
            if u_scores:
                all_users_avg[u.id] = sum(s.percentage for s in u_scores) / len(u_scores)
        
        # Sort by average score descending
        rankings = sorted(all_users_avg.items(), key=lambda x: x[1], reverse=True)
        user_rank = next((i+1 for i, (uid, _) in enumerate(rankings) if uid == user.id), 0)
        
        # Use user's full name or a fallback if not available
        user_name = user.full_name if user.full_name else user.email
        
        # Generate HTML report
        report_html = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    h1 {{ color: #333366; text-align: center; }}
                    h2 {{ color: #333366; border-bottom: 1px solid #ccc; padding-bottom: 5px; }}
                    .stats {{ background-color: #f5f5f5; padding: 15px; border-radius: 5px; }}
                    .stats table {{ width: 100%; border-collapse: collapse; }}
                    .stats th, .stats td {{ padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }}
                    .quiz-list {{ margin-top: 20px; }}
                    .progress-bar {{ background-color: #e0e0e0; border-radius: 5px; height: 10px; }}
                    .progress {{ background-color: #4CAF50; height: 10px; border-radius: 5px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Monthly Quiz Activity Report</h1>
                    <p>Hello {user_name},</p>
                    <p>Here's your quiz activity summary for {month_name} {year}:</p>
                    
                    <div class="stats">
                        <h2>Monthly Statistics</h2>
                        <table>
                            <tr>
                                <th>Total Quizzes Taken:</th>
                                <td>{total_quizzes}</td>
                            </tr>
                            <tr>
                                <th>Quizzes Passed:</th>
                                <td>{quizzes_passed} ({quizzes_passed/total_quizzes*100:.1f}%)</td>
                            </tr>
                            <tr>
                                <th>Average Score:</th>
                                <td>{avg_score:.1f}%</td>
                            </tr>
                            <tr>
                                <th>Best Score:</th>
                                <td>{best_score:.1f}%</td>
                            </tr>
                            <tr>
                                <th>Total Time Spent:</th>
                                <td>{formatted_time}</td>
                            </tr>
                            <tr>
                                <th>Your Ranking:</th>
                                <td>{user_rank} out of {len(rankings)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="quiz-list">
                        <h2>Quiz Details</h2>
                        <table>
                            <tr>
                                <th>Quiz Name</th>
                                <th>Score</th>
                                <th>Status</th>
                            </tr>
        """
        
        # Add quiz details rows
        for score in monthly_scores:
            quiz = Quiz.query.get(score.quiz_id)
            status = "Passed" if score.passed else "Failed"
            status_color = "#4CAF50" if score.passed else "#F44336"
            
            report_html += f"""
                            <tr>
                                <td>{quiz.name}</td>
                                <td>{score.percentage:.1f}%</td>
                                <td style="color: {status_color}"><strong>{status}</strong></td>
                            </tr>
            """
        
        report_html += """
                        </table>
                    </div>
                    
                    <p>Keep up the good work! Visit the platform to improve your scores.</p>
                    <p>Best regards,<br>Quiz Platform Team</p>
                </div>
            </body>
        </html>
        """
        
        # Send email with report
        email_reminder.delay(
            user.email,
            f"Your Monthly Quiz Activity Report - {month_name} {year}",
            report_html
        )
        
        # Create notification
        notification = Notification(
            user_id=user.id,
            type='monthly_report',
            title=f'Monthly Activity Report - {month_name} {year}',
            message=f'Your monthly activity report for {month_name} {year} has been sent to your email.',
            is_sent=True
        )
        
       
        
        # Save to database
        from flask import current_app
        with current_app.app_context():
            from backend.models import db
            db.session.add(notification)
            db.session.commit()
    
    return f"Monthly reports generated and sent to {len(users)} users"

@shared_task(ignore_result=False)
def check_and_send_personalized_reminders():
    """
    A simpler version that doesn't rely on user preferences in the database.
    Just check the current hour and use the main reminder logic.
    """
    current_time = datetime.now()
    
    # Only run at certain hours (e.g., 7 PM)
    if current_time.hour == 19 and current_time.minute < 10:
        # Reuse the existing reminder function
        return send_daily_quiz_reminders()
    
    return "Not reminder time"

@shared_task(ignore_result=False)
def clean_up_old_notifications():
    """
    Task to clean up notifications older than a specified time period (e.g., 1 day).
    """
    # Define the time period (e.g., 1 day)
    time_period = timedelta(days=1)
    cutoff_time = datetime.now(timezone.utc) - time_period
    
    # Delete notifications older than the cutoff time
    old_notifications = Notification.query.filter(Notification.created_at < cutoff_time).all()
    for notification in old_notifications:
        db.session.delete(notification)
    
    db.session.commit()
    
    return f"Deleted {len(old_notifications)} old notifications"