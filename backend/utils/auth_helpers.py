from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def role_required(allowed_roles):
    """Decorator to enforce role-based access control for API endpoints"""
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return jsonify({
                    "success": False,
                    "message": "Authorization token is missing, expired, or invalid",
                    "error": str(e)
                }), 401
                
            claims = get_jwt()
            user_role = claims.get("role")
            
            if isinstance(allowed_roles, list):
                if user_role not in allowed_roles:
                    return jsonify({
                        "success": False,
                        "message": f"Forbidden: Requires one of roles: {', '.join(allowed_roles)}"
                    }), 403
            elif isinstance(allowed_roles, str):
                if user_role != allowed_roles:
                    return jsonify({
                        "success": False,
                        "message": f"Forbidden: Requires {allowed_roles} role"
                    }), 403
                    
            return fn(*args, **kwargs)
        return decorator
    return wrapper
