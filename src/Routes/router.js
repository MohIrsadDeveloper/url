const express = require('express');
const router = express.Router()

const registerController  = require('../Controllers/authController');
const paymentGatewayController = require("../Controllers/Payments")

router.post("/register", registerController.register);
router.post("/login", registerController.login);
router.delete("/delete", registerController.deleteUsers);
router.get("/userinfo", registerController.userInfo);

// Payment
router.post("/payment", paymentGatewayController.payment);
router.post("/callback", paymentGatewayController.callback);

module.exports = router;