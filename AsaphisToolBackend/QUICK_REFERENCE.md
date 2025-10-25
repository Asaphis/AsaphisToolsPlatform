# 🚀 Quick Reference Card

## Setup Commands (Run Once)

```bash
# Navigate to backend
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend

# Install Python packages (takes 10-15 min)
pip install -r python/requirements.txt

# Install Node packages
npm install
```

## Start Commands (Every Time)

```bash
# Start backend server
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
npm run dev
# Server runs on http://localhost:4000

# Start frontend (new terminal)
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisTool
npm run dev
# Frontend runs on http://localhost:3000
```

## API Endpoints

### Background Removal
```
POST http://localhost:4000/api/v1/files/remove-background
FormData: image=<file>
Response: { success: true, image: "data:image/png;base64,..." }
```

### Other File Processing
```
POST http://localhost:4000/api/v1/files/compress-image
POST http://localhost:4000/api/v1/files/resize-image
POST http://localhost:4000/api/v1/files/convert-image
```

### Tools & Categories
```
GET  http://localhost:4000/api/v1/tools
GET  http://localhost:4000/api/v1/tools/:slug
GET  http://localhost:4000/api/v1/categories
```

### Admin (requires auth)
```
GET  http://localhost:4000/api/v1/admin/dashboard
GET  http://localhost:4000/api/v1/admin/tools
POST http://localhost:4000/api/v1/admin/tools
```

## Frontend Integration

### Environment Variable
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### API Call Example
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/files/remove-background`,
  { method: 'POST', body: formData }
);

const { image } = await response.json();
// image is base64 PNG with transparent background
```

## File Locations

```
Backend:  C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend
Frontend: C:\Users\husse\AsaphisToolsPlatform\AsaphisTool
Python:   C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend\python
```

## Troubleshooting

### Python not found
```bash
python --version  # Check if installed
where python      # Find Python location
```

### Module not found
```bash
pip install -r python/requirements.txt
pip list | findstr torch  # Verify PyTorch installed
```

### Backend won't start
```bash
npm install       # Install dependencies
npm run dev       # Start with detailed logs
```

### Can't connect from frontend
- Check backend is running (http://localhost:4000/health)
- Verify NEXT_PUBLIC_API_URL in frontend .env.local
- Check CORS settings if using different domain

## Documentation Files

1. **BACKGROUND_REMOVAL_SUMMARY.md** - Start here! ⭐
2. **SETUP_PYTHON.md** - Python installation
3. **BACKGROUND_REMOVAL_SETUP.md** - Complete guide
4. **FRONTEND_INTEGRATION.md** - Frontend code
5. **README.md** - Full backend docs
6. **API.md** - All API endpoints
7. **QUICKSTART.md** - Backend quick start

## Test Checklist

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Python packages installed (`pip list`)
- [ ] Model file exists (python/u2net.pth ~4.7 MB)
- [ ] Backend starts (`npm run dev`)
- [ ] Health check works (http://localhost:4000/health)
- [ ] Can upload test image
- [ ] Background removed successfully
- [ ] Frontend can connect

## Performance

- **First image:** 5-10 seconds (model loading)
- **Next images:** 2-3 seconds
- **Max file size:** 10 MB
- **Supported formats:** JPEG, PNG, WebP
- **Output format:** PNG with transparency

## Common Commands

```bash
# Test Python
python --version
python -c "import torch; print('OK')"

# Test API
curl http://localhost:4000/health
curl -X POST http://localhost:4000/api/v1/files/remove-background -F "image=@test.jpg"

# Check logs
npm run dev  # Shows all backend logs

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Quick Links

- Supabase: https://supabase.com
- Backend: http://localhost:4000
- Frontend: http://localhost:3000
- Health Check: http://localhost:4000/health

---

**Keep this file handy for quick reference!** 📌
