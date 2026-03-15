import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-forum';

app.use(express.json());

const db = new Database('forum.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Authentication middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please log in again.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes

// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const info = stmt.run(username, hash);
    const userId = Number(info.lastInsertRowid);
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: userId, username } });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  const user = stmt.get(username) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, username: user.username } });
});

// Create Post
app.post('/api/posts', authenticate, (req: any, res: any) => {
  const { category, title, content } = req.body;
  if (!category || !title || !content) {
    return res.status(400).json({ error: 'Category, title, and content required' });
  }

  const stmt = db.prepare('INSERT INTO posts (user_id, category, title, content) VALUES (?, ?, ?, ?)');
  const info = stmt.run(req.user.id, category, title, content);
  
  const post = db.prepare('SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?').get(Number(info.lastInsertRowid));
  res.json(post);
});

// Get Posts
app.get('/api/posts', (req, res) => {
  const { username, category, title, sort_by_length, page = '1', limit = '10' } = req.query;
  
  let query = 'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE 1=1';
  const params: any[] = [];

  if (username) {
    query += ' AND users.username LIKE ?';
    params.push(`%${username}%`);
  }
  
  if (category) {
    query += ' AND posts.category = ?';
    params.push(category);
  }

  if (title) {
    query += ' AND posts.title LIKE ?';
    params.push(`%${title}%`);
  }

  if (sort_by_length === 'asc') {
    query += ' ORDER BY LENGTH(posts.content) ASC';
  } else if (sort_by_length === 'desc') {
    query += ' ORDER BY LENGTH(posts.content) DESC';
  } else {
    query += ' ORDER BY posts.created_at DESC';
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const countQuery = query.replace('SELECT posts.*, users.username', 'SELECT COUNT(*) as total');
  const totalResult = db.prepare(countQuery).get(...params) as { total: number };
  const total = totalResult.total;

  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  const posts = db.prepare(query).all(...params);

  res.json({
    posts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
