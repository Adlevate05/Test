// module.exports = {
//   apps: [
//     {
//       name: "cron-jobs",
//       script: "./build/CronJobs/index.js", // Points to the compiled schedules entry
//       instances: 1,
//       exec_mode: "fork",
//       watch: false,
//       log_date_format: 'YYYY-MM-DD HH:mm:ss', // custom timestamp format
//       out_file: './logs/cron-jobs-out.log', // path for standard logs
//       error_file: './logs/cron-jobs-error.log', // path for error logs
//     },
//   ],
// };
// ;