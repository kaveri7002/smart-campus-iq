import csv
import io
from flask import Blueprint, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response
from services.sms_service import SMSService

attendance_bp = Blueprint("attendance", __name__)

@attendance_bp.route("/sessions", methods=["POST"])
@jwt_required()
@role_required(["faculty", "admin"])
def get_or_create_session():
    """Finds existing session or creates a new attendance session for the class period"""
    data = request.get_json() or {}
    department = data.get("department")
    semester = data.get("semester")
    section = data.get("section")
    subject_code = data.get("subject_code")
    date_str = data.get("date", datetime.utcnow().strftime("%Y-%m-%d"))
    period = data.get("period", 1)

    if not all([department, semester, section, subject_code, date_str]):
        return error_response("Department, semester, section, subject, and date are required", 400)

    try:
        semester = int(semester)
        period = int(period)
    except ValueError:
        return error_response("Semester and period must be valid integers", 400)

    db = get_db()
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_name = claims.get("name", "Faculty")

    # Subject details
    subject = db.subjects.find_one({"code": subject_code})
    subject_name = subject.get("name", subject_code) if subject else subject_code

    # Check for existing session (prevent duplicates)
    session = db.attendance_sessions.find_one({
        "department": department,
        "semester": semester,
        "section": section,
        "subject_code": subject_code,
        "date": date_str,
        "period": period
    })

    if not session:
        session_doc = {
            "faculty_id": user_id,
            "faculty_name": user_name,
            "department": department,
            "semester": semester,
            "section": section,
            "subject_code": subject_code,
            "subject_name": subject_name,
            "date": date_str,
            "period": period,
            "is_finalized": False,
            "sms_dispatched": False,
            "created_at": datetime.utcnow()
        }
        res = db.attendance_sessions.insert_one(session_doc)
        session_id = str(res.inserted_id)
        session = db.attendance_sessions.find_one({"_id": res.inserted_id})
    else:
        session_id = str(session["_id"])

    # Load students enrolled in this class section
    students = list(db.students.find({
        "department": department,
        "semester": semester,
        "section": section
    }).sort("usn", 1))

    # Load existing attendance records for this session
    records = list(db.attendance_records.find({"session_id": session_id}))
    record_map = {r["student_id"]: r["status"] for r in records}

    # Format students list with current attendance status
    student_list = []
    for s in students:
        s_id = str(s["_id"])
        
        # Calculate past cumulative attendance in this subject
        past_records = list(db.attendance_records.find({
            "student_id": s_id,
            "subject_code": subject_code
        }))
        tot = len(past_records)
        att = sum(1 for r in past_records if r.get("status") in ["Present", "Late"])
        hist_pct = (att / tot * 100.0) if tot > 0 else 100.0

        student_list.append({
            "student_id": s_id,
            "usn": s.get("usn"),
            "name": s.get("name"),
            "phone": s.get("phone"),
            "status": record_map.get(s_id, "Present"),  # default Present for convenient fast marking
            "cumulative_percentage": round(hist_pct, 1),
            "is_low_attendance": hist_pct < 75.0
        })

    # Fetch notification status summary if already dispatched
    sms_logs = list(db.sms_notifications.find({"session_id": session_id}))

    return success_response({
        "session": session,
        "students": student_list,
        "sms_logs": sms_logs,
        "total_students": len(student_list),
        "present_count": sum(1 for s in student_list if s["status"] == "Present"),
        "absent_count": sum(1 for s in student_list if s["status"] == "Absent"),
        "late_count": sum(1 for s in student_list if s["status"] == "Late")
    }, "Attendance session loaded")

@attendance_bp.route("/sessions", methods=["GET"])
@jwt_required()
def list_sessions():
    db = get_db()
    dept = request.args.get("department")
    sem = request.args.get("semester")
    sec = request.args.get("section")
    subj = request.args.get("subject_code")
    date_str = request.args.get("date")

    query = {}
    if dept:
        query["department"] = dept
    if sem:
        try: query["semester"] = int(sem)
        except ValueError: pass
    if sec:
        query["section"] = sec
    if subj:
        query["subject_code"] = subj
    if date_str:
        query["date"] = date_str

    sessions = list(db.attendance_sessions.find(query).sort("created_at", -1).limit(50))
    return success_response(sessions, f"Retrieved {len(sessions)} sessions")

