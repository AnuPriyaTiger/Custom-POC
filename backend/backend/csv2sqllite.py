import sqlite3
import pandas as pd

# Path to your SQLite database file
db_path = "test.db"

# Path to your Excel file


import sqlite3
import pandas as pd

# Path to your SQLite database file
db_path = "test.db"

# Path to your CSV file
csv_file = "merch_sales.csv"

# Table name where data will be inserted
table_name = "data"

# Read the CSV file into a pandas DataFrame
df = pd.read_csv(csv_file)

# Connect to SQLite database
conn = sqlite3.connect(db_path)

# Dynamically create a CREATE TABLE statement based on the DataFrame columns
columns = df.columns
column_types = []

# Infer SQLite-compatible data types from the DataFrame
for column in columns:
    if pd.api.types.is_integer_dtype(df[column]):
        column_types.append(f"{column} INTEGER")
    elif pd.api.types.is_float_dtype(df[column]):
        column_types.append(f"{column} REAL")
    elif pd.api.types.is_bool_dtype(df[column]):
        column_types.append(f"{column} BOOLEAN")
    elif pd.api.types.is_datetime64_any_dtype(df[column]):
        column_types.append(f"{column} DATETIME")
    else:
        column_types.append(f"{column} TEXT")

print("column_types",column_types)
# Combine column definitions into the CREATE TABLE query
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {table_name} (
    {', '.join(column_types)}
);
"""
conn.execute(create_table_query)

# Insert DataFrame data into SQLite table
df.to_sql(table_name, conn, if_exists="replace", index=False)

# Close the connection
conn.close()

print(f"Data imported successfully into table '{table_name}'!")

