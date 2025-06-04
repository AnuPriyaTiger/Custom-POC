from sqlalchemy import Column, Integer, ForeignKey, JSON
from utility.db_connection import Base

class Data(Base):
    __tablename__ = "data"

    ID = Column(Integer, primary_key=True, index=True)
    