from flask import jsonify
from bson import ObjectId
from datetime import datetime, date

def json_serializable(data):
    """Recursively converts MongoDB ObjectId and datetime to JSON-friendly structures"""
    if isinstance(data, list):
        return [json_serializable(item) for item in data]
    elif isinstance(data, dict):
        new_dict = {}
        for k, v in data.items():
            if isinstance(v, ObjectId):
                new_dict[k] = str(v)
            elif isinstance(v, (datetime, date)):
                new_dict[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                new_dict[k] = json_serializable(v)
            else:
                new_dict[k] = v
        return new_dict
    elif isinstance(data, ObjectId):
        return str(data)
    elif isinstance(data, (datetime, date)):
        return data.isoformat()
    return data

def success_response(data=None, message="Success", status_code=200):
    response = {
        "success": True,
        "message": message,
        "data": json_serializable(data) if data is not None else None
    }
    return jsonify(response), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    response = {
        "success": False,
        "message": message
    }
    if errors is not None:
        response["errors"] = errors
    return jsonify(response), status_code
