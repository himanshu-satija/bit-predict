# BitPredict

BitPredict is an interactive web application that allows users to predict Bitcoin price movements. Users can make guesses about whether the price will go up or down within a 60-second window, earning or losing points based on the accuracy of their predictions.

## Features

- User authentication (signup, login, logout)
- Real-time Bitcoin price updates
- Prediction gameplay with score tracking

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Authentication: JWT with HttpOnly cookies

## Prerequisites

- Node.js (v20 or later)
- npm or yarn
- PostgreSQL

## Local Development Setup

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/bitpredict.git
   cd bitpredict
   ```

2. Install dependencies:

   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the `server` directory with the following content:

   ```
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/bitpredict
   SECRET_KEY=your_jwt_secret_key
   CRYPTO_API_KEY=your_cryptocompare_api_key
   ```

4. Set up the database:

   - Create a PostgreSQL database named `bitpredict`
   - Run the following SQL command to create the `users` table:

   ```
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) NOT NULL UNIQUE,
       password_hash VARCHAR(255) NOT NULL,
       score INTEGER NOT NULL DEFAULT 0,
       last_guess VARCHAR(10),
       last_guess_time TIMESTAMPTZ,
       last_price NUMERIC
   );
   ```

5. Start the development servers:

   ```
   npm run dev
   ```

   This will start both the client (on port 5173) and the server (on port 3000) concurrently.

6. Open your browser and navigate to `http://localhost:5173` to view the application.

## Deployment

### Client Deployment

1. Build the client:

   ```
   cd client
   npm run build
   ```

2. Deploy the contents of the `client/dist` directory to your preferred static hosting service (e.g., Netlify, Vercel, or AWS S3).

3. Set the `VITE_BASE_URL` environment variable to your server's URL in your hosting platform's configuration.

### Server Deployment

1. Build the server:

   ```
   cd server
   yarn build
   ```

2. Deploy the contents of the `server/dist` directory to your preferred Node.js hosting platform (e.g., Heroku, DigitalOcean, or AWS EC2).

3. Set up the environment variables on your hosting platform, similar to the local `.env` file.

4. Ensure your PostgreSQL database is set up and accessible from your server.

5. Start the server (yarn start)

## Database Setup

1. Install PostgreSQL on your local machine or set up a cloud-hosted PostgreSQL instance.

2. Create a new database named `bitpredict`:

   ```
   createdb bitpredict
   ```

3. Connect to the database:

   ```
   psql -d bitpredict
   ```

4. Run the SQL command to create the `users` table:

   ```
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) NOT NULL UNIQUE,
       password_hash VARCHAR(255) NOT NULL,
       score INTEGER NOT NULL DEFAULT 0,
       last_guess VARCHAR(10),
       last_guess_time TIMESTAMPTZ,
       last_price NUMERIC
   );
   ```

5. Exit the PostgreSQL prompt:

   ```
   \q
   ```

6. Update the `DATABASE_URL` in your `.env` file with the correct credentials and connection details.

## License

This project is licensed under the MIT License.
