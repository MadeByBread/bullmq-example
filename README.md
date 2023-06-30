# Bullmq Example

This example demonstrates how one can do two things with [bullmq](https://docs.bullmq.io/):
1. Set up a periodic, cron-like task that runs on an interval
2. Set up an async task that gets kicked off when one makes a request to an api endpoint

## Getting started
```bash
$ npm install
$
$ # Run each of these next 3 commands in their own terminal windows:
$
$ # 1. Starts a local docker container running redis in the background - skip this
$ # if you already have redis running on localhost:6379 (connection information is in src/config.js)
$ npm run start:redis
$
$ # 2. Starts a process that runs a local web server on port 5000 - this can be horizontally scaled
$ npm start
$
$ # 3. Starts a process that listens for bullmq messages - this can be horizontally scaled
$ npm run start:worker
```

Now that you have everything running, you should see a `* Periodic task executed!` log in the worker
process every 5 seconds.

To trigger the async task, run `npm run trigger-event`. This will make a request with curl to the
local web server, which will put a message into redis with bullmq. Then, the worker process will
pick up this message and process it, logging out something starting with `* Triggered task executed!`
