import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from database import get_db, is_mock
from services.seed_data import seed_database

# Import Blueprints
from routes.auth import auth_bp
from routes.students import students_bp
from routes.faculty import faculty_bp
from routes.attendance import attendance_bp
from routes.qr_attendance import qr_attendance_bp
from routes.face_attendance import face_attendance_bp
from routes.sms import sms_bp
from routes.labs import labs_bp
from routes.projects import projects_bp
from routes.complaints import complaints_bp
from routes.events import events_bp
from routes.placement import placement_bp
from routes.library import library_bp
from routes.dashboard import dashboard_bp
from routes.admin import admin_bp

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("SmartCampusApp")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Setup CORS
    frontend_origin = Config.FRONTEND_URL
    if frontend_origin == "*" or not frontend_origin:
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        # Support multiple origins if comma-separated
        origins = [o.strip() for o in frontend_origin.split(",")]
        CORS(app, resources={r"/api/*": {"origins": origins}})

    # Setup JWT
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            "success": False,
            "message": "Authorization token is missing or not provided"
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            "success": False,
            "message": "Signature verification failed or token is malformed"
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            "success": False,
            "message": "Authentication session has expired. Please log in again."
        }), 401

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(students_bp, url_prefix="/api/students")
    app.register_blueprint(faculty_bp, url_prefix="/api/faculty")
    app.register_blueprint(attendance_bp, url_prefix="/api/attendance")
    app.register_blueprint(qr_attendance_bp, url_prefix="/api/attendance/qr")
    app.register_blueprint(face_attendance_bp, url_prefix="/api/attendance/face")
    app.register_blueprint(sms_bp, url_prefix="/api/sms")
    app.register_blueprint(labs_bp, url_prefix="/api/labs")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(complaints_bp, url_prefix="/api/complaints")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(placement_bp, url_prefix="/api/placement")
    app.register_blueprint(library_bp, url_prefix="/api/library")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "system": "Smart Campus IQ — Smart Engineering College Management API",
            "version": "1.0.0",
            "status": "Operational",
            "docs": "/api/health"
        }), 200

    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_status = "Connected"
        try:
            db = get_db()
            db_name = db.name
            mock_mode = is_mock()
        except Exception as e:
            db_status = f"Error: {str(e)}"
            db_name = "N/A"
            mock_mode = False

        return jsonify({
            "status": "Healthy",
            "database": {
                "status": db_status,
                "name": db_name,
                "is_mock": mock_mode
            },
            "college": Config.COLLEGE_NAME,
            "sms_mode": Config.SMS_MODE
        }), 200

    # Auto-initialize database connection and seed demo data
    with app.app_context():
        try:
            db = get_db()
            seed_database(db)
            logger.info("Database initialization and verification completed.")
        except Exception as e:
            logger.error(f"Failed to auto-seed database on start: {e}")

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
