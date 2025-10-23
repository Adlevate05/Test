import cron from "node-cron";
export const cleanSessionsSchedule = () => {
    cron.schedule("0 0 * * *", () => {
        console.log("Running scheduled task: Clean up old sessions");
    });
};
