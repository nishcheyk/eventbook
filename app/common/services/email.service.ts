import nodemailer from "nodemailer";
import QRCode from "qrcode";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM;

if (!SMTP_USER || !SMTP_PASS) {
  throw new Error("SMTP_USER and SMTP_PASS must be set in environment variables");
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
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
  seatNumbers,
  seatCategories,
  reservationName,
}: {
  toEmail: string;
  subject: string;
  message?: string;
  qrContent: string | string[];
  seatNumbers: string[];
  seatCategories: string[];
  reservationName: string;
}) => {
  const qrArray = Array.isArray(qrContent) ? qrContent : [qrContent];

  const attachments: any[] = [];
  let qrHtml = "";

  for (let i = 0; i < qrArray.length; i++) {
    const qr = qrArray[i];
    if (typeof qr !== "string") throw new Error(`QR at index ${i} is not a string`);

    const cid = `qrcode${i}@eventbook`;
    const qrCodeBuffer = await QRCode.toBuffer(qr, { width: 200 });

    attachments.push({ filename: `qrcode${i + 1}.png`, content: qrCodeBuffer, cid });
    qrHtml += `<div style="margin-bottom:10px">
        <img src="cid:${cid}" alt="QR Code ${i + 1}" style="width:200px;height:auto;" />
      </div>`;
  }

  const detailsHtml = `
    <h3>Booking Details</h3>
    <p><strong>Name:</strong> ${reservationName}</p>
    <p><strong>Seats:</strong> ${seatNumbers.join(", ")}</p>
    <p><strong>Categories:</strong> ${seatCategories.join(", ")}</p>
  `;

  const emailHtml = `
    <div>
      ${message ? `<p>${message}</p>` : ""}
      ${detailsHtml}
      ${qrHtml}
    </div>
  `;

  const info = await transporter.sendMail({
    from: MAIL_FROM,
    to: toEmail,
    subject,
    html: emailHtml,
    attachments,
  });

  console.log(`Email sent to ${toEmail}, message ID: ${info.messageId}`);
};
