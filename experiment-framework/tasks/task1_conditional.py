"""
Task 1: Conditional Complexity
Build a decision system for user classification
"""

# Requirements:
# - If age > 18 AND score > 80 → "premium"
# - If age > 18 AND score > 50 → "standard"  
# - If score < 50 OR flagged → "review"
# - Else → "reject"

# Test data
test_cases = [
    {'age': 25, 'score': 85, 'flagged': False},
    {'age': 20, 'score': 60, 'flagged': False},
    {'age': 17, 'score': 90, 'flagged': False},
    {'age': 30, 'score': 45, 'flagged': False},
    {'age': 22, 'score': 75, 'flagged': True},
]

# Expected outputs:
# P1: premium (age>18, score>80)
# P2: standard (age>18, score>50)
# P3: reject (age<=18, score>=50, not flagged)
# P4: review (score<50)
# P5: review (flagged)

def classify_user(age, score, flagged):
    # Implement your solution here
    pass

# Run tests
for i, case in enumerate(test_cases, 1):
    result = classify_user(case['age'], case['score'], case['flagged'])
    print(f"Test {i}: {result}")
