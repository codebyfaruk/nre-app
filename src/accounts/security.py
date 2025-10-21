# src/accounts/security.py
import hashlib
import secrets


def hash_password(password: str) -> str:
    """
    Hash password with PBKDF2-HMAC-SHA256 using a unique random salt.
    Returns: salt$hash (both in hex format)
    """
    # Generate unique 16-byte salt using cryptographically secure RNG
    salt = secrets.token_bytes(16)
    
    # Hash password with 600,000 iterations (OWASP 2025 recommendation)
    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        600_000  # Increased from 100k for 2025 security standards
    )
    
    # Store salt and hash together
    return f"{salt.hex()}${hashed.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """
    Verify password against stored hash.
    stored_hash format: salt$hash
    """
    try:
        salt_hex, hash_hex = stored_hash.split("$")
        salt = bytes.fromhex(salt_hex)
        
        # Hash provided password with stored salt
        hashed = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode(),
            salt,
            600_000
        )
        
        return hashed.hex() == hash_hex
    except (ValueError, AttributeError):
        return False
