
Phase 1 – Project Structure and Environment Setup

Objective: Establish a solid foundation for Chatly, an AI-powered chat widget platform, by setting up a clear and scalable project structure and development environment. This phase ensures a strict separation between the backend and frontend for independent development and local testing, uses a local SQLite database (no cloud integration at this stage), and integrates the Wave SaaS Dashboard template as the base for the user dashboard (without subscription/payment features).

Step 1: Create the Project Folder Structure
   - At the root level, create two main directories:
       • "backend": Contains all server-side code, including API endpoints, data models, local database configuration, migrations, real-time communication (using Socket.io), and external integrations (such as web crawling with Cheerio).
       • "frontend": Contains the entire client-side application, including UI components, pages, styling, routing, and the customized Wave SaaS Dashboard template.
   - Organize the "backend" folder into subdirectories:
       • "models" – Define data models (User, Conversation, Message, KnowledgeBase, Widget) with a tenant identifier for multi-tenancy.
       • "controllers" – Implement business logic and handle incoming requests.
       • "routes" – Define API endpoint definitions.
       • "services" – Manage functionalities such as real-time messaging and web crawling.
       • "middlewares" – For authentication, validation, and enforcing tenant-based data isolation.
       • "config" – Store configuration files and environment variables.
   - Organize the "frontend" folder into subdirectories:
       • "components" – Reusable UI elements.
       • "pages" – Individual application screens (Dashboard, Conversations, Knowledge Base, Widget Setup, Settings, Authentication).
       • "assets" – Static files such as images and fonts.
       • "utilities" – Helper functions and configuration files.
       • "hooks" – Custom React hooks as needed.

Step 2: Environment Setup and Configuration
   - Initialize the backend project with Node.js and Express.js.
   - Initialize the frontend project with React (using Create React App or a similar framework).
   - Configure a local SQLite database for development and testing in the backend. Store the database connection string and other sensitive data (e.g., PORT, JWT_SECRET) in a .env file.
   - Set up necessary environment variables for both backend and frontend to facilitate local development.

Step 3: Integrate the Wave SaaS Dashboard Template
   - In the "frontend" folder, integrate the Wave SaaS Dashboard template from https://wave.devdojo.com/ as the foundation for the user dashboard.
   - Customize the template to match Chatly’s branding by modifying colors, logos, and layout. Adapt the navigation to include core pages: Dashboard, Conversations, Knowledge Base, Widget Setup, and Settings.
   - Ensure that the integrated template is fully responsive and ready for further customization to support Chatly-specific functionalities.

Step 4: Establish Multi-Tenancy Foundations
   - Design the database schema so that every model (User, Conversation, Message, KnowledgeBase, Widget) includes a tenant identifier to ensure data isolation for each user.
   - Document the multi-tenancy strategy in the project documentation, specifying how backend APIs and frontend data fetching will use the tenant identifier to isolate data.
   - Ensure that each API call and data operation is scoped to the authenticated user's tenant.

Step 5: Documentation and Development Guidelines
   - Create a comprehensive README or project guide that details:
       • The overall folder structure and the purpose of each directory.
       • Steps for setting up the development environment, including dependency installation and .env configuration.
       • Instructions on how to run the backend and frontend independently.
       • The approach to multi-tenancy and data isolation.
       • How the Wave SaaS Dashboard template is integrated and the planned customization.
   - Establish coding conventions and guidelines to ensure consistency across the project as development progresses.

This phase lays the groundwork for Chatly by creating a well-organized codebase, configuring a local development environment (using SQLite), and integrating a modern, customizable dashboard template (Wave SaaS Dashboard). Once this setup is complete and documented, we will proceed to Phase 2: Backend Development & API Implementation.

Phase 2 – Backend Development & API Implementation

Objective: Develop the backend server for Chatly to handle user authentication, conversation management, knowledge base operations, widget configuration, and real-time messaging. Use Node.js with Express, Prisma ORM with SQLite for local development, Socket.io for real-time functionality, and JWT for secure authentication. Exclude any subscription or payment-related features.

1. Environment Setup:
   - Initialize a Node.js project within the "backend" folder.
   - Install necessary dependencies: Express.js, Prisma, SQLite, Socket.io, JWT libraries, and Cheerio (for web crawling).
   - Create and configure a .env file with variables (e.g., PORT, DATABASE_URL, JWT_SECRET). Ensure DATABASE_URL points to a local SQLite database file.

2. Database Design & Multi-Tenancy:
   - Define the database schema using Prisma:
       • User: Contains email, hashed password, company/site name, and a unique tenant identifier.
       • Conversation: Stores conversation details (IDs, timestamps, etc.) along with the tenant identifier.
       • Message: Records message content, timestamps, and status indicators (Sent, Delivered, Seen) with the tenant identifier.
       • KnowledgeBase: Manages text entries and Q&A pairs, including the tenant identifier.
       • Widget: Holds widget configuration settings (colors, logo, welcome text, position) with the tenant identifier.
   - Generate Prisma migrations and validate the schema using the local SQLite database.

