import Queue from "bull";
import cluster from "cluster";

// TODO 
// Decorate classes 
// Deployment
// Monitoring 
// Alerting 
// Metrics (TICK stack?)
// Handle timeouts 
// Handle failures explicitly 

// This module is intended to allow external-api and internal-api to: 
// 1.) Schedule future operations (e.g. bill a customer once in the future)
// 2.) Schedule recurring operations on a cron (e.g. bill a customer monthly) 
// 3.) Schedule async processing (e.g. send a lob snail mail letter to a customer)

// useful redis-cli commands 
// hgetall "bull:example-queue:47" 

const numWorkers = 4;
const queues = [new Queue("abcabc"), new Queue("abcabc")]

class AsyncQueue<T extends AsyncJob<any>> {
  // public priority = new Queue('priority')
  public default = (job: T) => {
    return new Queue(`default-${job.jobName}`)
  }
}

abstract class AsyncJob<T extends object> {
  public abstract jobName: string 
  public abstract props: T 
  public abstract queue: Queue.Queue

  public async schedule(){
    await this.queue.add(this.jobName, this.props)
  }
  public async process(){
    await this.queue.process(this.jobName, this.processOneJob.bind(this))
  }

  private async processOneJob(job: Queue.Job<this['props']>){
    console.log('processing one job')
    // console.log(this)
    console.log({jobName: this.jobName, props: this.props, queue: this.queue.name})
    return await this.execute(job)
  }
  public abstract async execute(job: Queue.Job<T>): Promise<void>

}

class SmallUseCase {
  public static async execute({id}:{id: string}){
    console.log("SmallUseCase: " + id)
    var start = new Date().getTime();
    var end = start;
    const ms = 1000;
    while (end < start + ms) {
      end = new Date().getTime();
    }

    return end 
  }
}

export class ShortRunningJob extends AsyncJob<{myIdIs: string}> {
  public jobName = 'shortRunningJob'
  public props: {myIdIs: string}
  public queue = new AsyncQueue().default(this)

  constructor(){
    super()
    this.props = {myIdIs: Math.random().toString()}
  }

  async execute(job: Queue.Job<this['props']>){    
    await SmallUseCase.execute({id: job.data.myIdIs})
  }
}
export class LongRunningJob extends AsyncJob<{myFavoritePizzaFlavor: string}> {
  public jobName = 'longRunningJob'
  public props: {myFavoritePizzaFlavor: string}
  public queue = new AsyncQueue().default(this)

  constructor(){
    super()
    const randNumber =  Math.floor((Math.random()*1000)) % 2
    this.props = {myFavoritePizzaFlavor: ['pineapple', 'pepperoni'][randNumber]}
  }

  async execute(job: Queue.Job<this['props']>){
    await SmallUseCase.execute({id: job.data.myFavoritePizzaFlavor})
  }
}

export class JobProcesser {
  async process(){
    for(const job of [new ShortRunningJob(), new LongRunningJob()]){
      job.process()
    }
  }
}