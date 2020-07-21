import Queue from "bull";
import SDC from 'statsd-client'
import { Logging, DataDog } from './middleware';
import { Config } from './config';


const statsdClient = new SDC({host: 'localhost', port: 8125});

// TODO 
// https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/?tab=kubernetes
// Deployment
// Alerting 
// Handle timeouts 
// Handle failures explicitly 
// Decorate classes 
// What metrics should we actually capture?
// Monitoring 

// This module is intended to allow external-api and internal-api to: 
// 1.) Schedule future operations (e.g. bill a customer once in the future)
// 2.) Schedule recurring operations on a cron (e.g. bill a customer monthly) 
// 3.) Schedule async processing (e.g. send a lob snail mail letter to a customer)

// useful redis-cli commands 
// hgetall "bull:example-queue:47" 

const redisHost = Config.get(Config.EnvVar.REDIS_HOST)
const redisPort = Number(Config.get(Config.EnvVar.REDIS_PORT))
const queueConfig = {redis: {port: redisPort, host: redisHost}}

const queues = [new Queue("abcabc", queueConfig), new Queue("abcabc", queueConfig)]

class AsyncQueue<T extends AsyncJob<any>> {
  // public priority = new Queue('priority')
  public default = (job: T) => {
    return new Queue(`default-${job.jobName}`)
  }
}

export abstract class AsyncJob<T extends object> {
  public abstract jobName: string 
  public abstract props: T 
  public abstract queue: Queue.Queue

  public async schedule(){
    await this.queue.add(this.jobName, this.props)
  }
  public async beginProcessingFromQueue(){
    await this.queue.process(this.jobName, this.processOneJob.bind(this))
  }

  private async processOneJob(bullQueueJob: Queue.Job<this['props']>){
    console.log('processing one job')
    console.log({jobName: this.jobName, props: this.props, queue: this.queue.name})

    let promise = this.execute(bullQueueJob.data)
    for(const middleware of [new Logging(),  new DataDog()]){
      promise = middleware.apply(this, promise)
    }
    await promise 
  }
  public abstract async execute(props: T): Promise<void>

}

class SmallUseCase {
  public static async execute({id}:{id: string}){
    console.log("SmallUseCase: " + id)
    var start = new Date().getTime();
    var end = start;
    const ms = Math.random() * 3000;
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

  async execute(payload: this['props']){    
    await SmallUseCase.execute({id: payload.myIdIs})
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

  async execute(payload: this['props']){
    await SmallUseCase.execute({id: payload.myFavoritePizzaFlavor})
  }
}

export class JobProcesser {
  async process(){
    for(const job of [new ShortRunningJob(), new LongRunningJob()]){
      job.beginProcessingFromQueue()
    }
  }
}