import db from "./database.js";

db.pragma("foreign_keys = ON");
db.prepare(
	`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    content TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`
).run();

export const getPosts = () => db.prepare("SELECT * FROM posts").all();

export const getPostById = (id) =>
	db.prepare("SELECT * FROM posts WHERE id = ?").get(id);

export const getPostByUser = (userId) =>
	db.prepare("SELECT * FROM posts WHERE userId = ?").all(userId);

export const savePost = (userId, title, content) =>
	db
		.prepare("INSERT INTO posts (userId, title, content) VALUES (?, ?, ?)")
		.run(userId, title, content);

export const updatePost = (id, title, content) =>
	db
		.prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
		.run(title, content, id);

export const deletePost = (id) =>
	db.prepare("DELETE FROM posts id = ?").run(id);


// savePost(1, "Ann's first post", "First content")
// savePost(1, "Ann's second post", "Second content")
// savePost(2, "Bob's first post", "First content")
// savePost(2, "Bob's second post", "Second content")
// savePost(3, "Cloe's first post", "First content")
// savePost(4, "Dan's first post", "First content")
// savePost(5, "Ed's first post", "First content")