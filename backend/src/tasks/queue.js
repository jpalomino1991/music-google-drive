const fs = require('fs');
const Queue = require('bull');

const db = require('../db');

const metadataQueue = new Queue('metadata', {
  redis: process.env.REDIS_URL,
  //api drive limit per user https://developers.google.com/docs/api/limits
  limiter: {
    max: 300,
    duration: 60000,
  },
});

metadataQueue.on('completed', () => {});

let completed = 0;
let failed = 0;
let stalled = 0;

metadataQueue
  .on('completed', async (job, result) => {
    completed++;

    const c = await metadataQueue.count();
    console.log(
      'COMPLETED',
      completed,
      'FAILED',
      failed,
      'STALLED',
      stalled,
      'INQUEUE',
      c
    );
    const gg = await metadataQueue.getJobCounts();
    console.log(gg);
    //const passState = await db.query.state({
    //where: { id: job.data.stateId },
    //});
    //console.log(JSON.stringify(passState, null, 2));
    //await db.mutation.updateState({
    //data: {
    //extraData: {
    //counts: passState.extraData.counts + 1,
    //},
    //},
    //where: {
    //id: job.data.stateId,
    //},
    /*});*/
  })
  .on('stalled', async job => {
    appendErrorFile(job, 'STALLED');
    stalled++;
    const c = await metadataQueue.count();
    console.log(
      'COMPLETED',
      completed,
      'FAILED',
      failed,
      'STALLED',
      stalled,
      'INQUEUE',
      c
    );
    const gg = await metadataQueue.getJobCounts();
    console.log(gg);
  })
  .on('error', function(error) {
    console.log('e', error);
    console.log('ERROR');
  })
  .on('failed', (job, err) => {
    if (job.opts.attempts === job.attemptsMade) {
      failed++;
      appendErrorFile(job, 'FAILED');
    }
  });

const appendErrorFile = (job, type) =>
  fs.appendFile(
    `./src/temp/error_process_${job.data.folderDriveId}_${job.data.providerId}`,
    `${JSON.stringify({
      songId: job.data.song,
      stacktrace: job.stacktrace,
      type,
    })}\n`,
    () => {}
  );

metadataQueue.process(10, __dirname + '/process.js');

const add = data => {
  metadataQueue.add(data, {
    delay: 200,
    attempts: 3,
  });
};

module.exports = { add };
