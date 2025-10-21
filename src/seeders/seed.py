import asyncio
from src.core.db import AsyncSessionLocal
from src.accounts.seeders.role_seeder import RoleSeeder


async def run_seeders():
    """Run all seeders"""
    print("\n" + "🚀 Starting Database Seeding".center(60, "="))
    
    async with AsyncSessionLocal() as db:
        try:
            # Run Role Seeder
            role_seeder = RoleSeeder(db)
            await role_seeder.seed()
            
            # Add more seeders here as needed
            # user_seeder = UserSeeder(db)
            # await user_seeder.seed()
            
            print("✅ All seeders completed successfully!\n")
            
        except Exception as e:
            print(f"\n❌ Error during seeding: {str(e)}\n")
            await db.rollback()
            raise
        finally:
            await db.close()


def main():
    """Entry point for running seeders"""
    asyncio.run(run_seeders())


if __name__ == "__main__":
    main()
