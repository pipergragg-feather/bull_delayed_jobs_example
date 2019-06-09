import Queue from "bull";
import cluster from "cluster";

const exampleQueue = new Queue("example-queue");
const numWorkers = 15;

const process = async () => {
  return exampleQueue.process("exampleJob", async (job: Queue.Job<ExampleJob>) => {
    var start = new Date().getTime();
    var end = start;
    const ms = 5000;
    while (end < start + ms) {
      end = new Date().getTime();
    }
    console.log({ processed: job.data.someId });
  });
};
interface ExampleJob {
  someId: string;
}

if (!module.parent) {
  if (cluster.isMaster) {
    for (var i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    cluster.on("online", function(worker) {
      // Lets create a few jobs for every created worker
      for (var i = 0; i < 500; i++) {
        exampleQueue.add("exampleJob", {
          someId: String(Math.round(Math.random() * 100000))
        }, {
            delay: Math.round(Math.random() * 100000)
          });
      }
    });
    cluster.on("exit", function(worker, code, signal) {
      console.log("worker " + worker.process.pid + " died");
    });
  }
  if (cluster.isWorker) {
    process()
  }
}
