# ConsultAI

ConsultAI is a full-stack web application designed to connect patients with verified doctors for real-time chat consultations. The platform features secure authentication, chat history, AI chatbot support, and a modern, user-friendly interface for both patients and doctors.

## Features

- Patient and doctor registration/login
- Real-time chat between patients and doctors
- AI chatbot for instant medical queries
- Doctor filtering by name and specialization
- Chat history and sidebar navigation
- Admin dashboard for user management
- Secure authentication and authorization
- Modern UI built with React and Vite
- Backend powered by Node.js, Express, and MongoDB

## Project Structure

```
ConsultAI-main/
├── backend/         # Node.js/Express API & Socket server
├── frontend/        # React + Vite client app
└── README.md        # Project documentation
```

## Prerequisites

- Node.js (v16 or above recommended)
- npm (comes with Node.js)
- MongoDB (local or cloud instance)

## Setup Instructions

### 1. Clone the Repository

```sh
git clone https://github.com/<your-username>/ConsultAI-main.git
cd ConsultAI-main
```

### 2. Backend Setup

```sh
cd backend
npm install
```

#### Configure Environment Variables

- Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret:

```sh
cp env.example .env
```

- Edit `.env` with your values.

#### Start Backend Server

```sh
npm start
```

- The backend will run on `http://localhost:5000` by default.

### 3. Frontend Setup

```sh
cd ../frontend
npm install
```

#### Configure Environment Variables

- Copy `.env.example` to `.env` and set the backend API URL:

```sh
cp env.example .env
```

- Edit `.env` with your values (e.g., `VITE_API_URL=http://localhost:5000`).

#### Start Frontend (React + Vite)

```sh
npm run dev
```

- The frontend will run on `http://localhost:5173` by default.

## Usage Guide

- Register as a patient or doctor.
- Patients can search/filter doctors and start chat consultations.
- Doctors can view and respond to patient messages.
- Use the AI chatbot for instant medical queries.
- Admins can manage users and view chat histories.

## Key Packages

### Backend

- express
- mongoose
- jsonwebtoken
- bcryptjs
- socket.io

### Frontend

- react
- react-router-dom
- axios
- socket.io-client
- vite

## Troubleshooting

- Ensure MongoDB is running and accessible.
- Check `.env` files for correct configuration.
- If ports are busy, change them in the `.env` or config files.
- For any missing packages, run `npm install` in the respective folder.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.

---

**ConsultAI** empowers patients and doctors to connect, chat, and consult securely and efficiently. For questions or support, open an issue on GitHub.

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
