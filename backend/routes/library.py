from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from datetime import datetime, timedelta
from bson import ObjectId
from database import get_db
from utils.response_helpers import success_response, error_response

library_bp = Blueprint("library", __name__)

@library_bp.route("/books", methods=["GET"])
@jwt_required()
def get_books():
    db = get_db()
    search = request.args.get("search")
    category = request.args.get("category")

    query = {}
    if category and category.lower() != "all":
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
            {"isbn": {"$regex": search, "$options": "i"}}
        ]

    books = list(db.library_books.find(query))
    return success_response(books, f"Found {len(books)} books")

@library_bp.route("/books/<book_id>/reserve", methods=["POST"])
@jwt_required()
def reserve_book(book_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    db = get_db()

    try:
        book = db.library_books.find_one({"_id": ObjectId(book_id)})
    except Exception:
        book = db.library_books.find_one({"_id": book_id})

    if not book:
        return error_response("Book not found", 404)

    if book.get("copies_available", 0) <= 0:
        return error_response("All physical copies are currently checked out. Added to waitlist.", 400)

    db.library_books.update_one({"_id": book["_id"]}, {"$inc": {"copies_available": -1}})

    res_doc = {
        "book_id": str(book["_id"]),
        "title": book.get("title"),
        "user_id": user_id,
        "user_name": claims.get("name"),
        "due_date": (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d"),
        "reserved_at": datetime.utcnow()
    }
    db.book_reservations.insert_one(res_doc)

    return success_response(res_doc, f"'{book.get('title')}' reserved successfully. Collect from {book.get('rack', 'Main Desk')} within 24 hours.")
