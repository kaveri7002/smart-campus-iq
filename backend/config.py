import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "smart-campus-iq-super-secret-key-2026")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-super-secret-key-smart-campus-iq-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_ACCESS_EXPIRES_HOURS", "12")))
    
    # MongoDB Config
    MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb+srv://demo:demo123@cluster0.mongodb.net/smart_campus_iq?retryWrites=true&w=majority")
    MONGODB_DB_NAME = os.environ.get("MONGODB_DB_NAME", "smart_campus_iq")
    USE_MOCK_DB_IF_UNAVAILABLE = os.environ.get("USE_MOCK_DB_IF_UNAVAILABLE", "true").lower() == "true"
    
    # Twilio SMS Config
    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "")
    # SMS Mode: "demo" or "live"
    SMS_MODE = os.environ.get("SMS_MODE", "demo").lower()
    
    # College Metadata
    COLLEGE_NAME = os.environ.get("COLLEGE_NAME", "Institute of Technology & Advanced Engineering (ITAE)")
    COLLEGE_SHORT = os.environ.get("COLLEGE_SHORT", "ITAE")
    COLLEGE_LOGO = os.environ.get("COLLEGE_LOGO", "https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80")
    
    # CORS
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
    PORT = int(os.environ.get("PORT", 5000))
