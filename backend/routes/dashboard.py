from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response
from services.sms_service import SMSService

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/student", methods=["GET"])
@jwt_required()
@role_required("student")
def get_student_dashboard():
    user_id = get_jwt_identity()
    db = get_db()
    student = db.students.find_one({"user_id": user_id})

    if not student:
        return error_response("Student record not found", 404)

    s_id = str(student["_id"])
    
    # 1. Attendance statistics
    records = list(db.attendance_records.find({"student_id": s_id}))
    tot_classes = len(records)
    att_classes = sum(1 for r in records if r.get("status") in ["Present", "Late"])
    overall_pct = (att_classes / tot_classes * 100.0) if tot_classes > 0 else 100.0

    # 2. Today's schedule
    day_name = datetime.utcnow().strftime("%A")
    tt = db.timetables.find_one({
        "department": student.get("department"),
        "semester": student.get("semester"),
        "section": student.get("section")
    })
    
    today_schedule = []
    if tt and "schedule" in tt:
        today_schedule = [s for s in tt["schedule"] if s.get("day") == day_name]
        if not today_schedule:
            # For weekend demo, show Monday's schedule
            today_schedule = [s for s in tt["schedule"] if s.get("day") == "Monday"]

    # 3. Recent SMS alerts
    recent_sms = list(db.sms_notifications.find({"student_id": s_id}).sort("created_at", -1).limit(5))

    # 4. Announcements & Events
    announcements = list(db.announcements.find().sort("date", -1).limit(4))
    events = list(db.events.find({"is_active": True}).sort("date", 1).limit(3))

    # 5. Complaints
    complaints = list(db.complaints.find({"user_id": user_id}).sort("created_at", -1).limit(3))

    return success_response({
        "profile": student,
        "overall_attendance_pct": round(overall_pct, 1),
        "total_classes": tot_classes,
        "attended_classes": att_classes,
        "is_low_attendance": overall_pct < 75.0,
        "today_schedule": today_schedule,
        "recent_sms": recent_sms,
        "announcements": announcements,
        "upcoming_events": events,
        "my_complaints": complaints
    }, "Student dashboard loaded")

@dashboard_bp.route("/faculty", methods=["GET"])
@jwt_required()
@role_required(["faculty", "admin"])
def get_faculty_dashboard():
    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()

    faculty = db.faculty.find_one({"user_id": user_id})
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    # Sessions conducted by this faculty
    sessions = list(db.attendance_sessions.find({"faculty_id": user_id}).sort("date", -1).limit(10))
    
    # Lab bookings pending approval
    pending_bookings = list(db.laboratory_bookings.find({"status": "Pending Approval"}).limit(5))

    # Low attendance students alert
    low_att_records = list(db.attendance_records.find({}))
    # Find critical students across department
    all_students = list(db.students.find({"department": faculty.get("department", "CSE") if faculty else "CSE"}))
    low_att_list = []
    for s in all_students:
        s_recs = [r for r in low_att_records if r.get("student_id") == str(s["_id"])]
        if s_recs:
            h = len(s_recs)
            a = sum(1 for r in s_recs if r.get("status") in ["Present", "Late"])
            pct = (a / h * 100.0)
            if pct < 75.0:
                low_att_list.append({
                    "usn": s.get("usn"),
                    "name": s.get("name"),
                    "department": s.get("department"),
                    "percentage": round(pct, 1),
                    "phone": s.get("phone")
                })

    return success_response({
        "faculty": faculty or {"name": claims.get("name")},
        "today_date": today_str,
        "recent_sessions": sessions,
        "pending_lab_approvals": pending_bookings,
        "low_attendance_alerts": low_att_list[:5],
        "assigned_subjects": faculty.get("subjects", []) if faculty else ["CS601", "CS602"]
    }, "Faculty dashboard loaded")

@dashboard_bp.route("/admin", methods=["GET"])
@jwt_required()
@role_required("admin")
def get_admin_dashboard():
    db = get_db()
    
    total_students = db.students.count_documents({})
    total_faculty = db.faculty.count_documents({})
    total_sessions = db.attendance_sessions.count_documents({})
    total_complaints = db.complaints.count_documents({})
    open_complaints = db.complaints.count_documents({"status": {"$in": ["Submitted", "In Progress"]}})
    total_labs = db.laboratories.count_documents({})
    total_projects = db.projects.count_documents({})
    
    # SMS stats
    sms_total = db.sms_notifications.count_documents({})
    sms_sent = db.sms_notifications.count_documents({"status": "Sent"})
    sms_demo = db.sms_notifications.count_documents({"status": "Demo"})
    sms_failed = db.sms_notifications.count_documents({"status": "Failed"})

    # Department breakdown
    dept_distribution = [
        {"name": "CSE", "students": db.students.count_documents({"department": "CSE"})},
        {"name": "AI & ML", "students": db.students.count_documents({"department": "AI & ML"})},
        {"name": "ECE", "students": db.students.count_documents({"department": "ECE"})},
        {"name": "ISE", "students": db.students.count_documents({"department": "ISE"})},
        {"name": "Civil", "students": db.students.count_documents({"department": "Civil"})},
        {"name": "ME", "students": db.students.count_documents({"department": "ME"})}
    ]

    # Attendance overall health
    records = list(db.attendance_records.find({}))
    tot = len(records)
    att = sum(1 for r in records if r.get("status") in ["Present", "Late"])
    avg_att = (att / tot * 100.0) if tot > 0 else 88.5

    settings = db.system_settings.find_one({}) or {}

    return success_response({
        "metrics": {
            "total_students": total_students,
            "total_faculty": total_faculty,
            "total_sessions": total_sessions,
            "average_attendance": round(avg_att, 1),
            "open_complaints": open_complaints,
            "total_complaints": total_complaints,
            "total_labs": total_labs,
            "active_projects": total_projects
        },
        "sms_stats": {
            "total": sms_total,
            "sent": sms_sent,
            "demo": sms_demo,
            "failed": sms_failed,
            "mode": SMSService.get_mode()
        },
        "department_distribution": dept_distribution,
        "system_settings": settings
    }, "Administrator dashboard loaded")
