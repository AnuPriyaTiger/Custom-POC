from apps.repository.user_access_repository import (
    create_user,
    get_all_users,
    get_user_by_id,
    update_user,
    delete_user,
)

def add_user_service(db, user_data):
    return create_user(db, user_data)

def fetch_all_users_service(db):
    return get_all_users(db)

def fetch_user_by_id_service(db, user_id):
    return get_user_by_id(db, user_id)

def update_user_service(db, user_id, update_data):
    return update_user(db, user_id, update_data)

def delete_user_service(db, user_id):
    return delete_user(db, user_id)