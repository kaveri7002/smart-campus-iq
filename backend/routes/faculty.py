from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response

faculty_bp = Blueprint("faculty", __name__)

@faculty_bp.route("", methods=["GET"])
@jwt_required()
def list_faculty():
    db = get_db()
    dept = request.args.get("department")
    query = {"department": dept} if dept else {}
    fac_list = list(db.faculty.find(query).sort("name", 1))
    return success_response(fac_list, f"Found {len(fac_list)} faculty members")

@faculty_bp.route("/me", methods=["GET"])
@jwt_required()
@role_required("faculty")
def get_my_faculty_profile():
    user_id = get_jwt_identity()
    db = get_db()
    faculty = db.faculty.find_one({"user_id": user_id})
    if not faculty:
        return error_response("Faculty profile not found", 404)
    return success_response(faculty, "Faculty profile retrieved")

@faculty_bp.route("/classes", methods=["GET"])
@jwt_required()
@role_required(["faculty", "admin"])
def get_assigned_classes():
    """Returns list of assigned subject sections for faculty"""
    user_id = get_jwt_identity()
    db = get_db()
    faculty = db.faculty.find_one({"user_id": user_id})
    
    assigned_subjects = faculty.get("subjects", []) if faculty else []
    
    # Fetch subject definitions
    subjects = list(db.subjects.find({"code": {"$in": assigned_subjects}})) if assigned_subjects else list(db.subjects.find())
    
    return success_response({
        "subjects": subjects,
        "departments": ["CSE", "ISE", "AI & ML", "ECE", "EEE", "ME", "Civil"],
        "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
        "sections": ["A", "B", "C"],
        "periods": [1, 2, 3, 4, 5, 6, 7, 8]
    }, "Assigned classes retrieved")
