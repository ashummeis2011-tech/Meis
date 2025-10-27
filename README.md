# Meis - Friend-Finding App

A swipe-based friend-finding application where users (ages 13-20) can create profiles and discover potential friends through an intuitive left/right swipe interface.

## Features

- **User Registration & Authentication**: JWT-based authentication with secure password hashing
- **Age-Restricted Access**: Only users aged 13-20 can join
- **Profile Creation**: Users create profiles with photos, bio, and interests
- **Swipe Interface**: Tinder-style swiping (left = reject, right = love)
- **Matching System**: Mutual right swipes create matches
- **Real-Time Chat**: Socket.io-powered messaging with text, images, and emojis
- **Account Management**: Edit profile, change email/password, deactivate or delete account
- **Photo Uploads**: Profile and message image uploads with validation

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- Socket.io
- Multer for file uploads

### Frontend
- React 18 + Vite
- React Router v6
- Axios
- Socket.io-client
- Context API for state management

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### 1. Database Setup
```bash
createdb meis_db
cd backend
psql -d meis_db -f src/migrations/init.sql
psql -d meis_db -f src/seeds/interest_tags.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Access
Open `http://localhost:5173` in your browser

## Usage

1. **Register**: Create account with email/password
2. **Setup Profile**: Add photo, name, age, bio, interests
3. **Swipe**: Browse users, swipe left (reject) or right (love)
4. **Match**: When both users swipe right, create a match
5. **Chat**: Send real-time messages to your matches
6. **Settings**: Edit profile, change credentials, manage account

## Project Structure

```
Meis/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Auth, validation, uploads
│   │   ├── socket/       # WebSocket handlers
│   │   ├── migrations/   # Database schema
│   │   └── server.js     # Entry point
│   └── uploads/          # User-uploaded files
│
└── frontend/              # React + Vite app
    ├── src/
    │   ├── pages/        # Main pages
    │   ├── components/   # Reusable components
    │   ├── context/      # Auth & Socket contexts
    │   ├── services/     # API calls
    │   └── App.jsx       # Routes & navigation
    └── public/

```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `POST /api/users/profile/setup` - Complete profile
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/email` - Change email
- `PUT /api/users/password` - Change password
- `DELETE /api/users/account` - Delete account

### Swipe
- `GET /api/swipe/next` - Get next user
- `POST /api/swipe` - Record swipe
- `GET /api/swipe/stats` - Get user count

### Matches & Chat
- `GET /api/matches` - Get all matches
- `GET /api/messages/:matchId` - Get messages
- `POST /api/messages` - Send message
- `POST /api/messages/image` - Send image

## Development

### Reset Database
```bash
psql -d meis_db
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q
psql -d meis_db -f backend/src/migrations/init.sql
psql -d meis_db -f backend/src/seeds/interest_tags.sql
```

### View Data
```bash
psql -d meis_db
SELECT * FROM users;
SELECT * FROM matches;
SELECT * FROM messages;
```

## Security

- JWT authentication (7-day expiration)
- Bcrypt password hashing (10 salt rounds)
- Protected routes
- File upload validation (type, size limits)
- Parameterized SQL queries
- CORS configuration
- Input validation

## License

Educational project
