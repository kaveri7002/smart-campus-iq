import random
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response

complaints_bp = Blueprint("complaints", __name__)

@complaints_bp.route("", methods=["GET"])
@jwt_required()
def get_complaints():
    db = get_db()
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    status = request.args.get("status")
    category = request.args.get("category")

    query = {}
    if role == "student":
        query["user_id"] = user_id
    if status and status.lower() != "all":
        query["status"] = status
    if category and category.lower() != "all":
        query["category"] = category

    complaints = list(db.complaints.find(query).sort("created_at", -1))
    return success_response(complaints, f"Found {len(complaints)} complaints")

@complaints_bp.route("", methods=["POST"])
@jwt_required()
def create_complaint():
    data = request.get_json() or {}
    category = data.get("category")
    location = data.get("location")
    priority = data.get("priority", "Medium")
    description = data.get("description", "").strip()

    if not all([category, location, description]):
        return error_response("Category, location, and description are required", 400)

    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()
    student = db.students.find_one({"user_id": user_id})

    # Generate Unique Complaint ID
    comp_code = f"CMP-2026-{random.randint(1000, 9999)}"
    
    complaint_doc = {
        "complaint_id": comp_code,
        "user_id": user_id,
        "student_name": claims.get("name"),
        "usn": student.get("usn", "N/A") if student else "N/A",
        "category": category,
        "location": location,
        "priority": priority,
        "description": description,
        "status": "Submitted",
        "assigned_to": "Maintenance & Infrastructure Desk",
        "admin_remarks": "Received by automated ticketing system. Under initial assessment.",
        "created_at": datetime.utcnow()
    }

    res = db.complaints.insert_one(complaint_doc)
    complaint_doc["_id"] = res.inserted_id
    return success_response(complaint_doc, f"Complaint {comp_code} registered successfully", 201)

@complaints_bp.route("/<complaint_id>", methods=["PATCH"])
@jwt_required()
@role_required(["admin", "faculty"])
def update_complaint_status(complaint_id):
    """Admin or Faculty update complaint status, priority, or remarks"""
    data = request.get_json() or {}
    status = data.get("status")
    assigned_to = data.get("assigned_to")
    admin_remarks = data.get("admin_remarks")
    priority = data.get("priority")

    db = get_db()
    try:
        comp = db.complaints.find_one({"_id": ObjectId(complaint_id)})
    except Exception:
        comp = db.complaints.find_one({"complaint_id": complaint_id})

    if not comp:
        return error_response("Complaint not found", 404)

    update_fields = {"updated_at": datetime.utcnow()}
    if status:
        update_fields["status"] = status
    if assigned_to:
        update_fields["assigned_to"] = assigned_to
    if admin_remarks:
        update_fields["admin_remarks"] = admin_remarks
    if priority:
        update_fields["priority"] = priority

    db.complaints.update_one({"_id": comp["_id"]}, {"$set": update_fields})
    updated = db.complaints.find_one({"_id": comp["_id"]})
    return success_response(updated, "Complaint status updated successfully")
