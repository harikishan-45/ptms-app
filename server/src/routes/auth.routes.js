const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/auth.controller");

// ✅ FUNCTIONS MUST EXIST — NOW THEY DO
router.post("/register", register);
router.post("/login", login);

module.exports = router;
