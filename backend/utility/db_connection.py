from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database URL: Update this to match your environment if necessary
DATABASE_URL = "sqlite:///./test.db"  # SQLite database file

# Create the SQLAlchemy engine
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Required for SQLite in multithreaded environments
)

# Configure the session maker
SessionLocal = sessionmaker(
    autocommit=False,  # Disable auto-commit for transactional integrity
    autoflush=False,   # Disable auto-flush to avoid premature commits
    bind=engine         # Bind the session to the engine
)

# Base class for ORM models
Base = declarative_base()

# Dependency for getting a database session
def get_db():
    """
    Provides a database session to use in FastAPI dependencies.
    Automatically closes the session after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
