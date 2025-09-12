"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const steps_controller_1 = require("../controllers/steps.controller");
const auth_1 = require("../middleware/auth");
const r = (0, express_1.Router)();
// GET /api/steps/me/today -> returns the steps for the user making the request (requires auth)
r.get('/me/today', auth_1.firebaseAuth, steps_controller_1.StepsController.me);
exports.default = r;
//# sourceMappingURL=steps.routes.js.map