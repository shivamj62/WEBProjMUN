#!/usr/bin/env python3
"""
Populate allowed_emails table with sample data
Run this after setup_database.py to add initial users
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/munsociety_db")

# Sample allowed emails data
ALLOWED_EMAILS = [
    # Admins
    ("admin@munsociety.edu", "admin", "MUN Admin"),
    ("coordinator@munsociety.edu", "admin", "Head Coordinator"),
    ("secretary@munsociety.edu", "admin", "Secretary General"),
    
    # Members (add more as needed)
    ("member1@munsociety.edu", "member", "Alice Johnson"),
    ("member2@munsociety.edu", "member", "Bob Smith"),
    ("member3@munsociety.edu", "member", "Carol Davis"),
    ("member4@munsociety.edu", "member", "David Wilson"),
    ("member5@munsociety.edu", "member", "Eva Brown"),
    ("delegate1@munsociety.edu", "member", "Frank Miller"),
    ("delegate2@munsociety.edu", "member", "Grace Lee"),
    ("delegate3@munsociety.edu", "member", "Henry Chen"),
    ("delegate4@munsociety.edu", "member", "Ivy Martinez"),
    ("delegate5@munsociety.edu", "member", "Jack Taylor"),
    ("student1@munsociety.edu", "member", "Kate Anderson"),
    ("student2@munsociety.edu", "member", "Liam Garcia"),
    ("student3@munsociety.edu", "member", "Maya Singh"),
    ("student4@munsociety.edu", "member", "Noah Kim"),
    ("student5@munsociety.edu", "member", "Olivia Rodriguez"),
    ("participant1@munsociety.edu", "member", "Paul Jones"),
]

def populate_allowed_emails():
    """Insert sample allowed emails into database"""
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        print("Populating allowed_emails table...")
        
        # Check if data already exists
        cur.execute("SELECT COUNT(*) FROM allowed_emails")
        existing_count = cur.fetchone()[0]
        
        if existing_count > 0:
            print(f"⚠️  Found {existing_count} existing emails.")
            response = input("Do you want to add more emails? (y/N): ").lower().strip()
            if response != 'y':
                print("Skipping population.")
                return
        
        # Insert allowed emails
        inserted_count = 0
        for email, role, name in ALLOWED_EMAILS:
            try:
                cur.execute(
                    "INSERT INTO allowed_emails (email, role, name) VALUES (%s, %s, %s)",
                    (email, role, name)
                )
                conn.commit()
                inserted_count += 1
                print(f"✅ Added: {name} ({email}) - {role}")
                
            except psycopg2.IntegrityError:
                # Email already exists, skip
                conn.rollback()
                print(f"⏭️  Skipped: {email} (already exists)")
                continue
        
        print(f"\n🎉 Successfully added {inserted_count} allowed emails!")
        
        # Show summary
        cur.execute("SELECT role, COUNT(*) FROM allowed_emails GROUP BY role")
        role_counts = cur.fetchall()
        
        print("\n📊 Current allowed emails summary:")
        for row in role_counts:
            print(f"  {row['role']}: {row['count']} users")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

def create_sample_admin_account():
    """Create a sample admin account for testing"""
    
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        # Check if admin account exists
        cur.execute("SELECT id FROM users WHERE email = 'admin@munsociety.edu'")
        if cur.fetchone():
            print("ℹ️  Admin account already exists.")
            return
        
        # Create admin account
        cur.execute("""
            INSERT INTO users (email, password, name, role)
            VALUES ('admin@munsociety.edu', 'admin123', 'MUN Admin', 'admin')
        """)
        conn.commit()
        
        print("✅ Created sample admin account:")
        print("   Email: admin@munsociety.edu")
        print("   Password: admin123")
        print("   ⚠️  Change this password in production!")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Database error creating admin account: {e}")
    except Exception as e:
        print(f"❌ Error creating admin account: {e}")

if __name__ == "__main__":
    print("📧 MUN Society Email Population")
    print("=" * 40)
    
    populate_allowed_emails()
    
    # Ask if user wants to create sample admin account
    response = input("\nCreate sample admin account for testing? (y/N): ").lower().strip()
    if response == 'y':
        create_sample_admin_account()
    
    print("\n🎉 Email population complete!")
    print("Next steps:")
    print("1. Start the server: 'uvicorn app.main:app --reload'")
    print("2. Visit http://localhost:8000/docs for API documentation")
    print("3. Test authentication with the sample admin account")
