from sqlalchemy.orm import Session
from apps.models.user_access import UserAccess

def create_user(db: Session, user_data: dict):
    new_user = UserAccess(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_all_users(db: Session):
    return db.query(UserAccess).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(UserAccess).filter(UserAccess.id == user_id).first()

def update_user(db: Session, user_id: int, update_data: dict):
    user = db.query(UserAccess).filter(UserAccess.id == user_id).first()
    if user:
        for key, value in update_data.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(UserAccess).filter(UserAccess.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return user