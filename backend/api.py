from flask import Blueprint
from flask_restful import Api
from .resources import (
    UserAPI, UserListAPI, SubjectAPI, SubjectListAPI, ChapterAPI, ChapterListAPI, 
    QuizAPI, QuizListAPI, QuestionAPI, QuestionListAPI, ScoreAPI, ScoreListAPI,  FeedbackAPI, FeedbackListAPI, get_summary_stats, 
    get_quiz_attempts, get_chart_data, get_user_stats, get_user_scores
)

api_bp = Blueprint('api', __name__)
api = Api(api_bp)

# Adding API resources
api.add_resource(UserAPI, '/users/<int:user_id>')
api.add_resource(UserListAPI, '/users')
api.add_resource(SubjectAPI, '/subjects/<int:subject_id>')
api.add_resource(SubjectListAPI, '/subjects')
api.add_resource(ChapterAPI, '/chapters/<int:chapter_id>')
api.add_resource(ChapterListAPI, '/chapters')
api.add_resource(QuizAPI, '/quizzes/<int:quiz_id>')
api.add_resource(QuizListAPI, '/quizzes')
api.add_resource(QuestionAPI, '/questions/<int:question_id>')
api.add_resource(QuestionListAPI, '/questions')
api.add_resource(ScoreAPI, '/scores/<int:score_id>')
api.add_resource(ScoreListAPI, '/scores')
api.add_resource(FeedbackAPI, '/feedbacks/<int:feedback_id>')
api.add_resource(FeedbackListAPI, '/feedbacks')


# I am adding function routes
api_bp.add_url_rule('/analytics/summary', 'get_summary_stats', get_summary_stats, methods=['GET'])
api_bp.add_url_rule('/analytics/quiz-attempts', 'get_quiz_attempts', get_quiz_attempts, methods=['GET'])
api_bp.add_url_rule('/analytics/chart-data', 'get_chart_data', get_chart_data, methods=['GET'])
api_bp.add_url_rule('/users/<int:user_id>/stats', 'get_user_stats', get_user_stats, methods=['GET'])
api_bp.add_url_rule('/users/<int:user_id>/scores', 'get_user_scores', get_user_scores, methods=['GET'])



