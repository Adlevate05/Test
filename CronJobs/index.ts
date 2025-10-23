import { syncProductsSchedule } from "./syncProductsSchedule.js";
import { cleanSessionsSchedule } from "./cleanSessionsSchedule.js";
import { syncCollectionsSchedule } from "./syncCollectionsSchedule.js";
console.log("Starting all cron jobs...");
// Register your cron jobs
syncProductsSchedule();
cleanSessionsSchedule();
syncCollectionsSchedule();
console.log("All cron jobs are now running.");
