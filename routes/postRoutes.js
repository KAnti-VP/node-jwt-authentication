import { Router } from "express";
import * as Post from "../data/posts.js";
import * as User from "../data/users.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const router = Router();

router.get("/", (req, res) => {
	const posts = Post.getPosts();
	res.json(posts);
});

router.get("/author", authorizaton, (req, res) => {
	const userId = +req.user.id;
	console.log(`User: ${JSON.stringify(req.user)}`)
	const posts = Post.getPostByUser(userId);
	res.json(posts);
});

router.get("/:postId", authorizaton, (req, res) => {
	const post = Post.getPostById(+req.params.postId);
	if (!post) {
		res.status(404).json({ message: "Post not found" });
	}
	res.json(post);
});

router.post("/", authorizaton, (req, res) => {
	const { title, content } = req.body;
	if (!title || !content) {
		return res
			.status(400)
			.json({ message: "Title and content are required" });
	}
	const saved = Post.savePost(req.user.id, title, content);
	const post = Post.getPostById(saved.lastInsertRowid);
	res.status(201).json(post);
});

router.put("/:postId", (req, res) => {
	const postId = +req.params.postId;
	const { title, content } = req.body;
	const userId = req.user.id;
	if (!title || !content) {
		return res
			.status(400)
			.json({ message: "Title and content are required" });
	}
	Post.updatePost(postId, title, content);
	const post = Post.getPostById(postId);
	res.status(200).json(post);
});

router.delete("/:postId", (req, res) => {
	const post = Post.getPostById(+req.params.postId);
	if (!post) {
		return res.status(404).json({ message: "Post not found" });
	}
	Post.delete(+req.params.postId);
	res.json({ message: "Post delete success" });
});

router.post("/login", (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json("Invalid cerdentials");
	}
	const user = User.getUserByEmail(email);
	if (!user || !bcrypt.compareSync(password, user.password)) {
		return res.status(400).json("Invalid cerdentials");
	}
	delete user.password
	const token = jwt.sign(user, process.env.API_KEY, {expiresIn: "2m"})
	res.cookie("jwt", token, {httpOnly: true})
	res.json({message: "Login success"})
});

function authorizaton(req, res, next) {
	const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    // Token dekódolása (nem csak ellenőrzés, hanem olvasás is)
    const claims = jwt.verify(token, process.env.API_KEY);

    // Ellenőrizzük a token lejárati idejét
    const now = Math.floor(Date.now() / 1000); // másodpercben
    if (!claims.exp || claims.exp < now) {
      console.warn("Token expired at:", new Date(claims.exp * 1000));
      return res.status(401).json({ message: "Token expired" });
    }

    // Token érvényes → felhasználói adatok mentése
    req.user = {
      id: claims.id,
      name: claims.name,
      email: claims.email,
    };

    console.log("Token valid, expires at:", new Date(claims.exp * 1000).toLocaleString());
    next();

  } catch (err) {
    console.error("JWT verification failed:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Unauthorized" });
  }
}

export default router;
