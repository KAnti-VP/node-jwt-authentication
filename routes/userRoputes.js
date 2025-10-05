import { Router } from "express";
import * as User from "../data/users.js";
import bcrypt from "bcrypt"

const router = Router();

router.get("/", (req, res) => {
	let users = User.getUsers();
  users = users.map(user => {return {id: user.id, name: user.name, email: user.email}})
	res.json(users);
});

router.get("/:id", (req, res) => {
	const user = User.getUserById(+req.params.id);
	if (!user) {
		res.status(404).json({ message: "User not found" });
	}
	const {password: _, ...data} = user
	res.json(data);
});

router.get("/:email", (req, res) => {
	const user = User.getUserByEmail(req.params.email);
	if (!user) {
		res.status(404).json({ message: "User not found" });
	}
  const {password: _, ...data} = user
	res.json(data);
});

router.post("/", (req, res) => {
	const { name, email, password } = req.body;
  if (!name || ! email || !password) {
    return res.sendStatus(400).json({message: "Invalid data"})
  }
  const salt = bcrypt.genSaltSync(12)
  const hashedPassword = bcrypt.hashSync(password, salt)
  const saved = User.saveUser(name, email, hashedPassword)
  const user = User.getUserById(saved.lastInsertRowid);
  const {password: _, ...data} = user
  res.status(201).json(data)
});

router.put("/:id", (req, res) => {
	const id = +req.params.id
	const { name, email, password } = req.body;
	if (!name || !email || !password) {
    return res.sendStatus(400).json({message: "Invalid data"})
  }
	let user = User.getUserById(id)
	if (!user) {
		return res.status(404).json({message: "User not found"})
	}
	const salt = bcrypt.genSaltSync(12)
  const hashedPassword = bcrypt.hashSync(password, salt)
	User.updateUser(id, name, email, hashedPassword)
	user = User.getUserById(id)
	const {password: _, ...data} = user
	res.status(200).json(data)
})

router.delete("/:id", (req, res) => {
	const user = User.getUserById(+req.params.id)
	if (!user) {
		return res.status(404).json({message: "User not found"})
	}
	User.deleteUser(+req.params.id)
	res.status(200).json({message: "Delete success"})
})

export default router;
