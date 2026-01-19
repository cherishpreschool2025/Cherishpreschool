# Cherish Pre School Dashboard

A beautiful, colorful dashboard and catalogue for Cherish Pre School to showcase school work and activities.

## Features

- 🎨 **Colorful & Attractive UI** - Modern, child-friendly design with vibrant colors
- 📚 **Activity Showcase** - Display various school activities with beautiful cards
- 🖼️ **Work Gallery** - Grid layout to showcase student work
- 📊 **Statistics Section** - Key metrics and achievements
- 🎯 **Category Filtering** - Filter activities by category
- 📱 **Responsive Design** - Works on all devices
- 🔐 **Admin Login** - Secure admin access to manage activities
- 📸 **Image Upload** - Upload and display photos of student activities
- ✏️ **Activity Management** - Add, edit, and delete activities with photos
- 💾 **Data Persistence** - Activities saved in browser localStorage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
cherish-pre-school/
├── src/
│   ├── components/
│   │   ├── ActivityCard.jsx    # Individual activity card component
│   │   ├── WorkGallery.jsx     # School work gallery component
│   │   ├── Header.jsx          # Header component
│   │   └── StatsSection.jsx    # Statistics section component
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Admin Access

To access the admin dashboard:

1. Click the **"Admin"** button in the header (top right)
2. Login with the default credentials:
   - **Username:** `admin`
   - **Password:** `cherish2025`

### Admin Features

- **Upload Photos** - Add photos of student activities (up to 5MB per image)
- **Add Activities** - Create new activity entries with title, description, category, and date
- **Edit Activities** - Modify existing activities and update photos
- **Delete Activities** - Remove activities from the dashboard
- **View All Activities** - See all activities in a management interface

> **Note:** For production use, change the default admin credentials in `src/components/AdminLogin.jsx`

## Customization

### Colors

You can customize the color scheme in `tailwind.config.js`. The current colors are:

- Cherish Blue
- Cherish Pink
- Cherish Yellow
- Cherish Green
- Cherish Purple
- Cherish Orange

### Activities

Activities are now managed through the admin dashboard. You can also edit the `defaultActivities` array in `src/App.jsx` for initial setup.

### School Work

Edit the `schoolWork` array in `src/App.jsx` to add or modify school work items.

### Admin Credentials

To change the admin login credentials, edit the `ADMIN_USERNAME` and `ADMIN_PASSWORD` constants in `src/components/AdminLogin.jsx`.

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Modern CSS Gradients

## License

© 2025 Cherish Pre School