@attendance_bp.route("/sessions/<session_id>/records", methods=["POST"])
@jwt_required()
@role_required(["faculty", "admin"])
def save_attendance_records(session_id):
    """Saves or updates draft attendance records for a session before finalizing"""
    db = get_db()
    try:
        sess = db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
    except Exception:
        sess = db.attendance_sessions.find_one({"_id": session_id})

    if not sess:
        return error_response("Session not found", 404)

    if sess.get("is_finalized"):
        return error_response("Cannot modify attendance after session has been finalized.", 400)

    data = request.get_json() or {}
    records = data.get("records", [])

    if not records:
        return error_response("Records list is empty", 400)

    saved_count = 0
    for r in records:
        student_id = r.get("student_id")
        status = r.get("status", "Present")
        usn = r.get("usn")
        name = r.get("name")

        # Upsert record
        filter_q = {"session_id": str(sess["_id"]), "student_id": str(student_id)}
        update_doc = {
            "$set": {
                "session_id": str(sess["_id"]),
                "student_id": str(student_id),
                "usn": usn,
                "student_name": name,
                "department": sess.get("department"),
                "semester": sess.get("semester"),
                "section": sess.get("section"),
                "subject_code": sess.get("subject_code"),
                "subject_name": sess.get("subject_name"),
                "date": sess.get("date"),
                "period": sess.get("period"),
                "status": status,
                "updated_at": datetime.utcnow()
            }
        }
        db.attendance_records.update_one(filter_q, update_doc, upsert=True)
        saved_count += 1

    return success_response({"saved_count": saved_count}, "Attendance records saved successfully")

@attendance_bp.route("/sessions/<session_id>/finalize", methods=["POST"])
@jwt_required()
@role_required(["faculty", "admin"])
def finalize_session(session_id):
    """
    Finalizes attendance session:
    1. Locks the session so records cannot be tampered.
    2. Computes updated cumulative student percentages.
    3. Triggers automated SMS dispatch (Twilio Live / Simulated Demo).
    4. Records comprehensive SMS audit logs.
    """
    db = get_db()
    try:
        sess = db.attendance_sessions.find_one({"_id": ObjectId(session_id)})
    except Exception:
        sess = db.attendance_sessions.find_one({"_id": session_id})

    if not sess:
        return error_response("Attendance session not found", 404)

    # If already finalized and SMS dispatched, return status
    if sess.get("is_finalized") and sess.get("sms_dispatched"):
        sms_logs = list(db.sms_notifications.find({"session_id": str(sess["_id"])}))
        return success_response({
            "session_id": str(sess["_id"]),
            "is_finalized": True,
            "sms_logs": sms_logs,
            "already_finalized": True
        }, "Session is already finalized")

    # Finalize session
    db.attendance_sessions.update_one(
        {"_id": sess["_id"]},
        {"$set": {
            "is_finalized": True,
            "finalized_at": datetime.utcnow()
        }}
    )

    # Trigger SMS dispatch engine
    sms_result = SMSService.dispatch_session_sms(session_id)

    # Fetch updated SMS logs to return to faculty dashboard
    sms_logs = list(db.sms_notifications.find({"session_id": str(sess["_id"])}))

    return success_response({
        "session_id": str(sess["_id"]),
        "is_finalized": True,
        "sms_dispatch": sms_result,
        "sms_logs": sms_logs
    }, "Attendance successfully finalized and SMS notifications processed!")

@attendance_bp.route("/reports", methods=["GET"])
@jwt_required()
def get_attendance_reports():
    """Generates subject-wise, student-wise, and low-attendance alerts (<75%)"""
    db = get_db()
    department = request.args.get("department", "CSE")
    semester = request.args.get("semester", "6")
    section = request.args.get("section", "A")

    try:
        sem_int = int(semester)
    except ValueError:
        sem_int = 6

    students = list(db.students.find({
        "department": department,
        "semester": sem_int,
        "section": section
    }).sort("usn", 1))

    subjects = list(db.subjects.find({"department": department, "semester": sem_int}))
    if not subjects:
        subjects = list(db.subjects.find({"semester": sem_int}))

    report_data = []
    low_attendance_alerts = []

    for st in students:
        s_id = str(st["_id"])
        subject_breakdown = {}
        total_held_all = 0
        total_attended_all = 0

        for subj in subjects:
            code = subj["code"]
            recs = list(db.attendance_records.find({"student_id": s_id, "subject_code": code}))
            held = len(recs)
            att = sum(1 for r in recs if r.get("status") in ["Present", "Late"])
            pct = (att / held * 100.0) if held > 0 else 100.0
            
            subject_breakdown[code] = {
                "subject_name": subj.get("name"),
                "held": held,
                "attended": att,
                "absent": held - att,
                "percentage": round(pct, 1)
            }
            total_held_all += held
            total_attended_all += att

        overall_pct = (total_attended_all / total_held_all * 100.0) if total_held_all > 0 else 100.0
        
        student_row = {
            "student_id": s_id,
            "usn": st.get("usn"),
            "name": st.get("name"),
            "department": st.get("department"),
            "semester": st.get("semester"),
            "section": st.get("section"),
            "phone": st.get("phone"),
            "total_classes": total_held_all,
            "attended_classes": total_attended_all,
            "overall_percentage": round(overall_pct, 1),
            "subject_breakdown": subject_breakdown,
            "is_critical": overall_pct < 75.0
        }
        report_data.append(student_row)

        if overall_pct < 75.0:
            low_attendance_alerts.append({
                "student_id": s_id,
                "usn": st.get("usn"),
                "name": st.get("name"),
                "phone": st.get("phone"),
                "overall_percentage": round(overall_pct, 1),
                "classes_needed_for_75": max(0, int((3 * total_held_all - 4 * total_attended_all) / 1)) if total_held_all > 0 else 0
            })

    return success_response({
        "department": department,
        "semester": sem_int,
        "section": section,
        "students_count": len(students),
        "reports": report_data,
        "low_attendance_alerts": low_attendance_alerts,
        "class_average": round(sum(r["overall_percentage"] for r in report_data) / max(1, len(report_data)), 1)
    }, "Attendance reports generated")