3. API Endpoint Implementation:
   - **Authentication Routes:**
       • POST /api/auth/register: Receives user registration data, creates a new user with a unique tenant, and returns a success response.
       • POST /api/auth/login: Validates credentials, issues a JWT token, and returns user details.
   - **Conversations & Messaging Routes:**
       • GET /api/conversations: Retrieves all conversations for the authenticated user, filtered by tenant.
       • GET /api/conversations/:id: Retrieves details and messages of a specific conversation.
       • POST /api/conversations/:id/messages: Appends new messages to an existing conversation (only messages can be added, no new conversation creation).
   - **Knowledge Base Routes:**
       • GET /api/knowledge-base: Lists all knowledge base entries (text entries and Q&A pairs) for the tenant.
       • POST /api/knowledge-base: Adds new entries.
       • PUT/DELETE /api/knowledge-base/:id: Updates or removes existing entries.
   - **Widget Configuration Routes:**
       • GET /api/widget: Retrieves the current widget settings for the user.
       • PUT /api/widget: Updates widget settings.
       • GET /api/widget/embed: Generates and returns a JavaScript embed code based on the saved widget configuration.
   - **User Settings Routes:**
       • GET /api/settings: Retrieves the user's profile and system configuration details.
       • PUT /api/settings: Allows updates to personal information and security settings.

4. Real-Time Messaging Integration:
   - Integrate Socket.io with Express to enable real-time messaging functionality.
   - Set up Socket.io events:
       • "message:new": Triggered when a new message is sent; broadcasts the message to the relevant clients.
       • "message:update": Updates message statuses (Sent, Delivered, Seen) and broadcasts changes.
   - Ensure that all real-time messaging respects tenant isolation so that messages are only delivered to users within the same tenant.

5. Security & Testing:
   - Implement JWT-based authentication middleware to secure all protected routes.
   - Ensure each API endpoint verifies the tenant identifier to enforce data isolation.
   - Write unit and integration tests for critical API endpoints and Socket.io events using tools like Postman.
   - Test the complete backend functionality locally with the SQLite database to confirm that all features work as intended.

6. Documentation:
   - Update backend documentation with clear descriptions of each API endpoint, expected request/response formats, and details of the multi-tenancy strategy.
   - Provide instructions for setting up and running the backend locally, including environment variable configuration and migration commands.
   - Include troubleshooting tips and guidelines for testing the real-time messaging features.

Phase 3 – Frontend Development & UI/UX Implementation

Objective: Build a responsive, user-friendly frontend using React that seamlessly integrates with the backend APIs and supports real-time messaging via Socket.io. The UI will use the pre-built Wave SaaS Dashboard template as the foundation, which we will customize to meet Chatly’s branding and functional requirements. (Note: No subscription/payment features at this stage; all data is isolated per user and stored in a local database.)

Steps:

