from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from bson import ObjectId
from datetime import datetime
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response
from services.sms_service import SMSService

sms_bp = Blueprint("sms", __name__)

@sms_bp.route("/logs", methods=["GET"])
@jwt_required()
def get_sms_logs():
    """Retrieve audit trail of SMS notifications with filters"""
    db = get_db()
    session_id = request.args.get("session_id")
    student_id = request.args.get("student_id")
    status = request.args.get("status")
    search = request.args.get("search")

    query = {}
    if session_id:
        query["session_id"] = session_id
    if student_id:
        query["student_id"] = student_id
    if status and status.lower() != "all":
        query["status"] = status
    if search:
        query["$or"] = [
            {"student_name": {"$regex": search, "$options": "i"}},
            {"usn": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
            {"subject_code": {"$regex": search, "$options": "i"}}
        ]

    logs = list(db.sms_notifications.find(query).sort("created_at", -1).limit(100))
    return success_response(logs, f"Found {len(logs)} SMS log records")

@sms_bp.route("/<notification_id>/retry", methods=["POST"])
@jwt_required()
@role_required(["admin", "faculty"])
def retry_sms(notification_id):
    """Manually retry a failed SMS notification safely"""
    db = get_db()
    try:
        notif = db.sms_notifications.find_one({"_id": ObjectId(notification_id)})
    except Exception:
        notif = db.sms_notifications.find_one({"_id": notification_id})

    if not notif:
        return error_response("Notification record not found", 404)

    # Increment retry count
    db.sms_notifications.update_one(
        {"_id": notif["_id"]},
        {"$inc": {"retry_count": 1}, "$set": {"status": "Pending", "delivery_status": "Retrying..."}}
    )

    result = SMSService.send_notification(notif["_id"])
    return success_response(result, "SMS retry executed")

@sms_bp.route("/webhook", methods=["POST"])
def twilio_webhook():
    """Twilio SMS delivery status callback"""
    db = get_db()
    message_sid = request.form.get("MessageSid")
    message_status = request.form.get("MessageStatus")

    if message_sid and message_status:
        db.sms_notifications.update_one(
            {"provider_message_id": message_sid},
            {"$set": {
                "delivery_status": message_status.capitalize(),
                "status": "Sent" if message_status in ["delivered", "sent"] else "Failed",
                "webhook_received_at": datetime.utcnow()
            }}
        )
    return "<Response></Response>", 200, {"Content-Type": "application/xml"}

@sms_bp.route("/stats", methods=["GET"])
@jwt_required()
def get_sms_stats():
    """Summary of SMS notifications across the campus"""
    db = get_db()
    total = db.sms_notifications.count_documents({})
    sent = db.sms_notifications.count_documents({"status": "Sent"})
    demo = db.sms_notifications.count_documents({"status": "Demo"})
    failed = db.sms_notifications.count_documents({"status": "Failed"})
    pending = db.sms_notifications.count_documents({"status": "Pending"})

    current_mode = SMSService.get_mode()

    return success_response({
        "current_mode": current_mode,
        "total": total,
        "sent": sent,
        "demo": demo,
        "failed": failed,
        "pending": pending
    }, "SMS statistics retrieved")
