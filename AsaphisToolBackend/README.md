# AsaphisTool Backend API

Complete Node.js/Express backend with Supabase database and admin panel for the AsaphisTool platform.

## 🚀 Features

- **RESTful API** - Clean and organized endpoint structure
- **Supabase Integration** - PostgreSQL database with real-time capabilities
- **JWT Authentication** - Secure user and admin authentication
- **Admin Panel API** - Complete CRUD operations for platform management
- **File Processing** - Image compression, resizing, and conversion
- **Analytics Tracking** - User behavior and tool usage analytics
- **Rate Limiting** - Protection against abuse
- **Error Handling** - Consistent error responses
- **Security** - Helmet, CORS, input validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be set up (2-3 minutes)
3. Go to Project Settings > API
4. Copy your **Project URL** and **API keys**

### 3. Create Database Schema

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Open the file `database/schema.sql` from this project
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the schema

This will create all necessary tables, indexes, policies, and seed data.

### 4. Configure Environment Variables

Create a `.env` file in the backend root:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Server Configuration
NODE_ENV=development
PORT=4000
API_VERSION=v1

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (from your Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Configuration (generate random secure strings)
JWT_SECRET=your_very_long_random_secret_key_min_32_chars
JWT_ADMIN_SECRET=your_very_long_admin_secret_key_min_32_chars
JWT_EXPIRES_IN=24h
JWT_ADMIN_EXPIRES_IN=12h

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp,image/gif
ALLOWED_VIDEO_TYPES=video/mp4,video/avi,video/mov
ALLOWED_PDF_TYPES=application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Admin Configuration
ADMIN_EMAIL=admin@asaphistool.com
ADMIN_PASSWORD=YourSecurePassword123!

# Analytics
ENABLE_ANALYTICS=true

# Logging
LOG_LEVEL=info
```

### 5. Create Admin User

After setting up the database, create your first admin user:

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter email and password
4. After creation, go to **SQL Editor** and run:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@asaphistool.com';
```

Replace the email with your admin email.

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

Server will start at `http://localhost:4000`

### Production Mode

```bash
npm start
```

## 📡 API Endpoints

### Base URL
```
http://localhost:4000/api/v1
```

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "displayName": "John Doe"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Admin Login
```http
POST /api/v1/auth/admin-login
Content-Type: application/json

{
  "email": "admin@asaphistool.com",
  "password": "AdminPassword123"
}
```

### Tools

#### Get All Tools
```http
GET /api/v1/tools
GET /api/v1/tools?category=image
GET /api/v1/tools?featured=true
GET /api/v1/tools?search=compress
```

#### Get Single Tool
```http
GET /api/v1/tools/:slug
```

#### Track Tool Usage
```http
POST /api/v1/tools/:slug/track
Content-Type: application/json

{
  "eventType": "usage",
  "eventData": { "action": "compress", "fileSize": 1024000 }
}
```

### Categories

#### Get All Categories
```http
GET /api/v1/categories
```

#### Get Category with Tools
```http
GET /api/v1/categories/:slug
```

### File Processing

#### Compress Image
```http
POST /api/v1/files/compress-image
Content-Type: multipart/form-data

image: [file]
quality: 80
format: jpeg
```

#### Resize Image
```http
POST /api/v1/files/resize-image
Content-Type: multipart/form-data

image: [file]
width: 800
height: 600
fit: cover
```

#### Convert Image Format
```http
POST /api/v1/files/convert-image
Content-Type: multipart/form-data

image: [file]
format: png
quality: 90
```

### User Routes (Authenticated)

All user routes require `Authorization: Bearer <token>` header.

#### Get Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "New Name",
  "preferences": { "theme": "dark" }
}
```

#### Get Favorites
```http
GET /api/v1/users/favorites
Authorization: Bearer <token>
```

#### Add to Favorites
```http
POST /api/v1/users/favorites/:toolId
Authorization: Bearer <token>
```

#### Remove from Favorites
```http
DELETE /api/v1/users/favorites/:toolId
Authorization: Bearer <token>
```

#### Get History
```http
GET /api/v1/users/history
Authorization: Bearer <token>
```

### Admin Routes (Admin Authentication Required)

All admin routes require `Authorization: Bearer <admin-token>` header.

#### Dashboard Statistics
```http
GET /api/v1/admin/dashboard
Authorization: Bearer <admin-token>
```

#### Manage Tools
```http
GET /api/v1/admin/tools
POST /api/v1/admin/tools
PUT /api/v1/admin/tools/:id
DELETE /api/v1/admin/tools/:id
Authorization: Bearer <admin-token>
```

#### Manage Users
```http
GET /api/v1/admin/users
PUT /api/v1/admin/users/:id
DELETE /api/v1/admin/users/:id
Authorization: Bearer <admin-token>
```

#### Manage Categories
```http
GET /api/v1/admin/categories
POST /api/v1/admin/categories
PUT /api/v1/admin/categories/:id
Authorization: Bearer <admin-token>
```

#### View Analytics
```http
GET /api/v1/admin/analytics
GET /api/v1/admin/analytics?startDate=2025-01-01&endDate=2025-12-31
GET /api/v1/admin/analytics?toolId=<uuid>&eventType=usage
Authorization: Bearer <admin-token>
```

#### Manage Ads
```http
GET /api/v1/admin/ads
POST /api/v1/admin/ads
PUT /api/v1/admin/ads/:id
DELETE /api/v1/admin/ads/:id
Authorization: Bearer <admin-token>
```

#### Manage Settings
```http
GET /api/v1/admin/settings
PUT /api/v1/admin/settings/:key
Authorization: Bearer <admin-token>
```

## 🔒 Security

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **Helmet** - Security headers
- **CORS** - Configured for frontend origin
- **Input Validation** - Express Validator
- **Row Level Security** - Supabase RLS policies

## 📁 Project Structure

```
AsaphisToolBackend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── upload.js            # File upload handling
│   ├── routes/
│   │   ├── admin.routes.js      # Admin panel routes
│   │   ├── analytics.routes.js  # Analytics routes
│   │   ├── auth.routes.js       # Authentication routes
│   │   ├── categories.routes.js # Categories routes
│   │   ├── file.routes.js       # File processing routes
│   │   ├── tools.routes.js      # Tools routes
│   │   └── user.routes.js       # User routes
│   └── server.js                # Express server setup
├── database/
│   └── schema.sql               # Database schema
├── uploads/                     # File upload directory (auto-created)
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🗃️ Database Schema

