# src/accounts/seeders/user_seeder.py - FIXED VERSION

from typing import List, Dict
from sqlalchemy import select
from src.core.seeders.base import BaseSeeder
from src.accounts.models import User, Role, UserRole
from src.accounts.security import hash_password

class UserSeeder(BaseSeeder):
    """Seeder for creating users with role assignments"""
    
    def get_users_data(self) -> List[Dict]:
        """Define users to be seeded"""
        return [
            {
                "username": "superadmin",
                "email": "superadmin@electroshop.com",
                "password": "SuperAdmin@123",
                "roles": ["superadmin", "admin", "manager", "staff"],
                "is_active": True,
                "is_staff": True,
            },
            {
                "username": "admin",
                "email": "admin@electroshop.com",
                "password": "Admin@123",
                "roles": ["admin", "manager", "staff"],
                "is_active": True,
                "is_staff": True,
            },
            {
                "username": "manager",
                "email": "manager@electroshop.com",
                "password": "Manager@123",
                "roles": ["manager", "staff"],
                "is_active": True,
                "is_staff": True,
            },
            {
                "username": "staff",
                "email": "staff@electroshop.com",
                "password": "Staff@123",
                "roles": ["staff"],
                "is_active": True,
                "is_staff": False,
            },
        ]
    
    async def get_role_by_name(self, role_name: str) -> Role:
        """Fetch a role by name"""
        result = await self.db.execute(
            select(Role).where(Role.name == role_name)
        )
        role = result.scalar_one_or_none()
        
        if not role:
            raise ValueError(f"Role '{role_name}' not found. Run role seeder first!")
        
        return role
    
    async def assign_roles_to_user(self, user: User, role_names: List[str]) -> None:
        """
        ✅ FIXED: Assign multiple roles via UserRole junction table
        """
        if not role_names:
            raise ValueError(f"User must have at least one role!")
        
        for role_name in role_names:
            role = await self.get_role_by_name(role_name)
            
            # ✅ Create UserRole junction entry (correct way)
            user_role = UserRole(
                user=user,  # Sets relationship
                role=role   # Sets relationship
            )
            
            # Add to session (not to user.roles!)
            self.db.add(user_role)
            print(f"   ├─ Assigned role: {role_name}")
    
    async def seed(self) -> None:
        """Seed users into the database"""
        print("\n" + "="*60)
        print("🌱 Seeding Users with Roles")
        print("="*60)
        
        users_data = self.get_users_data()
        created_count = 0
        skipped_count = 0
        
        for user_data in users_data:
            # Check if user exists
            exists = await self.check_exists(User, username=user_data["username"])
            
            if exists:
                print(f"⊘ Skipped: {user_data['username']} (already exists)")
                skipped_count += 1
                continue
            
            print(f"\n👤 Creating user: {user_data['username']}")
            
            # Extract roles and password
            role_names = user_data.pop("roles")
            password = user_data.pop("password")
            
            if not role_names:
                print(f"   ❌ Error: No roles specified")
                continue
            
            try:
                # Create user
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    password_hash=hash_password(password),
                    is_active=user_data["is_active"],
                    is_staff=user_data["is_staff"]
                )
                
                # Add and flush to get user.id
                self.db.add(user)
                await self.db.flush()
                
                # Assign roles via UserRole
                await self.assign_roles_to_user(user, role_names)
                
                created_count += 1
                print(f"   ✅ User created with {len(role_names)} role(s)")
                
            except Exception as e:
                print(f"   ❌ Error: {e}")
                await self.db.rollback()
                raise
        
        # Commit everything
        await self.db.commit()
        
        print("\n" + "-"*60)
        print(f"✅ Seeding Complete!")
        print(f"   Created: {created_count} | Skipped: {skipped_count}")
        print("-"*60)
        
        print("\n🔑 Test Credentials:")
        print("   superadmin / SuperAdmin@123")
        print("   admin      / Admin@123")
        print("   manager    / Manager@123")
        print("   staff      / Staff@123")
        print("="*60 + "\n")
