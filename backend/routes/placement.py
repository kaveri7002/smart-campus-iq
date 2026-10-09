from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.response_helpers import success_response, error_response

placement_bp = Blueprint("placement", __name__)

@placement_bp.route("/drives", methods=["GET"])
@jwt_required()
def get_placement_drives():
    db = get_db()
    drives = list(db.placement_drives.find().sort("drive_date", 1))
    return success_response(drives, "Placement drives retrieved")

@placement_bp.route("/drives/<drive_id>/apply", methods=["POST"])
@jwt_required()
def apply_placement_drive(drive_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()

    student = db.students.find_one({"user_id": user_id})
    if not student:
        return error_response("Student record required to apply for placements", 400)

    try:
        drive = db.placement_drives.find_one({"_id": ObjectId(drive_id)})
    except Exception:
        drive = db.placement_drives.find_one({"_id": drive_id})

    if not drive:
        return error_response("Placement drive not found", 404)

    # Check CGPA eligibility
    min_cgpa = drive.get("eligibility_cgpa", 7.0)
    student_cgpa = student.get("cgpa", 0.0)
    if student_cgpa < min_cgpa:
        return error_response(f"Eligibility criteria not met. Minimum CGPA required: {min_cgpa}, your CGPA: {student_cgpa}", 400)

    app_doc = {
        "drive_id": str(drive["_id"]),
        "company_name": drive.get("company_name"),
        "role": drive.get("role"),
        "user_id": user_id,
        "student_name": student.get("name"),
        "usn": student.get("usn"),
        "cgpa": student_cgpa,
        "status": "Applied / Shortlist Pending",
        "applied_at": datetime.utcnow()
    }

    db.placement_applications.update_one(
        {"drive_id": str(drive["_id"]), "user_id": user_id},
        {"$set": app_doc},
        upsert=True
    )

    return success_response(app_doc, f"Successfully applied for {drive.get('company_name')} - {drive.get('role')}!")

@placement_bp.route("/prep-resources", methods=["GET"])
@jwt_required()
def get_prep_resources():
    return success_response({
        "coding_stats": {
            "problems_solved": 142,
            "target": 200,
            "easy": 60,
            "medium": 65,
            "hard": 17,
            "streak_days": 18
        },
        "aptitude_modules": [
            {"topic": "Quantitative Aptitude - Time & Work, Speed", "progress": 85, "total_questions": 50},
            {"topic": "Logical Reasoning - Syllogisms & Seating", "progress": 70, "total_questions": 40},
            {"topic": "Verbal Ability & Reading Comprehension", "progress": 90, "total_questions": 30}
        ],
        "resume_checklist": [
            {"item": "Single page clean LaTeX / ATS format", "completed": True},
            {"item": "Quantified impact on 2+ Full Stack / AI Projects", "completed": True},
            {"item": "Verified GitHub repository & live demo links", "completed": True},
            {"item": "Listed Data Structures & Algorithm competencies", "completed": True},
            {"item": "Core CS Fundamentals (DBMS, OS, Computer Networks)", "completed": False}
        ]
    }, "Placement preparation statistics loaded")
