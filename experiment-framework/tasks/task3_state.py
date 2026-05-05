"""
Task 3: State + Loop
Simulate a resource monitor with continuous tracking
"""

# Requirements:
# - Loop continuously (simulate 5 iterations)
# - Track CPU, RAM values
# - If CPU > 80 OR RAM > 80:
#     - Trigger "alert" action
# - Else if CPU > 60 OR RAM > 60:
#     - Trigger "warning" action
# - Else:
#     - Trigger "normal" action
# - Record all actions

import random

def simulate_readings():
    """Generate fake system readings"""
    return [
        {'cpu': 45, 'ram': 50},
        {'cpu': 75, 'ram': 65},
        {'cpu': 85, 'ram': 70},
        {'cpu': 55, 'ram': 82},
        {'cpu': 40, 'ram': 45},
    ]

def monitor_resources(readings):
    # Implement your solution here
    pass

readings = simulate_readings()
actions = monitor_resources(readings)

for i, action in enumerate(actions, 1):
    print(f"Iteration {i}: {action}")
