import {
  ServiceStackEnvironment,
  IStringMap,
  ISecretMap,
} from "../../util/ServiceStackEnvironment";
import { WorkerInputProps } from "./Worker";
import { Variables } from '../../util/Variables';

export class DatadogEnvironment extends ServiceStackEnvironment {
  public getEnvironment(props: WorkerInputProps): IStringMap {
    return {
      ECS_FARGATE: "true",
      DD_ENV: "qa",
      DD_DOGSTATSD_NON_LOCAL_TRAFFIC: "true",
      DD_SERVICE: "worker",
      DD_VERSION: "1",
      DD_TAGS: 'fargate_qa sidecar_qa'
    } as IStringMap;
  }

  public getSecrets(props: WorkerInputProps): ISecretMap {
    return {
      DD_API_KEY: this.secretFromSSMSecureStringParameter(
        `feather.${Variables.environment()}.worker.datadog_api_key`,
        1
      ),
    };
  }
}
