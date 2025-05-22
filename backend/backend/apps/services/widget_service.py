from apps.repository.widget_repository import (
    get_all_widgets, create_widget, update_widget, delete_widget, get_widget_by_id, preview_widget_query,
    preview_list_tables_query
)

def fetch_all_widgets(db):
    return get_all_widgets(db)

def add_widget(db, widget_data):
    return create_widget(db, widget_data)

def modify_widget(db, widget_id, widget_data):
    return update_widget(db, widget_id, widget_data)

def remove_widget(db, widget_id):
    return delete_widget(db, widget_id)

def fetch_widget_by_id(db, widget_id):
    return get_widget_by_id(db, widget_id)

def execute_preview_query(db, data):
    return preview_widget_query(db, data)

def get_input_table_data(db):
    return preview_list_tables_query(db) 