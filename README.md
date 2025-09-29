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

# ConsultAI

ConsultAI is a full-stack web application for modern medical consultations, connecting patients and doctors with real-time chat, AI support, and premium document management features.

## ✨ Key Features
- Patient and doctor registration/login (with Google Sign-In)
- Real-time chat between patients and doctors
- AI chatbot for instant medical queries
- Doctor filtering by name and specialization
- Chat history and sidebar navigation
- Admin dashboard for user management
- Secure authentication and role-based authorization
- **Medical Report Upload:**
   - Drag & drop and multi-file upload
   - Premium grid/list views for documents
   - Batch select, select all, and batch delete
   - Sorting, filtering, and search
   - Storage usage bar (coming soon)
   - Dark/light mode and creative UI animations

## 🗂️ Project Structure
```
ConsultAI-main/
├── backend/         # Node.js/Express API & Socket server
├── frontend/        # React + Vite client app
└── README.md        # Project documentation
```

## 🚀 Quick Start

### 1. Clone the Repository
```sh
git clone https://github.com/<your-username>/ConsultAI-main.git
cd ConsultAI-main
```

### 2. Install All Dependencies (One Command)
```sh
cd backend && npm install && cd ../frontend && npm install
```

### 3. Configure Environment Variables

#### Backend
- Copy `env.example` to `.env`:
   ```sh
   cd backend
   cp env.example .env
   ```
- Edit `.env` and set:
   - `MONGODB_URI` (your MongoDB connection string)
   - `JWT_SECRET` (any strong secret)
   - Cloudinary keys for document upload

#### Frontend
- Copy `env.example` to `.env`:
   ```sh
   cd ../frontend
   cp env.example .env
   ```
- Edit `.env` and set:
   - `VITE_API_URL=http://localhost:5000` (or your backend URL)

### 4. Seed the Database (Optional)
```sh
cd ../backend
npm run seed:admin      # Create admin user
npm run seed:test-users # Create test users (doctor, patient, etc.)
```

### 5. Start the Servers
```sh
# Start backend
cd backend
npm run dev
# Start frontend (in a new terminal)
cd ../frontend
npm run dev
```

### 6. Access the App
- Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📝 Usage Guide
- Register as a patient or doctor (or use test accounts below)
- Patients: search/filter doctors, upload/view/delete medical reports, start chat consultations
- Doctors: view/respond to patient messages, manage reports
- Use the AI chatbot for instant medical queries
- Admins: manage users, verify doctors, view chat histories

## 👤 Test Accounts
| Role      | Email                   | Password      |
|-----------|------------------------|---------------|
| Admin     | admin@consultai.com    | admin123      |
| Doctor    | doctor@consultai.com   | doctor123     |
| Patient   | patient@consultai.com  | patient123    |
| Unverified| unverified@consultai.com| unverified123 |

## 🔑 .env Setup

### Backend `.env` example:
```
MONGODB_URI=mongodb://localhost:27017/consultai
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env` example:
```
VITE_API_URL=http://localhost:5000
```

## 🛠️ Key Packages
### Backend
- express, mongoose, jsonwebtoken, bcryptjs, socket.io, multer, cloudinary
### Frontend
- react, react-router-dom, axios, socket.io-client, vite

## 💡 Troubleshooting
- Ensure MongoDB is running and accessible
- Check `.env` files for correct configuration
- If ports are busy, change them in `.env` or config files
- For missing packages, run `npm install` in the respective folder

## 🤝 Contributing
Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.

## 📄 License
MIT

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