"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, password } = req.body;
        const hash = yield bcrypt_1.default.hash(password, 10);
        yield user_schema_1.default.create({ name, email, password: hash });
        res.status(201).json({ message: 'User Registered!' });
    }
    catch (err) {
        if (err.code === 11000 && ((_a = err.keyPattern) === null || _a === void 0 ? void 0 : _a.email)) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield user_schema_1.default.findOne({ email });
    if (!user)
        return res.status(401).json({ message: 'No user' });
    const valid = yield bcrypt_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
    res.json({ token });
});
exports.login = login;
