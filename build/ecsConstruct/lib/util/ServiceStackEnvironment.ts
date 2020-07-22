import { Construct, StackProps } from "@aws-cdk/core";
import { Secret } from "@aws-cdk/aws-ecs";
import { StringParameter } from "@aws-cdk/aws-ssm";

export interface IStringMap {
  [key: string]: string;
}

export interface ISecretMap {
  [key: string]: Secret;
}

export abstract class ServiceStackEnvironment {
  constructor(protected scope: Construct) {}
  /**
   * Provides (non-secret) environment variables
   */
  public abstract getEnvironment(props: StackProps): IStringMap | undefined;
  /**
   * Provides secret environment variables
   */
  public abstract getSecrets(props: StackProps): ISecretMap | undefined;

  /**
   * Reference a secret stored in AWS SSM Parameter Store
   * @param parameterName The SecureString parameter name
   * @param version The parameter version to reference
   */
  protected secretFromSSMSecureStringParameter(
    parameterName: string,
    version: number
  ): Secret {
    return Secret.fromSsmParameter(
      StringParameter.fromSecureStringParameterAttributes(
        this.scope,
        `ssm-${parameterName}`,
        {
          parameterName,
          version
        }
      )
    );
  }
}
