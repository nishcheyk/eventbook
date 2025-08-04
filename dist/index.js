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
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./app/routes"));
require("reflect-metadata");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', routes_1.default);
function connectDB(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState === 1)
            return;
        yield mongoose_1.default.connect(uri);
    });
}
function disconnectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0)
            yield mongoose_1.default.disconnect();
    });
}
if (process.env.NODE_ENV !== 'test') {
    connectDB(process.env.MONGODB_URI).then(() => app.listen(3000, () => console.log('Server running on port 3000')));
}
exports.default = app;
