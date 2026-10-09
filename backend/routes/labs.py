from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response

labs_bp = Blueprint("labs", __name__)

@labs_bp.route("", methods=["GET"])
@jwt_required()
def get_labs():
    db = get_db()
    dept = request.args.get("department")
    query = {"department": dept} if dept else {}
    labs = list(db.laboratories.find(query))
    return success_response(labs, f"Found {len(labs)} laboratories")

@labs_bp.route("/bookings", methods=["GET"])
@jwt_required()
def get_lab_bookings():
    db = get_db()
    user_id = get_jwt_identity()
    claims = get_jwt()
    role = claims.get("role")
    status = request.args.get("status")

    query = {}
    if role == "student":
        query["student_id"] = user_id
    if status and status.lower() != "all":
        query["status"] = status

    bookings = list(db.laboratory_bookings.find(query).sort("date", -1))
    return success_response(bookings, f"Found {len(bookings)} bookings")

@labs_bp.route("/bookings", methods=["POST"])
@jwt_required()
@role_required(["student", "faculty"])
def create_lab_booking():
    """Create lab booking request with conflict prevention"""
    data = request.get_json() or {}
    lab_id = data.get("lab_id")
    date_str = data.get("date")
    time_slot = data.get("time_slot")
    purpose = data.get("purpose")
    team_members = data.get("team_members", "")

    if not all([lab_id, date_str, time_slot, purpose]):
        return error_response("Lab ID, date, time slot, and purpose are required", 400)

    db = get_db()
    try:
        lab = db.laboratories.find_one({"_id": ObjectId(lab_id)})
    except Exception:
        lab = db.laboratories.find_one({"_id": lab_id})

    if not lab:
        return error_response("Laboratory not found", 404)

    # Check for slot conflicts (already Confirmed booking)
    existing_conflict = db.laboratory_bookings.find_one({
        "lab_id": str(lab["_id"]),
        "date": date_str,
        "time_slot": time_slot,
        "status": "Confirmed"
    })

    if existing_conflict:
        return error_response(f"Slot {time_slot} on {date_str} is already booked & confirmed for another batch.", 409)

    user_id = get_jwt_identity()
    claims = get_jwt()

    booking_doc = {
        "lab_id": str(lab["_id"]),
        "lab_name": lab.get("name"),
        "department": lab.get("department"),
        "student_id": user_id,
        "student_name": claims.get("name"),
        "student_email": claims.get("email"),
        "date": date_str,
        "time_slot": time_slot,
        "purpose": purpose,
        "team_members": team_members,
        "status": "Pending Approval",
        "created_at": datetime.utcnow()
    }

    res = db.laboratory_bookings.insert_one(booking_doc)
    booking_doc["_id"] = res.inserted_id
    return success_response(booking_doc, "Lab booking request submitted successfully", 201)

@labs_bp.route("/bookings/<booking_id>", methods=["PATCH"])
@jwt_required()
@role_required(["faculty", "admin"])
def update_booking_status(booking_id):
    """Faculty or Admin approve/reject booking"""
    data = request.get_json() or {}
    status = data.get("status")  # 'Confirmed' or 'Rejected'
    remarks = data.get("remarks", "")

    if status not in ["Confirmed", "Rejected", "Cancelled"]:
        return error_response("Invalid status. Must be Confirmed, Rejected, or Cancelled", 400)

    db = get_db()
    try:
        booking = db.laboratory_bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        booking = db.laboratory_bookings.find_one({"_id": booking_id})

    if not booking:
        return error_response("Booking not found", 404)

    # If approving, check conflict one more time
    if status == "Confirmed":
        existing = db.laboratory_bookings.find_one({
            "_id": {"$ne": booking["_id"]},
            "lab_id": booking["lab_id"],
            "date": booking["date"],
            "time_slot": booking["time_slot"],
            "status": "Confirmed"
        })
        if existing:
            return error_response("Another booking has already been confirmed for this exact slot.", 409)

    user_id = get_jwt_identity()
    claims = get_jwt()

    db.laboratory_bookings.update_one(
        {"_id": booking["_id"]},
        {"$set": {
            "status": status,
            "remarks": remarks,
            "action_by": claims.get("name", "Faculty"),
            "updated_at": datetime.utcnow()
        }}
    )

    updated = db.laboratory_bookings.find_one({"_id": booking["_id"]})
    return success_response(updated, f"Booking status updated to {status}")
