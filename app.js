import env from "dotenv";
import express from "express";
import cors from "cors";
import postsRoutes from "./routes/postRoutes.js";
import usersRoutes from "./routes/userRoputes.js";
import cookieParser from "cookie-parser";

env.config();
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(cookieParser())

app.use("/posts", postsRoutes);
app.use("/users", usersRoutes);

app.use((err, req, res, next) => {
	if (err) {
		res.status(500).json({ message: err.message });
	}
});

app.listen(PORT, () => {
	console.log(`Server runs on http://localhost:${PORT}`);
});
