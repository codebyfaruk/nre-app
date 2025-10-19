from src.accounts.models.user import User, RoleEnum
from src.accounts.security import hash_password
from src.core.db import SessionLocal

def create_user(email: str, password: str, name: str, role: RoleEnum = RoleEnum.CUSTOMER):
    db = SessionLocal()  # synchronous session
    try:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User {email} already exists.")
            return

        user = User(
            email=email,
            username=email.split("@")[0],
            name=name,
            hashed_password=hash_password(password),
            role=role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User {email} created successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3]
    role = sys.argv[4] if len(sys.argv) > 4 else RoleEnum.CUSTOMER

    create_user(email, password, name, RoleEnum(role))
