from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utility.db_connection import get_db
from apps.services.widget_service import (
    fetch_all_widgets, add_widget, modify_widget, remove_widget, fetch_widget_by_id, execute_preview_query,get_input_table_data
)

router = APIRouter(prefix="/widgets", tags=["Widgets"])

@router.get("/")
def get_all_widgets(db: Session = Depends(get_db)):
    return fetch_all_widgets(db)

@router.post("/")
def create_widget(widget_data: dict, db: Session = Depends(get_db)):
    return add_widget(db, widget_data)

@router.put("/{widget_id}")
def update_widget(widget_id: int, widget_data: dict, db: Session = Depends(get_db)):
    widget = modify_widget(db, widget_id, widget_data)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return widget

@router.delete("/{widget_id}")
def delete_widget(widget_id: int, db: Session = Depends(get_db)):
    widget = remove_widget(db, widget_id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return {"message": "Widget deleted successfully"}

@router.post("/preview")
def preview_widget(data: dict, db: Session = Depends(get_db)):
    try:
        query_output = execute_preview_query(db, data)

        return query_output
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(f"Query error : {e}"))

@router.post("/get-chart-input")
def get_chart_input(db: Session = Depends(get_db)):
    try:
        chart_input = get_input_table_data(db)

        return chart_input
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(f"Query error : {e}"))