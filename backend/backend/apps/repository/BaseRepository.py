"""The `BaseRepository` class provides common database operations for models,
such as creating, filtering, querying, getting all records, getting the
first record, deleting records, and updating records."""

from typing import List

from utility.db_connection import db


class BaseRepository:
    """
    Base class to handle all common database operations of models
    """

    def __init__(self, model=None, res=None, db=db) -> None:
        self._model = model
        self._res = res
        self._db = db

    async def create(self, values: dict = {}) -> dict:
        """
        The function creates a new object using the given values and adds it
        to the database.
        :param values: The `values` parameter is a dictionary that contains
        the values to be used for creating a new object. The keys of the
        dictionary should correspond to the attributes of the object and
        the values should be the desired values for those attributes
        :type values: dict
        :return: a dictionary object.
        """
        new_obj = self._model(**values)
        self._db.session.add(new_obj)
        self._db.session.commit()
        return new_obj

    async def filter(self, query, name, value, model) -> dict:
        """
        The function filters a query based on a given name, value, and model.
        :param query: The `query` parameter is an SQLAlchemy query object. It
        represents a database query that can be further modified or executed
        :param name: The name parameter is a string that represents the name
        of the column in the database table that you want to filter on
        :param value: The "value" parameter is the value that you want to
        filter the query by. It can be a single value or a list of values,
        depending on the type of filter you want to apply
        :param model: The `model` parameter is the SQLAlchemy model class that
        represents the database table you want to filter. It is an optional
        parameter, and if not provided, the method will use the `_model`
        attribute of the current instance
        :return: a filtered query.
        """
        column = getattr(model or self._model, name)
        operator = None
        if value is None:
            operator = getattr(column, "is_")
        elif value != 0 and not value:
            return query
        elif isinstance(value, list):
            operator = getattr(column, "in_")
        else:
            operator = getattr(column, "__eq__")
        return query.filter(operator(value))

    async def query(self, filters: dict = {}) -> dict:
        """
        The function takes in a dictionary of filters, applies them to a
        database query, and returns the query.
        :param filters: The `filters` parameter is a dictionary that contains
        the filters to be applied to the query. Each key-value pair in the
        dictionary represents a filter, where the key is the name of the
        filter and the value is the value to filter by
        :type filters: dict
        :return: a query object.
        """
        query = self._db.session.query(self._model)
        if len(filters) > 0:
            for filter in filters.keys():
                query = self.filter(query, filter, filters[filter], self._model)
        return query

    async def get_all(self, filters: dict = {}) -> List[dict]:
        """
        The function `get_all` takes in a dictionary of filters, creates a
        query using those filters and returns all the results of the query.
        :param filters: The `filters` parameter is a dictionary that contains
        the filters to be applied to the query. Each key-value pair in the
        dictionary represents a filter, where the key is the column name and
        the value is the filter value
        :type filters: dict
        :return: a list of dictionaries.
        """
        query = self.query(filters=filters)
        return query.all()

    async def get_first(self, filters: dict = {}) -> dict:
        """
        The function `get_first` returns the first result from a query based
        on the given filters.
        :param filters: The `filters` parameter is a dictionary that contains
        the conditions to filter the query results. It is optional and
        defaults to an empty dictionary if not provided
        :type filters: dict
        :return: The first result from the query that matches the given
        filters.
        """
        return self.query(filters=filters).first()

    async def delete(self, filters: dict = {}) -> int:
        """
        The function deletes records from a database table based on the
        provided filters and returns the number of deleted records.
        :param filters: The `filters` parameter is a dictionary that contains
        the conditions to filter the records that you want to delete. Each
        key-value pair in the dictionary represents a condition. The key is
        the name of the column in the database table, and the value is the
        value that the column should match in order for
        :type filters: dict
        :return: The method is returning an integer value, which represents
        the number of rows that were
        deleted from the database.
        """
        query = self.query(filters=filters)
        is_deleted = query.delete()
        self._db.session.commit()
        return is_deleted

    async def update(self, id: int, values: dict = {}) -> dict | bool:
        """
        The function updates a record in the database with the given id and
        values.
        :param id: The `id` parameter is an integer that represents the unique
        identifier of the object you want to update in the database
        :type id: int
        :param values: The `values` parameter is a dictionary that contains
        the updated values for the object with the specified `id`. The keys of
        the dictionary represent the names of the attributes or columns in the
        object, and the values represent the new values for those attributes or
        columns
        :type values: dict
        :return: either a dictionary or a boolean value.
        """
        query = self._db.session.query(self._model).filter(self._model.id == id)
        response = query.update(values)
        self._db.session.commit()
        return response

    def close_connection(self) -> None:
        """
        The function closes the current database session.
        """
        self._db.session.close()
