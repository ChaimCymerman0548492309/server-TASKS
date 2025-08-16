"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/register", (req, res, next) => {
    Promise.resolve((0, authController_1.register)(req, res)).catch(next);
});
router.post("/login", (req, res, next) => {
    Promise.resolve((0, authController_1.login)(req, res)).catch(next);
});
router.post("/logout", authController_1.logout);
exports.default = router;