@attendance_bp.route("/export-csv", methods=["GET"])
@jwt_required()
def export_attendance_csv():
    """Exports attendance report to downloadable CSV file"""
    db = get_db()
    department = request.args.get("department", "CSE")
    semester = request.args.get("semester", "6")
    section = request.args.get("section", "A")

    try:
        sem_int = int(semester)
    except ValueError:
        sem_int = 6

    students = list(db.students.find({
        "department": department,
        "semester": sem_int,
        "section": section
    }).sort("usn", 1))

    output = io.StringIO()
    writer = csv.writer(output)
    
    # CSV Header
    writer.writerow(["USN", "Student Name", "Department", "Semester", "Section", "Contact Number", "Total Classes", "Attended", "Attendance %", "Status Alert"])

    for st in students:
        s_id = str(st["_id"])
        recs = list(db.attendance_records.find({"student_id": s_id}))
        held = len(recs)
        att = sum(1 for r in recs if r.get("status") in ["Present", "Late"])
        pct = (att / held * 100.0) if held > 0 else 100.0
        alert = "CRITICAL (<75%)" if pct < 75.0 else "Satisfactory"

        writer.writerow([
            st.get("usn"),
            st.get("name"),
            st.get("department"),
            st.get("semester"),
            st.get("section"),
            st.get("phone"),
            held,
            att,
            f"{pct:.1f}%",
            alert
        ])

    csv_data = output.getvalue()
    filename = f"Attendance_Report_{department}_Sem{semester}_{section}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    
    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition": f"attachment; filename={filename}"}
    )

@attendance_bp.route("/me", methods=["GET"])
@jwt_required()
@role_required("student")
def get_my_attendance():
    """Returns student's individual attendance breakdown, historical logs, and SMS notification history"""
    user_id = get_jwt_identity()
    db = get_db()
    student = db.students.find_one({"user_id": user_id})

    if not student:
        return error_response("Student record not found", 404)

    s_id = str(student["_id"])
    records = list(db.attendance_records.find({"student_id": s_id}).sort("date", -1))
    sms_logs = list(db.sms_notifications.find({"student_id": s_id}).sort("created_at", -1))

    # Calculate overall & subject breakdown
    subjects = list(db.subjects.find({"department": student.get("department"), "semester": student.get("semester")}))
    if not subjects:
        subjects = list(db.subjects.find())

    subject_stats = []
    tot_held = len(records)
    tot_att = sum(1 for r in records if r.get("status") in ["Present", "Late"])

    for sub in subjects:
        code = sub["code"]
        sub_recs = [r for r in records if r.get("subject_code") == code]
        held = len(sub_recs)
        att = sum(1 for r in sub_recs if r.get("status") in ["Present", "Late"])
        pct = (att / held * 100.0) if held > 0 else 100.0
        
        subject_stats.append({
            "code": code,
            "name": sub.get("name"),
            "credits": sub.get("credits", 4),
            "held": held,
            "attended": att,
            "absent": held - att,
            "percentage": round(pct, 1),
            "is_low": pct < 75.0
        })

    overall_pct = (tot_att / tot_held * 100.0) if tot_held > 0 else 100.0

    return success_response({
        "student": student,
        "overall_percentage": round(overall_pct, 1),
        "total_classes": tot_held,
        "attended_classes": tot_att,
        "absent_classes": tot_held - tot_att,
        "is_low_attendance": overall_pct < 75.0,
        "subject_breakdown": subject_stats,
        "recent_records": records[:20],
        "sms_history": sms_logs[:20]
    }, "Student attendance retrieved")
