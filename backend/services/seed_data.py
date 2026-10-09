from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import logging

logger = logging.getLogger("SmartCampusSeed")

def seed_database(db):
    """Seed comprehensive demo data for Engineering College if collections are empty"""
    try:
        if db.users.count_documents({}) > 0:
            logger.info("Database already seeded with initial data.")
            return

        logger.info("Starting database seeding with realistic engineering campus data...")
        
        # 1. Departments
        departments = [
            {"code": "CSE", "name": "Computer Science & Engineering", "hod": "Dr. R. K. Hegde", "building": "Block A - Ramanujan Bhavan"},
            {"code": "ISE", "name": "Information Science & Engineering", "hod": "Dr. M. S. Swaminathan", "building": "Block A - 3rd Floor"},
            {"code": "AI & ML", "name": "Artificial Intelligence & Machine Learning", "hod": "Dr. Sudha Murthy", "building": "Block C - Innovation Hub"},
            {"code": "ECE", "name": "Electronics & Communication Engineering", "hod": "Dr. V. K. Atre", "building": "Block B - Vikram Sarabhai Bhavan"},
            {"code": "EEE", "name": "Electrical & Electronics Engineering", "hod": "Dr. Homi Bhabha", "building": "Block B - Ground Floor"},
            {"code": "ME", "name": "Mechanical Engineering", "hod": "Dr. E. Sreedharan", "building": "Block D - Workshop Complex"},
            {"code": "Civil", "name": "Civil Engineering", "hod": "Dr. M. Visvesvaraya", "building": "Block E - Sir MV Bhavan"}
        ]
        db.departments.insert_many(departments)
        
        # 2. Subjects
        subjects = [
            {"code": "CS601", "name": "Cloud Computing & Distributed Systems", "department": "CSE", "semester": 6, "credits": 4},
            {"code": "CS602", "name": "Full Stack Web Engineering", "department": "CSE", "semester": 6, "credits": 4},
            {"code": "CS603", "name": "Advanced Database Management", "department": "CSE", "semester": 6, "credits": 3},
            {"code": "AI601", "name": "Deep Learning & Computer Vision", "department": "AI & ML", "semester": 6, "credits": 4},
            {"code": "AI602", "name": "Natural Language Processing", "department": "AI & ML", "semester": 6, "credits": 4},
            {"code": "EC601", "name": "Embedded Systems & IoT Protocols", "department": "ECE", "semester": 6, "credits": 4},
            {"code": "IS601", "name": "Cyber Security & Cryptography", "department": "ISE", "semester": 6, "credits": 4}
        ]
        db.subjects.insert_many(subjects)
        
        # 3. Users & Profiles
        password_hash = generate_password_hash("Campus@123")
        
        # Administrator
        admin_user = {
            "name": "Prof. S. R. Kulkarni (Dean & Admin)",
            "email": "admin@campus.edu",
            "password": password_hash,
            "role": "admin",
            "phone": "+919845000001",
            "department": "Administration",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        admin_id = db.users.insert_one(admin_user).inserted_id
        
        # Faculty 1 (CSE)
        fac1_user = {
            "name": "Dr. Rajesh Sharma",
            "email": "faculty.cse@campus.edu",
            "password": password_hash,
            "role": "faculty",
            "phone": "+919845000002",
            "department": "CSE",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        fac1_id = db.users.insert_one(fac1_user).inserted_id
        db.faculty.insert_one({
            "user_id": str(fac1_id),
            "faculty_id": "FAC-CSE-101",
            "name": "Dr. Rajesh Sharma",
            "email": "faculty.cse@campus.edu",
            "department": "CSE",
            "designation": "Associate Professor",
            "phone": "+919845000002",
            "subjects": ["CS601", "CS602"],
            "cabin": "A-304",
            "created_at": datetime.utcnow()
        })
        
        # Faculty 2 (AI&ML)
        fac2_user = {
            "name": "Prof. Priya Nair",
            "email": "faculty.aiml@campus.edu",
            "password": password_hash,
            "role": "faculty",
            "phone": "+919845000003",
            "department": "AI & ML",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        fac2_id = db.users.insert_one(fac2_user).inserted_id
        db.faculty.insert_one({
            "user_id": str(fac2_id),
            "faculty_id": "FAC-AIML-102",
            "name": "Prof. Priya Nair",
            "email": "faculty.aiml@campus.edu",
            "department": "AI & ML",
            "designation": "Assistant Professor",
            "phone": "+919845000003",
            "subjects": ["AI601", "AI602"],
            "cabin": "C-205",
            "created_at": datetime.utcnow()
        })
        
        # Students data
        raw_students = [
            {
                "name": "Aditya Verma",
                "email": "student1@campus.edu",
                "usn": "1IT21CS001",
                "phone": "+919876543210",
                "department": "CSE",
                "semester": 6,
                "section": "A",
                "cgpa": 8.92,
                "batch": "2021-2025"
            },
            {
                "name": "Ananya Sen",
                "email": "student2@campus.edu",
                "usn": "1IT21CS002",
                "phone": "+919876543211",
                "department": "CSE",
                "semester": 6,
                "section": "A",
                "cgpa": 9.35,
                "batch": "2021-2025"
            },
            {
                "name": "Rohan Deshmukh",
                "email": "student3@campus.edu",
                "usn": "1IT21CS003",
                "phone": "+919876543212",
                "department": "CSE",
                "semester": 6,
                "section": "A",
                "cgpa": 7.84,
                "batch": "2021-2025"
            },
            {
                "name": "Kavya Reddy",
                "email": "student4@campus.edu",
                "usn": "1IT21CS004",
                "phone": "+919876543213",
                "department": "CSE",
                "semester": 6,
                "section": "A",
                "cgpa": 8.60,
                "batch": "2021-2025"
            },
            {
                "name": "Sneha Patel",
                "email": "student5@campus.edu",
                "usn": "1IT21AI015",
                "phone": "+919876543214",
                "department": "AI & ML",
                "semester": 6,
                "section": "A",
                "cgpa": 9.10,
                "batch": "2021-2025"
            },
            {
                "name": "Rahul Sundaram",
                "email": "student6@campus.edu",
                "usn": "1IT21EC040",
                "phone": "+919876543215",
                "department": "ECE",
                "semester": 6,
                "section": "B",
                "cgpa": 7.45,
                "batch": "2021-2025"
            }
        ]
        
        created_students = []
        for s in raw_students:
            s_user = {
                "name": s["name"],
                "email": s["email"],
                "password": password_hash,
                "role": "student",
                "phone": s["phone"],
                "department": s["department"],
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            u_id = db.users.insert_one(s_user).inserted_id
            
            student_doc = {
                "user_id": str(u_id),
                "usn": s["usn"],
                "name": s["name"],
                "email": s["email"],
                "phone": s["phone"],
                "department": s["department"],
                "semester": s["semester"],
                "section": s["section"],
                "cgpa": s["cgpa"],
                "batch": s["batch"],
                "blood_group": "O+",
                "mentor": "Dr. Rajesh Sharma",
                "created_at": datetime.utcnow()
            }
            stud_res = db.students.insert_one(student_doc)
            student_doc["_id"] = stud_res.inserted_id
            created_students.append(student_doc)
            
        # 4. Past Attendance Sessions & Records (Past 5 days for CSE 6th Sem Sec A)
        dates = [
            (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            for i in range(5, 0, -1)
        ]
        
        # Preload historical attendance for demo analytics
        for idx, d_str in enumerate(dates):
            sess_doc = {
                "faculty_id": str(fac1_id),
                "faculty_name": "Dr. Rajesh Sharma",
                "department": "CSE",
                "semester": 6,
                "section": "A",
                "subject_code": "CS601",
                "subject_name": "Cloud Computing & Distributed Systems",
                "date": d_str,
                "period": 1,
                "is_finalized": True,
                "finalized_at": datetime.utcnow() - timedelta(days=5 - idx),
                "sms_dispatched": True,
                "created_at": datetime.utcnow() - timedelta(days=5 - idx)
            }
            s_res = db.attendance_sessions.insert_one(sess_doc)
            session_id = str(s_res.inserted_id)
            
            # Attendance for 4 CSE students
            cse_students = [cs for cs in created_students if cs["department"] == "CSE"]
            for s_idx, st in enumerate(cse_students):
                # Make student 1 mostly present, student 3 absent occasionally for alert testing
                status = "Present"
                if s_idx == 2 and idx in [1, 3]:
                    status = "Absent"
                elif s_idx == 3 and idx == 2:
                    status = "Late"
                    
                rec_doc = {
                    "session_id": session_id,
                    "student_id": str(st["_id"]),
                    "usn": st["usn"],
                    "student_name": st["name"],
                    "department": st["department"],
                    "semester": st["semester"],
                    "section": st["section"],
                    "subject_code": "CS601",
                    "date": d_str,
                    "period": 1,
                    "status": status,
                    "created_at": datetime.utcnow() - timedelta(days=5 - idx)
                }
                db.attendance_records.insert_one(rec_doc)
                
                # Notification record
                db.sms_notifications.insert_one({
                    "session_id": session_id,
                    "student_id": str(st["_id"]),
                    "usn": st["usn"],
                    "student_name": st["name"],
                    "phone": st["phone"],
                    "subject_code": "CS601",
                    "date": d_str,
                    "status": "Demo",
                    "delivery_status": "Delivered (Demo)",
                    "message_body": f"Hello {st['name']}, your attendance for Cloud Computing & Distributed Systems on {d_str} has been marked {status.upper()}. - ITAE Smart Campus",
                    "mode": "demo",
                    "created_at": datetime.utcnow() - timedelta(days=5 - idx)
                })

        # 5. Laboratories
        labs = [
            {
                "name": "NVIDIA AI/ML High Performance GPU Lab",
                "lab_code": "LAB-AIML-01",
                "department": "AI & ML",
                "location": "Innovation Hub, 3rd Floor - Room 301",
                "capacity": 45,
                "in_charge": "Prof. Priya Nair",
                "equipment": ["45x Intel i9 13th Gen Workstations", "8x NVIDIA RTX 4090 GPUs", "Edge AI Jetson Nano Kits", "Gigabit LAN"],
                "available_slots": ["09:00 - 11:00", "11:15 - 13:15", "14:00 - 16:00", "16:15 - 18:15"],
                "status": "Active"
            },
            {
                "name": "Cloud Computing & Distributed Systems Lab",
                "lab_code": "LAB-CSE-02",
                "department": "CSE",
                "location": "Block A, 2nd Floor - Room 208",
                "capacity": 60,
                "in_charge": "Dr. Rajesh Sharma",
                "equipment": ["60x Core i7 Workstations", "Private OpenStack Cloud Cluster", "Kubernetes Testbed", "Cisco Catalyst Switches"],
                "available_slots": ["09:00 - 11:00", "11:15 - 13:15", "14:00 - 16:00"],
                "status": "Active"
            },
            {
                "name": "IoT & Embedded Robotics Lab",
                "lab_code": "LAB-ECE-03",
                "department": "ECE",
                "location": "Vikram Sarabhai Block, Ground Floor",
                "capacity": 35,
                "in_charge": "Dr. Arvind Rao",
                "equipment": ["35x STM32 & ESP32 Dev Boards", "Digital Storage Oscilloscopes", "Raspberry Pi 4 Compute Modules", "Soldering Stations"],
                "available_slots": ["09:00 - 11:00", "14:00 - 16:00", "16:15 - 18:15"],
                "status": "Active"
            }
        ]
        db.laboratories.insert_many(labs)

        # 6. Projects & Hackathon postings
        projects = [
            {
                "title": "Autonomous Campus Security Drone with Thermal Vision",
                "description": "Building an autonomous quadcopter equipped with FLIR thermal imaging and OpenCV object tracking for after-hours campus perimeter patrol.",
                "department": "CSE / ECE",
                "category": "Capstone Project",
                "lead_name": "Aditya Verma",
                "lead_usn": "1IT21CS001",
                "required_skills": ["Python", "OpenCV", "ROS2", "Embedded Systems", "Hardware"],
                "team_size": 4,
                "current_members": 2,
                "github_url": "https://github.com/campus-projects/drone-patrol",
                "status": "Recruiting",
                "created_at": datetime.utcnow() - timedelta(days=3)
            },
            {
                "title": "Smart Energy Grid Optimization using Reinforcement Learning",
                "description": "Predicting solar microgrid loads across college buildings and dynamically scheduling battery storage charging cycles using Deep Q-Networks.",
                "department": "AI & ML",
                "category": "Research / Hackathon",
                "lead_name": "Sneha Patel",
                "lead_usn": "1IT21AI015",
                "required_skills": ["Python", "PyTorch", "FastAPI", "IoT Sensors", "Time-series"],
                "team_size": 3,
                "current_members": 2,
                "github_url": "https://github.com/campus-projects/smart-energy-grid",
                "status": "In Progress",
                "created_at": datetime.utcnow() - timedelta(days=6)
            }
        ]
        db.projects.insert_many(projects)

        # 7. Complaints
        complaints = [
            {
                "complaint_id": "CMP-2026-1001",
                "student_id": str(created_students[0]["_id"]),
                "student_name": "Aditya Verma",
                "usn": "1IT21CS001",
                "category": "Wi-Fi & Internet",
                "location": "Block A - 3rd Floor Library Reading Hall",
                "priority": "High",
                "description": "Wi-Fi access point #AP-A3 keeps dropping packets during peak afternoon research hours. Speed drops below 1 Mbps.",
                "status": "In Progress",
                "assigned_to": "Network Admin Team",
                "admin_remarks": "Technician dispatched to replace optical transceiver switch.",
                "created_at": datetime.utcnow() - timedelta(days=2)
            },
            {
                "complaint_id": "CMP-2026-1002",
                "student_id": str(created_students[1]["_id"]),
                "student_name": "Ananya Sen",
                "usn": "1IT21CS002",
                "category": "Classrooms & Projectors",
                "location": "Seminar Hall 2 - Innovation Hub",
                "priority": "Medium",
                "description": "HDMI projection cable has loose audio connector pins, causing buzzing sound in speaker outputs.",
                "status": "Resolved",
                "assigned_to": "AV Support",
                "admin_remarks": "Replaced with high-grade shielded 4K HDMI cable.",
                "created_at": datetime.utcnow() - timedelta(days=4)
            }
        ]
        db.complaints.insert_many(complaints)

        # 8. Events
        events = [
            {
                "title": "Smart India Hackathon (Internal Round 2026)",
                "category": "Hackathon",
                "department": "All Engineering Departments",
                "date": "2026-10-24",
                "time": "09:00 AM - 09:00 PM (36-hr)",
                "venue": "Campus Auditorium & Innovation Hub",
                "organizer": "Centre for Innovation & Incubation",
                "max_seats": 200,
                "registered_count": 84,
                "registration_deadline": "2026-10-20",
                "description": "Compete across AI/ML, CleanTech, MedTech, and Smart Governance problem statements with cash awards worth ₹2,00,000.",
                "is_active": True
            },
            {
                "title": "Hands-on Workshop: Generative AI on Google Cloud",
                "category": "Workshop",
                "department": "CSE / AI & ML / ISE",
                "date": "2026-10-18",
                "time": "02:00 PM - 05:30 PM",
                "venue": "GPU Compute Lab 301",
                "organizer": "Google Developer Student Club (GDSC)",
                "max_seats": 60,
                "registered_count": 52,
                "registration_deadline": "2026-10-16",
                "description": "Deep dive into building multi-modal LLM applications, RAG pipelines, and agentic workflows using Vertex AI.",
                "is_active": True
            }
        ]
        db.events.insert_many(events)

        # 9. Digital Library Books
        books = [
            {"isbn": "978-0134494166", "title": "Clean Architecture: A Craftsman's Guide to Software Structure", "author": "Robert C. Martin", "category": "Software Engineering", "copies_available": 6, "total_copies": 8, "rack": "CS-Rack-04"},
            {"isbn": "978-0262035613", "title": "Deep Learning (Adaptive Computation and Machine Learning)", "author": "Ian Goodfellow, Yoshua Bengio", "category": "AI / Machine Learning", "copies_available": 3, "total_copies": 5, "rack": "AI-Rack-01"},
            {"isbn": "978-0132350884", "title": "Clean Code: A Handbook of Agile Software Craftsmanship", "author": "Robert C. Martin", "category": "Software Engineering", "copies_available": 4, "total_copies": 10, "rack": "CS-Rack-03"},
            {"isbn": "978-1491957660", "title": "Designing Data-Intensive Applications", "author": "Martin Kleppmann", "category": "Distributed Systems", "copies_available": 5, "total_copies": 7, "rack": "CS-Rack-08"}
        ]
        db.library_books.insert_many(books)

        # 10. Placement Drives
        placements = [
            {
                "company_name": "Google Cloud",
                "role": "Cloud Solutions Architect - Associate",
                "ctc": "24.5 LPA",
                "eligibility_cgpa": 8.0,
                "eligible_departments": ["CSE", "ISE", "AI & ML", "ECE"],
                "drive_date": "2026-10-28",
                "registration_deadline": "2026-10-22",
                "status": "Open",
                "rounds": ["Online Coding Assessment", "Technical Interview I", "System Architecture", "Leadership & Fit"]
            },
            {
                "company_name": "Microsoft IDC",
                "role": "Software Development Engineer (SDE-1)",
                "ctc": "28.0 LPA",
                "eligibility_cgpa": 8.5,
                "eligible_departments": ["CSE", "ISE", "AI & ML"],
                "drive_date": "2026-11-04",
                "registration_deadline": "2026-10-25",
                "status": "Upcoming",
                "rounds": ["Online Assessment", "Data Structures & Algo I", "System Design", "HR"]
            },
            {
                "company_name": "Cisco Systems",
                "role": "Network Software Engineer",
                "ctc": "18.2 LPA",
                "eligibility_cgpa": 7.5,
                "eligible_departments": ["CSE", "ISE", "ECE", "EEE"],
                "drive_date": "2026-11-12",
                "registration_deadline": "2026-11-02",
                "status": "Upcoming",
                "rounds": ["Technical MCQ + Coding", "Core Networking / OS", "Managerial"]
            }
        ]
        db.placement_drives.insert_many(placements)

        # 11. Timetables (CSE 6th Sem Sec A)
        timetable_slots = [
            {"day": "Monday", "period": 1, "time": "09:00 - 10:00", "subject_code": "CS601", "subject_name": "Cloud Computing", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            {"day": "Monday", "period": 2, "time": "10:00 - 11:00", "subject_code": "CS602", "subject_name": "Full Stack Web Eng.", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            {"day": "Monday", "period": 3, "time": "11:15 - 12:15", "subject_code": "CS603", "subject_name": "Advanced DBMS", "faculty": "Prof. S. R. Rao", "room": "A-201"},
            {"day": "Monday", "period": 4, "time": "14:00 - 16:00", "subject_code": "CS602L", "subject_name": "Web Eng. Laboratory", "faculty": "Dr. Rajesh Sharma", "room": "LAB-CSE-02"},
            
            {"day": "Tuesday", "period": 1, "time": "09:00 - 10:00", "subject_code": "CS602", "subject_name": "Full Stack Web Eng.", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            {"day": "Tuesday", "period": 2, "time": "10:00 - 11:00", "subject_code": "CS601", "subject_name": "Cloud Computing", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            {"day": "Tuesday", "period": 3, "time": "11:15 - 12:15", "subject_code": "IS601", "subject_name": "Cyber Security", "faculty": "Dr. Sudha Murthy", "room": "A-201"},
            
            {"day": "Wednesday", "period": 1, "time": "09:00 - 10:00", "subject_code": "CS603", "subject_name": "Advanced DBMS", "faculty": "Prof. S. R. Rao", "room": "A-201"},
            {"day": "Wednesday", "period": 2, "time": "10:00 - 11:00", "subject_code": "CS601", "subject_name": "Cloud Computing", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            
            {"day": "Thursday", "period": 1, "time": "09:00 - 10:00", "subject_code": "CS601", "subject_name": "Cloud Computing", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            {"day": "Thursday", "period": 2, "time": "10:00 - 11:00", "subject_code": "CS602", "subject_name": "Full Stack Web Eng.", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            
            {"day": "Friday", "period": 1, "time": "09:00 - 10:00", "subject_code": "CS602", "subject_name": "Full Stack Web Eng.", "faculty": "Dr. Rajesh Sharma", "room": "A-201"},
            {"day": "Friday", "period": 2, "time": "10:00 - 11:00", "subject_code": "CS603", "subject_name": "Advanced DBMS", "faculty": "Prof. S. R. Rao", "room": "A-201"}
        ]
        db.timetables.insert_many([
            {
                "department": "CSE",
                "semester": 6,
                "section": "A",
                "academic_year": "2025-2026",
                "schedule": timetable_slots
            }
        ])

        # 12. College Announcements
        announcements = [
            {
                "title": "Semester End Examination (SEE) Schedule Released",
                "category": "Academic",
                "priority": "Important",
                "date": datetime.utcnow().strftime("%Y-%m-%d"),
                "content": "The tentative timetable for the 6th & 8th Semester B.Tech Theory Examinations (Nov/Dec 2026) has been published on the examination portal.",
                "author": "Controller of Examinations"
            },
            {
                "title": "Annual Inter-Collegiate Technical Fest 'TECH-SPARK 2026'",
                "category": "Event",
                "priority": "General",
                "date": (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "content": "Registrations are now open for project exhibitions, code-golfing, robotics arena, and hackathons with cash prizes of ₹5 Lakhs.",
                "author": "Student Activity Council"
            }
        ]
        db.announcements.insert_many(announcements)

        # 13. System Settings
        db.system_settings.insert_one({
            "college_name": "Institute of Technology & Advanced Engineering (ITAE)",
            "college_code": "ITAE",
            "attendance_threshold_percentage": 75,
            "sms_mode": "demo",
            "twillio_active": False,
            "allow_qr_attendance": True,
            "allow_face_attendance": True,
            "updated_at": datetime.utcnow()
        })

        logger.info("Successfully seeded database with all engineering college entities and demo accounts.")
    except Exception as e:
        logger.error(f"Seeding error: {e}")
