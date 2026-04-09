from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from app.extensions import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password, validate_username

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json()

    # Champs requis
    required = ["username", "email", "password"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Champs manquants : {', '.join(missing)}"}), 400

    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]

    # Validation
    valid, msg = validate_username(username)
    if not valid:
        return jsonify({"error": msg}), 400

    if not validate_email(email):
        return jsonify({"error": "Email invalide"}), 400

    valid, msg = validate_password(password)
    if not valid:
        return jsonify({"error": msg}), 400

    # Unicité
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email déjà utilisé"}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Nom d'utilisateur déjà pris"}), 409

    # Création
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "message": "Compte créé avec succès",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 201


@auth_bp.post("/login")
def login():
    data = request.get_json()

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email et mot de passe requis"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Identifiants incorrects"}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token,
    }), 200


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Utilisateur introuvable"}), 404
    return jsonify({"user": user.to_dict()}), 200