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
const bull_queue_service_1 = __importDefault(require("./bull-queue.service"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// import twilio from 'twilio'; (for SMS)
bull_queue_service_1.default.process('sendNotification', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, qrCode } = job.data;
    const transporter = nodemailer_1.default.createTransport({ /*SMTP config*/});
    yield transporter.sendMail({
        from: 'noreply@events.com',
        to: email,
        subject: 'Your Ticket',
        html: `<p>Your ticket booking is confirmed!</p><img src="${qrCode}"/>`
    });
    // Add SMS using Twilio if needed
}));
