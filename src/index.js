const app = require('express')();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const { createEnqueueTriggeredTaskFunction } = require('./worker');

app.get('/', (req, res) => res.send('Bullmq example app'));
app.use(morgan('tiny'));

const enqueueTask = createEnqueueTriggeredTaskFunction();
app.post('/trigger-task', bodyParser.text(), (req, res) => {
  enqueueTask(req.body.toString());

  // 202 Accepted: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/202
  res.status(202).end();
});

const port = parseInt(process.env.PORT || '5000', 10);
app.listen(port, () => {
  console.log(`* Listening on port ${port}`);
});
