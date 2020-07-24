import {AsyncJob} from './processor'
import { Config } from './config';
import {StatsD, ClientOptions} from 'hot-shots'
interface Middleware {
    apply<T extends AsyncJob<any>>(job: T, promise: Promise<void>): Promise<void>
}

export class Logging implements Middleware {
    public async apply<T extends AsyncJob<any>>(job: T, promise: Promise<void>): Promise<void> {
    console.log(`Applied Logging for ${job.jobName}: ${JSON.stringify(job.props)}`)
    console.log(`STATSD_HOST: ${process.env['STATSD_HOST']}`)
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


export class Monitoring implements Middleware {
    public static statsDConfig = (): ClientOptions => {
        return {
            host: Config.get(Config.EnvVar.STATSD_HOST), 
            port: Number(Config.get(Config.EnvVar.STATSD_PORT)),
            globalTags: ['worker'],
        }}

    public async apply<T extends AsyncJob<any>>(job: T, promise: Promise<void>): Promise<void> {
        console.log(Monitoring.statsDConfig())
        new StatsD(Monitoring.statsDConfig()).increment(job.jobName)
        new StatsD(Monitoring.statsDConfig()).increment('somethingIIncrement')
        new StatsD(Monitoring.statsDConfig()).event(job.jobName, 'job middleware')
        return promise 
    }

    private statsD(){
        return new StatsD(Monitoring.statsDConfig())
    }
    
}
