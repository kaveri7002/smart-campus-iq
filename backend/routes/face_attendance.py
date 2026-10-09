from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response
from services.face_service import FaceAttendanceService

face_attendance_bp = Blueprint("face_attendance", __name__)

@face_attendance_bp.route("/verify", methods=["POST"])
@jwt_required()
@role_required(["faculty", "admin"])
def verify_face_attendance():
    """Faculty triggers face scan frame to recognize and mark students"""
    data = request.get_json() or {}
    session_id = data.get("session_id")
    image_base64 = data.get("image", "")

    if not session_id:
        return error_response("Session ID is required", 400)

    db = get_db()
    sess = db.attendance_sessions.find_one({"_id": session_id}) or db.attendance_sessions.find_one({"_id": str(session_id)})
    if not sess:
        try:
            from bson import ObjectId
            sess = db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
        except Exception:
            pass

    if not sess:
        return error_response("Session not found", 404)

    # Fetch students enrolled in this section
    students = list(db.students.find({
        "department": sess.get("department"),
        "semester": sess.get("semester"),
        "section": sess.get("section")
    }))
    usn_list = [s.get("usn") for s in students]

    result = FaceAttendanceService.recognize_and_verify(image_base64, target_usn_list=usn_list)
    return success_response(result, "Face recognition processing completed")

@face_attendance_bp.route("/enroll", methods=["POST"])
@jwt_required()
def enroll_student_face():
    """Student/Faculty enrolls face template with consent"""
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    image_base64 = data.get("image", "")

    if not image_base64:
        return error_response("Image capture is required for face registration", 400)

    db = get_db()
    student = db.students.find_one({"user_id": user_id})
    if not student:
        return error_response("Student record not found", 404)

    result = FaceAttendanceService.enroll_face(student["_id"], image_base64)
    return success_response(result, "Face data registered successfully")
