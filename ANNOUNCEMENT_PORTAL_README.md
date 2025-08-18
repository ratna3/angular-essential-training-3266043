# Announcement Portal

A modern Angular 16+ MVP announcement website that allows users to view and interact with the latest announcements from administrators.

## Features

### User Features
- **Landing Page**: Users enter their name and email to access announcements
- **Announcement Page**: 
  - View the latest announcement from admin
  - Like announcements with heart button (one like per user)
  - Real-time viewer list showing names and emails
  - User authentication via name/email (no password required)

### Admin Features
- **Admin Login**: Secure login (username: `adminIndia`, password: `Indi@446`)
- **Admin Dashboard**: 
  - Create/update announcements
  - View statistics (total viewers, likes)
  - Monitor recent viewer activity

## Technical Features

- **Angular 16+** with modern features:
  - Standalone components
  - Signals for reactive state management
  - Lazy loading routes
  - TypeScript strict mode
- **Bootstrap 5** for clean, responsive UI
- **Local Storage** for data persistence (no backend required)
- **Client-side validation** for user inputs
- **Real-time updates** using Angular signals

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```
   or
   ```bash
   npx ng serve --port 4200
   ```

3. **Access the application:**
   - Open your browser to `http://localhost:4200`
   - The landing page will prompt for name and email
   - Admin access: `http://localhost:4200/admin`

## Application Routes

- `/` - Landing page (user entry)
- `/announcement` - Main announcement page
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard

## Demo Credentials

**Admin Login:**
- Username: `adminIndia`
- Password: `Indi@446`

## Project Structure

```
src/app/
├── interfaces/           # TypeScript interfaces
│   ├── user.ts
│   ├── announcement.ts
│   └── admin.ts
├── services/            # Angular services for state management
│   ├── user.service.ts
│   ├── announcement.service.ts
│   └── admin.service.ts
├── pages/               # Route components
│   ├── landing/
│   ├── announcement/
│   ├── admin-login/
│   └── admin-dashboard/
└── app-routing.module.ts # Application routing
```

## Development Notes

- All data is stored in localStorage (no backend required)
- Uses Angular 16+ signals for reactive state management
- Implements lazy loading for optimal performance
- Responsive design with Bootstrap 5
- Modern TypeScript with strict type checking

## Build

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

This is an MVP project. Future enhancements could include:
- Real backend integration
- User authentication with JWT
- Real-time websocket updates
- Announcement editing/deletion
- User profile management
- Push notifications
