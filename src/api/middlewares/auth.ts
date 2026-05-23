import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getPool } from "../../db/connection";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const isProduction = process.env.NODE_ENV === "production";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    if (isProduction && process.env.DATABASE_URL) {
      res.status(401).json({ error: "Access denied. No authentication token provided." });
      return;
    }

    // Permissive auth for dev or mock DB: auto-create a user if none exists
    if (!process.env.DATABASE_URL) {
      req.user = { userId: "dev-mock-user-id" };
      next();
      return;
    }

    try {
      const pool = getPool();
      const email = "system_op@tradex.inc";
      let userId: string;

      const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (userRes.rows.length === 0) {
        userId = uuidv4();
        const hash = await bcrypt.hash("tradex2026!#", 10);
        await pool.query("INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)", [userId, email, hash]);
      } else {
        userId = userRes.rows[0].id;
      }

      req.user = { userId };
      next();
      return;
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed autoprovisioning user" });
      return;
    }
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
}
