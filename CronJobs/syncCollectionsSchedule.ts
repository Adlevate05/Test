import cron from "node-cron";
export const syncCollectionsSchedule = () => {
    cron.schedule("* * * * *", () => {
        console.log("Running scheduled task: Sync Collections");
    });
};
