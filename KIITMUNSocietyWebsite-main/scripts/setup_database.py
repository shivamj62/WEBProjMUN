#!/usr/bin/env python3
"""
Database setup script for MUN Society Website
Creates all required tables with proper schema
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/munsociety_db")

def create_tables():
    """Create all database tables"""
    
    # SQL statements for table creation
    sql_statements = [
        # Allowed emails table (pre-populated)
        """
        CREATE TABLE IF NOT EXISTS allowed_emails (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Users table (created when account is set up)
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL REFERENCES allowed_emails(email),
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL,
            name VARCHAR(255) NOT NULL,
            account_created BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # Blogs table (MUN competition reports)
        """
        CREATE TABLE IF NOT EXISTS blogs (
            id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            content TEXT NOT NULL,
            image1_path VARCHAR(500),
            image2_path VARCHAR(500),
            author_id INTEGER REFERENCES users(id),
            competition_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            published BOOLEAN DEFAULT TRUE
        );
        """,
        
        # Resources table
        """
        CREATE TABLE IF NOT EXISTS resources (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            original_filename VARCHAR(255) NOT NULL,
            file_path VARCHAR(500) NOT NULL,
            file_size BIGINT,
            uploaded_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT
        );
        """,
        
        # Create indexes for better performance
        """
        CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
        CREATE INDEX IF NOT EXISTS idx_blogs_competition_date ON blogs(competition_date);
        CREATE INDEX IF NOT EXISTS idx_resources_uploaded_by ON resources(uploaded_by);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        """
    ]
    
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        cur = conn.cursor()
        
        print("Creating database tables...")
        
        for sql in sql_statements:
            cur.execute(sql)
            conn.commit()
        
        print("✅ Database tables created successfully!")
        
        # Check if we need to populate allowed_emails
        cur.execute("SELECT COUNT(*) FROM allowed_emails")
        count = cur.fetchone()[0]
        
        if count == 0:
            print("📝 No allowed emails found. Run populate_emails.py to add sample data.")
        else:
            print(f"📊 Found {count} allowed emails in database.")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

def check_database_connection():
    """Test database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        print("✅ Database connection successful!")
        return True
    except psycopg2.Error as e:
        print(f"❌ Database connection failed: {e}")
        print("Please check your DATABASE_URL in .env file")
        return False

if __name__ == "__main__":
    print("🚀 MUN Society Database Setup")
    print("=" * 40)
    
    # Check connection first
    if not check_database_connection():
        sys.exit(1)
    
    # Create tables
    create_tables()
    
    print("\n🎉 Database setup complete!")
    print("Next steps:")
    print("1. Run 'python scripts/populate_emails.py' to add sample data")
    print("2. Start the server with 'uvicorn app.main:app --reload'")
