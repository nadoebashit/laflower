import urllib.request
import json

def request(method, url, data=None, token=None):
    req = urllib.request.Request('http://localhost:8000' + url, method=method)
    req.add_header('Content-Type', 'application/json')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    if data is not None:
        try:
            res = urllib.request.urlopen(req, data=json.dumps(data).encode('utf-8'))
            return json.loads(res.read())
        except Exception as e:
            if hasattr(e, 'read'):
                print(e.read().decode())
            raise e
    else:
        try:
            res = urllib.request.urlopen(req)
            return json.loads(res.read())
        except Exception as e:
            if hasattr(e, 'read'):
                print(e.read().decode())
            raise e

print('1. Login')
login = request('POST', '/auth/login', {'email': 'admin@flowers.com', 'password': 'Admin12345!'})
token = login['access_token']
print('Login OK')

print('2. Get Flowers')
flowers = request('GET', '/flowers', token=token)
print(flowers)

print('3. Sell Bouquet')
items = [{'flower_id': flowers['items'][0]['id'], 'quantity': 2}]
bouquet = request('POST', '/bouquets', {'items': items}, token=token)
print(bouquet)

print('4. Get Reports')
reports = request('GET', '/reports?period=today', token=token)
print(reports)
