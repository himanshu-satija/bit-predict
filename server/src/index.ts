import express, { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app: Express = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const CRYPTO_API_URL =
  "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=" +
  process.env.CRYPTO_API_KEY;

console.log(CLIENT_URL, "CLIENT_URL");

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "my_precious_little_secret";

// PostgreSQL Client Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

app.use(express.json());
app.use(cookieParser()); // Add cookie-parser middleware

// Register Route
app.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const client = await pool.connect();
    const existingUser = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      client.release();
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query(
      "INSERT INTO users (username, password_hash, score, last_guess, last_guess_time, last_price) VALUES ($1, $2, 0, NULL, NULL, NULL)",
      [username, hashedPassword]
    );
    client.release();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    client.release();

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Logout Route
app.post("/logout", (_req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    expires: new Date(0),
  });
  res.json({ message: "Logout successful" });
});

// Middleware to check authentication
const authenticateToken = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.body.username = (user as any).username;
    next();
  });
};

// Auth check route
app.get("/auth-check", authenticateToken, (req: Request, res: Response) => {
  res.json({ isAuthenticated: true, username: req.body.username });
});

// Fetch BTC price from the server
app.get(
  "/btc-price",
  authenticateToken,
  async (_req: Request, res: Response) => {
    try {
      const response = await fetch(CRYPTO_API_URL);
      const data = await response.json();
      const currentPrice = data.USD;

      res.json({ price: currentPrice });
    } catch (error) {
      console.error("Error fetching BTC price:", error);
      res.status(500).json({ message: "Error fetching BTC price" });
    }
  }
);

// Fetch user score and guess status
app.get("/score", authenticateToken, async (req: Request, res: Response) => {
  const { username } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query(
      "SELECT score, last_guess, last_guess_time, last_price FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length > 0) {
      const { score, last_guess, last_guess_time, last_price } = result.rows[0];

      // check if there is an unresolved guess and more than 60 seconds have passed
      // this might mean the server was restarted and the guess was never resolved
      // so we need to resolve it without changing the score
      if (last_guess && last_guess_time && last_price) {
        const currentTime = new Date();
        const timeSinceGuess =
          currentTime.getTime() - last_guess_time.getTime();
        if (timeSinceGuess > 60000) {
          // resolve the guess without changing the score
          await client.query(
            "UPDATE users SET last_guess = NULL, last_guess_time = NULL, last_price = NULL WHERE username = $1",
            [username]
          );
          client.release();
          return res.json({
            score,
            last_guess: null,
            last_guess_time: null,
            last_price: null,
          });
        }
      }

      client.release();

      res.json({ score, last_guess, last_guess_time, last_price });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching score:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user score based on guess
app.post("/guess", authenticateToken, async (req: Request, res: Response) => {
  const { guess } = req.body;
  const { username } = req.body;

  try {
    const client = await pool.connect();

    // Check if there's an unresolved guess
    const unresolvedGuess = await client.query(
      "SELECT last_guess, last_guess_time FROM users WHERE username = $1 AND last_guess IS NOT NULL",
      [username]
    );

    if (unresolvedGuess.rows.length > 0) {
      client.release();
      return res.status(400).json({
        message:
          "Previous guess is still unresolved. Please wait for it to be resolved before making a new guess.",
      });
    }

    // Fetch the current BTC price from the server
    const priceResponse = await fetch(CRYPTO_API_URL);
    const priceData = await priceResponse.json();
    const currentPrice = priceData.USD;

    // Store the new guess
    await client.query(
      "UPDATE users SET last_guess = $1, last_guess_time = NOW(), last_price = $2 WHERE username = $3",
      [guess, currentPrice, username]
    );

    // Schedule the resolution of the guess after 60 seconds
    setTimeout(async () => {
      const userResult = await client.query(
        "SELECT score, last_guess, last_guess_time, last_price FROM users WHERE username = $1",
        [username]
      );

      if (userResult.rows.length === 0) {
        client.release();
        console.error("User not found during score update");
        return;
      }

      const userRow = userResult.rows[0];
      const lastGuess = userRow.last_guess;
      const lastPrice = userRow.last_price;

      // Fetch the current BTC price again
      const newPriceResponse = await fetch(CRYPTO_API_URL);
      const newPriceData = await newPriceResponse.json();
      const newCurrentPrice = newPriceData.USD;

      // Resolve the guess and update the score
      let updatedScore = userRow.score;
      const wasCorrect =
        (lastGuess === "up" && Number(newCurrentPrice) > Number(lastPrice)) ||
        (lastGuess === "down" && Number(newCurrentPrice) < Number(lastPrice));

      if (wasCorrect) {
        updatedScore += 1;
      } else {
        updatedScore -= 1;
      }

      await client.query(
        "UPDATE users SET score = $1, last_guess = NULL, last_guess_time = NULL, last_price = NULL WHERE username = $2",
        [updatedScore, username]
      );

      console.log(
        `User ${username} guess resolved: ${
          wasCorrect ? "correct" : "incorrect"
        }. New score: ${updatedScore}`
      );

      client.release();
    }, 60000); // Delay the score update by 60 seconds

    res.json({
      message: "New guess recorded",
      guess: guess,
      price: currentPrice,
    });
  } catch (error) {
    console.error("Error handling guess:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
