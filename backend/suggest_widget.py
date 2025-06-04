import duckdb as dd
import pandas as pd
from llm_connector import LLMConnector
import re

class Suggestwidgets(object):
    def __init__(self, api_key, provider, db_name = 'mac_test.db'):
        # Create / connect to database
        self.db_conn = self.sqlite_connector(db_name)
        self.llm_conn = LLMConnector(api_key=api_key, provider=provider)

    def sqlite_connector(self, db_name):
        """Method to connect to the duckdb database

        Args:
            db_name (str): database name and path to connect to

        Returns:
            object : returns the database connection object
        """
        return dd.connect(db_name)
    
    def get_list_of_tables(self):
        # 1. get the list of tables 
        """Get the list of tables and identify columns for each table

        Returns:
            array : list of tables in the database
        """
        show_tables_query = 'SHOW TABLES'
        tables_list = self.db_conn.sql(show_tables_query)
        tables_list = tables_list.fetchall()
        return [i[0] for i in tables_list if i[0] not in ["table_columns_descriptions", \
                                                          "table_descriptions", \
                                                            "table_suggested_charts", \
                                                                "sqlite_sequence", \
                                                                    "sqlite_temp_master", \
                                                                        "sqlite_stat1", \
                                                                            "sqlite_stat2"]]
        
    def get_sample_data_columns(self, table_name):
        # 2. get sample data for each column in the table
        """this method will get the sample data for each column in the table and generate description for each column using LLM

        Args:
            table_name (string): name of the table

        Returns:
            tuple : tuple containing columns and sample data
        """
        show_columns_query = 'select * from {table_name} order by random() limit 50'.format(table_name = table_name)
        res = self.db_conn.sql(show_columns_query)
        columns = res.columns
        data = res.fetchall()
        return columns, data

    def auto_gen_description_columns_table(self, table_name):
        # 3. auto generate descriptions for each column in the table and save it another table
        """Method to generate description for each column in the table and save it in another table
        Also generate the table description as a summary of the columns and their descriptions
        This method will use LLM to generate the description for each column in the table and save it in another table.
        The table will have the following columns: table_name, column_name, description
        The description will be generated using the following prompt:
        Hi, I am a data analyst. I am trying to generate description for the columns in a {table_name} table with \
                            columns: {columns} and sample_data:{sample_data}. Please generate description and provide response as a \
                            sql query insert command like 'insert into table_columns_descriptions (table_name, column_name, description) values ()'
        The table will be created if it does not exist.
        The table will be created with the following columns: table_name, column_name, description
        The table will be created with the following data types: table_name: string, column_name: string, description: string

        Args:
            table_name (string): name of the table
        """
        breakpoint()
        columns, sample_data = self.get_sample_data_columns(table_name)
        gen_desc_prompt = "Hi, I am a data analyst. I am trying to generate description for the columns in a {table_name} table with \
                            columns: {columns} and sample_data:{sample_data}. Please generate description and provide response as a \
                            sql query insert command like 'INSERT into table_columns_descriptions (table_name, column_name, column_type, description) \
                                values ()'. Also generate the table description as a summary of the columns and their descriptions \
                                    and provide response as a sql query insert command like 'insert into table_descriptions (table_name, description) values ()'"
        
        response = self.llm_conn.get_response(gen_desc_prompt.format(table_name=table_name, columns=columns, sample_data=sample_data))
        llm_response = response.json()['content'][0]['text']
        # Extract the SQL insert commands from the content
        sql_insert_commands = re.findall(r'INSERT INTO table_columns_descriptions.*?;', llm_response, re.DOTALL)
        self.db_conn.sql(sql_insert_commands[0].replace("\n", "").replace("\\'", "''"))
        # Extract the table description from the content
        table_description = re.search(r'INSERT INTO table_descriptions.*?;', llm_response, re.DOTALL)
        print(table_name, table_description)
        if table_description:
            # insert the table description into the database
            # Assuming you have a database connection and cursor set up
            self.db_conn.sql(table_description[0].replace("\n", ""))
        else:
            table_description = None
        return columns, table_description

    def run_auto_gen_description(self, tables):
        """
        Method to run the auto generate description for each table in the database
        This method will get the list of tables in the database and run the auto generate description for each table
        """
        # create the table_columns_descriptions table if it does not exist
        create_table_query = 'CREATE TABLE IF NOT EXISTS table_columns_descriptions (table_name string, column_name string, column_type string, description string)'
        self.db_conn.sql(create_table_query)
        # create the table_columns_descriptions table if it does not exist
        create_table_query = 'CREATE TABLE IF NOT EXISTS table_descriptions (table_name string, description string)'
        self.db_conn.sql(create_table_query)
        # create the table_suggested_charts table if it does not exist
        create_table_query = 'CREATE TABLE IF NOT EXISTS table_suggested_charts (table_name string, chart_type string, title string, x_axis string, y_axis string, query string)'
        self.db_conn.sql(create_table_query)
        
        for table in tables:
           self.auto_gen_description_columns_table(table)
    
    def get_col_data(self, table_name, column):
        """get the data for a specific column in the table
            find the min, max, median and mode for the column if it is numerical
            otherwise find the unique values and count for the column
            and return the data as a list
        This method will use the following query to get the data for the column:
        select {column} from {table_name}
        This method will return the data as a list
        The data will be returned as a list of tuples
        Args:
            table_name (str): name of the table
            column (str): name of the column

        Returns:
            list: data as a list
        """
        # write query to get data for the colunm randomly and not in a praticular order
        columns_query = 'select * from {table_name} order by random() limit 50'.format(table_name=table_name)
        res = self.db_conn.sql(columns_query)
        data = res.fetchall()
        # load the data to a pandas dataframe
        df = pd.DataFrame(data, columns=res.columns)
        # if the data size is less than 50 then duplicate the data until it is greater than 50
        # this is done to get the random values for the column
        if df.shape[0] < 50:
            df = pd.concat([df] * (100 // df.shape[0]), ignore_index=True)
        # get the data for the column
        if df[column].dtype == 'int64' or df[column].dtype == 'float64':
            # get the min, max, median and mode for the column
            data = {
                "min": df[column].min(),
                "max": df[column].max(),
                "median": df[column].median(),
                "mode": df[column].mode()[0],
                "mean": df[column].mean(),
                "std": df[column].std(),
                "count": df[column].count(),
                # select 50 random values from the column
                "random_values": df[column].sample(50).tolist(),
                # get the unique values and count for the column
                "unique_values": df[column].unique(),
                "unique_count": df[column].nunique(),
                # get the value counts for the column
                "value_counts": df[column].value_counts().to_dict(),
            }
        else:
            # get the unique values and count for the column
            data = {
                "unique_values": df[column].unique(),
                "count": df[column].value_counts(),
                "unique_count": df[column].nunique(),
                # select 50 random values from the column
                "random_values": df[column].sample(50).tolist(),
                # get the value counts for the column
                "value_counts": df[column].value_counts().to_dict(),
                
            }
        return data

    def auto_gen_charts_single_col(self, table_name):
        """Take each column in a table from the list of tables 
        and see if we can generate an aggregate or pie chart with it

        Args:
            table_name (str): name of the table
        """
        # 2. get sample data for all the columns from table_columns_descriptions
        col_query = "SELECT * FROM table_columns_descriptions WHERE table_name = '{}'".format(table_name)
        col_desc_query_res = self.db_conn.sql(col_query)
        col_desc_query_res = col_desc_query_res.fetchall()
        
        sample_query = "SELECT * FROM {table_name} order by random() limit 50".format(table_name=table_name)
        sample_data_res = self.db_conn.sql(sample_query)
        sample_data = sample_data_res.fetchall()
        # loop through the response from the llm and find the combination of columns that makes sense for making a chart
        # find the columns that are best suited for making a chart
        col_filter_prompt = "Hi, I am a data analyst. " \
        "I am trying to generate a separate chart for each column in the table. \
        This is the column description data {col_data} for this {table_name} table and sample data {sample_data}.  \
        Please use this information to suggest which of these columns are most suitable for making a chart.\
        Please provide the response as a list of columns that are suitable for making a chart. \
        example suggested_columns = [col1, col2]. I will use this list to call the llm again for more details \
        I want the list of columns that can be aggreated or can be used for pie charts or bar charts. " 
        response = self.llm_conn.get_response(col_filter_prompt.format(col_data=col_desc_query_res[1:], table_name=table_name, sample_data=sample_data))
        breakpoint()
        llm_response = re.findall(r'suggested_columns = \[(.*?)\]', response.json()['content'][0]['text'], re.DOTALL)
        if llm_response:
            for col in llm_response:
                col_name = eval(col)
                for col_desc_list in col_desc_query_res[1:]:
                    if col_name in col_desc_list:
                        col_type = col[2]
                        col_desc = col[3].lower()
                        if not col_desc or " id " in col_desc or "auto increment" in col_desc or "primary key" in col_desc or "unique" in col_desc or "Foreign key" in col_desc or "foreign key" in col_desc:
                            # skip the column if it is an id or auto increment or primary key or unique
                            continue
                        col_data = self.get_col_data(table_name, col_name)
                        col_data_prompt = "Hi, I am a data analyst. I am trying to generate a chart for the column {col_name}. type {col_type} in a {table_name} table \
                                        with description of columns as {col_desc} and data:{data}. Please use this information to generate a chart \
                                            and provide response as a sql query insert command like 'insert into table_suggested_charts (table_name, chart_type, title, x_axis, y_axis, query) \
                                                values ()'. For the query columns generate a select query command to get data from database for the chart.\
                                                Assess if creating a chart with the data is not possible please say so." \
                                                "My end users are business users and the charts need to make sense to them. I dont want to show them a chart " \
                                                    "that does not make sense to them. I am looking for a chart that can be used to show the data in a meaningful way."
                        response = self.llm_conn.get_response(col_data_prompt.format(col_name=col_name, col_type=col_type, col_desc=col_desc, table_name=table_name, data=col_data))
                        #insert the response into the table_suggested_charts table
                        if response.status_code == 200 and response.json()['content']:
                            llm_response = response.json()['content'][0]['text']
                            # Extract the SQL insert commands from the content
                            chart_query = re.findall(r'INSERT INTO table_suggested_charts.*?;', llm_response, re.DOTALL)
                            # Extract the table description from the content
                            if chart_query:
                                # insert the table description into the database
                                # Assuming you have a database connection and cursor set up
                                try:
                                    self.db_conn.sql(chart_query[0].replace("\n", ""))
                                except:
                                    print("Error in inserting the chart query: ", chart_query[0])
                                    continue
                            else:
                                continue
                
    def auto_gen_charts_multiple_cols(self, list_of_tables):
        # 3. confirm the information on each column and update it
        """take combination of columns in a table from the list of tables
        and see if we can generate a chart with it. Create a chart only if it makes sense
        and the chart is possible with the data
        
        Args:
            list_of_tables (list): tables list
        """
        #import pdb;pdb.set_trace()
        # 1. get the list of tables 
        for table in list_of_tables:
            # 2. get sample data for each column in the table
            columns, sample_data = self.get_sample_data_columns(table)
            col_query = "SELECT * FROM table_columns_descriptions WHERE table_name = '{}'".format(table)
            col_desc_query_res = self.db_conn.sql(col_query)
            col_desc_query_res = col_desc_query_res.fetchall()
            col_types = [i[2] for i in col_desc_query_res[1:]]
            col_descs = [i[3] for i in col_desc_query_res[1:]]
            # 3. send the data to llms as prompt and ask it to find out which combination of columns makes sense for making a chart
            col_data_prompt = "Hi, I am a data analyst. I am trying to generate a chart for the columns {columns} with types {col_types} in a {table_name} table \
                            with description of columns as {col_descs} and data:{sample_data}. Please use this information to generate a chart \
                                and provide response as a sql query insert command like 'insert into table_suggested_charts (table_name, chart_type, title, x_axis, y_axis, query) \
                                    values ()'. For the query columns generate a select query command to get data from database for the chart.\
                                    Assess if chart is possible with this data otherwise return chart not possible."
            # 4. get the response from llm and save it in another table
            response = self.llm_conn.get_response(col_data_prompt.format(columns=columns, table_name=table, col_types=col_types, col_descs=col_descs, sample_data=sample_data))
            # 5. loop through the response from the llm and find the combination of columns that makes sense for making a chart
            if response.status_code == 200 and response.json()['content']:
                llm_response = response.json()['content'][0]['text']
                # Extract the SQL insert commands from the content
                chart_query = re.findall(r'INSERT INTO table_suggested_charts.*?;', llm_response, re.DOTALL)
                if chart_query:
                    self.db_conn.sql(chart_query[0].replace("\n", ""))
            
    def auto_gen_charts_multiple_tables(self, list_of_tables):
        """In this method we will look for foreighn key relationships between the tables
        and generate charts using the data from multiple tables
        This method will use the following prompt to generate the charts:
        Hi, I am a Power BI analyst. I have a {table_name} table that has {description of columns}. {foreighn key table and its descriptions} \
        I want to create total aggregates, pie charts, bar charts, line charts using this data. \
        I have the data in a sql table. Can you give me the necessary queries in this format {query: query that needs to be executed, chart_type: type of the chart that needs to be used, title: Title for the chart, x-axis:text to display on x-axis, y-axis:text to display omn y-axis}. \
        Adding sample data for reference: {sample_data}
        
        Args:
        
            list_of_tables (list): list of the table
        """
        # get the information schema from the database to understand the relationship and send it to llm to get the relationship
        
        # info_schema_list = []
        # for table in list_of_tables:
        #     info_schema_query = "DESCRIBE TABLE {table}".format(table = table)
        #     info_schema = self.db_conn.sql(info_schema_query)
        #     info_schema_resp = info_schema.fetchall()
        #     info_schema_list.append(info_schema_resp)
        foreign_key_columns = self.db_conn.sql("select * from table_columns_descriptions where description like '%Foreign key%'").fetchall()
        
        relation_prompt = "Hi, I am a data analyst. I have a list of tables on which \
            I would like to find out which two tables can be joined. Also need combinations of these tables  \
            two or three tables that can be joined. I will be using this information to join these tables    \
            create charts out of these. This is the description of columns for the tables: {foreign_key_columns}. \
            Need the response as a list of lists \
            "
        response = self.llm_conn.get_response(relation_prompt.format(foreign_key_columns=foreign_key_columns))
        llm_response1 = response.json()['content'][0]['text']
        two_table_joins = re.findall("(?<=Two-table joins:)(.*)(?=Three-table joins:)", llm_response1, re.DOTALL)
        two_table_joins_list = []
        for i in (two_table_joins[0].split('\n')):
            # j=i.split(',  #')[0]
            j=i.split(',  #')[0].strip()
            if not j or j in ('[',']'):
                continue
            else:
                k=eval(j.rstrip(','))
                # k = [eval(i) for i in j.rstrip(',') if i]
            # k = [eval(i) for i in j.strip()[1:-1].split(',') if i]
            if k:
                two_table_joins_list.append(k)
        for two_tables_joins in two_table_joins_list:
            # get the data for the combination of tables
            table1 = two_tables_joins[0]
            table2 = two_tables_joins[1]
            # get the sample data for the tables
            columns, sample_data = self.get_sample_data_columns(table1)
            columns2, sample_data2 = self.get_sample_data_columns(table2)
            #connect to llm using a prompt to get the details to be inserted to the suggested charts table
            two_table_joins_prompt = "Hi, I am a data analyst. I am trying to generate a chart for theese 2 tables {table1} and {table2}. \
                                    with columns for  {table1} as {columns} & {table2} as {columns2} \
                                    with sample data for {table1} {sample_data} and {table2} {sample_data2}. \
                                    and provide response as a sql query insert command like 'insert into table_suggested_charts (table_name, chart_type, title, x_axis, y_axis, query) \
                                    values ()'. For the query columns generate a select query command to get data from database for the chart.\
                                    Assess if chart is possible with this data otherwise return chart not possible."
            two_table_joins_prompt = two_table_joins_prompt.format(table1=table1, table2=table2, columns=columns, columns2=columns2, sample_data=sample_data, sample_data2=sample_data2)
            

            response = self.llm_conn.get_response(two_table_joins_prompt)
            if response.status_code == 200 and response.json()['content']:
                llm_response = response.json()['content'][0]['text']

                chart_query = re.findall(r'INSERT INTO table_suggested_charts.*?;', llm_response, re.DOTALL)
                if chart_query:
                    self.db_conn.sql(chart_query[0].replace("\n", ""))
        
        three_table_joins_list = []
        # three_table_joins = re.findall("(?<=Three-table joins:)(.*)(?=Note:)", llm_response1, re.DOTALL) 
        three_table_joins = re.findall(r"Three-table joins:\s*(\[\s*(?:\[[^\[\]]*\]\s*,?\s*)+\])", llm_response1, re.DOTALL)
        if three_table_joins:
            for i in (three_table_joins[0].split('\n')):
                # j = i.split(',  #')[0]
                j=i.split(',  #')[0].strip()
                if not j or j in ('[',']'):
                    continue
                else:
                    k=eval(j.rstrip(','))
                    # k = [eval(i) for i in j.strip()[1:-1].split(',') if i]
                if k:
                    three_table_joins_list.append(k)
        for three_tables_joins in three_table_joins_list:

            table1 = three_tables_joins[0]
            table2 = three_tables_joins[1]
            table3 = three_tables_joins[2]

            columns, sample_data = self.get_sample_data_columns(table1)
            columns2, sample_data2 = self.get_sample_data_columns(table2)
            columns3, sample_data3 = self.get_sample_data_columns(table3)

            three_table_joins_prompt = "Hi, I am a data analyst. I am trying to generate a chart for these 3 tables {table1}, {table2}, and {table3}. \
                                        with columns for {table1} as {columns}, {table2} as {columns2}, and {table3} as {columns3} \
                                        with sample data for {table1} {sample_data}, {table2} {sample_data2}, and {table3} {sample_data3}. \
                                        and provide response as a sql query insert command like 'insert into table_suggested_charts (table_name, chart_type, title, x_axis, y_axis, query) \
                                        values ()'. For the query columns generate a select query command to get data from database for the chart.\
                                        Assess if chart is possible with this data otherwise return chart not possible."
            three_table_joins_prompt = three_table_joins_prompt.format(table1=table1, table2=table2, table3=table3, columns=columns, columns2=columns2, columns3=columns3, sample_data=sample_data, sample_data2=sample_data2, sample_data3=sample_data3)
            
            response = self.llm_conn.get_response(three_table_joins_prompt)
            if response.status_code == 200 and response.json()['content']:
                llm_response = response.json()['content'][0]['text']
                
                chart_query = re.findall(r'INSERT INTO table_suggested_charts.*?;', llm_response, re.DOTALL)
                if chart_query:
                    self.db_conn.sql(chart_query[0].replace("\n", ""))
        
    def run(self):
        """in this method we will orchestrate the whole process calling the functions in the right order
        """
        # 1. get the list of tables 
        list_of_tables = self.get_list_of_tables()
        print(list_of_tables)
        # 2. generate descriptions for each column and the table
        # self.run_auto_gen_description(list_of_tables)
        # 3. create charts for each column in the table
        for table in list_of_tables:
           if table != 'film_text':
            self.auto_gen_charts_single_col(table)
        # 4. get the charts for multiple columns in a table
        #self.auto_gen_charts_multiple_cols(list_of_tables)
        # 5. get the charts for multiple tables
        # self.auto_gen_charts_multiple_tables(list_of_tables)


