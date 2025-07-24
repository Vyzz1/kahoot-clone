# Kahoot Clone

## Prerequisites

Before running this project, make sure you have the following installed:

### Required Software

- **Node.js**: v18.0.0 or higher (recommended: v20.x)
- **npm**: v9.0.0 or higher
- **TypeScript**: v5.8.3 (specified in package.json)
- **MongoDB**: v6.0 or higher

### Development Tools (Recommended)

- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier

## Environment Setup

### 1. Node.js Version Management

We recommend using a Node.js version manager:

- **Windows**: Use `nvm-windows` or `fnm`
- **macOS/Linux**: Use `nvm` or `fnm`

### 2. Database Setup

- Install MongoDB locally or use MongoDB Atlas
- Default connection: `mongodb://localhost:27017`

### 3. Redis (for sessions)

- Install Redis locally or use a cloud service
- Default connection: `localhost:6379`

## Quick Start

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install frontend dependencies
   cd frontend
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables (see Environment Variables section)
4. Start development servers:

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Environment Variables

Create `.env` files in both `frontend` and `server` directories. See `.env.example` files for required variables.

## Project Structure

- `frontend/` - React + TypeScript + Vite frontend
- `server/` - Node.js + Express + TypeScript backend
- `reports/` - Documentation and reports

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Backend

- `npm run start:dev` - Start development server with nodemon
- `npm run start:stag` - Start staging server with nodemon
- `npm run start:prod` - Start production server with nodemon

