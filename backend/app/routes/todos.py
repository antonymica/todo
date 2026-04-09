from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.todo import Todo
from app.models.user import User

todos_bp = Blueprint("todos", __name__)

VALID_PRIORITIES = {"low", "medium", "high"}


def get_current_user() -> User | None:
    user_id = int(get_jwt_identity())
    return db.session.get(User, user_id)


@todos_bp.get("/")
@jwt_required()
def get_todos():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    # Filtres optionnels
    completed = request.args.get("completed")
    priority = request.args.get("priority")

    query = Todo.query.filter_by(user_id=user.id)

    if completed is not None:
        query = query.filter_by(completed=completed.lower() == "true")

    if priority and priority in VALID_PRIORITIES:
        query = query.filter_by(priority=priority)

    todos = query.order_by(Todo.created_at.desc()).all()
    return jsonify({"todos": [t.to_dict() for t in todos]}), 200


@todos_bp.post("/")
@jwt_required()
def create_todo():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404

    data = request.get_json()
    title = (data.get("title") or "").strip()

    if not title:
        return jsonify({"error": "Le titre est requis"}), 400

    if len(title) > 200:
        return jsonify({"error": "Titre trop long (max 200 caractères)"}), 400

    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        return jsonify({"error": "Priorité invalide (low, medium, high)"}), 400

    due_date = None
    if data.get("due_date"):
        try:
            due_date = datetime.fromisoformat(data["due_date"])
        except ValueError:
            return jsonify({"error": "Format de date invalide (ISO 8601)"}), 400

    todo = Todo(
        title=title,
        description=data.get("description"),
        priority=priority,
        due_date=due_date,
        user_id=user.id,
    )
    db.session.add(todo)
    db.session.commit()

    return jsonify({"todo": todo.to_dict()}), 201


@todos_bp.get("/<int:todo_id>")
@jwt_required()
def get_todo(todo_id: int):
    user = get_current_user()
    todo = Todo.query.filter_by(id=todo_id, user_id=user.id).first()

    if not todo:
        return jsonify({"error": "Todo introuvable"}), 404

    return jsonify({"todo": todo.to_dict()}), 200


@todos_bp.patch("/<int:todo_id>")
@jwt_required()
def update_todo(todo_id: int):
    user = get_current_user()
    todo = Todo.query.filter_by(id=todo_id, user_id=user.id).first()

    if not todo:
        return jsonify({"error": "Todo introuvable"}), 404

    data = request.get_json()

    if "title" in data:
        title = data["title"].strip()
        if not title:
            return jsonify({"error": "Le titre ne peut pas être vide"}), 400
        todo.title = title

    if "description" in data:
        todo.description = data["description"]

    if "completed" in data:
        if not isinstance(data["completed"], bool):
            return jsonify({"error": "completed doit être un booléen"}), 400
        todo.completed = data["completed"]

    if "priority" in data:
        if data["priority"] not in VALID_PRIORITIES:
            return jsonify({"error": "Priorité invalide"}), 400
        todo.priority = data["priority"]

    if "due_date" in data:
        if data["due_date"] is None:
            todo.due_date = None
        else:
            try:
                todo.due_date = datetime.fromisoformat(data["due_date"])
            except ValueError:
                return jsonify({"error": "Format de date invalide"}), 400

    db.session.commit()
    return jsonify({"todo": todo.to_dict()}), 200


@todos_bp.delete("/<int:todo_id>")
@jwt_required()
def delete_todo(todo_id: int):
    user = get_current_user()
    todo = Todo.query.filter_by(id=todo_id, user_id=user.id).first()

    if not todo:
        return jsonify({"error": "Todo introuvable"}), 404

    db.session.delete(todo)
    db.session.commit()

    return jsonify({"message": "Todo supprimé"}), 200


@todos_bp.patch("/<int:todo_id>/toggle")
@jwt_required()
def toggle_todo(todo_id: int):
    user = get_current_user()
    todo = Todo.query.filter_by(id=todo_id, user_id=user.id).first()

    if not todo:
        return jsonify({"error": "Todo introuvable"}), 404

    todo.completed = not todo.completed
    db.session.commit()

    return jsonify({"todo": todo.to_dict()}), 200