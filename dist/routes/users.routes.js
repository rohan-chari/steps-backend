"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_1 = require("../middleware/auth");
const r = (0, express_1.Router)();
// GET /api/users/me -> returns the user making the request (requires auth)
r.get('/me', auth_1.firebaseAuth, users_controller_1.UsersController.me);
// POST /api/users/sync -> syncs user data from frontend (requires auth)
r.post('/sync', auth_1.firebaseAuth, users_controller_1.UsersController.sync);
exports.default = r;
//# sourceMappingURL=users.routes.js.map