1. Initial Setup in the "frontend" Folder:
   - Initialize a new React project (using Create React App or a similar tool).
   - Install required libraries: React Router v6 for navigation, Chakra UI and Tailwind CSS for styling, and Lucide React for icons.
   - Integrate the Wave SaaS Dashboard template (from https://wave.devdojo.com/) as the base layout for the user dashboard.
   - Configure environment variables (e.g., API base URL) to connect with the local backend.

2. Develop Core Pages:
   - **Authentication Pages (Sign-Up and Login):**
     • **Sign-Up (/register):**
       - Create a registration form with fields for email, password, and company/site name.
       - On submission, send data to the backend’s registration API.
       - On success, redirect to the login page.
     • **Login (/login):**
       - Create a login form with fields for email and password.
       - Authenticate the user via the backend’s login API, receive a JWT token, and store it securely.
       - Redirect the user to the Dashboard upon successful authentication.
     
   - **Dashboard (/dashboard):**
     • Customize the integrated Wave SaaS Dashboard template to display key metrics such as active conversations, recent messages, etc.
     • Include navigation links to all core pages: Conversations, Knowledge Base, Widget Setup, and Settings.
     • Ensure data displayed is unique to the logged-in user, using the tenant identifier from the backend.
     
   - **Conversations Page (/conversations/all, /conversations/:id):**
     • Develop a WhatsApp-inspired interface displaying a list of all existing conversations retrieved from the backend.
     • Each conversation should show message bubbles with timestamps and status indicators (Sent, Delivered, Seen).
     • Allow manual replies to messages; automated bot responses are handled by the backend.
     • Ensure that users can only view conversations from their own isolated workspace.
     
   - **Knowledge Base Page (/knowledge-base):**
     • Create sections for managing content:
       - **Text Entries:** For adding/editing FAQs or articles.
       - **Q&A Pairs:** For defining common questions with their answers.
       - Optionally, include a section for website crawling data if activated.
     • Allow users to add, edit, or delete entries that the AI will use for automated responses.
     • Ensure all entries are stored per user (isolated by tenant).
     
   - **Widget Setup Page (/setup/basic):**
     • Divide the page into two tabs:
       - **Customization Tab:** Provide form inputs for customizing widget appearance (colors, logo, welcome text, position) along with a live preview that updates in real time.
       - **Install Tab:** Display the generated JavaScript embed code based on the current customization settings.
     • Ensure that widget settings are uniquely saved per user and that the embed code reflects the live preview.
     
   - **Settings Page (/settings):**
     • Develop a settings interface for updating user profile information (name, email, password) and security options.
     • Optionally, allow configuration of advanced AI parameters.
     • Ensure that changes are updated via corresponding backend APIs and are isolated per user.

3. API Integration & Real-Time Messaging:
   - Use Axios or Fetch to connect the frontend to the backend API endpoints for all CRUD operations.
   - Implement the Socket.io client to subscribe to real-time events (e.g., new messages, status updates) and dynamically update the Conversations page.
   - Ensure every API call includes the JWT token and tenant identifier to enforce data isolation.

4. UI/UX and Responsiveness:
   - Emulate a WhatsApp-style chat interface for the Conversations page for familiarity.
   - Ensure a responsive design that adapts seamlessly to desktop, tablet, and mobile screens.
   - Customize the Wave SaaS Dashboard template using Chakra UI and Tailwind CSS to align with Chatly’s branding.
   - Incorporate interactive elements (toast notifications, modals, loaders) for a smooth user experience.
   - Test the live preview on the Widget Setup page to verify immediate visual feedback.

5. Final Testing and Refinement:
   - Conduct unit tests for individual components and pages.
   - Perform integration tests to ensure proper communication between frontend and backend.
   - Validate that multi-tenancy is enforced—each user should only see their own data.
   - Verify that real-time messaging updates (via Socket.io) are functioning correctly.
   - Document any issues and refine the UI/UX based on test feedback.

This phase will deliver a polished, fully functional frontend that offers a seamless user experience, modern UI design based on the Wave SaaS Dashboard template, and smooth integration with the backend for data operations and real-time communication.


Phase 4 – Integration, Testing, and Local Launch

Objective: Complete the final phase by integrating the backend and frontend, thoroughly testing the complete system, and setting up a local launch environment. This phase focuses on ensuring that the entire Chatly platform works seamlessly together on a local machine, with deployment to the cloud planned for later stages.

1. Integration:
   - Connect the frontend with the backend APIs using Axios or Fetch, ensuring every request includes the proper JWT token and tenant identifier.
   - Integrate the Socket.io client in the frontend to subscribe to real-time events (e.g., new messages, status updates such as Sent, Delivered, and Seen).
   - Verify that all user actions on the frontend (authentication, widget customization, viewing conversations, etc.) trigger the corresponding backend responses.
   - Ensure that multi-tenancy is enforced so that each user sees only their own isolated data.

2. Comprehensive Testing:
   - Perform unit tests on individual backend endpoints and frontend components.
   - Execute integration tests to verify smooth communication between the frontend and backend.
   - Conduct end-to-end testing simulating complete user flows (from registration and login to widget setup and real-time chat interactions).
   - Use tools like Postman to test API endpoints and Socket.io client simulators to verify real-time messaging.
   - Document and fix any issues encountered during testing to ensure a stable, bug-free environment.

3. Local Launch Setup:
   - Configure the system to run entirely in a local development environment:
       • The backend will operate on a local server (using SQLite for the database).
       • The frontend will run locally, connecting to the backend via the specified API base URL (e.g., http://localhost:PORT).
   - Create detailed local deployment instructions in the project documentation, including:
       • Commands to start the backend server and the frontend application.
       • Guidelines for setting up environment variables locally.
       • Steps to verify that all functionalities (authentication, conversation display, widget customization, etc.) are operating correctly.
   - Ensure that all integration points (API calls, real-time messaging) are fully functional and that the user experience matches the intended design.

4. Maintenance and Future Planning:
   - Prepare documentation for ongoing local testing and debugging procedures.
   - Outline a plan for future cloud deployment and scaling once local testing is complete and the system is fully validated.
   - Set up local logging and error tracking mechanisms to facilitate troubleshooting during this testing phase.

This phase will result in a completely integrated and tested Chatly platform running locally, allowing for full verification of all features without cloud deployment at this stage. The system will be ready for further refinement and eventual cloud launch once all functionalities are confirmed stable.

