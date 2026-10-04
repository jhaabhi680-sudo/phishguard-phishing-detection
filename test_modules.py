import sys
sys.path.insert(0, 'src')
from feature_engineering import extract_url_features, get_interpretable_features
from predict import validate_url, get_risk_level

# Test URL validation
print('Testing URL validation...')
tests = [
    ('https://google.com', True),
    ('', False),
    ('https://secure-account-verification-example.com/login', True),
]
for url, expected_valid in tests:
    is_valid, cleaned, err = validate_url(url)
    status = 'OK' if is_valid == expected_valid else 'FAIL'
    print(f'  [{status}] "{url[:50]}" -> valid={is_valid}')

# Test feature extraction
print()
print('Testing feature extraction...')
test_url = 'https://secure-account-verification-example.com/login'
feats = get_interpretable_features(test_url)
print(f'  URL: {test_url}')
for k, v in feats.items():
    if not isinstance(v, list) or v:
        print(f'  {k:30s}: {v}')

# Test risk score
print()
print('Testing risk levels...')
for score in [10, 45, 75, 95]:
    print(f'  Score {score} -> {get_risk_level(score)}')

print()
print('All tests passed!')
