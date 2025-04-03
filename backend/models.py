from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

# Initialize the db
db = SQLAlchemy()

# User-Role Association
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id', ondelete='CASCADE')),
    db.UniqueConstraint('user_id', 'role_id', name='uix_user_role')
)

# User Model
class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password = db.Column(db.String(128), nullable=False)
    fs_uniquifier = db.Column(db.String(64), unique=True, nullable=False, index=True)
    active = db.Column(db.Boolean, default=True)
    full_name = db.Column(db.String(100))
    qualification = db.Column(db.String(100))
    dob = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_active = db.Column(db.DateTime)  # Track user's last activity

    # Relationships
    roles = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))
    scores = db.relationship('Score', backref='user', lazy=True, cascade="all, delete-orphan")
    feedbacks = db.relationship('Feedback', backref='user', lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', lazy=True, cascade="all, delete-orphan")
    
    def is_admin(self):
        return any(role.name == 'admin' for role in self.roles)


# Role Model
class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(100), nullable=False)


class Subject(db.Model):
    __tablename__ = 'subject'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade="all, delete-orphan")


class Chapter(db.Model):
    __tablename__ = 'chapter'
    id = db.Column(db.Integer, primary_key=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False, index=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade="all, delete-orphan")


# Quiz Model
class Quiz(db.Model):
    __tablename__ = 'quiz'
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(200), nullable=False, index=True)
    date_of_quiz = db.Column(db.String, nullable=False)
    time_duration_hours = db.Column(db.Integer, nullable=False, default=0)
    time_duration_minutes = db.Column(db.Integer, nullable=False, default=30)
    remarks = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    passing_percentage = db.Column(db.Float, default=60.0)  # Default passing score
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade="all, delete-orphan")
    scores = db.relationship('Score', backref='quiz', lazy=True, cascade="all, delete-orphan")
    
    @property
    def total_duration_minutes(self):
        """Calculate total duration in minutes for calculations"""
        return (self.time_duration_hours * 60) + self.time_duration_minutes
    
    @property
    def formatted_duration(self):
        """Return formatted duration as HH:MM"""
        return f"{self.time_duration_hours:02d}:{self.time_duration_minutes:02d}"


# Feedback Model
class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    selected_option = db.Column(db.Integer, nullable=False)  # User's selected option (1-4)
    is_correct = db.Column(db.Boolean, nullable=False)  # Whether the answer was correct
    feedback_message = db.Column(db.Text)  # Custom feedback for the user
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


# Question Model
class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    question_statement = db.Column(db.Text, nullable=False)
    option1 = db.Column(db.String(200), nullable=False)
    option2 = db.Column(db.String(200), nullable=False)
    option3 = db.Column(db.String(200), nullable=False)
    option4 = db.Column(db.String(200), nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)  # 1-4
    explanation = db.Column(db.Text)  # Explanation for the correct answer
    difficulty_level = db.Column(db.String(50), default='Medium')  # Easy, Medium, Hard
    marks = db.Column(db.Integer, default=1)  # Marks for this question
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    feedbacks = db.relationship('Feedback', backref='question', lazy=True, cascade="all, delete-orphan")


# Score Model
class Score(db.Model):
    __tablename__ = 'score'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    total_scored = db.Column(db.Integer, nullable=False)  # Total correct answers
    total_questions = db.Column(db.Integer, nullable=False)  # Total questions in the quiz
    total_marks_scored = db.Column(db.Integer, nullable=False)  # Total marks scored
    total_possible_marks = db.Column(db.Integer, nullable=False)  # Total possible marks
    percentage = db.Column(db.Float)  # Percentage score
    time_taken_seconds = db.Column(db.Integer)  # Time taken in seconds
    passed = db.Column(db.Boolean)  # Whether the user passed the quiz


# Notification Model 
class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'reminder', 'export_complete', 'new_quiz'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    related_id = db.Column(db.Integer)  # Related quiz_id, export_id, etc.
    is_read = db.Column(db.Boolean, default=False)
    is_sent = db.Column(db.Boolean, default=False)  # Whether notification was sent via email/SMS
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))





