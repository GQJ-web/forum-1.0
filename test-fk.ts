import Database from 'better-sqlite3';

const db = new Database(':memory:');
db.exec(`
  CREATE TABLE users (id INTEGER PRIMARY KEY);
  CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, FOREIGN KEY (user_id) REFERENCES users(id));
`);

try {
  db.prepare('INSERT INTO posts (user_id) VALUES (1)').run();
  console.log('Inserted successfully (foreign keys disabled)');
} catch (err) {
  console.error('Error:', err);
}
