"""
This module is for handling exception for the
methods. We will be handling Exceptions using these exception.
"""

from fastapi import HTTPException


class CustomHTTPException(HTTPException):
    """
    Base class for custom HTTP exceptions.

    Args:
        detail (str): A message describing the error.
        status_code (int): The HTTP status code for the error.
    """

    def __init__(self, detail: str, status_code: int):
        super().__init__(status_code=status_code, detail=detail)


class NotFoundError(CustomHTTPException):
    """
    Exception raised when a requested resource is not found.

    Args:
        detail (str): A message describing the error. Defaults to "Resource not found".
    """

    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=404)


class UnauthorizedError(CustomHTTPException):
    """
    Exception raised for unauthorized access attempts.

    Args:
        detail (str): A message describing the error. Defaults to "Unauthorized access".
    """

    def __init__(self, detail: str = "Unauthorized access"):
        super().__init__(detail=detail, status_code=401)


class BadRequestError(CustomHTTPException):
    """
    Exception raised for invalid request parameters.

    Args:
        detail (str): A message describing the error. Defaults to "Bad request".
    """

    def __init__(self, detail: str = "Bad request"):
        super().__init__(detail=detail, status_code=400)


class ConflictError(CustomHTTPException):
    """
    Exception raised when a conflict occurs with the current state of the resource.

    Args:
        detail (str): A message describing the error. Defaults to "Conflict error".
    """

    def __init__(self, detail: str = "Conflict error"):
        super().__init__(detail=detail, status_code=409)
