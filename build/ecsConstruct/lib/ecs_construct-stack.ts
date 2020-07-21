import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as secrets from "@aws-cdk/aws-secretsmanager"
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

const deployEnv = process.env.DEPLOY_ENV || "QA";
export class EcsConstructStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     const vpc = new ec2.Vpc(this, `Worker${deployEnv}VPC`, {
      maxAzs: 2 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, `Worker${deployEnv}Cluster`, {
      vpc: vpc
    });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, `Worker${deployEnv}Service`, {
      cluster: cluster, // Required
      cpu: 256, // Default is 256
      desiredCount: 2, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("pipergragg/worker") },
      memoryLimitMiB: 512, // Default is 512
      publicLoadBalancer: false // Default is false
    });
    
    new secrets.Secret(this, `Worker${deployEnv}EnvSecrets`)
  }
}
