import hashlib
from src.core.config  import settings

def hash_password(password: str) -> str:
    """
    Hash password with SHA-256 using a single secret salt from env.
    Returns hex string.
    """
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), settings.SECRET_KEY.encode(), 100_000)
    return hashed.hex()

def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify password against stored hash using the same secret salt.
    """
    return hash_password(password) == stored_hash
