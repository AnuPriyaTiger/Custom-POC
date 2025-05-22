from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from utility.db_connection import Base

class UserAccess(Base):
    __tablename__ = "user_access"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(64), nullable=False)
    access_type = Column(String(64), nullable=False)
    permission = Column(String(255))
    widget_ids = Column(String(255))
    is_active = Column(Boolean, nullable=False, default=True)
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())