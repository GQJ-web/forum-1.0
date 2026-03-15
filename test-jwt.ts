import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';

const db = new Database(':memory:');
db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT);
`);

const info = db.prepare('INSERT INTO users (username) VALUES (?)').run('test');
console.log('lastInsertRowid type:', typeof info.lastInsertRowid);

try {
  const token = jwt.sign({ id: info.lastInsertRowid, username: 'test' }, 'secret');
  console.log('Token:', token);
} catch (err) {
  console.error('JWT Error:', err);
}
