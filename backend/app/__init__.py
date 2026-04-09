from flask import Flask, jsonify
from config import get_config
from app.extensions import db, migrate, jwt, cors


def create_app():
    app = Flask(__name__)
    app.config.from_object(get_config())

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {"origins": app.config["CORS_ORIGINS"]}
    })

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token expiré", "code": "TOKEN_EXPIRED"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Token invalide", "code": "TOKEN_INVALID"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Token manquant", "code": "TOKEN_MISSING"}), 401

    # Blueprints
    from app.routes.auth import auth_bp
    from app.routes.todos import todos_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(todos_bp, url_prefix="/api/todos")

    # Health check
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app