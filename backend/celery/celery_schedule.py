from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder, send_daily_quiz_reminders, generate_monthly_activity_report
from backend.celery.tasks import check_and_send_personalized_reminders, clean_up_old_notifications

celery_app = app.extensions["celery"]

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Daily message at 1:10 PM, everyday
    sender.add_periodic_task(
        crontab(hour=15, minute=6), 
        email_reminder.s(
            'students@gmail.com', 
            'Daily Quiz Check-in Reminder', 
            '<h2>Quiz Platform: Daily Check-in Reminder</h2><p>Hello there!</p><p>Just a friendly reminder to log into your quiz platform today. Regular practice helps reinforce your learning and improve your results.</p><p>Here\'s what you can do today:</p><ul><li>Complete any pending quizzes</li><li>Review your previous quiz attempts</li><li>Check if there are any new quizzes available</li></ul><p>Even just 15 minutes of quiz practice can make a big difference to your understanding!</p><p>See you online,<br>The Quiz Platform Team</p>'
        ), 
        name='daily_reminder'
    )
    
    # Daily user reminders - run every day at 4:08 PM
    sender.add_periodic_task(
        crontab(hour=17, minute=59),  
        send_daily_quiz_reminders.s(),
        name='user_daily_reminders'
    )
    
    # Monthly activity report - run on the 1st of every month at 9:00 AM
    sender.add_periodic_task(
        crontab(day_of_month=1, hour=9, minute=0),
        generate_monthly_activity_report.s(),
        name='monthly_activity_report'
    )
    
    # Check for personalized reminders every 10 minutes
    sender.add_periodic_task(
        crontab(minute='*/10'),
        check_and_send_personalized_reminders.s(),
        name='personalized_reminders'
    )

    # Schedule the clean-up task to run daily at midnight
    sender.add_periodic_task(
        crontab(hour=0, minute=0),  # Midnight daily
        clean_up_old_notifications.s(),
        name='clean_up_old_notifications'
    )

@celery_app.task
def test(arg):
    print(arg)