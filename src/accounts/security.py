import hashlib
import os

def hash_password(password: str, salt: bytes = None) -> tuple[str, bytes]:
    """
    Hash password using SHA-256 with a salt.
    Returns (hashed_password_hex, salt)
    """
    if salt is None:
        salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return hashed.hex(), salt

def verify_password(password: str, hashed: str, salt: bytes) -> bool:
    """
    Verify password against the hash and salt.
    """
    new_hash, _ = hash_password(password, salt)
    return new_hash == hashed
