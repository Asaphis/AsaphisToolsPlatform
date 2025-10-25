# Quick Start Guide

Get your backend running in 5 minutes! ⚡

## Step 1: Install Dependencies

```bash
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login
3. Click **New Project**
4. Fill in:
   - Name: `AsaphisTool`
   - Database Password: (choose a strong password)
   - Region: (closest to you)
5. Wait 2-3 minutes for setup

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, click **Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (click reveal)

## Step 4: Create Database

1. In Supabase, click **SQL Editor**
2. Open `database/schema.sql` from this project
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see: "Success. No rows returned"

## Step 5: Create .env File

```bash
# In the AsaphisToolBackend directory
copy .env.example .env
```

Now edit `.env` and fill in:

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Paste your Supabase credentials here:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Generate secure secrets (see below)
JWT_SECRET=your_32_char_random_string_here
JWT_ADMIN_SECRET=your_32_char_random_string_here
```

### Generate JWT Secrets

Run this command twice to generate two random secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as `JWT_SECRET` and `JWT_ADMIN_SECRET`.

## Step 6: Create Admin User

1. In Supabase Dashboard > **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter:
   - Email: `admin@asaphistool.com`
   - Password: (your admin password)
   - Confirm Email: ✅ (check this)
4. Click **Create user**

5. In **SQL Editor**, run:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@asaphistool.com';
```

## Step 7: Start the Server

```bash
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 AsaphisTool Backend Server                      ║
║                                                       ║
║   Environment: development                           ║
║   Port:        4000                                   ║
║   ...                                                 ║
╚═══════════════════════════════════════════════════════╝
```

## Step 8: Test It!

Open a new terminal and test:

```bash
curl http://localhost:4000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T...",
  "uptime": 1.234,
  "environment": "development"
}
```

## Step 9: Test API Endpoints

### Get Categories
```bash
curl http://localhost:4000/api/v1/categories
```

### Admin Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/admin-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@asaphistool.com\",\"password\":\"your_password\"}"
```

You should get back a token!

## Step 10: Connect Frontend

In your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

## 🎉 Done!

Your backend is now running! Check the main README.md for:
- Complete API documentation
- Admin panel endpoints
- Deployment guides
- Troubleshooting

## Common Issues

### "Missing required environment variables"
- Make sure `.env` file exists
- Check all required variables are filled in

### "Connection error" from Supabase
- Verify your Supabase URL and keys
- Check if your Supabase project is active

### "Port 4000 already in use"
- Change `PORT=4001` in `.env`
- Or kill the process using port 4000

### Database errors
- Make sure you ran the `schema.sql` in Supabase SQL Editor
- Check Supabase Dashboard > Database > Tables

## Need Help?

- Check the full README.md
- Visit Supabase docs: https://supabase.com/docs
- Check server logs in your terminal

---

Happy coding! 🚀
