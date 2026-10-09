from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.response_helpers import success_response, error_response

projects_bp = Blueprint("projects", __name__)

@projects_bp.route("", methods=["GET"])
@jwt_required()
def get_projects():
    db = get_db()
    category = request.args.get("category")
    dept = request.args.get("department")
    skill = request.args.get("skill")
    search = request.args.get("search")

    query = {}
    if category and category.lower() != "all":
        query["category"] = category
    if dept and dept.lower() != "all":
        query["department"] = dept
    if skill:
        query["required_skills"] = {"$regex": skill, "$options": "i"}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"required_skills": {"$regex": search, "$options": "i"}}
        ]

    projects = list(db.projects.find(query).sort("created_at", -1))
    return success_response(projects, f"Found {len(projects)} projects")

@projects_bp.route("", methods=["POST"])
@jwt_required()
def create_project():
    data = request.get_json() or {}
    title = data.get("title", "").strip()
    description = data.get("description", "").strip()
    category = data.get("category", "Mini Project")
    department = data.get("department", "CSE")
    required_skills = data.get("required_skills", [])
    team_size = int(data.get("team_size", 4))
    github_url = data.get("github_url", "")

    if not title or not description:
        return error_response("Title and description are required", 400)

    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()

    student = db.students.find_one({"user_id": user_id})
    lead_name = claims.get("name", "Student")
    lead_usn = student.get("usn", "N/A") if student else "N/A"

    project_doc = {
        "title": title,
        "description": description,
        "category": category,
        "department": department,
        "lead_id": user_id,
        "lead_name": lead_name,
        "lead_usn": lead_usn,
        "required_skills": required_skills if isinstance(required_skills, list) else [s.strip() for s in required_skills.split(",")],
        "team_size": team_size,
        "current_members": 1,
        "members": [{"user_id": user_id, "name": lead_name, "usn": lead_usn, "role": "Lead"}],
        "join_requests": [],
        "github_url": github_url,
        "status": "Recruiting",
        "created_at": datetime.utcnow()
    }

    res = db.projects.insert_one(project_doc)
    project_doc["_id"] = res.inserted_id
    return success_response(project_doc, "Project created successfully", 201)

@projects_bp.route("/<project_id>/apply", methods=["POST"])
@jwt_required()
def apply_to_project(project_id):
    """Student requests to join project team"""
    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()

    try:
        proj = db.projects.find_one({"_id": ObjectId(project_id)})
    except Exception:
        proj = db.projects.find_one({"_id": project_id})

    if not proj:
        return error_response("Project not found", 404)

    student = db.students.find_one({"user_id": user_id})
    applicant_data = {
        "user_id": user_id,
        "name": claims.get("name"),
        "usn": student.get("usn", "N/A") if student else "N/A",
        "email": claims.get("email"),
        "applied_at": datetime.utcnow().isoformat()
    }

    # Add to join requests
    db.projects.update_one(
        {"_id": proj["_id"]},
        {"$addToSet": {"join_requests": applicant_data}}
    )

    return success_response(None, "Application to join project team sent to project lead!")
