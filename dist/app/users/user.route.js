"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
router.post('/register', users_controller_1.register);
router.post('/login', users_controller_1.login);
exports.default = router;
