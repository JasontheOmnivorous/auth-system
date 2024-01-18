import express from "express";
import {
  login,
  protect,
  restrictTo,
  signup,
} from "../controller/authController";
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controller/userController";
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.use(protect);
router.route("/").get(getAllUsers).post(restrictTo("admin"), createUser);
router
  .route("/:id")
  .get(getUser)
  .put(restrictTo("admin"), updateUser)
  .delete(restrictTo("admin"), deleteUser);

export default router;
