import * as cdk from '@aws-cdk/core';
import * as ecs from "@aws-cdk/aws-ecs";
import * as secrets from "@aws-cdk/aws-secretsmanager"

import {WorkerEnvironment} from './WorkerEnvironment'
import {Variables} from '../../util/Variables' 
import { FargateTaskDefinition } from '@aws-cdk/aws-ecs';
import { ServiceStackInputProps } from '../../util/ServiceStack';
import { DatadogEnvironment } from './DatadogEnvironment';
import { StackBase } from '../../util/StackBase';
import { CfnOutput } from '@aws-cdk/core';

export type WorkerInputProps = ServiceStackInputProps
export class Worker extends StackBase {
  // readonly secret: secrets.Secret

  constructor(scope: cdk.Construct, id: string, props: WorkerInputProps) {
    super(scope, id, props);

    // ECS Task
    // Fargate tasks require the awsvpc network mode.
    const taskDefinition = new FargateTaskDefinition(this, Variables.withSuffix("worker-task"), {
      cpu: 1024,
      memoryLimitMiB: 2048,
    });

    // Environment variables for this stack
    const datadogEnv = new DatadogEnvironment(
      this
    );
    
    const datadog = taskDefinition.addContainer(Variables.withSuffix('datadog'), {
      cpu: 512,
      environment: datadogEnv.getEnvironment(props),
      essential: true,
      image: ecs.ContainerImage.fromRegistry("datadog/agent:latest"),
      logging: new ecs.AwsLogDriver({ streamPrefix: Variables.withSuffix("ecs") }),
      memoryLimitMiB: 1024,
      secrets: datadogEnv.getSecrets(props),
      
    });

    datadog.addPortMappings({containerPort: 8126, protocol: ecs.Protocol.TCP})
    datadog.addPortMappings({containerPort: 8125, protocol: ecs.Protocol.TCP})

    // Environment variables for this stack
    const env = new WorkerEnvironment(
      this
    );

    taskDefinition.addContainer(Variables.withSuffix('worker'), {
      cpu: 512,
      environment: Object.assign(env.getEnvironment(props), {STATSD_HOST: datadog.containerName}),
      essential: true,
      image: ecs.ContainerImage.fromEcrRepository(props.InfraStack.repository),
      logging: new ecs.AwsLogDriver({ streamPrefix: Variables.withSuffix("ecs") }),
      memoryLimitMiB: 2048,
    });

    // ECS Service
    new ecs.FargateService(this, Variables.withSuffix("service-worker"), {
      cluster: props.InfraStack.cluster,
      desiredCount: 2,
      securityGroup: props.InfraStack.vpcSecurityGroup,
      taskDefinition,
      vpcSubnets: { subnets: props.InfraStack.vpc.privateSubnets }, 
      
    });
    

    // Outputs
    new CfnOutput(this, "DatadogContainerName", {
      value: datadog.containerName,
    });

  }
}
