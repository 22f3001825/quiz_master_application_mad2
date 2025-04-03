from flask import current_app as app, jsonify, render_template, request, send_file
from flask_security import auth_required, roles_required, verify_password, hash_password, roles_required
from backend.models import db
from datetime import datetime
from backend.celery.tasks import create_csv
from celery.result import AsyncResult
datastore = app.security.datastore
cache = app.cache

@app.route('/')
def home_():
    return render_template("index.html")

@auth_required('token')
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)
    if result.ready():
        
        return send_file(result.result, as_attachment=True), 200
    else:
        return {'message': 'task not ready'}, 405

@app.get('/create-csv')
def createCSV():
    user_id = request.args.get('user_id')
    if user_id:
        task = create_csv.delay(user_id)
        return {'task_id': task.id}, 200
    else:
        return {'message': 'user_id is missing'}, 400




@app.get('/cache')
@cache.cached(timeout=5)
def cache():
    return {'time' : str(datetime.now())}

@app.get('/protected')
@auth_required()
def protected():
    return '<h1> only accessible by authenticated users </h1>'


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        app.logger.info('Login request received: %s', data)

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            app.logger.error('Invalid inputs: email or password missing')
            return jsonify({"message": "Invalid email or password"}), 400
        
        user = datastore.find_user(email=email)

        if not user:
            app.logger.error('Invalid email: %s', email)
            return jsonify({"message": "Invalid email"}), 404
        
        if verify_password(password, user.password):
            role_name = user.roles[0].name if user.roles else 'user'
            response = {
                'token': user.get_auth_token(),
                'email': user.email,
                'role': role_name,
                'id': user.id
            }
            app.logger.info('Login successful: %s', response)
            return jsonify(response)
        
        app.logger.error('Password wrong for email: %s', email)
        return jsonify({'message': 'Invalid password'}), 400

    except Exception as e:
        app.logger.error('An unexpected error occurred: %s', str(e))
        return jsonify({'message': 'An unexpected error occurred', 'error': str(e)}), 500
    
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name', '')
    qualification = data.get('qualification', '')
    dob = data.get('dob', '')
    role_name = 'user'

    if not email or not password:
        return jsonify({"message": "invalid inputs"}), 400
    
    user = datastore.find_user(email=email)

    if user:
        return jsonify({"message": "user already exists"}), 409

    try:
        user = datastore.create_user(
            email=email,
            password=hash_password(password),
            full_name=full_name,
            qualification=qualification,
            dob=datetime.strptime(dob, '%Y-%m-%d') if dob else None,
            active=True
        )
        role = datastore.find_or_create_role(name=role_name)
        datastore.add_role_to_user(user, role)
        db.session.commit()
        return jsonify({"message": "user created", "id": user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "error creating user", "error": str(e)}), 500


@app.route('/admin/dashboard', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_dashboard():
    # This is a placeholder for the admin dashboard logic
    return '<h1>Admin Dashboard - only accessible by admin</h1>'

@app.route('/user/dashboard', methods=['GET'])
@auth_required('token')
@roles_required('user')
def user_dashboard():
    # This is a placeholder for the user dashboard logic
    return '<h1>User Dashboard - only accessible by user</h1>'


