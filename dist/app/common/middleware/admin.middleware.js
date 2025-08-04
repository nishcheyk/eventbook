"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const adminMiddleware = (req, res, next) => {
    var _a;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.isAdmin) {
        return next();
    }
    res.status(403).json({ message: 'Access forbidden: Admins only' });
};
exports.default = adminMiddleware;
