from typing import List, Dict
from src.core.seeders.base import BaseSeeder
from src.accounts.models import Role


class RoleSeeder(BaseSeeder):
    """Seeder for creating hierarchical roles"""
    
    def get_roles_data(self) -> List[Dict[str, str]]:
        """
        Define the hierarchical roles to be seeded.
        
        Role Hierarchy:
        ├── Level 4: SuperAdmin (Full system access)
        ├── Level 3: Admin (Management + User operations)
        ├── Level 2: Manager (Team management + Operations)
        └── Level 1: Staff (Basic operations)
        """
        return [
            {
                "name": "staff",
                "description": "Basic staff member with limited access (Level 1)"
            },
            {
                "name": "manager",
                "description": "Team manager with operational permissions (Level 2)"
            },
            {
                "name": "admin",
                "description": "Administrator with full management access (Level 3)"
            },
            {
                "name": "superadmin",
                "description": "Super Administrator with complete system control (Level 4)"
            },
        ]
    
    async def seed(self) -> None:
        """Seed roles into the database"""
        print("\n" + "="*60)
        print("🌱 Seeding Roles")
        print("="*60)
        
        roles_data = self.get_roles_data()
        created_count = 0
        skipped_count = 0
        
        for role_data in roles_data:
            exists = await self.check_exists(Role, name=role_data["name"])
            
            if not exists:
                await self.create_if_not_exists(Role, role_data, unique_field="name")
                created_count += 1
            else:
                print(f"⊘ Skipped: {role_data['name']} (already exists)")
                skipped_count += 1
        
        await self.db.commit()
        
        print("\n" + "-"*60)
        print("✅ Roles Seeding Complete!")
        print(f"   Created: {created_count} | Skipped: {skipped_count}")
        print("-"*60)
        
        # Display hierarchy
        print("\n📊 Role Hierarchy:")
        print("   └─ Level 4: SuperAdmin → Full Access")
        print("   └─ Level 3: Admin      → Admin + Manager + Staff")
        print("   └─ Level 2: Manager    → Manager + Staff")
        print("   └─ Level 1: Staff      → Staff only")
        print("="*60 + "\n")
