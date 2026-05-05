# Task 4: Hostile Task - Data Transformation (Compression Test)

## Purpose
This task challenges E+'s decomposition philosophy by requiring dense data operations that Python handles compactly.

## Scenario
Process a list of user records to compute statistics.

## Requirements

Given a list of users with fields (name, age, score, active):
1. Filter only active users
2. Map to extract scores
3. Compute: count, sum, average, max, min
4. Classify based on average:
   - avg > 80 → "excellent"
   - avg > 60 → "good"  
   - avg > 40 → "average"
   - else → "needs improvement"
5. Output classification and count

## Python Version (for comparison)
See task4_data.py

## E+ Version
See task4_eplus.eplus

## Success Metrics
- Correctness: All 5 statistics computed correctly
- Classification: Proper category assigned
- Time: Completion time recorded
- Cognitive Load: Compare mental effort between approaches

## Why This is "Hostile" to E+
- Python can do this in ~10 lines with list comprehensions
- E+ requires explicit step-by-step decomposition
- Tests whether decomposition aids or hinders understanding
- Challenges the "one thought per line" philosophy with compressed operations
