import qrcode
import io
import base64
import secrets
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_db

class QRService:
    @staticmethod
    def create_session(session_id, faculty_id, valid_minutes=15):
        """Creates a signed short-lived QR session code and returns base64 image"""
        db = get_db()
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(minutes=valid_minutes)

        # Deactivate previous active QR codes for this session
        db.qr_sessions.update_many(
            {"session_id": str(session_id), "is_active": True},
            {"$set": {"is_active": False}}
        )

        qr_doc = {
            "session_id": str(session_id),
            "faculty_id": str(faculty_id),
            "token": token,
            "expires_at": expires_at,
            "is_active": True,
            "scanned_students": [],
            "created_at": datetime.utcnow()
        }
        db.qr_sessions.insert_one(qr_doc)

        # Generate QR Code image payload
        # Payload can be scanned URL or raw token
        qr_payload = f"SMARTCAMPUS_QR_ATTENDANCE:{token}:{session_id}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_payload)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        qr_image_uri = f"data:image/png;base64,{img_str}"

        return {
            "token": token,
            "expires_at": expires_at.isoformat(),
            "valid_minutes": valid_minutes,
            "qr_image_data": qr_image_uri,
            "qr_payload": qr_payload
        }

    @staticmethod
    def verify_and_checkin(token, student_id, student_usn, student_name):
        """Student check-in via QR token validation"""
        db = get_db()
        qr_session = db.qr_sessions.find_one({"token": token, "is_active": True})

        if not qr_session:
            return {"success": False, "error": "Invalid or expired QR session token."}

        if datetime.utcnow() > qr_session["expires_at"]:
            db.qr_sessions.update_one({"_id": qr_session["_id"]}, {"$set": {"is_active": False}})
            return {"success": False, "error": "This QR attendance session has expired."}

        session_id = qr_session["session_id"]
        
        # Verify if session is already finalized
        sess = db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
        if not sess:
            return {"success": False, "error": "Attendance session not found."}

        if sess.get("is_finalized"):
            return {"success": False, "error": "Attendance for this class has already been finalized by faculty."}

        # Check for duplicate scan
        existing_scan = db.attendance_records.find_one({
            "session_id": str(session_id),
            "student_id": str(student_id)
        })

        if existing_scan:
            return {
                "success": True,
                "already_marked": True,
                "status": existing_scan.get("status"),
                "message": f"You are already recorded as {existing_scan.get('status')} for this session."
            }

        # Save student record as Present
        new_record = {
            "session_id": str(session_id),
            "student_id": str(student_id),
            "usn": student_usn,
            "student_name": student_name,
            "department": sess.get("department"),
            "semester": sess.get("semester"),
            "section": sess.get("section"),
            "subject_code": sess.get("subject_code"),
            "date": sess.get("date"),
            "period": sess.get("period"),
            "status": "Present",
            "method": "QR_CODE_SCAN",
            "created_at": datetime.utcnow()
        }
        db.attendance_records.insert_one(new_record)

        # Append to scanned list in qr_session for live faculty dashboard updates
        db.qr_sessions.update_one(
            {"_id": qr_session["_id"]},
            {"$addToSet": {"scanned_students": {
                "student_id": str(student_id),
                "usn": student_usn,
                "name": student_name,
                "scanned_at": datetime.utcnow().isoformat()
            }}}
        )

        return {
            "success": True,
            "message": f"Successfully marked Present for {sess.get('subject_name', sess.get('subject_code'))}!",
            "session_details": {
                "subject": sess.get("subject_name", sess.get("subject_code")),
                "date": sess.get("date"),
                "period": sess.get("period")
            }
        }
