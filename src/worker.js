const { Queue, Worker } = require('bullmq');
const { REDIS_CONFIG } = require('./config');

// ----------------------------------------------------------------------------
// TRIGGERED TASK
//
// Whenever a request is made to the POST /trigger-task api endpoint, a message
// will be sent to redis, which will queue these messages. Then, any number of
// workers processes will read from redis and process those messages asyncronously.
//
// This is helpful whenever you have a long running task (anything over maybe
// 500ms ish?) that you don't want to keep an api request in flight while it
// completes.
// ----------------------------------------------------------------------------
const TRIGGERED_TASK_WORKER_NAME = 'triggered-task';
function createTriggeredTaskWorker() {
  const worker = new Worker(TRIGGERED_TASK_WORKER_NAME, async (job) => {
    console.log('* Triggered task executed!');
    console.log('  Job data:', job.data);
  }, { connection: REDIS_CONFIG });

  return worker;
}
exports.createEnqueueTriggeredTaskFunction = function createEnqueueTriggeredTaskFunction() {
  const triggeredTaskQueue = new Queue(TRIGGERED_TASK_WORKER_NAME, { connection: REDIS_CONFIG });
  return (data) => {
    const payload = {
      version: 1,
      data,
    };
    triggeredTaskQueue.add('task', payload, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  };
}

// ----------------------------------------------------------------------------
// PERIODIC TASK
//
// When each worker process starts, it will run `createPeriodicTaskWorker`,
// which upserts a bullmq message that is stored under the key "schedule". So,
// the first worker that comes online will create the message, then when further
// workers come online, the upsert will effectively be a no-op.
//
// Then, every 5000ms (configurable below), bullmq will process the message in
// the "worker" code below.
// ----------------------------------------------------------------------------
const PERIODIC_TASK_WORKER_NAME = 'periodic-task';
const PERIODIC_TASK_RUN_EVERY_MILLISECONDS = 5000;
function createPeriodicTaskWorker() {
  const worker = new Worker(PERIODIC_TASK_WORKER_NAME, async (job) => {
    console.log('* Periodic task executed!');
    console.log('  Job data:', job.data);
  }, { connection: REDIS_CONFIG });

  // Send this message periodically using `repeat` to implement a cron-esque workflow
  // More info: https://docs.bullmq.io/guide/jobs/repeatable
  const queue = new Queue(PERIODIC_TASK_WORKER_NAME, { connection: REDIS_CONFIG });
  const payload = {
    version: 1,
    youCould: 'put data here',
  };
  queue.add('schedule', payload, {
    repeat: {
      every: PERIODIC_TASK_RUN_EVERY_MILLISECONDS,
    },
    removeOnComplete: true,
    removeOnFail: true,
  });

  return worker;
}

function main() {
  createTriggeredTaskWorker();
  createPeriodicTaskWorker();
  console.log('* Started worker process!');
}
if (require.main === module) {
  main();
}
