import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as secrets from "@aws-cdk/aws-secretsmanager"
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";

const deployEnv = process.env.DEPLOY_ENV || "QA";

export class EcsConstructStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     const vpc = new ec2.Vpc(this, `WorkerVPC-${deployEnv}`, {
      maxAzs: 2 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, `WorkerCluster-${deployEnv}`, {
      vpc: vpc
    });

    const repo = new ecr.Repository(this, `WorkerRepository-${deployEnv}`, {repositoryName:  `worker-repo-${deployEnv.toLowerCase()}`})

    new secrets.Secret(this, `WorkerEnvSecrets-${deployEnv}`)

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, `WorkerService-${deployEnv}`, {
      cluster: cluster, // Required
      cpu: 256 * 4, // Default is 256
      desiredCount: 2, // Default is 1
      taskImageOptions: { image: ecs.ContainerImage.fromEcrRepository(repo, 'latest')},
      memoryLimitMiB: 512 * 4, // Default is 512
      publicLoadBalancer: false // Default is false
    });
  }
}
