# ConsultAI

ConsultAI is a web application for medical consultations, connecting patients with doctors.

## Features

- User authentication (login/register)
- Google Sign-In integration
- Role-based access control (Admin, Doctor, Patient)
- Doctor verification system
- Dashboard for each user role

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
   - Copy `backend/env.example` to `backend/.env`
   - Copy `frontend/env.example` to `frontend/.env`
   - Update the values as needed
   - For Google Sign-In, add your Google Client ID to both `.env` files

4. Seed the database with test users:

```bash
cd backend
npm run seed:admin      # Create admin user
npm run seed:test-users  # Create test users (doctor, patient, etc.)
```

5. Start the servers:

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server in a new terminal
cd frontend
npm run dev
```

6. Access the application at http://localhost:5173

## Test Accounts

The following test accounts are available for testing:

### Admin Account
- **Email:** admin@consultai.com
- **Password:** admin123

### Doctor Account (Verified)
- **Email:** doctor@consultai.com
- **Password:** doctor123

### Patient Account
- **Email:** patient@consultai.com
- **Password:** patient123

### Unverified Doctor Account
- **Email:** unverified@consultai.com
- **Password:** unverified123

## Project Structure

### Backend

- `controllers/` - Request handlers
- `middleware/` - Express middleware (auth, validation)
- `models/` - MongoDB schemas
- `routes/` - API routes
- `scripts/` - Database seed scripts
- `server.js` - Main application entry point

### Frontend

- `src/components/` - React components
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/App.jsx` - Main application component
- `src/main.jsx` - Application entry point

## License

MIT