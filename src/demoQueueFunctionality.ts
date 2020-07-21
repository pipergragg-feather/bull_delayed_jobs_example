import cluster from "cluster";
import {ShortRunningJob, LongRunningJob, JobProcesser} from './processor'


// TODO 
// Decorate classes 
// Deployment
// Monitoring 
// Alerting 
// Metrics (TICK stack?)

// This module is intended to allow external-api and internal-api to: 
// 1.) Schedule future operations (e.g. bill a customer once in the future)
// 2.) Schedule recurring operations on a cron (e.g. bill a customer monthly) 
// 3.) Schedule async processing (e.g. send a lob snail mail letter to a customer)

// useful redis-cli commands 
// hgetall "bull:example-queue:47" 

if (!module.parent) {
  if (cluster.isMaster) {
    for (var i = 0; i < 2; i++) {
      new ShortRunningJob().schedule()
      new LongRunningJob().schedule()
    }
    for (var i = 0; i < 4; i++) {
      cluster.fork();
    }
    cluster.on("online", function(worker) {
      // Lets create a few jobs for every created worker
      console.log('Worker ' + worker.process.pid + ' online.')
      
    })
    cluster.on("exit", function(worker, code, signal) {
      console.log("worker " + worker.process.pid + " died");
    });
  }
  if (cluster.isWorker) {
    new JobProcesser().process()
  }
}
