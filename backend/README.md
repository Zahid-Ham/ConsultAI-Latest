# ConsultAI Backend

A basic Express server with MongoDB connection, CORS support, and environment configuration.

## Features

- Express.js server
- CORS enabled
- MongoDB connection with Mongoose
- Environment variables with dotenv
- Health check endpoint
- Error handling middleware

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

3. Update the `.env` file with your MongoDB connection string:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/consultai
NODE_ENV=development
```

## Running the Server

### Development mode (with auto-restart):

```bash
npm run dev
```

### Production mode:

```bash
npm start
```

## API Endpoints

- `GET /` - Returns "API running" message
- `GET /health` - Health check endpoint

## Requirements

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
