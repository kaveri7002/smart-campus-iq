import logging
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartCampusDB")

client = None
db = None
is_mock_db = False

def get_db():
    global client, db, is_mock_db
    if db is not None:
        return db
    
    uri = Config.MONGODB_URI
    db_name = Config.MONGODB_DB_NAME
    
    try:
        if uri and "mongodb" in uri:
            logger.info("Attempting to connect to MongoDB Atlas...")
            # Set a 3-second server selection timeout for fast detection
            client = MongoClient(uri, serverSelectionTimeoutMS=3000)
            # Test ping
            client.admin.command('ping')
            db = client[db_name]
            is_mock_db = False
            logger.info(f"Successfully connected to MongoDB database: {db_name}")
            init_indexes(db)
            return db
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB cluster ({e}).")
        if Config.USE_MOCK_DB_IF_UNAVAILABLE:
            try:
                import mongomock
                logger.info("Falling back to local in-memory MongoMock for standalone development/hackathon demo testing.")
                client = mongomock.MongoClient()
                db = client[db_name]
                is_mock_db = True
                init_indexes(db)
                return db
            except Exception as mock_err:
                logger.error(f"Failed to initialize MongoMock: {mock_err}")
                raise e
        else:
            raise e

def is_mock():
    global is_mock_db
    return is_mock_db

def init_indexes(database):
    """Create essential performance and unique indexes"""
    try:
        # Users collection
        database.users.create_index([("email", ASCENDING)], unique=True)
        database.users.create_index([("role", ASCENDING)])
        
        # Students collection
        database.students.create_index([("usn", ASCENDING)], unique=True)
        database.students.create_index([("department", ASCENDING), ("semester", ASCENDING), ("section", ASCENDING)])
        database.students.create_index([("user_id", ASCENDING)], unique=True)
        
        # Faculty collection
        database.faculty.create_index([("faculty_id", ASCENDING)], unique=True)
        database.faculty.create_index([("department", ASCENDING)])
        database.faculty.create_index([("user_id", ASCENDING)], unique=True)
        
        # Attendance Sessions
        database.attendance_sessions.create_index([
            ("department", ASCENDING),
            ("semester", ASCENDING),
            ("section", ASCENDING),
            ("subject_code", ASCENDING),
            ("date", ASCENDING),
            ("period", ASCENDING)
        ], unique=True)
        
        # Attendance Records
        database.attendance_records.create_index([
            ("session_id", ASCENDING),
            ("student_id", ASCENDING)
        ], unique=True)
        database.attendance_records.create_index([("student_id", ASCENDING), ("subject_code", ASCENDING)])
        database.attendance_records.create_index([("date", DESCENDING)])
        
        # SMS Notifications
        database.sms_notifications.create_index([("session_id", ASCENDING), ("student_id", ASCENDING)])
        database.sms_notifications.create_index([("status", ASCENDING)])
        database.sms_notifications.create_index([("created_at", DESCENDING)])
        
        # QR Sessions
        database.qr_sessions.create_index([("token", ASCENDING)], unique=True)
        database.qr_sessions.create_index([("expires_at", ASCENDING)])
        
        # Labs
        database.laboratory_bookings.create_index([("lab_id", ASCENDING), ("date", ASCENDING), ("time_slot", ASCENDING)])
        
        # Complaints
        database.complaints.create_index([("complaint_id", ASCENDING)], unique=True)
        database.complaints.create_index([("status", ASCENDING)])
        database.complaints.create_index([("created_at", DESCENDING)])
        
        logger.info("MongoDB indexes verified and ensured.")
    except Exception as e:
        logger.warning(f"Index creation notice: {e}")
