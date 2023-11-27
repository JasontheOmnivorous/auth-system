import express from "express";
import { login, signup } from "../controller/authController";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controller/userController";
import { protect } from "../utils/authGuard";
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.use(protect);
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

export default router;
