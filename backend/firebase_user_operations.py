import firebase_admin
from firebase_admin import credentials, auth
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
current_dir = os.path.dirname(os.path.abspath(__file__))
cred = credentials.Certificate(os.path.join(current_dir, 'keys.json'))
firebase_admin.initialize_app(cred)

@app.route('/create-user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        user = auth.create_user(
            email=email,
            password=password
        )
        return jsonify({'uid': user.uid}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/delete-user', methods=['DELETE'])
def delete_user():
    try:
        data = request.get_json()
        uid = data.get('uid')
        
        if not uid:
            return jsonify({'error': 'UID is required'}), 400
        
        auth.delete_user(uid)
        return jsonify({'status': 'success'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000) 