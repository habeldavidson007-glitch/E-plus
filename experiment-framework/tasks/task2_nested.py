"""
Task 2: Nested Reasoning
Process a list of users with nested conditions
"""

# Requirements:
# For each user:
#   - Check if active
#   - If active:
#       - If balance > threshold:
#           - Mark as "priority"
#       - Else:
#           - Mark as "standard"
#   - Else:
#       - Mark as "inactive"

users = [
    {'name': 'Alice', 'active': True, 'balance': 1500},
    {'name': 'Bob', 'active': True, 'balance': 300},
    {'name': 'Charlie', 'active': False, 'balance': 2000},
    {'name': 'Diana', 'active': True, 'balance': 800},
]

threshold = 1000

def process_users(users, threshold):
    # Implement your solution here
    pass

results = process_users(users, threshold)
for r in results:
    print(f"{r['name']}: {r['status']}")
