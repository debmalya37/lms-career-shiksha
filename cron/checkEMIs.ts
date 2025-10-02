// cron/checkEMIs.ts
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import EMI from '@/models/emiModel';
import { User as IUser } from '@/models/user';
import Course, { ICourse } from '@/models/courseModel';
import dbConnect from '@/lib/db';

async function startCron() {
  // --- Connect to MongoDB ---
  await dbConnect();

  // --- Configure Nodemailer ---
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // --- Cron job runs every day at 8:00 AM server time ---
  cron.schedule('0 8 * * *', async () => {
    console.log('Running EMI check cron job:', new Date());

    try {
      const emis = await EMI.find({ status: 'active' }).populate('userId courseId');

      for (const emi of emis) {
        const user = emi.userId as IUser;
        const course = emi.courseId as ICourse;
        const today = new Date();
        const diffTime = emi.nextEMIDueDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // --- Reminder for EMI due in 7 days or less ---
        if (daysLeft <= 7 && daysLeft > 0) {
          await sendEmail(
            transporter,
            user.email,
            'EMI Payment Reminder',
            `Dear ${user.name},\n\nYour EMI for the course "${course.title}" is due in ${daysLeft} day(s) on ${emi.nextEMIDueDate.toLocaleDateString()}. Please make sure to pay on time.\n\nThank you.`
          );
          console.log(`Reminder sent to ${user.email}, EMI due in ${daysLeft} days`);
        }

        // --- Overdue handling ---
        if (daysLeft < 0) {
          emi.status = 'overdue';
          await emi.save();

          await sendEmail(
            transporter,
            user.email,
            'EMI Overdue Notice',
            `Dear ${user.name},\n\nYour EMI for the course "${course.title}" is overdue since ${emi.nextEMIDueDate.toLocaleDateString()}. Please pay within the next 7 days to avoid any penalties.\n\nThank you.`
          );
          console.log(`Overdue notice sent to ${user.email}`);
        }
      }

      console.log('EMI cron job finished successfully.');
    } catch (err) {
      console.error('Error in EMI cron job:', err);
    }
  });

  console.log('EMI cron job scheduled.');
}

// --- Helper function to send email ---
async function sendEmail(transporter: nodemailer.Transporter, to: string, subject: string, text: string) {
  try {
    await transporter.sendMail({
      from: `"Your Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

// Start cron
startCron();
