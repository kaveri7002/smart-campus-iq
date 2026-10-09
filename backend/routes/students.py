from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response

students_bp = Blueprint("students", __name__)

@students_bp.route("", methods=["GET"])
@jwt_required()
def list_students():
    db = get_db()
    department = request.args.get("department")
    semester = request.args.get("semester")
    section = request.args.get("section")
    search = request.args.get("search")

    query = {}
    if department:
        query["department"] = department
    if semester:
        try:
            query["semester"] = int(semester)
        except ValueError:
            pass
    if section:
        query["section"] = section.upper()
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"usn": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]

    students = list(db.students.find(query).sort("usn", 1))
    return success_response(students, f"Found {len(students)} students")

@students_bp.route("/me", methods=["GET"])
@jwt_required()
@role_required("student")
def get_my_student_profile():
    user_id = get_jwt_identity()
    db = get_db()
    student = db.students.find_one({"user_id": user_id})
    if not student:
        return error_response("Student profile not found", 404)
    return success_response(student, "Profile retrieved")

@students_bp.route("/me", methods=["PUT"])
@jwt_required()
@role_required("student")
def update_my_student_profile():
    user_id = get_jwt_identity()
    db = get_db()
    data = request.get_json() or {}
    
    # Allowed fields for student self-update (verified phone, blood group, address, emergency contact)
    allowed = ["phone", "blood_group", "emergency_contact", "address", "linkedin_url", "github_url"]
    update_doc = {k: v for k, v in data.items() if k in allowed}
    
    if "phone" in update_doc:
        # Update both student and user collection
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"phone": update_doc["phone"]}})

    db.students.update_one({"user_id": user_id}, {"$set": update_doc})
    updated = db.students.find_one({"user_id": user_id})
    return success_response(updated, "Profile updated successfully")

@students_bp.route("/<student_id>", methods=["GET"])
@jwt_required()
def get_student_by_id(student_id):
    db = get_db()
    try:
        student = db.students.find_one({"_id": ObjectId(student_id)})
    except Exception:
        student = db.students.find_one({"_id": student_id})
        
    if not student:
        return error_response("Student not found", 404)
    return success_response(student, "Student details retrieved")
