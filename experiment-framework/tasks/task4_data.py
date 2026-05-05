# Task 4: Data Transformation (Hostile Task)
# Tests compression vs decomposition trade-off

import json

def process_users(users):
    """Process user list and return statistics."""
    # Filter active users
    active_users = [u for u in users if u['active']]
    
    # Extract scores
    scores = [u['score'] for u in active_users]
    
    # Compute statistics
    count = len(scores)
    total = sum(scores)
    average = total / count if count > 0 else 0
    maximum = max(scores) if scores else 0
    minimum = min(scores) if scores else 0
    
    # Classify based on average
    if average > 80:
        classification = "excellent"
    elif average > 60:
        classification = "good"
    elif average > 40:
        classification = "average"
    else:
        classification = "needs improvement"
    
    return {
        'count': count,
        'sum': total,
        'average': average,
        'max': maximum,
        'min': minimum,
        'classification': classification
    }

# Sample data
users = [
    {'name': 'Alice', 'age': 25, 'score': 85, 'active': True},
    {'name': 'Bob', 'age': 30, 'score': 72, 'active': True},
    {'name': 'Charlie', 'age': 22, 'score': 45, 'active': False},
    {'name': 'Diana', 'age': 28, 'score': 91, 'active': True},
    {'name': 'Eve', 'age': 35, 'score': 68, 'active': True},
    {'name': 'Frank', 'age': 29, 'score': 55, 'active': False},
    {'name': 'Grace', 'age': 31, 'score': 88, 'active': True}
]

# Process and output
result = process_users(users)
print(f"Active users: {result['count']}")
print(f"Score sum: {result['sum']}")
print(f"Average score: {result['average']:.2f}")
print(f"Max score: {result['max']}")
print(f"Min score: {result['min']}")
print(f"Classification: {result['classification']}")
