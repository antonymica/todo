import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_email(email: str) -> bool:
    return bool(EMAIL_REGEX.match(email))


def validate_password(password: str) -> tuple[bool, str]:
    """
    Retourne (valide, message_erreur)
    - min 8 caractères
    - au moins une majuscule
    - au moins un chiffre
    """
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    if not any(c.isupper() for c in password):
        return False, "Le mot de passe doit contenir au moins une majuscule"
    if not any(c.isdigit() for c in password):
        return False, "Le mot de passe doit contenir au moins un chiffre"
    return True, ""


def validate_username(username: str) -> tuple[bool, str]:
    if len(username) < 3:
        return False, "Le nom d'utilisateur doit contenir au moins 3 caractères"
    if len(username) > 50:
        return False, "Le nom d'utilisateur ne peut dépasser 50 caractères"
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Seuls les lettres, chiffres et underscores sont autorisés"
    return True, ""