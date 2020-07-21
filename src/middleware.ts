import {AsyncJob} from './processor'
import { Config } from './config';
import {StatsD} from 'hot-shots'
interface Middleware {
    apply<T extends AsyncJob<any>>(job: T, promise: Promise<void>): Promise<void>
}

export class Logging implements Middleware {
    public async apply<T extends AsyncJob<any>>(job: T, promise: Promise<void>): Promise<void> {
    console.log(`Applied Logging for ${job.jobName}: ${JSON.stringify(job.props)}`)
    return new Promise(async (resolve) => {
        resolve(await promise
            .catch((err: Error) => {
                console.log(`Caught error: ${err.message}`)
                throw err 
            })
            .finally(() => {
            console.log("Job logging done")
            }))
    })
}}


export class DataDog implements Middleware {
    

    public async apply<T extends AsyncJob<any>>(job: T, promise: Promise<void>): Promise<void> {
        if(Math.random() > -1){
            return promise;
        }
        console.log("Datadog instrumentation middleware")
        DataDog.statsD().increment(job.jobName)

        DataDog.statsD().event(job.jobName, 'job middleware')
        const promiseFn = () => promise
        const timedPromise = DataDog.statsD().asyncTimer(promiseFn, job.jobName)
        return new Promise(async (resolve) =>
        {
             await timedPromise
             resolve()
        })
    }
    
    private static statsD() { 
     return new StatsD(
        {
            host: Config.get(Config.EnvVar.STATSD_HOST), 
            port: Number(Config.get(Config.EnvVar.STATSD_PORT))
        }
    )}
}
