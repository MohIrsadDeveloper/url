const express = require('express');
const router = express.Router()

const registerController  = require('../Controllers/authController');


router.post("/register", registerController.register);
router.post("/login", registerController.login);
router.delete("/delete", registerController.deleteUsers);
router.get("/userinfo", registerController.userInfo);


module.exports = router;