import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from utility.db_connection import get_db
from sqlalchemy import text
from apps.services.dashboard_service import (
    get_dashboard,
    get_widget_data,
    store_dashboard_layout
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/fetch-widget")
def fetch_widget(db: Session = Depends(get_db)):
    widgets = get_dashboard(db)
    if not widgets:
        raise HTTPException(status_code=404, detail="No widgets found")
    return widgets


@router.post("/fetch-widget-data/{widget_id}")
async def fetch_widget_data(widget_id: int, db: Session = Depends(get_db)):

    widget_data = get_widget_data(db, widget_id)
    if widget_data is None:
        raise HTTPException(
            status_code=404, detail="Widget not found or no query available")
    try:
        query = text(widget_data['query'])
        data = db.execute(query)
        column_names = data.keys()
        result = [dict(zip(column_names, row)) for row in data.fetchall()]
        parameter_result = []
        if widget_data['parameter_query']:
            parameter_query = text(widget_data['parameter_query'])
            parameter_execution = db.execute(parameter_query)
            parameter_column_names = parameter_execution.keys()
            parameter_result = [
                dict(
                    zip(parameter_column_names, row)
                ) for row in parameter_execution.fetchall()]
        widget_info = {
            "widget_data": result,
            "parameter_data": parameter_result if widget_data[
                'parameter_query'] else [],
            "chart_type": widget_data['chart_type'],
            "length": widget_data['length'],
            "width": widget_data['width'],
            "only_axis": widget_data[
                'only_axis'] if widget_data['only_axis'] else "",
            "x_axis": widget_data['x_axis'] if widget_data['x_axis'] else "",
            "y_axis": widget_data['y_axis'] if widget_data['y_axis'] else "",
            "query": widget_data['query'],
            "parameters": widget_data[
                'parameters'] if widget_data['parameters'] else [],
            "parameter_query": widget_data[
                'parameter_query'] if widget_data['parameter_query'] else "",
            "filters_list": widget_data[
                'filters_list'] if widget_data['filters_list'] else [],

        }
        return widget_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/layout")
def save_dashboard_layout_endpoint(positions: dict, db: Session = Depends(get_db)):
    layout = store_dashboard_layout(db, positions)
    return {"message": "Layout saved successfully", "layout": layout}
