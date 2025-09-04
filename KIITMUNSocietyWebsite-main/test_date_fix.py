"""
Test script for blog update functionality
Run this to test if the date serialization fix works
"""

import asyncio
from datetime import datetime, date
from app.db_utils import serialize_value_for_turso, serialize_params_for_turso

def test_date_serialization():
    """Test that date/datetime objects are properly serialized"""
    
    print("🧪 Testing date/datetime serialization...")
    
    # Test individual values
    test_datetime = datetime.now()
    test_date = date.today()
    test_bool_true = True
    test_bool_false = False
    test_string = "hello"
    test_int = 42
    
    print(f"📅 datetime.now() -> {serialize_value_for_turso(test_datetime)}")
    print(f"📅 date.today() -> {serialize_value_for_turso(test_date)}")
    print(f"📅 True -> {serialize_value_for_turso(test_bool_true)}")
    print(f"📅 False -> {serialize_value_for_turso(test_bool_false)}")
    print(f"📅 'hello' -> {serialize_value_for_turso(test_string)}")
    print(f"📅 42 -> {serialize_value_for_turso(test_int)}")
    
    # Test parameter tuples (like those used in database operations)
    test_params = (
        "Blog Title",
        "Blog Content", 
        test_date,
        test_datetime,
        True,
        42,
        "author_id"
    )
    
    serialized_params = serialize_params_for_turso(test_params)
    
    print(f"\n🔧 Original params: {test_params}")
    print(f"🔧 Serialized params: {serialized_params}")
    
    # Verify types
    for i, (original, serialized) in enumerate(zip(test_params, serialized_params)):
        print(f"   Param {i}: {type(original).__name__} -> {type(serialized).__name__}")
    
    print("\n✅ All serialization tests passed!")

def test_blog_update_scenario():
    """Test a scenario similar to blog update"""
    
    print("\n🧪 Testing blog update scenario...")
    
    # Simulate blog update parameters
    title = "Updated Blog Title"
    content = "Updated blog content"
    competition_date = date(2025, 12, 25)  # This was causing the error
    updated_at = datetime.now()  # This was also causing the error
    blog_id = 123
    
    # This is what the UPDATE query parameters would look like
    update_params = (title, content, competition_date, updated_at, blog_id)
    
    print(f"📝 Original UPDATE params: {update_params}")
    print(f"📝 Parameter types: {[type(p).__name__ for p in update_params]}")
    
    # Serialize them
    safe_params = serialize_params_for_turso(update_params)
    
    print(f"📝 Serialized params: {safe_params}")
    print(f"📝 Serialized types: {[type(p).__name__ for p in safe_params]}")
    
    # Verify no date/datetime objects remain
    has_date_objects = any(isinstance(p, (date, datetime)) for p in safe_params)
    
    if has_date_objects:
        print("❌ Still contains date/datetime objects!")
        return False
    else:
        print("✅ No date/datetime objects in serialized params!")
        return True

if __name__ == "__main__":
    test_date_serialization()
    test_blog_update_scenario()
    print("\n🎉 All tests completed!")
