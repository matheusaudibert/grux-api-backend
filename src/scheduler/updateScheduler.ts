import * as cron from "node-cron";
import { UserService } from "../services/UserService";

const userService = new UserService();

export function startUpdateScheduler(): void {
  const interval = process.env.UPDATE_INTERVAL_MINUTES || "10";
  const cronExpression = `*/${interval} * * * *`;

  (async () => {
    try {
      await userService.updateAllUsers();
    } catch (error) {
      console.error("Initial update error:", error);
    }
  })();

  cron.schedule(cronExpression, async () => {
    try {
      await userService.updateAllUsers();
    } catch (error) {
      console.error("Scheduled update error:", error);
    }
  });
}
