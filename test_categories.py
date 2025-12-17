import requests
import json

# Login
print("🔐 Login...")
login_resp = requests.post('http://localhost:3005/api/login', json={
    'email': 'admin@digikoder.local',
    'password': 'admin123'
})

if login_resp.status_code != 200:
    print(f"❌ Login failed: {login_resp.status_code}")
    print(login_resp.text)
    exit(1)

token = login_resp.json()['token']
print(f"✅ Login successful")

# Create category
print("\n📝 Creating test category...")
cat_resp = requests.post('http://localhost:3005/api/categories',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'id': 'test',
        'label': 'Test Catégorie',
        'icon': 'Filter'
    }
)

print(f"Response status: {cat_resp.status_code}")
print(json.dumps(cat_resp.json(), indent=2, ensure_ascii=False))

# Verify it was created
print("\n📋 Listing all categories...")
list_resp = requests.get('http://localhost:3005/api/categories')
print(json.dumps(list_resp.json(), indent=2, ensure_ascii=False))
