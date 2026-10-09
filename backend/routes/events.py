from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response

events_bp = Blueprint("events", __name__)

@events_bp.route("", methods=["GET"])
@jwt_required()
def get_events():
    db = get_db()
    events = list(db.events.find({"is_active": True}).sort("date", 1))
    return success_response(events, f"Found {len(events)} events")

@events_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "faculty"])
def create_event():
    data = request.get_json() or {}
    title = data.get("title")
    category = data.get("category", "Hackathon")
    department = data.get("department", "All Departments")
    date_str = data.get("date")
    time_str = data.get("time", "09:00 AM - 05:00 PM")
    venue = data.get("venue")
    max_seats = int(data.get("max_seats", 100))
    description = data.get("description", "")
    organizer = data.get("organizer", "College Department")

    if not all([title, date_str, venue]):
        return error_response("Title, date, and venue are required", 400)

    db = get_db()
    event_doc = {
        "title": title,
        "category": category,
        "department": department,
        "date": date_str,
        "time": time_str,
        "venue": venue,
        "organizer": organizer,
        "max_seats": max_seats,
        "registered_count": 0,
        "registrations": [],
        "registration_deadline": date_str,
        "description": description,
        "is_active": True,
        "created_at": datetime.utcnow()
    }

    res = db.events.insert_one(event_doc)
    event_doc["_id"] = res.inserted_id
    return success_response(event_doc, "Event published successfully", 201)

@events_bp.route("/<event_id>/register", methods=["POST"])
@jwt_required()
def register_for_event(event_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()

    try:
        ev = db.events.find_one({"_id": ObjectId(event_id)})
    except Exception:
        ev = db.events.find_one({"_id": event_id})

    if not ev:
        return error_response("Event not found", 404)

    if ev.get("registered_count", 0) >= ev.get("max_seats", 100):
        return error_response("Event is fully booked! Seat limit reached.", 400)

    student = db.students.find_one({"user_id": user_id})
    usn = student.get("usn") if student else "N/A"

    # Check if already registered
    existing_reg = db.event_registrations.find_one({
        "event_id": str(ev["_id"]),
        "user_id": user_id
    })

    if existing_reg:
        return error_response("You have already registered for this event.", 400)

    reg_doc = {
        "event_id": str(ev["_id"]),
        "event_title": ev.get("title"),
        "user_id": user_id,
        "name": claims.get("name"),
        "email": claims.get("email"),
        "usn": usn,
        "registered_at": datetime.utcnow()
    }

    db.event_registrations.insert_one(reg_doc)
    db.events.update_one({"_id": ev["_id"]}, {"$inc": {"registered_count": 1}})

    return success_response(None, f"Successfully registered for '{ev.get('title')}'!")
