from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response
from services.qr_service import QRService

qr_attendance_bp = Blueprint("qr_attendance", __name__)

@qr_attendance_bp.route("/create", methods=["POST"])
@jwt_required()
@role_required(["faculty", "admin"])
def generate_qr_session():
    """Faculty initiates a live dynamic QR attendance code for the current class session"""
    data = request.get_json() or {}
    session_id = data.get("session_id")
    valid_minutes = data.get("valid_minutes", 15)

    if not session_id:
        return error_response("Session ID is required", 400)

    user_id = get_jwt_identity()
    result = QRService.create_session(session_id, user_id, valid_minutes=valid_minutes)
    return success_response(result, "QR code session generated successfully")

@qr_attendance_bp.route("/checkin", methods=["POST"])
@jwt_required()
@role_required("student")
def student_qr_checkin():
    """Student scans and submits their attendance via QR token"""
    data = request.get_json() or {}
    qr_payload = data.get("qr_payload", "").strip()

    if not qr_payload:
        return error_response("QR payload/token is required", 400)

    # Extract token if formatted as SMARTCAMPUS_QR_ATTENDANCE:token:session_id
    if ":" in qr_payload:
        parts = qr_payload.split(":")
        token = parts[1] if len(parts) >= 2 else parts[0]
    else:
        token = qr_payload

    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()
    student = db.students.find_one({"user_id": user_id})

    if not student:
        return error_response("Student record not linked to account", 404)

    result = QRService.verify_and_checkin(
        token=token,
        student_id=str(student["_id"]),
        student_usn=student.get("usn"),
        student_name=student.get("name")
    )

    if not result.get("success"):
        return error_response(result.get("error", "Check-in failed"), 400)

    return success_response(result, result.get("message"))

@qr_attendance_bp.route("/status/<session_id>", methods=["GET"])
@jwt_required()
@role_required(["faculty", "admin"])
def get_qr_session_status(session_id):
    """Faculty polls real-time live scan check-ins for the active QR code"""
    db = get_db()
    qr_session = db.qr_sessions.find_one({"session_id": str(session_id), "is_active": True})
    
    if not qr_session:
        return success_response({"is_active": False, "scanned_students": []}, "No active QR session")

    # Fetch full student records
    records = list(db.attendance_records.find({"session_id": str(session_id)}))
    
    return success_response({
        "is_active": True,
        "token": qr_session.get("token"),
        "expires_at": qr_session.get("expires_at"),
        "scanned_count": len(qr_session.get("scanned_students", [])),
        "scanned_students": qr_session.get("scanned_students", []),
        "all_records": records
    }, "Live QR status retrieved")