### Main Tables

- **users** - User profiles (extends Supabase Auth)
- **tools** - Available tools on the platform
- **categories** - Tool categories
- **analytics** - Usage tracking and analytics
- **user_favorites** - User's favorite tools
- **user_history** - User tool usage history
- **ads** - Advertisement management
- **blog_posts** - Blog/content management
- **settings** - Platform settings

See `database/schema.sql` for complete schema with indexes, triggers, and RLS policies.

## 🔄 Connecting Frontend

Update your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Example frontend API call:

```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tools`);
const data = await response.json();
```

## 🚀 Deployment

### Deploy to Vercel/Netlify (Serverless)

The backend can be deployed as serverless functions. For Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the backend directory
3. Set environment variables in Vercel dashboard
4. Update frontend `NEXT_PUBLIC_API_URL` to your Vercel URL

### Deploy to Railway/Render (Traditional)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy command: `npm start`
4. Update frontend `NEXT_PUBLIC_API_URL`

### Deploy to VPS (Self-hosted)

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start src/server.js --name asaphistool-api

# Setup auto-restart
pm2 startup
pm2 save
```

## 🧪 Testing

Health check:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T17:36:06.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment (development/production) | development | Yes |
| `PORT` | Server port | 4000 | No |
| `API_VERSION` | API version prefix | v1 | No |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 | Yes |
| `SUPABASE_URL` | Supabase project URL | - | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key | - | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | Yes |
| `JWT_SECRET` | JWT secret for user tokens | - | Yes |
| `JWT_ADMIN_SECRET` | JWT secret for admin tokens | - | Yes |
| `JWT_EXPIRES_IN` | User token expiration | 24h | No |
| `JWT_ADMIN_EXPIRES_IN` | Admin token expiration | 12h | No |
| `MAX_FILE_SIZE` | Max upload size in bytes | 10485760 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 | No |

## 🛠️ Development Tips

1. **Generate secure JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **View logs in development:**
   ```bash
   npm run dev
   ```

3. **Test API endpoints:**
   Use Postman, Insomnia, or Thunder Client

4. **Monitor Supabase:**
   Check your Supabase dashboard for database queries and performance

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

For issues and questions:
- Open an issue on GitHub
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Check Express documentation: [expressjs.com](https://expressjs.com)

---

**Built with Node.js, Express, and Supabase** 🚀
