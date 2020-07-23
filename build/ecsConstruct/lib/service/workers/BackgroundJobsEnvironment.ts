import {
  ServiceStackEnvironment,
  IStringMap,
  ISecretMap,
} from "../../util/ServiceStackEnvironment";
import { BackgroundJobsInputProps } from "./BackgroundJobs";

export class BackgroundJobsEnvironment extends ServiceStackEnvironment {
  public getEnvironment(props: BackgroundJobsInputProps): IStringMap {
    return {
      ADDRESS: "::",

      DEBUG: "*:*",
      REDIS_HOST: props.PersistenceStack.workerRedisCluster.getAtt('RedisEndpoint.Address').toString(),
      REDIS_PORT: props.PersistenceStack.workerRedisCluster.port?.toString()
    } as IStringMap;
  }

  public getSecrets(props: BackgroundJobsInputProps): ISecretMap {
   return {}
    // return {
    //   DD_API_KEY: this.secretFromSSMSecureStringParameter(
    //     "feather.qa.worker.datadog_api_key",
    //     1
    //   ),
    // };
}
}