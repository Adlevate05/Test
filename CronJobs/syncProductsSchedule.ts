import cron from "node-cron";


export const syncProductsSchedule = () => {
    cron.schedule("* * * * *", () => {
        console.log("Running scheduled task: Sync Products");
    });
};
