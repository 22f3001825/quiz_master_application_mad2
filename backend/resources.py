from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user, roles_required
from backend.models import User, Role, Subject, Chapter, Quiz, Question, Feedback, Score, Notification,db
from datetime import date, timedelta
from datetime import datetime, timezone
cache = app.cache
api = Api(prefix='/api')

class DateString(fields.Raw):
    def format(self, value):
        if isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return str(value)

user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'roles': fields.List(fields.String(attribute='name')),  # Corrected attribute for roles
    'full_name': fields.String,
    'qualification': fields.String,
    'dob': DateString,
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime,
    'last_active': fields.DateTime,
}
subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime,
}

chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'subject_id': fields.Integer,
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime,
}

quiz_fields = {
    'id': fields.Integer,
    'chapter_id': fields.Integer,
    'name': fields.String,
    'date_of_quiz': fields.String,
    'time_duration_hours': fields.Integer,
    'time_duration_minutes': fields.Integer,
    'remarks': fields.String,
    'is_active': fields.Boolean,
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime,
}

question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'question_statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.Integer,
    'explanation': fields.String,
    'difficulty_level': fields.String,
    'created_at': fields.DateTime,
    'updated_at': fields.DateTime,
}

feedback_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'question_id': fields.Integer,
    'quiz_id': fields.Integer,
    'selected_option': fields.Integer,
    'is_correct': fields.Boolean,
    'feedback_message': fields.String,
    'timestamp': fields.DateTime,
}


score_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'quiz_id': fields.Integer,
    'timestamp': fields.DateTime,
    'total_scored': fields.Integer,
    'total_questions': fields.Integer,
    'total_marks_scored': fields.Integer,
    'total_possible_marks': fields.Integer,
    'percentage': fields.Float,
    'time_taken_seconds': fields.Integer,
    'passed': fields.Boolean,
}

notification_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'type': fields.String,
    'title': fields.String,
    'message': fields.String,
    'related_id': fields.Integer,
    'is_read': fields.Boolean,
    'is_sent': fields.Boolean,
    'created_at': fields.DateTime,
}




# Helper function to get JSON data and validate it
def get_json_data(required_fields):
    data = request.get_json()
    if not data:
        return {"message": "No input data provided"}, 400

    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return {"message": f"Missing fields: {', '.join(missing_fields)}"}, 400

    return data


