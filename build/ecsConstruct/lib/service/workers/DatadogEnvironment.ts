import {
  ServiceStackEnvironment,
  IStringMap,
  ISecretMap,
} from "../../util/ServiceStackEnvironment";
import { BackgroundJobsInputProps } from "./BackgroundJobs";

export class DatadogEnvironment extends ServiceStackEnvironment {
  public getEnvironment(props: BackgroundJobsInputProps): IStringMap {
    return {
      DD_API_KEY: "89f02f00ee72014ba8f878db4729c6e1",
      ECS_FARGATE: "true",
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
