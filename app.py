from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore
from flask_caching import Cache
from backend.celery.celery_market import celery_init_app
import flask_excel as excel
from flask_login import current_user
from datetime import datetime, timezone

def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')

    app.config.from_object(LocalDevelopmentConfig)

    # Initialize models
    db.init_app(app)
    
    # Initialize cache
    cache = Cache(app)
    app.cache = cache

    # Initialize Flask-Security
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    
    # Initialize Flask-Excel
    excel.init_excel(app)

    # Push context
    app.app_context().push()

    # Initialize Flask-RESTful
    from backend.resources import api
    api.init_app(app)

    # Register API blueprint
    from backend.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Update last active time
    @app.before_request
    def update_last_active():
        if current_user.is_authenticated:
            current_user.last_active = datetime.now(timezone.utc)
            db.session.commit()

    return app

app = createApp()

# Initialize Celery
celery_app = celery_init_app(app)

# Import and configure scheduled tasks
import backend.celery.celery_schedule

# Import and create initial data
import backend.create_initial_data

# Import routes
import backend.routes

if __name__ == '__main__':
    app.run()