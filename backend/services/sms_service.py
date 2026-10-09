import os
import logging
from datetime import datetime
from bson import ObjectId
from config import Config
from database import get_db

logger = logging.getLogger("SmartCampusSMS")

class SMSService:
    @staticmethod
    def get_mode():
        db = get_db()
        settings = db.system_settings.find_one({})
        if settings and "sms_mode" in settings:
            return settings["sms_mode"].lower()
        return Config.SMS_MODE.lower()

    @staticmethod
    def format_message(student_name, subject_name, date_str, status, percentage, college_name=None):
        college = college_name or Config.COLLEGE_SHORT
        status_upper = status.upper()
        
        if status_upper == "PRESENT":
            return f"Hello {student_name}, your attendance for {subject_name} on {date_str} has been marked PRESENT. Your current attendance is {percentage:.1f}%. - {college}"
        elif status_upper == "ABSENT":
            return f"Hello {student_name}, your attendance for {subject_name} on {date_str} has been marked ABSENT. Please contact your faculty if you believe this is incorrect. - {college}"
        elif status_upper == "LATE":
            return f"Hello {student_name}, your attendance for {subject_name} on {date_str} has been marked LATE. Your current attendance is {percentage:.1f}%. - {college}"
        else:
            return f"Hello {student_name}, your attendance for {subject_name} on {date_str} is recorded as {status_upper}. - {college}"

    @classmethod
    def send_notification(cls, notification_id):
        """Processes a single notification document with idempotency and safe error handling"""
        db = get_db()
        try:
            notif = db.sms_notifications.find_one({"_id": ObjectId(notification_id)})
        except Exception:
            notif = db.sms_notifications.find_one({"_id": notification_id})
            
        if not notif:
            logger.error(f"SMS notification {notification_id} not found.")
            return {"success": False, "error": "Notification record not found"}

        # If already successfully delivered or in demo mode sent, don't resend
        if notif.get("status") in ["Sent", "Delivered", "Demo"]:
            return {"success": True, "status": notif.get("status"), "message": "Already processed"}

        mode = cls.get_mode()
        phone = notif.get("phone", "").strip()
        message_body = notif.get("message_body", "")

        # 1. Demo Mode
        if mode == "demo":
            update_data = {
                "status": "Demo",
                "delivery_status": "Simulated (Demo Mode - Verified)",
                "provider_message_id": f"DEMO-MSG-{int(datetime.utcnow().timestamp())}",
                "mode": "demo",
                "processed_at": datetime.utcnow(),
                "error_details": None
            }
            db.sms_notifications.update_one({"_id": notif["_id"]}, {"$set": update_data})
            logger.info(f"[DEMO SMS] To: {phone} | Body: {message_body}")
            return {"success": True, "status": "Demo", "message": "Demo SMS logged successfully"}

        # 2. Live Mode (Twilio SDK)
        if not Config.TWILIO_ACCOUNT_SID or not Config.TWILIO_AUTH_TOKEN or not Config.TWILIO_PHONE_NUMBER:
            update_data = {
                "status": "Failed",
                "delivery_status": "Failed - Missing Twilio Credentials",
                "error_details": "Twilio Account SID, Auth Token, or From Number is unconfigured in environment.",
                "mode": "live",
                "processed_at": datetime.utcnow()
            }
            db.sms_notifications.update_one({"_id": notif["_id"]}, {"$set": update_data})
            return {"success": False, "status": "Failed", "error": "Twilio credentials missing"}

        try:
            from twilio.rest import Client
            client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
            
            # Simple phone format sanitation for E.164
            target_phone = phone
            if not target_phone.startswith("+"):
                # Default to India (+91) if 10 digits
                if len(target_phone) == 10:
                    target_phone = f"+91{target_phone}"
                else:
                    target_phone = f"+{target_phone}"

            message = client.messages.create(
                body=message_body,
                from_=Config.TWILIO_PHONE_NUMBER,
                to=target_phone
            )

            update_data = {
                "status": "Sent",
                "delivery_status": message.status.capitalize(),
                "provider_message_id": message.sid,
                "mode": "live",
                "processed_at": datetime.utcnow(),
                "error_details": None
            }
            db.sms_notifications.update_one({"_id": notif["_id"]}, {"$set": update_data})
            logger.info(f"[LIVE SMS] Sent to {target_phone}, SID: {message.sid}")
            return {"success": True, "status": "Sent", "sid": message.sid}

        except Exception as e:
            err_msg = str(e)
            logger.error(f"[LIVE SMS ERROR] To: {phone} | Error: {err_msg}")
            update_data = {
                "status": "Failed",
                "delivery_status": "Failed - Provider Error",
                "error_details": err_msg,
                "mode": "live",
                "processed_at": datetime.utcnow()
            }
            db.sms_notifications.update_one({"_id": notif["_id"]}, {"$set": update_data})
            return {"success": False, "status": "Failed", "error": err_msg}

    @classmethod
    def dispatch_session_sms(cls, session_id):
        """Creates notifications for all students in a finalized attendance session and dispatches them safely"""
        db = get_db()
        try:
            sess = db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
        except Exception:
            sess = db.attendance_sessions.find_one({"_id": session_id})

        if not sess:
            return {"success": False, "error": "Attendance session not found"}

        subject_code = sess.get("subject_code")
        subject_name = sess.get("subject_name", subject_code)
        date_str = sess.get("date")

        # Fetch all records for this session
        records = list(db.attendance_records.find({"session_id": str(sess["_id"])}))
        if not records:
            # Try matching by ObjectId if string didn't match
            records = list(db.attendance_records.find({"session_id": ObjectId(sess["_id"])}))

        results = []
        for rec in records:
            student_id = rec.get("student_id")
            # Fetch student details for mobile & current percentage
            try:
                student = db.students.find_one({"_id": ObjectId(student_id)})
            except Exception:
                student = db.students.find_one({"_id": student_id})

            if not student:
                continue

            # Calculate up-to-date subject attendance percentage
            student_all_records = list(db.attendance_records.find({
                "student_id": str(student["_id"]),
                "subject_code": subject_code
            }))
            total_classes = len(student_all_records)
            attended_classes = sum(1 for r in student_all_records if r.get("status") in ["Present", "Late"])
            percentage = (attended_classes / total_classes * 100.0) if total_classes > 0 else 100.0

            message_text = cls.format_message(
                student_name=student.get("name", "Student"),
                subject_name=subject_name,
                date_str=date_str,
                status=rec.get("status", "Present"),
                percentage=percentage,
                college_name=Config.COLLEGE_NAME
            )

            # Check if notification document already exists (idempotency)
            existing = db.sms_notifications.find_one({
                "session_id": str(sess["_id"]),
                "student_id": str(student["_id"])
            })

            if existing:
                notif_id = existing["_id"]
                # If previously failed, we allow processing again
                if existing.get("status") in ["Sent", "Demo"]:
                    results.append({"student_id": str(student["_id"]), "status": existing.get("status")})
                    continue
            else:
                notif_doc = {
                    "session_id": str(sess["_id"]),
                    "student_id": str(student["_id"]),
                    "usn": student.get("usn"),
                    "student_name": student.get("name"),
                    "phone": student.get("phone"),
                    "subject_code": subject_code,
                    "subject_name": subject_name,
                    "date": date_str,
                    "attendance_status": rec.get("status"),
                    "calculated_percentage": round(percentage, 2),
                    "message_body": message_text,
                    "status": "Pending",
                    "delivery_status": "Queued",
                    "mode": cls.get_mode(),
                    "retry_count": 0,
                    "created_at": datetime.utcnow()
                }
                insert_res = db.sms_notifications.insert_one(notif_doc)
                notif_id = insert_res.inserted_id

            # Dispatch notification
            dispatch_res = cls.send_notification(notif_id)
            results.append({"student_id": str(student["_id"]), "status": dispatch_res.get("status")})

        # Mark session sms_dispatched flag
        db.attendance_sessions.update_one(
            {"_id": sess["_id"]},
            {"$set": {"sms_dispatched": True, "sms_dispatched_at": datetime.utcnow()}}
        )

        return {"success": True, "dispatched_count": len(results), "details": results}
