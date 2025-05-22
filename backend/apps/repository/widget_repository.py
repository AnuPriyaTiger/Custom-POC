import re
import pandas as pd
from sqlalchemy.orm import Session
from apps.models.widget import Widget
from sqlalchemy import text


def construct_sql(query):

    # Convert the query to uppercase for parsing while keeping the original query intact
    query_upper = query.upper()

    # Find the positions of 'SELECT', 'FROM', and 'WHERE' in the query string
    select_pos = query_upper.find("SELECT") + len("SELECT")
    from_pos = query_upper.find("FROM")
    where_pos = query_upper.find("WHERE")

    if select_pos == -1 or from_pos == -1:
        raise ValueError(
            "Invalid SQL query format. Missing 'SELECT' or 'FROM'.")

    # Extract the SELECT columns by slicing the original query between 'SELECT' and 'FROM'
    select_part = query[select_pos:from_pos].strip()

    # If the select part is '*', we do not need to process columns
    if select_part == "*":
        select_columns = ["*"]
    else:
        # Otherwise, split and strip the column names
        select_columns = [col.strip() for col in select_part.split(",")]

    # Extract the table name by slicing the original query between 'FROM' and 'WHERE'
    table_name = query[from_pos + len("FROM"):where_pos].strip(
    ) if where_pos != -1 else query[from_pos + len("FROM"):].strip()

    # Extract the WHERE condition if present, and find the columns used in WHERE clause
    where_columns = set()
    if where_pos != -1:
        # Use the uppercase query for parsing conditions
        where_part_upper = query_upper[where_pos + len("WHERE"):].strip()

        # Split the WHERE part into conditions by 'AND' and 'OR' (case-insensitive)
        conditions = re.split(r'\sAND\s|\sOR\s', where_part_upper)

        # Extract columns from each condition using the original query
        original_where_part = query[where_pos + len("WHERE"):].strip()
        original_conditions = re.split(
            r'\sand\s|\sor\s', original_where_part, flags=re.IGNORECASE)

        for condition in original_conditions:
            # Use regex to extract possible column names (before '=', '<', '>', etc.)
            match = re.match(r"([a-zA-Z0-9_]+)", condition.strip())
            if match:
                where_columns.add(match.group(1))

    # If SELECT is '*', we do not add columns from WHERE
    if select_columns == ["*"]:
        all_columns = select_columns
    else:
        # Combine the SELECT columns and WHERE columns, preserving their original case and order
        all_columns = select_columns + \
            [col for col in where_columns if col not in select_columns]

    # Construct final SQL query
    final_query = f"SELECT {', '.join(all_columns)} FROM {table_name}"

    return final_query


def get_filter_data(db: Session, filter_list: list, table_name: str):
    filter_data = []
    table_name_str = table_name
    for parameter in filter_list:
        query = text(f'SELECT DISTINCT {parameter} FROM {table_name_str}')
        parameter_data = db.execute(query)
        # Convert RMKeyView to a list
        parameter_column = list(parameter_data.keys())
        # Access the first item in the list
        parameter_column = str(parameter_column[0])
        print(parameter_column)
        parameter_row_data = [row for row in parameter_data.fetchall()]
        parameter_row_list = [parameter_row[0]
                              for parameter_row in parameter_row_data]
        print(parameter_row_list)
        parameter_data = {parameter_column: parameter_row_list}
        filter_data.append(parameter_data)

    return filter_data


def get_all_widgets(db: Session):
    return db.query(Widget).all()


def create_widget(db: Session, widget_data: dict):
    parameter_query = construct_sql(widget_data['query'])
    print(widget_data['table_name'])
    filters_list = get_filter_data(
        db, widget_data['parameters'], widget_data['table_name'])
    widget_data["parameter_query"] = parameter_query
    widget_data["filters_list"] = filters_list
    new_widget = Widget(**widget_data)
    db.add(new_widget)
    db.commit()
    db.refresh(new_widget)
    return new_widget


def update_widget(db: Session, widget_id: int, widget_data: dict):
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if widget:
        for key, value in widget_data.items():
            setattr(widget, key, value)
        db.commit()
        db.refresh(widget)
    return widget


def delete_widget(db: Session, widget_id: int):
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if widget:
        db.delete(widget)
        db.commit()
    return widget


def get_widget_by_id(db: Session, widget_id: int):
    return db.query(Widget).filter(Widget.id == widget_id).first()


def preview_widget_query(db: Session, data: str):
    query = text(data["query"])
    result = db.execute(query)
    # Fetch the result and convert it to a list of dictionaries
    columns = result.keys()
    data = [dict(zip(columns, row)) for row in result.fetchall()]
    return data


def preview_list_tables_query(db: Session):
    query = text("SELECT name FROM sqlite_master WHERE type = 'table';")
    result = db.execute(query)
    # Fetch the result and convert it to a list of dictionaries
    columns = result.keys()
    table_data = [dict(zip(columns, row)) for row in result.fetchall()]
    table_dataframe = pd.DataFrame(table_data)
    table_dataframe.rename(columns={"name": "table_name"}, inplace=True)
    table_data = table_dataframe.to_dict(orient="records")
    columns_list = []
    for table_name in table_data:
        table = table_name['table_name']
        column_query = text(f"PRAGMA table_info({table})")
        column_result = db.execute(column_query)
        column_names = column_result.keys()
        column_data = [dict(zip(column_names, row))
                       for row in column_result.fetchall()]
        column_dataframe = pd.DataFrame(column_data)
        column_dataframe.rename(columns={"name": "column_name"}, inplace=True)
        column_dataframe = column_dataframe[["column_name", "type"]].copy()
        column_data = column_dataframe.to_dict(orient="records")
        tabular_info = {table: column_data}
        columns_list.append(tabular_info)

    data = {"table_info": table_data,
            "columns_info": columns_list}

    return data
