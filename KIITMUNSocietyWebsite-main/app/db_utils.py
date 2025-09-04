"""
Database Date/DateTime Utilities for Turso Compatibility
Handles proper serialization of Python date/datetime objects for libsql_client
"""

from datetime import datetime, date
from typing import Any, List, Tuple, Optional

def serialize_value_for_turso(value: Any) -> Any:
    """
    Convert Python objects to Turso-compatible types
    
    Args:
        value: Any Python value that might contain date/datetime objects
        
    Returns:
        Turso-compatible value (strings for dates/datetimes)
    """
    if isinstance(value, datetime):
        return value.isoformat()
    elif isinstance(value, date):
        return value.isoformat()
    elif value is True:
        return 1  # SQLite boolean compatibility
    elif value is False:
        return 0  # SQLite boolean compatibility
    else:
        return value

def serialize_params_for_turso(params: Optional[Tuple]) -> Optional[Tuple]:
    """
    Convert a tuple of parameters for Turso database operations
    
    Args:
        params: Tuple of parameters that might contain date/datetime objects
        
    Returns:
        Tuple with properly serialized values
    """
    if params is None:
        return None
    
    return tuple(serialize_value_for_turso(param) for param in params)

def serialize_list_for_turso(values: List[Any]) -> List[Any]:
    """
    Convert a list of values for Turso database operations
    
    Args:
        values: List of values that might contain date/datetime objects
        
    Returns:
        List with properly serialized values
    """
    return [serialize_value_for_turso(value) for value in values]

# Utility functions for common date operations
def now_iso() -> str:
    """Get current datetime as ISO string for database storage"""
    return datetime.now().isoformat()

def date_to_iso(date_obj: date) -> str:
    """Convert date object to ISO string for database storage"""
    return date_obj.isoformat()

def datetime_to_iso(datetime_obj: datetime) -> str:
    """Convert datetime object to ISO string for database storage"""
    return datetime_obj.isoformat()

def parse_date_string(date_string: str, format_str: str = "%Y-%m-%d") -> date:
    """
    Parse date string and return date object
    
    Args:
        date_string: Date string to parse
        format_str: Format string (default: "%Y-%m-%d")
        
    Returns:
        date object
        
    Raises:
        ValueError: If date string is invalid
    """
    return datetime.strptime(date_string, format_str).date()

def parse_date_for_db(date_string: str, format_str: str = "%Y-%m-%d") -> str:
    """
    Parse date string and return ISO string ready for database storage
    
    Args:
        date_string: Date string to parse
        format_str: Format string (default: "%Y-%m-%d")
        
    Returns:
        ISO date string for database storage
        
    Raises:
        ValueError: If date string is invalid
    """
    parsed_date = parse_date_string(date_string, format_str)
    return date_to_iso(parsed_date)
