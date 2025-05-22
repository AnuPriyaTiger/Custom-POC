from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utility.db_connection import get_db
from apps.services.user_access_service import (
    add_user_service,
    fetch_all_users_service,
    fetch_user_by_id_service,
    update_user_service,
    delete_user_service,
)

router = APIRouter(prefix="/users-access", tags=["User Access"])

@router.post("/", response_model=dict)
def add_user(user_data: dict, db: Session = Depends(get_db)):
    return add_user_service(db, user_data)

@router.get("/", response_model=list)
def get_all_users(db: Session = Depends(get_db)):
    return fetch_all_users_service(db)

@router.get("/{id}", response_model=dict)
def get_user(id: int, db: Session = Depends(get_db)):
    user = fetch_user_by_id_service(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{id}", response_model=dict)
def update_user(id: int, update_data: dict, db: Session = Depends(get_db)):
    user = update_user_service(db, id, update_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{id}", response_model=dict)
def delete_user(id: int, db: Session = Depends(get_db)):
    user = delete_user_service(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}