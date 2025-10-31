# Authentication setup

This project uses Supabase for user management and JWTs for API authentication.

Environment variables required

- JWT_SECRET: secret used to sign regular user tokens
- JWT_EXPIRES_IN: expiration for user JWT (e.g., 7d)
- JWT_ADMIN_SECRET: secret used to sign admin tokens
- JWT_ADMIN_EXPIRES_IN: expiration for admin tokens (e.g., 1d)
- SUPABASE_URL
- SUPABASE_KEY (service role key)
- FRONTEND_URL (for CORS)

How admin login works

1. Admin signs in via POST /api/v1/auth/admin-login with email and password.
2. Backend authenticates using Supabase, ensures `users.is_admin` is true, then issues a JWT signed with `JWT_ADMIN_SECRET`.
3. Admin frontend stores the token in `localStorage` under `admin_token` and includes it in `Authorization: Bearer <token>` headers for admin API calls.
4. Backend admin routes use `authenticateAdmin` middleware to verify the admin JWT and checks `users.is_admin` in the database.

Notes and security

- Never share your JWT_ADMIN_SECRET. Keep it in environment variables and never commit it.
- For production, use HTTPS and secure cookies where appropriate.
- Consider using Refresh Tokens or short-lived tokens plus cookie storage to reduce XSS exposure.
- Ensure `supabaseAdmin` client is configured with a service role key for admin operations.
- Add rate-limiting on the `/api/v1/auth` endpoints to prevent brute-force attacks.

If you'd like, I can implement:
- Server-side sessions (HttpOnly cookie) for admin instead of localStorage
- Refresh token flow
- Rate limiting specific to auth endpoints
- 2FA for admin accounts

Tell me which you'd prefer and I'll implement the next step.
