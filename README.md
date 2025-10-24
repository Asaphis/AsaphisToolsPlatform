# AsaphisToolsPlatform

A comprehensive platform for free online tools and utilities.

## Project Structure

This is a monorepo containing three main applications:

### 📱 AsaphisTool (Frontend)
Located in `/AsaphisTool`

The main user-facing web application built with Next.js, featuring:
- Image compression and editing tools
- PDF manipulation tools
- Text processing utilities
- QR code generator
- Password generator
- And many more free online tools

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS

### 🔧 AsaphisToolBackend (Backend API)
Located in `/AsaphisToolBackend`

Backend API server providing:
- Tool management
- Analytics tracking
- Admin API endpoints
- Database integration

**Tech Stack:** Node.js, Express

### 🎛️ AsaphisToolAdminPanel (Admin Dashboard)
Located in `/AsaphisToolAdminPanel`

Admin dashboard for:
- Managing tools and categories
- Viewing analytics
- Content management
- User management

**Tech Stack:** React, TypeScript

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Asaphis/AsaphisToolsPlatform.git
cd AsaphisToolsPlatform
```

2. Install dependencies for each project:

**Frontend:**
```bash
cd AsaphisTool
npm install
npm run dev
```

**Backend:**
```bash
cd AsaphisToolBackend
npm install
npm start
```

**Admin Panel:**
```bash
cd AsaphisToolAdminPanel
npm install
npm start
```

## Environment Variables

Each project requires its own `.env` file. See the `.env.example` file in each directory.

## Contributing

This is a private repository. For questions or support, contact asaphis.org@gmail.com

## License

Private - All Rights Reserved
