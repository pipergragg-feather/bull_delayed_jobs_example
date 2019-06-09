import Queue from "bull";

var exampleQueue = new Queue("example-queue");

exampleQueue.on('failed', (job: Queue.Job<ExampleJob>, err) => {
  // Job failed with reason err!
   console.log("job failed: id: "+job.id + " with err?:"+err);
   //myQueue.retryJob(job);
   job.retry();
 });

const add = async () => {
  const dummyId =  String(Math.round((Math.random() * 100000)));
  const exampleJob: ExampleJob = {
    someId: dummyId
  };
  console.log(`Adding job with jobId ${dummyId}`)
  await exampleQueue.add("exampleJob", exampleJob, {
    delay: 10000
  });
};

interface ExampleJob {
  someId: string;
}

if (!module.parent) {
  add().then(() => {
    process.exit(0);
  });
}
