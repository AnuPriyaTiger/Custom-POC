from sqlalchemy import Column, Integer, ForeignKey, JSON
from utility.db_connection import Base

class Dashboard(Base):
    __tablename__ = "dashboards"

    user_id = Column(Integer, primary_key=True, index=True)
    positions = Column(JSON, nullable=False)
