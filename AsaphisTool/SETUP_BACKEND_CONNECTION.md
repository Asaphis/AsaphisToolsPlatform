# Backend Connection Setup Guide

## ✅ Frontend is Now Connected!

I've updated the BackgroundRemover component to properly connect to your backend API.

## 🚀 Setup Steps

### 1. Configure Frontend Environment

Create or update `.env.local` in the **frontend** folder:

```bash
# AsaphisTool/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 2. Start the Backend Server

Navigate to the backend folder and start the server:

```bash
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisToolBackend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run dev
```

The backend should start on `http://localhost:4000`

### 3. Verify Backend Setup

Make sure you've completed the backend setup (see `AsaphisToolBackend/README-REMOVE-BG.md`):

- ✅ Python 3.8+ installed
- ✅ Python dependencies installed: `pip install -r requirements.txt`
- ✅ U²-Net model downloaded to `models/u2net.pth` (~176 MB)
- ✅ `uploads/` folder exists (created automatically)

### 4. Start the Frontend

In a **new terminal**, start the Next.js frontend:

```bash
cd C:\Users\husse\AsaphisToolsPlatform\AsaphisTool

npm run dev
```

The frontend should start on `http://localhost:3000`

### 5. Test Background Removal

1. Go to `http://localhost:3000/tools/background-remover`
2. Upload an image
3. Wait for processing (5-10 seconds for first image, faster afterwards)
4. See the transparent result!
5. Select different background colors/gradients
6. Download the result

## 📡 API Connection Details

### Endpoint
```
POST http://localhost:4000/api/remove-bg
```

### Request
- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** `image` field with file

### Response
```json
{
  "status": "success",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### Error Response
```json
{
  "status": "error",
  "error": "Error message here"
}
```

## 🔧 How It Works

1. **User uploads image** → Frontend sends to backend via FormData
2. **Backend receives** → Multer saves to `uploads/` folder
3. **Python processes** → U²-Net model removes background
4. **Returns base64** → Transparent PNG as data URL
5. **Frontend displays** → Shows result with selected background
6. **User downloads** → Canvas composites and exports

## 🐛 Troubleshooting

### "Background removal API is not configured"
- Make sure `.env.local` exists in frontend folder
- Verify `NEXT_PUBLIC_API_URL=http://localhost:4000`
- Restart Next.js dev server after changing .env

### "Failed to connect to background removal service"
- Check if backend is running on port 4000
- Check terminal for backend errors
- Verify no firewall blocking localhost connections

### "Server error: 500"
- Check backend terminal for Python errors
- Verify U²-Net model exists: `AsaphisToolBackend/models/u2net.pth`
- Ensure Python dependencies installed
- Check `uploads/` folder has write permissions

### Backend won't start
- Port 4000 might be in use: Change port in backend config
- Update `NEXT_PUBLIC_API_URL` to match new port

### Slow processing
- First image takes 5-10 seconds (model loading)
- Subsequent images are faster (~1-3 seconds)
- Consider GPU acceleration for faster processing

## 📊 Expected Performance

- **First Request:** 5-10 seconds (model loading)
- **Subsequent Requests:** 1-3 seconds per image
- **Model Size:** 176 MB (U²-Net)
- **Max File Size:** 10 MB

## 🔒 Security Notes

- Files automatically deleted after processing
- 10MB file size limit enforced
- Only PNG/JPG files accepted
- All processing happens locally (no external APIs)

## 🎉 You're Ready!

Once both servers are running, your background remover should work perfectly with:
- ✅ AI-powered background removal
- ✅ Multiple background options
- ✅ Custom background upload
- ✅ Download with selected background
- ✅ Full dark mode support

Happy coding! 🚀
