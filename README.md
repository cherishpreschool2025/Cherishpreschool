# Cherish Pre School Website

A beautiful website for Cherish Pre School to showcase school activities and student work.

## Features

- 🎨 Colorful and child-friendly design
- 📚 Activity showcase with photos
- 📸 Photo gallery for each activity
- 🔐 Admin dashboard to manage activities
- 📱 Works on all devices (mobile, tablet, desktop)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase (for photo storage):
   - Create a free account at [supabase.com](https://supabase.com)
   - Create a storage bucket named `activity-photos`
   - Make it public
   - Add storage policies (INSERT, SELECT, UPDATE, DELETE)
   - Copy your project URL and anon key

3. Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=your_secure_password_here
```

**Important:** 
- Never commit the `.env` file to git (it's already in `.gitignore`)
- Change the default password to something secure
- Keep your `.env` file private

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and go to `http://localhost:5173`

## Admin Access

- Click the "Admin" button in the footer and login

**Important:** 
- Change the admin password in your `.env` file before deploying
- Use a strong, secure password
- Never share your `.env` file

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with all files ready to deploy.

## Deployment - Vercel

1. **Push code to GitHub** (if not already)
2. **Go to [vercel.com](https://vercel.com)** and sign up/login
3. **Import your GitHub repository**
4. **Add Environment Variables** in Vercel dashboard:
   - Go to: Settings → Environment Variables
   - Add all 4 variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_ADMIN_USERNAME`
     - `VITE_ADMIN_PASSWORD`
5. **Deploy** - Vercel will automatically deploy!

**Important:** Always add environment variables in your hosting platform's settings!

## Support

For questions or issues, contact the school administration.

---

Made with ❤️ for Cherish Pre School
