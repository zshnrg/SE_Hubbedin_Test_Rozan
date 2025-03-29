import { Router } from "express";

// Importing routes
import userRoute from "./routes/users.route.js";

const router = Router();

// All routes
router.use("/users", userRoute);

export default router;