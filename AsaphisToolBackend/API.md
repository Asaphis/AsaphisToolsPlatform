# API Documentation

Complete API reference for AsaphisTool Backend

## Base URL

```
Development: http://localhost:4000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

Most endpoints require authentication via JWT tokens in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "stack": "Stack trace (development only)"
}
```

---

## 🔐 Authentication Endpoints

### Register New User

**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### User Login

**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "isAdmin": false
  }
}
```

### Admin Login

**POST** `/auth/admin-login`

Request:
```json
{
  "email": "admin@asaphistool.com",
  "password": "AdminPass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "uuid",
    "email": "admin@asaphistool.com",
    "displayName": "Admin"
  }
}
```

---

## 🛠️ Tools Endpoints

### Get All Tools

**GET** `/tools`

Query Parameters:
- `category` - Filter by category (e.g., `image`, `pdf`)
- `featured` - Filter featured tools (`true`/`false`)
- `popular` - Filter popular tools (`true`/`false`)
- `premium` - Filter premium tools (`true`/`false`)
- `search` - Search in name, description, tags

Examples:
```
GET /tools
GET /tools?category=image
GET /tools?featured=true&popular=true
GET /tools?search=compress
```

Response:
```json
{
  "success": true,
  "count": 15,
  "tools": [
    {
      "id": "uuid",
      "name": "Image Compressor",
      "slug": "image-compressor",
      "description": "Compress images...",
      "category": "image",
      "icon": "🗜️",
      "featured": true,
      "popular": true,
      "premium": false,
      "tags": ["compress", "optimize"],
      "usage_count": 1234,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Single Tool

**GET** `/tools/:slug`

Response:
```json
{
  "success": true,
  "tool": {
    "id": "uuid",
    "name": "Image Compressor",
    "slug": "image-compressor",
    "description": "...",
    "category": "image",
    "icon": "🗜️",
    "featured": true,
    "popular": true,
    "premium": false,
    "tags": ["compress"],
    "seo_title": "...",
    "seo_description": "...",
    "keywords": ["..."],
    "usage_count": 1234
  }
}
```

### Track Tool Usage

**POST** `/tools/:slug/track`

Request:
```json
{
  "eventType": "usage",
  "eventData": {
    "action": "compress",
    "fileSize": 1024000,
    "compressionRatio": 65.5
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

---

## 📁 Categories Endpoints

### Get All Categories

**GET** `/categories`

Response:
```json
{
  "success": true,
  "count": 8,
  "categories": [
    {
      "id": "uuid",
      "name": "Image",
      "slug": "image",
      "description": "Image processing tools",
      "icon": "🖼️",
      "color": "blue",
      "display_order": 1,
      "is_active": true
    }
  ]
}
```

### Get Category with Tools

**GET** `/categories/:slug`

Response:
```json
{
  "success": true,
  "category": {
    "id": "uuid",
    "name": "Image",
    "slug": "image",
    "description": "...",
    "icon": "🖼️"
  },
  "tools": [
    { "id": "...", "name": "Image Compressor", ... }
  ],
  "toolCount": 5
}
```

---

## 📊 Analytics Endpoints

### Track Analytics Event

**POST** `/analytics/track`

Request:
```json
{
  "toolId": "uuid",
  "eventType": "view",
  "eventData": {
    "referrer": "google",
    "device": "mobile"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

### Get Popular Tools

**GET** `/analytics/popular?limit=10`

Response:
```json
{
  "success": true,
  "tools": [...]
}
```

---

## 📄 File Processing Endpoints

### Compress Image

**POST** `/files/compress-image`

**Content-Type:** `multipart/form-data`

Form Data:
- `image` (file) - Image file
- `quality` (number) - Quality 1-100 (default: 80)
- `format` (string) - Output format: `jpeg`, `png`, `webp`

Response:
```json
{
  "success": true,
  "image": "data:image/jpeg;base64,...",
  "originalSize": 2048000,
  "compressedSize": 512000,
  "compressionRatio": "75.00"
}
```

### Resize Image

**POST** `/files/resize-image`

**Content-Type:** `multipart/form-data`

Form Data:
- `image` (file) - Image file
- `width` (number) - Target width in pixels
- `height` (number) - Target height in pixels
- `fit` (string) - Fit mode: `cover`, `contain`, `fill`, `inside`, `outside`

Response:
```json
{
  "success": true,
  "image": "data:image/...",
  "dimensions": {
    "width": 800,
    "height": 600
  },
  "size": 153600
}
```

### Convert Image Format

**POST** `/files/convert-image`

**Content-Type:** `multipart/form-data`

Form Data:
- `image` (file) - Image file
- `format` (string) - Target format: `jpeg`, `png`, `webp`, `gif`
- `quality` (number) - Quality 1-100 (default: 90)

Response:
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "format": "png",
  "size": 204800
}
```

---

## 👤 User Endpoints

**Authentication Required:** All endpoints require Bearer token

### Get User Profile

**GET** `/users/profile`

Response:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "John Doe",
    "avatar_url": null,
    "is_admin": false,
    "preferences": {
      "theme": "dark",
      "language": "en"
    },
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### Update User Profile

**PUT** `/users/profile`

Request:
```json
{
  "displayName": "Jane Doe",
  "preferences": {
    "theme": "light",
    "language": "es"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

### Get User Favorites

**GET** `/users/favorites`

Response:
```json
{
  "success": true,
  "favorites": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "tool_id": "uuid",
      "created_at": "...",
      "tools": {
        "id": "...",
        "name": "Image Compressor",
        ...
      }
    }
  ]
}
```

### Add Tool to Favorites

**POST** `/users/favorites/:toolId`

Response:
```json
{
  "success": true,
  "message": "Tool added to favorites"
}
```

### Remove Tool from Favorites

**DELETE** `/users/favorites/:toolId`

Response:
```json
{
  "success": true,
  "message": "Tool removed from favorites"
}
```

### Get User History

**GET** `/users/history?limit=20`

Response:
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "tool_id": "uuid",
      "used_at": "2025-01-15T10:30:00Z",
      "tools": {
        "name": "PDF Merger",
        ...
      }
    }
  ]
}
```

---

## 👑 Admin Endpoints

**Authentication Required:** All endpoints require admin Bearer token

### Dashboard Statistics

**GET** `/admin/dashboard`

Response:
```json
{
  "success": true,
  "stats": {
    "totalTools": 25,
    "totalUsers": 1500,
    "totalUsage": 50000
  },
  "recentActivity": [...],
  "popularTools": [...]
}
```

### Manage Tools

**GET** `/admin/tools` - Get all tools (including inactive)

**POST** `/admin/tools` - Create new tool

Request:
```json
{
  "name": "New Tool",
  "slug": "new-tool",
  "description": "Tool description",
  "category": "image",
  "icon": "🎨",
  "featured": false,
  "popular": false,
  "premium": false,
  "tags": ["tag1", "tag2"]
}
```

**PUT** `/admin/tools/:id` - Update tool

Request:
```json
{
  "name": "Updated Name",
  "featured": true,
  "is_active": true
}
```

**DELETE** `/admin/tools/:id` - Delete tool

### Manage Users

**GET** `/admin/users` - Get all users

**PUT** `/admin/users/:id` - Update user

Request:
```json
{
  "isAdmin": true,
  "isActive": true
}
```

**DELETE** `/admin/users/:id` - Delete user

### Manage Categories

**GET** `/admin/categories` - Get all categories

**POST** `/admin/categories` - Create category

Request:
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "...",
  "icon": "🎯",
  "color": "purple",
  "display_order": 10
}
```

**PUT** `/admin/categories/:id` - Update category

### View Analytics

**GET** `/admin/analytics`

Query Parameters:
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `toolId` - Filter by tool UUID
- `eventType` - Filter by event type

Example:
```
GET /admin/analytics?startDate=2025-01-01&endDate=2025-12-31&eventType=usage
```

### Manage Ads

**GET** `/admin/ads` - Get all ads

**POST** `/admin/ads` - Create ad

Request:
```json
{
  "title": "Summer Sale",
  "description": "50% off all tools",
  "image_url": "https://...",
  "link_url": "https://...",
  "slot": "header",
  "is_active": true,
  "display_order": 1,
  "start_date": "2025-06-01T00:00:00Z",
  "end_date": "2025-08-31T23:59:59Z"
}
```

**PUT** `/admin/ads/:id` - Update ad

**DELETE** `/admin/ads/:id` - Delete ad

### Manage Settings

**GET** `/admin/settings` - Get all settings

**PUT** `/admin/settings/:key` - Update setting

Request:
```json
{
  "value": "new_value"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## Rate Limits

- **Default:** 100 requests per 15 minutes per IP
- **Strict endpoints:** 20 requests per 15 minutes

Rate limit info in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Testing with cURL

### Get Categories
```bash
curl http://localhost:4000/api/v1/categories
```

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Upload and Compress Image
```bash
curl -X POST http://localhost:4000/api/v1/files/compress-image \
  -F "image=@/path/to/image.jpg" \
  -F "quality=80" \
  -F "format=jpeg"
```

### Get Profile (Authenticated)
```bash
curl http://localhost:4000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with JavaScript

```javascript
// Get tools
const response = await fetch('http://localhost:4000/api/v1/tools');
const data = await response.json();

// Login
const loginResponse = await fetch('http://localhost:4000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// Authenticated request
const profileResponse = await fetch('http://localhost:4000/api/v1/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profile = await profileResponse.json();

// File upload
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('quality', '80');

const compressResponse = await fetch('http://localhost:4000/api/v1/files/compress-image', {
  method: 'POST',
  body: formData
});
const compressed = await compressResponse.json();
```

---

**Last Updated:** October 2025  
**API Version:** v1
