import { Pool } from "pg";

const pool = new Pool({
  host:     process.env.DB_HOST     || "aws-1-ap-south-1.pooler.supabase.com",
  database: process.env.DB_NAME     || "postgres",
  user:     process.env.DB_USER     || "postgres.ueujpsbaffzigqfglqhi",
  password: process.env.DB_PASS     || "Varshi@5126",
  port:     parseInt(process.env.DB_PORT || "5432"),
  ssl:      { rejectUnauthorized: false },
});

export default pool;
