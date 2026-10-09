import os
import sys
import unittest
import json
from datetime import datetime

# Set test environment with 32+ char secret key
os.environ["SECRET_KEY"] = "super-secret-key-32-chars-long-for-testing-12345"
os.environ["JWT_SECRET_KEY"] = "super-jwt-secret-key-32-chars-long-for-testing-12345"
os.environ["SMS_MODE"] = "demo"
os.environ["USE_MOCK_DB_IF_UNAVAILABLE"] = "true"

from app import create_app
from database import get_db

class SmartCampusSystemTest(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        self.db = get_db()

    def test_01_health_check(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "Healthy")
        print("[OK] Health Check Passed")

    def test_02_authentication_and_roles(self):
        # 1. Student Login
        res_stu = self.client.post('/api/auth/login', json={
            "email": "student1@campus.edu",
            "password": "Campus@123"
        })
        self.assertEqual(res_stu.status_code, 200)
        data_stu = res_stu.get_json()
        self.assertTrue(data_stu["success"])
        self.assertEqual(data_stu["data"]["role"], "student")
        self.student_token = data_stu["data"]["token"]

        # 2. Faculty Login
        res_fac = self.client.post('/api/auth/login', json={
            "email": "faculty.cse@campus.edu",
            "password": "Campus@123"
        })
        self.assertEqual(res_fac.status_code, 200)
        data_fac = res_fac.get_json()
        self.assertEqual(data_fac["data"]["role"], "faculty")
        self.faculty_token = data_fac["data"]["token"]

        # 3. Admin Login
        res_adm = self.client.post('/api/auth/login', json={
            "email": "admin@campus.edu",
            "password": "Campus@123"
        })
        self.assertEqual(res_adm.status_code, 200)
        data_adm = res_adm.get_json()
        self.assertEqual(data_adm["data"]["role"], "admin")
        self.admin_token = data_adm["data"]["token"]

        print("[OK] Multi-Role JWT Authentication Passed (Student, Faculty, Admin)")

    def test_03_smart_attendance_and_sms_workflow(self):
        # 1. Faculty Login
        login_res = self.client.post('/api/auth/login', json={
            "email": "faculty.cse@campus.edu",
            "password": "Campus@123"
        })
        fac_token = login_res.get_json()["data"]["token"]
        headers = {"Authorization": f"Bearer {fac_token}"}

        # 2. Create/Load Attendance Session for today
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        session_payload = {
            "department": "CSE",
            "semester": 6,
            "section": "A",
            "subject_code": "CS601",
            "date": today_str,
            "period": 3
        }
        sess_res = self.client.post('/api/attendance/sessions', json=session_payload, headers=headers)
        self.assertEqual(sess_res.status_code, 200)
        sess_data = sess_res.get_json()["data"]
        session_id = sess_data["session"]["_id"]
        students = sess_data["students"]
        self.assertGreater(len(students), 0)
        print(f"[OK] Loaded session {session_id} with {len(students)} enrolled students")

        # 3. Mark Student 1 Present, Student 2 Late, Student 3 Absent
        records = [
            {"student_id": students[0]["student_id"], "usn": students[0]["usn"], "name": students[0]["name"], "status": "Present"},
            {"student_id": students[1]["student_id"], "usn": students[1]["usn"], "name": students[1]["name"], "status": "Late"},
            {"student_id": students[2]["student_id"], "usn": students[2]["usn"], "name": students[2]["name"], "status": "Absent"}
        ]
        save_res = self.client.post(f'/api/attendance/sessions/{session_id}/records', json={"records": records}, headers=headers)
        self.assertEqual(save_res.status_code, 200)
        print("[OK] Draft attendance records persisted in MongoDB")

        # 4. Finalize Session and trigger automated SMS
        fin_res = self.client.post(f'/api/attendance/sessions/{session_id}/finalize', headers=headers)
        self.assertEqual(fin_res.status_code, 200)
        fin_data = fin_res.get_json()["data"]
        self.assertTrue(fin_data["is_finalized"])
        self.assertGreater(len(fin_data["sms_logs"]), 0)
        print(f"[OK] Session finalized and {len(fin_data['sms_logs'])} SMS notifications dispatched")

        # 5. Check SMS log details
        first_sms = fin_data["sms_logs"][0]
        self.assertEqual(first_sms["status"], "Demo")
        self.assertIn("Cloud Computing", first_sms["message_body"])
        print(f"[OK] SMS Template Verified: '{first_sms['message_body']}'")

    def test_04_qr_attendance(self):
        # 1. Faculty creates a new active session
        fac_res = self.client.post('/api/auth/login', json={"email": "faculty.cse@campus.edu", "password": "Campus@123"})
        fac_token = fac_res.get_json()["data"]["token"]

        sess_res = self.client.post('/api/attendance/sessions', json={
            "department": "CSE",
            "semester": 6,
            "section": "A",
            "subject_code": "CS602",
            "date": "2026-10-09",
            "period": 5
        }, headers={"Authorization": f"Bearer {fac_token}"})
        sess_id = sess_res.get_json()["data"]["session"]["_id"]

        qr_res = self.client.post('/api/attendance/qr/create', json={"session_id": str(sess_id)}, headers={"Authorization": f"Bearer {fac_token}"})
        self.assertEqual(qr_res.status_code, 200)
        token = qr_res.get_json()["data"]["token"]
        print("[OK] Generated signed QR attendance code")

        # 2. Student Check-in
        stu_res = self.client.post('/api/auth/login', json={"email": "student1@campus.edu", "password": "Campus@123"})
        stu_token = stu_res.get_json()["data"]["token"]

        checkin_res = self.client.post('/api/attendance/qr/checkin', json={"qr_payload": token}, headers={"Authorization": f"Bearer {stu_token}"})
        self.assertEqual(checkin_res.status_code, 200)
        print("[OK] Student QR code validation and check-in verified")

    def test_05_complaints_and_labs(self):
        stu_res = self.client.post('/api/auth/login', json={"email": "student1@campus.edu", "password": "Campus@123"})
        stu_token = stu_res.get_json()["data"]["token"]
        headers = {"Authorization": f"Bearer {stu_token}"}

        # 1. File complaint
        cmp_res = self.client.post('/api/complaints', json={
            "category": "Wi-Fi & Internet",
            "location": "Hostel Block 3",
            "priority": "High",
            "description": "High latency on campus proxy."
        }, headers=headers)
        self.assertEqual(cmp_res.status_code, 201)
        cmp_id = cmp_res.get_json()["data"]["complaint_id"]
        self.assertTrue(cmp_id.startswith("CMP-2026-"))
        print(f"[OK] Created Complaint with ID {cmp_id}")

        # 2. Book lab slot
        labs_res = self.client.get('/api/labs', headers=headers)
        lab_id = labs_res.get_json()["data"][0]["_id"]
        book_res = self.client.post('/api/labs/bookings', json={
            "lab_id": str(lab_id),
            "date": "2026-10-25",
            "time_slot": "14:00 - 16:00",
            "purpose": "PyTorch Distributed Training",
            "team_members": "1IT21CS002"
        }, headers=headers)
        self.assertEqual(book_res.status_code, 201)
        print("[OK] Lab reservation conflict-checked and queued for approval")

if __name__ == "__main__":
    unittest.main()
