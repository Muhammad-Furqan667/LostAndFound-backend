# Testing Token Blacklist & Current User Endpoint

## 🎯 Test Secure Logout (Token Blacklist)

Follow these steps in Postman to verify the token blacklist is working:

### Step 1: Login
```http
POST http://localhost:8081/api/users/login
Content-Type: application/json

{
  "reg_no": "2021-CS-100",
  "password": "test123"
}
```

**Save the token from the response!**

---

### Step 2: Test POST (Should Work)
```http
POST http://localhost:8081/api/lost
Authorization: Bearer <YOUR_TOKEN>
Content-Type: form-data

name: Lost Laptop
description: Black laptop
location: Library
contact: 03001234567
```

**Expected:** ✅ Success (200)

---

### Step 3: Logout
```http
POST http://localhost:8081/api/users/logout
Authorization: Bearer <YOUR_TOKEN>
```

**Expected Response:**
```json
{
  "message": "Ali Ahmed is logout successful"
}
```

**Check server logs - you should see:**
```
Attempting to blacklist token: eyJhbGciOiJIUzI1NiI...
Token blacklisted successfully
```

---

### Step 4: Try POST Again (Should FAIL)
```http
POST http://localhost:8081/api/lost
Authorization: Bearer <SAME_TOKEN>
Content-Type: form-data

name: Lost Laptop 2
description: Another laptop
location: Library
contact: 03001234567
```

**Expected:** ❌ 401 Unauthorized
```json
{
  "error": "Session expired. Please login again."
}
```

**Check server logs - you should see:**
```
Checking if token is blacklisted...
⛔ Token found in blacklist. Denying access.
```

✅ **If you see this error, the blacklist is working!**

---

## 👤 Test Current User Endpoint

### Get Current User Profile
```http
GET http://localhost:8081/api/users/me
Authorization: Bearer <VALID_TOKEN>
```

**Expected Response (200):**
```json
{
  "message": "Current user retrieved successfully",
  "user": {
    "id": 1,
    "reg_no": "2021-CS-100",
    "name": "Ali Ahmed",
    "contact": "03001234567",
    "department": "Computer Science",
    "created_at": "2025-11-29T18:58:00.000Z"
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Still able to post after logout

1. **Check server logs** when you logout - do you see "Token blacklisted successfully"?
2. **Check server logs** when you try to post - do you see "Token found in blacklist"?
3. **Verify the table exists:**
   - Go to Supabase → Table Editor
   - Find `token_blacklist` table
   - After logout, you should see your token stored there

4. **If token is NOT being saved:**
   - Check if you get any error in server logs during logout
   - Verify the table has the correct columns: `id`, `token`, `created_at`

5. **If token is saved but not checked:**
   - The logs will show "Checking if token is blacklisted..."
   - If you see an error, share it with me

---

## 📋 Summary

**Two new features:**
1. ✅ **Secure Logout**: Tokens are blacklisted and cannot be reused
2. ✅ **Get Current User**: `GET /api/users/me` returns logged-in user's profile

**Endpoints:**
- `POST /api/users/login` - Login and get token
- `POST /api/users/logout` - Logout and blacklist token (requires auth)
- `GET /api/users/me` - Get current user profile (requires auth)
- `POST /api/lost` - Create lost item (requires auth)
- `POST /api/found` - Create found item (requires auth)
