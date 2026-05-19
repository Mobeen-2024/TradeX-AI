# Startup Validation

## Environment Setup
Copy `.env.example` to `.env` and fill out the required variables:
- `DATABASE_URL`: Ensure you have a running PostgreSQL instance and provide the connection string.
- `JWT_SECRET`: Generate a secure random string for signing JSON Web Tokens.
- `GEMINI_API_KEY`: Required for executing AI Agent operations.

## Database
The project uses PostgreSQL with `pgvector` extension for semantic memory but standard local databases can be configured. Migrations reside in `src/db/migrations/` and must be applied sequentially to the database prior to starting the service.

## Running Locally
1. Run `npm install` to install dependencies.
2. Ensure postgres is running and accessible.
3. Validate your `.env` configuration.
4. Execute `npm run dev` to start the backend Node.js development server on port 3000.
5. Hit `/health/db` to verify the application has established a persistent connection to the database.
