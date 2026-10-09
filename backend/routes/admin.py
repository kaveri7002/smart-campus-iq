from flask import Blueprint, request
from werkzeug.security import generate_password_hash
from flask_jwt_extended import jwt_required
from datetime import datetime
from bson import ObjectId
from database import get_db
from utils.auth_helpers import role_required
from utils.response_helpers import success_response, error_response

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("admin")
def list_all_users():
    db = get_db()
    role = request.args.get("role")
    query = {"role": role} if role else {}
    users = list(db.users.find(query, {"password": 0}).sort("created_at", -1))
    return success_response(users, f"Found {len(users)} users")

@admin_bp.route("/users", methods=["POST"])
@jwt_required()
@role_required("admin")
def create_user():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "Campus@123")
    role = data.get("role", "student")
    department = data.get("department", "CSE")
    phone = data.get("phone", "")

    if not name or not email:
        return error_response("Name and email are required", 400)

    db = get_db()
    if db.users.find_one({"email": email}):
        return error_response("User with this email already exists", 400)

    hashed_pw = generate_password_hash(password)
    user_doc = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "role": role,
        "department": department,
        "phone": phone,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    user_id = db.users.insert_one(user_doc).inserted_id

    # Create associated profile record
    if role == "student":
        usn = data.get("usn", f"1IT21{department[:2].upper()}{random_digits(3)}")
        db.students.insert_one({
            "user_id": str(user_id),
            "usn": usn,
            "name": name,
            "email": email,
            "phone": phone,
            "department": department,
            "semester": int(data.get("semester", 6)),
            "section": data.get("section", "A"),
            "cgpa": float(data.get("cgpa", 8.0)),
            "batch": data.get("batch", "2021-2025"),
            "created_at": datetime.utcnow()
        })
    elif role == "faculty":
        db.faculty.insert_one({
            "user_id": str(user_id),
            "faculty_id": f"FAC-{department[:3].upper()}-{random_digits(3)}",
            "name": name,
            "email": email,
            "department": department,
            "designation": data.get("designation", "Assistant Professor"),
            "phone": phone,
            "subjects": data.get("subjects", []),
            "cabin": data.get("cabin", "Block A-201"),
            "created_at": datetime.utcnow()
        })

    user_doc["_id"] = user_id
    del user_doc["password"]
    return success_response(user_doc, "User created successfully", 201)

def random_digits(n):
    import random
    return "".join([str(random.randint(0, 9)) for _ in range(n)])

@admin_bp.route("/settings", methods=["GET"])
@jwt_required()
def get_settings():
    db = get_db()
    settings = db.system_settings.find_one({}) or {
        "college_name": "Institute of Technology & Advanced Engineering (ITAE)",
        "college_code": "ITAE",
        "attendance_threshold_percentage": 75,
        "sms_mode": "demo"
    }
    return success_response(settings, "System settings loaded")

@admin_bp.route("/settings", methods=["PUT"])
@jwt_required()
@role_required("admin")
def update_settings():
    data = request.get_json() or {}
    db = get_db()
    
    update_doc = {
        "college_name": data.get("college_name", "Institute of Technology & Advanced Engineering (ITAE)"),
        "college_code": data.get("college_code", "ITAE"),
        "attendance_threshold_percentage": int(data.get("attendance_threshold_percentage", 75)),
        "sms_mode": data.get("sms_mode", "demo").lower(),
        "allow_qr_attendance": bool(data.get("allow_qr_attendance", True)),
        "allow_face_attendance": bool(data.get("allow_face_attendance", True)),
        "updated_at": datetime.utcnow()
    }

    db.system_settings.update_one({}, {"$set": update_doc}, upsert=True)
    settings = db.system_settings.find_one({})
    return success_response(settings, "Settings saved successfully")
