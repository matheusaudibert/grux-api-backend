import * as cron from "node-cron";
import { UserService } from "../services/UserService";

const userService = new UserService();

export function startUpdateScheduler(): void {
  const interval = process.env.UPDATE_INTERVAL_MINUTES || "10";
  const cronExpression = `*/${interval} * * * *`;

  cron.schedule(cronExpression, async () => {
    try {
      await userService.updateAllUsers();
      console.log("Updated successfully");
    } catch (error) {
      console.error("Update error:", error);
    }
  });
}
