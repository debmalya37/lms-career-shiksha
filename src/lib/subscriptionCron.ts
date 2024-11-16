// src/lib/subscriptionCron.ts
import cron from 'node-cron';
import dbConnect from '@/lib/db';
import { User } from '@/models/user';

let isCronJobScheduled = false;

export function startSubscriptionCron() {
  if (isCronJobScheduled) {
    console.log('Cron job already scheduled.');
    return; // Prevent multiple schedules
  }

  isCronJobScheduled = true;

  // Schedule the cron job to run once per minute
  cron.schedule('0 0 * * *', async () => {
    console.log('Running subscription update...');
    try {
      await dbConnect();
      const result = await User.updateMany(
        { subscription: { $gt: 0 } },
        { $inc: { subscription: -1 } }
      );
      console.log('Subscription days decremented for users:', result.modifiedCount);
    } catch (error) {
      console.error('Error updating subscriptions:', error);
    }
  });
}