class UserAPI(Resource):
    @marshal_with(user_fields)
    @auth_required('token')  
    def get(self, user_id):
        try:
            # Check if the current user is an admin or the user whose profile is being accessed
            if current_user.id == user_id or current_user.has_role('admin'):
                user = User.query.get(user_id)
                if not user:
                    print(f"User with ID {user_id} not found")  # Debug log
                    return {"message": "User not found"}, 404
                print(f"User found: {user}")  # Debug log
                return user
            else:
                print("Unauthorized access attempt")  # Debug log
                return {"message": "Unauthorized access"}, 403
        except Exception as e:
            db.session.rollback()
            print(f"Error fetching user: {e}")  # Log the error
            return {"message": "Internal Server Error"}, 500
    def delete(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted"}, 200
    


# User List API
class UserListAPI(Resource):
    #@cache.memoize(timeout=10)
    @marshal_with(user_fields)
    def get(self):
        query = request.args.get('query')
        if query:
            users = User.query.join(User.roles).filter(
                Role.name == 'user',
                User.active == True,
                User.email.ilike(f'%{query}%')
            ).all()
        else:
            users = User.query.join(User.roles).filter(Role.name == 'user', User.active == True).all()
        return users
    def delete(self):
        User.query.delete()
        db.session.commit()
        return {"message": "All users deleted"}, 200


# Subject API
class SubjectAPI(Resource):
    @marshal_with(subject_fields)
    
    def get(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        return subject

    @auth_required('token')
 
    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        db.session.delete(subject)
        db.session.commit()
        return {"message": "Subject deleted"}, 200

    @auth_required('token')

    def put(self, subject_id):
        required_fields = ['name', 'description']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        subject.name = data['name']
        subject.description = data['description']
        db.session.commit()
        return {"message": "Subject updated"}, 200


# Subject List API
class SubjectListAPI(Resource):
    #@cache.cached(timeout = 5, key_prefix = 'subject_list')
    @marshal_with(subject_fields)
    def get(self):
        subjects = Subject.query.all()
        return subjects

    @auth_required('token')

    def post(self):
        required_fields = ['name', 'description']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        subject = Subject(name=data['name'], description=data['description'])
        db.session.add(subject)
        db.session.commit()
        return {"message": "Subject created"}, 201


# Chapter API
class ChapterAPI(Resource):
    @marshal_with(chapter_fields)
    def get(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        return chapter

    @auth_required('token')
    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted"}, 200

    @auth_required('token')
    def put(self, chapter_id):
        required_fields = ['name', 'description', 'subject_id', 'is_active']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        chapter.name = data['name']
        chapter.description = data['description']
        chapter.subject_id = data['subject_id']
        chapter.is_active = data['is_active'] 
        db.session.commit()
        return {"message": "Chapter updated"}, 200

# Chapter List API
class ChapterListAPI(Resource):
    #@cache.cached(timeout = 5, key_prefix = 'chapter_list')
    @marshal_with(chapter_fields)
    def get(self):
        chapters = Chapter.query.all()
        return chapters

    @auth_required('token')
    def post(self):
        required_fields = ['name', 'description', 'subject_id', 'is_active']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        chapter = Chapter(name=data['name'], description=data['description'], subject_id=data['subject_id'], is_active=data['is_active'])
        db.session.add(chapter)
        db.session.commit()
        return {"message": "Chapter created"}, 201


class QuizAPI(Resource):
    @marshal_with(quiz_fields)
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        return quiz

    @auth_required('token')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted"}, 200

    @auth_required('token')
    def put(self, quiz_id):
        required_fields = ['name', 'date_of_quiz', 'time_duration_hours', 'time_duration_minutes', 'remarks', 'is_active']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        quiz.name = data['name']
        quiz.date_of_quiz = data['date_of_quiz']
        quiz.time_duration_hours = data['time_duration_hours']
        quiz.time_duration_minutes = data['time_duration_minutes']
        quiz.remarks = data['remarks']
        quiz.is_active = data['is_active']
        db.session.commit()
        return {"message": "Quiz updated"}, 200

class QuizListAPI(Resource):
   # @cache.cached(timeout = 5, key_prefix = 'quiz_list')
    @marshal_with(quiz_fields)
    def get(self):
        quizzes = Quiz.query.all()
        return quizzes

    @auth_required('token')
    def post(self):
        required_fields = ['chapter_id', 'name', 'date_of_quiz', 'time_duration_hours', 'time_duration_minutes', 'remarks', 'is_active']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        try:
            quiz = Quiz(
                chapter_id=data['chapter_id'],
                name=data['name'],
                date_of_quiz=data['date_of_quiz'],
                time_duration_hours=data['time_duration_hours'],
                time_duration_minutes=data['time_duration_minutes'],
                remarks=data['remarks'],
                is_active=data['is_active']
            )
            db.session.add(quiz)
            db.session.commit()
            return {"message": "Quiz created"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Internal Server Error: " + str(e)}, 500


# Question API
class QuestionAPI(Resource):
    @marshal_with(question_fields)
    def get(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        return question

    @auth_required('token')
    
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        db.session.delete(question)
        db.session.commit()
        return {"message": "Question deleted"}, 200

    @auth_required('token')

    def put(self, question_id):
        required_fields = ['question_statement', 'option1', 'option2', 'option3', 'option4', 'correct_option', 'explanation', 'difficulty_level']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        question.question_statement = data['question_statement']
        question.option1 = data['option1']
        question.option2 = data['option2']
        question.option3 = data['option3']
        question.option4 = data['option4']
        question.correct_option = data['correct_option']
        question.explanation = data['explanation']
        question.difficulty_level = data['difficulty_level']
        db.session.commit()
        return {"message": "Question updated"}, 200



class QuestionListAPI(Resource):
    # @cache.cached(timeout = 5, key_prefix = 'question_list')
    @marshal_with(question_fields)
    def get(self):
        questions = Question.query.all()
        return questions

    @auth_required('token')
    def post(self):
        if not request.is_json:
            return {"message": "Request must be JSON"}, 400

        data = request.get_json()

        if isinstance(data, list):  # Handle multiple questions
            required_fields = ['quiz_id', 'question_statement', 'option1', 'option2', 'option3', 'option4', 'correct_option', 'explanation', 'difficulty_level']
            questions = []

            for item in data:
                missing_fields = [field for field in required_fields if field not in item]
                if missing_fields:
                    return {"message": f"Missing fields in request: {', '.join(missing_fields)}"}, 400

                question = Question(
                    quiz_id=item['quiz_id'],
                    question_statement=item['question_statement'],
                    option1=item['option1'],
                    option2=item['option2'],
                    option3=item['option3'],
                    option4=item['option4'],
                    correct_option=item['correct_option'],
                    explanation=item['explanation'],
                    difficulty_level=item['difficulty_level']
                )
                questions.append(question)
            
            db.session.bulk_save_objects(questions)
            db.session.commit()
            return {"message": f"{len(questions)} questions created"}, 201

        elif isinstance(data, dict):  # Handle single question
            required_fields = ['quiz_id', 'question_statement', 'option1', 'option2', 'option3', 'option4', 'correct_option', 'explanation', 'difficulty_level']

            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return {"message": f"Missing fields in request: {', '.join(missing_fields)}"}, 400

            question = Question(
                quiz_id=data['quiz_id'],
                question_statement=data['question_statement'],
                option1=data['option1'],
                option2=data['option2'],
                option3=data['option3'],
                option4=data['option4'],
                correct_option=data['correct_option'],
                explanation=data['explanation'],
                difficulty_level=data['difficulty_level']
            )
            db.session.add(question)
            db.session.commit()
            return {"message": "Question created"}, 201

        else:
            return {"message": "Invalid input, expected a dictionary or a list of dictionaries"}, 400

@app.route('/api/quizzes/<int:quiz_id>', methods=['GET'])
#@auth_required('token')
def get_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        quiz_data = {
            'id': quiz.id,
            'name': quiz.name,
            'passing_percentage': quiz.passing_percentage,  # Add this line
            'duration': {
                'hours': quiz.time_duration_hours,
                'minutes': quiz.time_duration_minutes
            },
            'remarks': quiz.remarks,
            'questions': []
        }

        return jsonify(quiz_data), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching quiz: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500

@app.route('/api/quizzes/<int:quiz_id>/questions', methods=['GET'])
#@auth_required('token')
def get_quiz_questions(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({"message": "Quiz not found"}), 404

        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        question_list = [{
            'id': q.id,
            'question_statement': q.question_statement,
            'options': [q.option1, q.option2, q.option3, q.option4],
            'correct_option': q.correct_option  
        } for q in questions]

        return jsonify(question_list), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching quiz questions: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500




@app.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
#@auth_required('token')
def submit_quiz(quiz_id):
    try:
        data = request.json
        user_id = current_user.id
        user_answers = data.get('answers', {})
        app.logger.info(f'Starting quiz submission for user_id: {user_id}, quiz_id: {quiz_id}, answers: {user_answers}')

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            app.logger.warning(f'Quiz not found: quiz_id {quiz_id}')
            return jsonify({"message": "Quiz not found"}), 404

        # Fetch questions and initialize variables
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        total_questions = len(questions)
        correct_answers = 0
        question_results = []

        # Process each question
        for question in questions:
            submitted_answer = user_answers.get(str(question.id))
            if submitted_answer is None:
                app.logger.warning(f'Answer missing for question_id: {question.id}')
                continue  # Skip this question if no answer is provided

            correct_answer = question.correct_option
            app.logger.info(f'Question ID: {question.id} - Submitted Answer: {submitted_answer}, Correct Answer: {correct_answer}')
            is_correct = int(submitted_answer) == correct_answer

            # Store feedback
            feedback = Feedback(
                user_id=user_id,
                question_id=question.id,
                quiz_id=quiz_id,
                selected_option=submitted_answer,
                is_correct=is_correct,
                feedback_message='',
                timestamp=datetime.now(timezone.utc)
            )
            db.session.add(feedback)

            # Store question result
            question_results.append({
                'question_id': question.id,
                'question_statement': question.question_statement,
                'submitted_answer': submitted_answer,
                'correct_answer': correct_answer,
                'is_correct': is_correct,
                'options': [question.option1, question.option2, question.option3, question.option4],
                'explanation': question.explanation
            })
            app.logger.info(f'Question ID: {question.id}, Submitted Answer: {submitted_answer}, Correct Answer: {correct_answer}, Is Correct: {is_correct}')

            # Increment correct answers count if correct
            if is_correct:
                correct_answers += 1

        # Calculate score
        percentage = (correct_answers / total_questions) * 100
        time_taken_seconds = data.get('time_taken_seconds', 0)
        passed = percentage >= quiz.passing_percentage

        # Store score
        score = Score(
            user_id=user_id,
            quiz_id=quiz_id,
            total_scored=correct_answers,
            total_questions=total_questions,
            total_marks_scored=correct_answers,
            total_possible_marks=total_questions,
            percentage=percentage,
            time_taken_seconds=time_taken_seconds,
            passed=passed,
            timestamp=datetime.now(timezone.utc)
        )

        db.session.add(score)
        db.session.commit()

        app.logger.info(f'Score created: {score}')

        # Return response
        return jsonify({
            "message": "Quiz submitted successfully",
            "score": {
                "user_id": score.user_id,
                "quiz_id": score.quiz_id,
                "total_scored": score.total_scored,
                "total_questions": score.total_questions,
                "total_marks_scored": score.total_marks_scored,
                "total_possible_marks": score.total_possible_marks,
                "percentage": score.percentage,
                "time_taken_seconds": score.time_taken_seconds,
                "passed": score.passed,
                "timestamp": score.timestamp
            },
            "question_results": question_results
        }), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error('An error occurred while submitting quiz: %s', str(e), exc_info=True)
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500
@app.route('/api/quizzes/<int:quiz_id>/results', methods=['GET'])
#@auth_required('token')
def get_quiz_results(quiz_id):
    try:
        user_id = current_user.id
        app.logger.info(f'Fetching results for user_id: {user_id}, quiz_id: {quiz_id}')

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            app.logger.warning(f'Quiz not found: quiz_id {quiz_id}')
            return jsonify({"message": "Quiz not found"}), 404

        # Fetch the most recent score for the user and quiz
        score = Score.query.filter_by(user_id=user_id, quiz_id=quiz_id).order_by(Score.timestamp.desc()).first()
        if not score:
            app.logger.warning(f'Score not found for user_id: {user_id}, quiz_id: {quiz_id}')
            return jsonify({"message": "Score not found"}), 404

        # Fetch the questions and user's answers
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        question_results = []

        for question in questions:
            # Fetch the most recent feedback before or at the score's timestamp
            feedback = Feedback.query.filter_by(
                user_id=user_id, 
                question_id=question.id
            ).filter(
                Feedback.timestamp <= score.timestamp
            ).order_by(
                Feedback.timestamp.desc()
            ).first()
    
            submitted_answer = feedback.selected_option if feedback else None
            is_correct = feedback.is_correct if feedback else False
            question_results.append({
                'question_id': question.id,
                'question_statement': question.question_statement,
                'submitted_answer': submitted_answer,
                'correct_answer': question.correct_option,
                'is_correct': is_correct,
                'options': [question.option1, question.option2, question.option3, question.option4],
                'explanation': question.explanation
            })

        return jsonify({
            "score": {
                "user_id": score.user_id,
                "quiz_id": score.quiz_id,
                "total_scored": score.total_scored,
                "total_questions": score.total_questions,
                "total_marks_scored": score.total_marks_scored,
                "total_possible_marks": score.total_possible_marks,
                "percentage": score.percentage,
                "time_taken_seconds": score.time_taken_seconds,
                "passed": score.passed,
                "timestamp": score.timestamp
            },
            "question_results": question_results
        }), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching quiz results: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500
@app.route('/api/scores', methods=['GET'])
#@auth_required('token')
def get_scores():
    try:
        user_id = current_user.id
        app.logger.info(f'Fetching scores for user_id: {user_id}')
        scores = Score.query.filter_by(user_id=user_id).order_by(Score.timestamp.desc()).all()
        scores_data = [{
            "id": score.id,
            "user_id": score.user_id,
            "quiz_id": score.quiz_id,
            "timestamp": score.timestamp,
            "total_scored": score.total_scored,
            "total_questions": score.total_questions,
            "total_marks_scored": score.total_marks_scored,
            "total_possible_marks": score.total_possible_marks,
            "percentage": score.percentage,
            "time_taken_seconds": score.time_taken_seconds,
            "passed": score.passed
        } for score in scores]
        app.logger.info(f'Scores fetched: {scores_data}')
        return jsonify(scores_data), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching scores: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500

# Score API
class ScoreAPI(Resource):
    @marshal_with(score_fields)
    def get(self, score_id):
        score = Score.query.get(score_id)
        if not score:
            return {"message": "Score not found"}, 404
        return score
class ScoreResource(Resource):
    @marshal_with(score_fields)
    @auth_required('token')
    def get(self):
        try:
            user_id = current_user.id
            app.logger.info(f'Fetching scores for user_id: {user_id}')
            scores = Score.query.filter_by(user_id=user_id).all()
            app.logger.info(f'Scores fetched: {scores}')
            return scores, 200
        except Exception as e:
            app.logger.error('An error occurred while fetching scores: %s', str(e))
            return {"message": "Internal Server Error", "error": str(e)}, 500

    
    
    def delete(self, score_id):
        score = Score.query.get(score_id)
        if not score:
            return {"message": "Score not found"}, 404
        db.session.delete(score)
        db.session.commit()
        return {"message": "Score deleted"}, 200

  
    def put(self, score_id):
        required_fields = [
            'total_scored', 'total_questions', 'total_marks_scored', 
            'total_possible_marks', 'percentage', 'time_taken_seconds', 'passed'
        ]
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        score = Score.query.get(score_id)
        if not score:
            return {"message": "Score not found"}, 404
        score.total_scored = data['total_scored']
        score.total_questions = data['total_questions']
        score.total_marks_scored = data['total_marks_scored']
        score.total_possible_marks = data['total_possible_marks']
        score.percentage = data['percentage']
        score.time_taken_seconds = data['time_taken_seconds']
        score.passed = data['passed']
        db.session.commit()
        return {"message": "Score updated"}, 200



# Score List API
class ScoreListAPI(Resource):
    @marshal_with(score_fields)
    def get(self):
        scores = Score.query.all()
        return scores

    

    def post(self):
        required_fields = [
            'user_id', 'quiz_id', 'total_scored', 'total_questions', 
            'total_marks_scored', 'total_possible_marks', 'percentage', 'time_taken_seconds', 'passed'
        ]
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        score = Score(
            user_id=data['user_id'],
            quiz_id=data['quiz_id'],
            total_scored=data['total_scored'],
            total_questions=data['total_questions'],
            total_marks_scored=data['total_marks_scored'],
            total_possible_marks=data['total_possible_marks'],
            percentage=data['percentage'],
            time_taken_seconds=data['time_taken_seconds'],
            passed=data['passed']
        )
        db.session.add(score)
        db.session.commit()
        return {"message": "Score created"}, 201
@app.route('/api/users/<int:user_id>/stats', methods=['GET'])
#@auth_required('token')
def get_user_stats(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Calculate user statistics
        total_quizzes = Score.query.filter_by(user_id=user_id).count()
        avg_score = db.session.query(db.func.avg(Score.percentage)).filter_by(user_id=user_id).scalar() or 0
        pass_rate = db.session.query(db.func.avg(db.case((Score.passed == True, 1), else_=0))).filter_by(user_id=user_id).scalar() or 0

        stats = {
            "totalQuizzes": total_quizzes,
            "avgScore": round(avg_score, 2),
            "passRate": round(pass_rate * 100, 2)
        }

        return jsonify(stats), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching user stats: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500
@app.route('/api/users/<int:user_id>/scores', methods=['GET'])
#@auth_required('token')
def get_user_scores(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        scores = Score.query.filter_by(user_id=user_id).order_by(Score.timestamp.desc()).all()
        scores_data = [{
            "id": score.id,
            "user_id": score.user_id,
            "quiz_id": score.quiz_id,
            "quiz_name": score.quiz.name,
            "timestamp": score.timestamp,
            "total_scored": score.total_scored,
            "total_questions": score.total_questions,
            "total_marks_scored": score.total_marks_scored,
            "total_possible_marks": score.total_possible_marks,
            "percentage": score.percentage,
            "time_taken_seconds": score.time_taken_seconds,
            "passed": score.passed
        } for score in scores]

        return jsonify(scores_data), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching user scores: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500
  
# Feedback API
class FeedbackAPI(Resource):
    @marshal_with(feedback_fields)
    def get(self, feedback_id):
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return {"message": "Feedback not found"}, 404
        return feedback

    @auth_required('token')

    def delete(self, feedback_id):
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return {"message": "Feedback not found"}, 404
        db.session.delete(feedback)
        db.session.commit()
        return {"message": "Feedback deleted"}, 200

    @auth_required('token')
 
    def put(self, feedback_id):
        required_fields = ['selected_option', 'is_correct', 'feedback_message']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return {"message": "Feedback not found"}, 404
        feedback.selected_option = data['selected_option']
        feedback.is_correct = data['is_correct']
        feedback.feedback_message = data['feedback_message']
        db.session.commit()
        return {"message": "Feedback updated"}, 200


# Feedback List API
class FeedbackListAPI(Resource):
    @marshal_with(feedback_fields)
    def get(self):
        feedbacks = Feedback.query.all()
        return feedbacks

    @auth_required('token')

    def post(self):
        required_fields = ['user_id', 'question_id', 'quiz_id', 'selected_option', 'is_correct', 'feedback_message']
        data = get_json_data(required_fields)
        if isinstance(data, tuple):
            return data

        feedback = Feedback(
            user_id=data['user_id'],
            question_id=data['question_id'],
            quiz_id=data['quiz_id'],
            selected_option=data['selected_option'],
            is_correct=data['is_correct'],
            feedback_message=data['feedback_message']
        )
        db.session.add(feedback)
        db.session.commit()
        return {"message": "Feedback created"}, 201
@auth_required('token')
def get_summary_stats():
    try:
        total_users = User.query.count()
        total_quizzes = Quiz.query.count()
        total_attempts = Score.query.count()
        avg_score = db.session.query(db.func.avg(Score.percentage)).scalar() or 0

        summary = {
            "totalUsers": total_users,
            "totalQuizzes": total_quizzes,
            "totalAttempts": total_attempts,
            "avgScore": round(avg_score, 2)
        }

        return jsonify(summary), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching summary stats: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500
@auth_required('token')
def get_quiz_attempts():
    try:
        scores = Score.query.order_by(Score.timestamp.desc()).limit(100).all()
        attempts = [{
            "id": score.id,
            "user_name": score.user.full_name,
            "quiz_name": score.quiz.name,
            "percentage": score.percentage,
            "total_marks_scored": score.total_marks_scored,
            "total_possible_marks": score.total_possible_marks,
            "timestamp": score.timestamp,
            "time_taken_seconds": score.time_taken_seconds,
            "passed": score.passed
        } for score in scores]

        return jsonify(attempts), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching quiz attempts: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500


@auth_required('token')
def get_chart_data():
    try:
        # Quiz Attempts by Day (last 30 days)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        attempts_by_day = db.session.query(
            db.func.date(Score.timestamp),
            db.func.count(Score.id)
        ).filter(
            Score.timestamp >= start_date
        ).group_by(
            db.func.date(Score.timestamp)
        ).all()
        
        # Ensure dates are in datetime format
        attempts_by_day_data = {
            "labels": [datetime.strptime(date, '%Y-%m-%d').strftime('%Y-%m-%d') for date, _ in attempts_by_day],
            "data": [count for _, count in attempts_by_day]
        }

        # Log attempts_by_day_data
        print("Attempts by Day Data:", attempts_by_day_data)

        # Average Quiz Scores by Subject
        scores_by_subject = db.session.query(
            Subject.id,
            db.func.avg(Score.percentage)
        ).join(
            Quiz, Quiz.id == Score.quiz_id
        ).join(
            Chapter, Chapter.id == Quiz.chapter_id
        ).join(
            Subject, Subject.id == Chapter.subject_id
        ).group_by(
            Subject.id
        ).all()

        # Log scores_by_subject
        print("Scores by Subject Data:", scores_by_subject)

        subjects = {subject.id: subject.name for subject in Subject.query.all()}
        scores_by_subject_data = {
            "labels": [subjects[subject_id] for subject_id, _ in scores_by_subject],
            "data": [avg_score for _, avg_score in scores_by_subject]
        }

        # Log scores_by_subject_data
        print("Scores by Subject Data (Processed):", scores_by_subject_data)

        # Pass/Fail Distribution
        pass_fail_data = db.session.query(
            db.case((Score.passed == True, 'Passed'), else_='Failed'),
            db.func.count(Score.id)
        ).group_by(
            db.case((Score.passed == True, 'Passed'), else_='Failed')
        ).all()

        # Log pass_fail_data
        print("Pass/Fail Data:", pass_fail_data)

        pass_fail_data = {
            "data": [count for _, count in pass_fail_data]
        }

        # User Activity Trends (last 30 days)
        user_activity = db.session.query(
            db.func.date(Score.timestamp),
            db.func.count(db.distinct(Score.user_id))
        ).filter(
            Score.timestamp >= start_date
        ).group_by(
            db.func.date(Score.timestamp)
        ).all()

        # Log user_activity
        print("User Activity Data:", user_activity)

        user_activity_data = {
            "labels": [datetime.strptime(date, '%Y-%m-%d').strftime('%Y-%m-%d') for date, _ in user_activity],
            "data": [count for _, count in user_activity]
        }

        chart_data = {
            "attemptsByDay": attempts_by_day_data,
            "scoresBySubject": scores_by_subject_data,
            "passFailData": pass_fail_data,
            "userActivity": user_activity_data
        }

        return jsonify(chart_data), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching chart data: %s', str(e), exc_info=True)
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500

@auth_required('token')
def get_user_stats(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        total_quizzes = Score.query.filter_by(user_id=user_id).count()
        avg_score = db.session.query(db.func.avg(Score.percentage)).filter_by(user_id=user_id).scalar() or 0
        pass_rate = db.session.query(db.func.avg(db.case((Score.passed == True, 1), else_=0))).filter_by(user_id=user_id).scalar() or 0

        stats = {
            "totalQuizzes": total_quizzes,
            "avgScore": round(avg_score, 2),
            "passRate": round(pass_rate * 100, 2)
        }

        return jsonify(stats), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching user stats: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500

@auth_required('token')
def get_user_scores(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        scores = Score.query.filter_by(user_id=user_id).order_by(Score.timestamp.desc()).all()
        scores_data = [{
            "id": score.id,
            "user_id": score.user_id,
            "quiz_id": score.quiz_id,
            "quiz_name": score.quiz.name,
            "timestamp": score.timestamp,
            "total_scored": score.total_scored,
            "total_questions": score.total_questions,
            "total_marks_scored": score.total_marks_scored,
            "total_possible_marks": score.total_possible_marks,
            "percentage": score.percentage,
            "time_taken_seconds": score.time_taken_seconds,
            "passed": score.passed
        } for score in scores]

        return jsonify(scores_data), 200
    except Exception as e:
        app.logger.error('An error occurred while fetching user scores: %s', str(e))
        return jsonify({'message': 'Internal Server Error', 'error': str(e)}), 500


api.add_resource(ScoreResource, '/scores')

