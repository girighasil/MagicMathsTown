# Maths Magic Town - Educational Platform

An adaptive educational technology platform for "Maths Magic Town" coaching institute, delivering personalized and interactive learning experiences for competitive exam preparation through cutting-edge technological solutions.

## Features

- Comprehensive online courses for competitive exams
- Test series management with auto-grading
- Interactive video lessons 
- Student dashboard with progress tracking
- Doubt resolution sessions
- Admin panel for content management
- Responsive design for all devices

## Tech Stack

- Frontend: React with TypeScript, Tailwind CSS, shadcn/ui
- Backend: Express.js with TypeScript
- Database: PostgreSQL (with SQLite fallback)
- ORM: Drizzle
- Authentication: Passport.js with session-based auth
- API: RESTful endpoints

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm (v8+)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/maths-magic-town.git
   cd maths-magic-town
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   
   Edit the `.env` file with your database configuration. If you don't have a PostgreSQL database, you can leave it empty and the application will use SQLite as a fallback.

4. Start the development server
   ```
   npm run dev
   ```

5. Open [http://localhost:5000](http://localhost:5000) in your browser

### Default Admin Login

Username: `admin`  
Password: `admin123`

(You should change this password after first login)

## Database Configuration

The application can use either PostgreSQL or SQLite:

- If a `DATABASE_URL` environment variable is provided, the app will use PostgreSQL
- If no `DATABASE_URL` is provided, it will automatically fall back to SQLite (stored in `./data/maths-magic-town.db`)

## Folder Structure

- `/client` - Frontend React application
- `/server` - Backend Express.js API
- `/shared` - Shared types and schemas
- `/uploads` - User-uploaded files
- `/data` - SQLite database (when using SQLite fallback)

## License

This project is licensed under the MIT License - see the LICENSE file for details