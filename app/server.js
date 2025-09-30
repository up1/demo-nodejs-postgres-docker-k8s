const express = require("express");
const pkg = require("pg");
const { Pool } = pkg;

// Build connection config from env
function pgConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl: false };
  }
  return {
    host: process.env.PGHOST || "localhost",
    port: parseInt(process.env.PGPORT || "5432", 10),
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "postgres",
    database: process.env.PGDATABASE || "appdb",
    ssl: false,
  };
}

const pool = new Pool(pgConfig());

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS todos (
id SERIAL PRIMARY KEY,
title TEXT NOT NULL,
done BOOLEAN NOT NULL DEFAULT false,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`);
}

const app = express();
app.use(express.json());

app.get("/health", (req, res) => res.status(200).send("OK"));

app.get("/todos", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM todos ORDER BY id ASC");
  res.json(rows);
});

app.post("/todos", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  const { rows } = await pool.query(
    "INSERT INTO todos(title) VALUES($1) RETURNING *",
    [title]
  );
  res.status(201).json(rows[0]);
});

app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;
  const fields = [];
  const values = [];
  if (title !== undefined) {
    values.push(title);
    fields.push(`title = $${values.length}`);
  }
  if (done !== undefined) {
    values.push(done);
    fields.push(`done = $${values.length}`);
  }
  if (fields.length === 0) return res.status(400).json({ error: "no fields" });
  values.push(id);
  const { rows } = await pool.query(
    `UPDATE todos SET ${fields.join(", ")} WHERE id = $${
      values.length
    } RETURNING *`,
    values
  );
  if (!rows[0]) return res.status(404).json({ error: "not found" });
  res.json(rows[0]);
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query("DELETE FROM todos WHERE id = $1", [
    id,
  ]);
  if (rowCount === 0) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

const port = process.env.PORT || 3000;

(async () => {
  try {
    await pool.connect(); // checks connectivity
    await ensureSchema();
    app.listen(port, () => console.log(`API listening on :${port}`));
  } catch (err) {
    console.error("Startup failed", err);
    process.exit(1);
  }
})();

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
