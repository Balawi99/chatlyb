# Chatly Backend

This is the backend for the Chatly platform, an AI-powered chat widget solution built with Node.js, Express, Prisma ORM, and Socket.io for real-time messaging.

## Architecture

The backend follows a modular architecture with clear separation of concerns:

- **Models**: Defined using Prisma ORM with SQLite for local development
- **Controllers**: Implemented through route handlers 
- **Routes**: API endpoints for user authentication, conversations, knowledge base, widget, and settings
- **Middlewares**: Authentication and validation
- **Services**: Socket.io for real-time messaging

## Multi-tenancy

Multi-tenancy is a core design principle in this application. Each user gets a unique tenant ID upon registration, which is used to isolate their data. This includes:

- Conversations
- Messages
- Knowledge base entries
- Widget configurations

All API endpoints enforce tenant isolation to ensure data security.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   PORT=8000
   JWT_SECRET=chatly_secure_jwt_secret_key
   DATABASE_URL="file:./dev.db"
   NODE_ENV=development
   ```
5. Initialize the database: `npx prisma migrate dev --name init`
6. Generate Prisma client: `npx prisma generate`

### Running the Server

- Development mode: `npm run dev` (uses nodemon for auto-restart)
- Production mode: `npm start`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user

### Conversations

- `GET /api/conversations` - Get all conversations for the authenticated user
- `GET /api/conversations/:id` - Get a specific conversation with messages
- `POST /api/conversations/:id/messages` - Add a new message to a conversation
- `PATCH /api/conversations/messages/:id/status` - Update message status

### Knowledge Base

- `GET /api/knowledge-base` - Get all knowledge base entries
- `POST /api/knowledge-base` - Add a new knowledge base entry
- `PUT /api/knowledge-base/:id` - Update a knowledge base entry
- `DELETE /api/knowledge-base/:id` - Delete a knowledge base entry

### Widget

- `GET /api/widget` - Get widget configuration
- `PUT /api/widget` - Update widget configuration
- `GET /api/widget/embed` - Get widget embed code
- `GET /api/widget/public/:tenantId` - Public endpoint to get widget configuration by tenant ID

### Settings

- `GET /api/settings` - Get user profile settings
- `PUT /api/settings` - Update user profile settings

## Real-time Messaging

Socket.io is used for real-time messaging, with the following events:

- `join-tenant` - Join a tenant room for isolated messaging
- `message:new` - Send a new message
- `message:update` - Update message status 