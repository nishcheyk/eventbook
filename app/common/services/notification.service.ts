// notification.queue.ts
import notificationQueue from "./bull-queue.service";
import { sendBookingNotification } from "./email.service";
import { sendSMS } from "./sms.service";

notificationQueue.process("sendNotification", async (job) => {
  const { email, phone, subject, message, qrCode } = job.data;

  if (email) {
    console.log(`Sending email to ${email} with subject "${subject}"`);
    try {
      await sendBookingNotification({
        toEmail: email,
        subject,
        message,
        qrContent: qrCode, // This *must* be a string, booking._id.toString()
      });
      console.log(`Email sent to ${email}`);
    } catch (err) {
      console.error(`Failed to send email to ${email}`, err);
    }
  }

  if (phone) {
    console.log(`Sending SMS to ${phone}: ${message}`);
    try {
      const smsResponse = await sendSMS(phone, message);
      console.log(`SMS sent successfully to ${phone}`, smsResponse);
    } catch (error) {
      console.error(`Failed to send SMS to ${phone}`, error);
    }
  }
});

export { notificationQueue };
