from apps.repository.dashboard_repository import (
    fetch_dashboard,
    fetch_widget_data,
    save_dashboard_layout
)

def get_dashboard(db):
    return fetch_dashboard(db)

def get_widget_data(db, widget_id):
    return fetch_widget_data(db, widget_id)

def store_dashboard_layout(db, positions):
    return save_dashboard_layout(db, positions)
