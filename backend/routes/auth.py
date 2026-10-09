from flask import Blueprint, request
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from database import get_db
from utils.response_helpers import success_response, error_response

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return error_response("Email and password are required", 400)

    db = get_db()
    user = db.users.find_one({"email": email})

    if not user or not check_password_hash(user["password"], password):
        return error_response("Invalid email or password", 401)

    if not user.get("is_active", True):
        return error_response("Account is deactivated. Contact Administrator.", 403)

    user_id = str(user["_id"])
    role = user.get("role", "student")
    
    # Fetch additional student or faculty profile details
    extra_profile = {}
    if role == "student":
        student_doc = db.students.find_one({"user_id": user_id})
        if student_doc:
            extra_profile = {
                "student_id": str(student_doc["_id"]),
                "usn": student_doc.get("usn"),
                "department": student_doc.get("department"),
                "semester": student_doc.get("semester"),
                "section": student_doc.get("section"),
                "cgpa": student_doc.get("cgpa")
            }
    elif role == "faculty":
        faculty_doc = db.faculty.find_one({"user_id": user_id})
        if faculty_doc:
            extra_profile = {
                "faculty_id": str(faculty_doc["_id"]),
                "faculty_code": faculty_doc.get("faculty_id"),
                "department": faculty_doc.get("department"),
                "designation": faculty_doc.get("designation"),
                "subjects": faculty_doc.get("subjects", [])
            }

    # Generate JWT token
    additional_claims = {
        "role": role,
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        **extra_profile
    }

    access_token = create_access_token(identity=user_id, additional_claims=additional_claims)

    user_data = {
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "role": role,
        "token": access_token,
        **extra_profile
    }

    return success_response(user_data, "Login successful")

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()
    
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = db.users.find_one({"_id": user_id})
        
    if not user:
        return error_response("User not found", 404)

    user_info = {
        "id": user_id,
        "name": user.get("name"),
        "email": user.get("email"),
        "phone": user.get("phone"),
        "role": claims.get("role", user.get("role")),
        "department": user.get("department")
    }

    if user.get("role") == "student":
        student = db.students.find_one({"user_id": user_id})
        if student:
            user_info.update({
                "student_id": str(student["_id"]),
                "usn": student.get("usn"),
                "semester": student.get("semester"),
                "section": student.get("section"),
                "cgpa": student.get("cgpa"),
                "batch": student.get("batch"),
                "mentor": student.get("mentor")
            })
    elif user.get("role") == "faculty":
        faculty = db.faculty.find_one({"user_id": user_id})
        if faculty:
            user_info.update({
                "faculty_id": str(faculty["_id"]),
                "designation": faculty.get("designation"),
                "subjects": faculty.get("subjects", []),
                "cabin": faculty.get("cabin")
            })

    return success_response(user_info, "Current user retrieved")

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    return success_response(None, "Logged out successfully")
