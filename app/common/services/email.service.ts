// email.service.ts
import nodemailer from "nodemailer";
import QRCode from "qrcode";

const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 587;
const DEFAULT_SMTP_USER = "bybirthpro@gmail.com";
const DEFAULT_SMTP_PASS = "yrpdxhyjjlwvqjrh"; // Replace with your app password
const DEFAULT_MAIL_FROM = "Event Booking <bybirthpro@gmail.com>";

const SMTP_HOST = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : DEFAULT_SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER || DEFAULT_SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS || DEFAULT_SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || DEFAULT_MAIL_FROM;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // TLS on port 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendBookingNotification = async ({
  toEmail,
  subject,
  message,
  qrContent,
}: {
  toEmail: string;
  subject: string;
  message: string;
  qrContent: string;
}) => {
  if (typeof qrContent !== "string") {
    throw new Error("qrContent must be a string");
  }

  // Console log for qrContent to help with testing
  console.log("QR Content being encoded into QR code:", qrContent);

  const qrCid = "qrcode@eventbook";
  const qrCodeBuffer = await QRCode.toBuffer(qrContent, { width: 200 });

  const emailHtml = `
    <p>${message}</p>
    <img src="cid:${qrCid}" alt="QR Code" style="width:200px; height:auto;" />
  `;

  try {
    const info = await transporter.sendMail({
      from: MAIL_FROM,
      to: toEmail,
      subject,
      html: emailHtml,
      attachments: [
        {
          filename: "qrcode.png",
          content: qrCodeBuffer,
          cid: qrCid,
        },
      ],
    });
    console.log(
      `Email sent successfully to ${toEmail}: Message ID ${info.messageId}`
    );
  } catch (error) {
    console.error(`Failed to send email to ${toEmail}:`, error);
    throw error;
  }
};
