# Chatly - AI-Powered Chat Widget Platform

Chatly is a SaaS platform that provides an AI-powered chat widget solution for websites. It allows users to add a customizable chat widget to their website, manage conversations, and build a knowledge base to improve AI responses.

## Project Structure

The project is organized into two main directories:

- **backend**: Contains the server-side code built with Node.js, Express, Prisma ORM, and Socket.io
- **frontend**: Contains the client-side application built with React, Chakra UI, and Tailwind CSS

## Features

- **User Authentication**: Secure registration and login system
- **Multi-tenancy**: Each user gets a unique tenant ID to isolate their data
- **Real-time Messaging**: Socket.io integration for real-time chat functionality
- **Knowledge Base Management**: Add text entries and Q&A pairs to improve AI responses
- **Website Crawling**: Import content directly from webpages into the knowledge base
- **AI-Powered Responses**: Integration with AI models for intelligent chat responses
- **Widget Customization**: Customize the appearance and behavior of the chat widget
- **AI Settings Control**: Configure AI model parameters and fallback responses
- **Embed Code Generation**: Generate JavaScript code to embed the widget on websites

## Technology Stack

### Backend
- Node.js with Express
- Prisma ORM with SQLite (for local development)
- Socket.io for real-time messaging
- JWT for authentication
- Bcrypt for password hashing
- Axios and Cheerio for website crawling
- Optional OpenAI integration for AI responses

### Frontend
- React (Create React App)
- Chakra UI and Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Socket.io client for real-time communication
- Lucide React for icons

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

### Configuration

1. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=8000
   JWT_SECRET="chatly_secure_jwt_secret_key"
   DATABASE_URL="file:./dev.db"
   NODE_ENV=development
   # Optional: Add your OpenAI API key to enable AI responses
   # OPENAI_API_KEY=your_openai_api_key_here
   ```

2. Initialize the database:
   ```
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd frontend
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Multi-tenancy

Multi-tenancy is a core design principle in this application. Each user gets a unique tenant ID upon registration, which is used to isolate their data. This includes:

- Conversations
- Messages
- Knowledge base entries
- Widget configurations
- AI settings

All API endpoints enforce tenant isolation to ensure data security.

## AI Integration

The application includes optional AI model integration:

1. **Knowledge Base**: Stores information that the AI can use to provide informed responses
2. **Website Crawling**: Allows importing content from existing websites into the knowledge base
3. **AI Settings**: Configure model parameters like temperature and max tokens
4. **Default Fallbacks**: Set up multiple fallback responses when AI can't find an answer

## License

This project is licensed under the MIT License - see the LICENSE file for details. 