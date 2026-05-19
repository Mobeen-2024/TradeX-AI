import { getPool } from "../connection";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  risk_tolerance_profile: any;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as User;
  }

  static async create(email: string, passwordHash: string): Promise<User> {
    const pool = getPool();
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
      [email, passwordHash]
    );
    return result.rows[0] as User;
  }

  static async findById(id: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as User;
  }
}
