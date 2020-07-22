import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecr from "@aws-cdk/aws-ecr";
import * as secrets from "@aws-cdk/aws-secretsmanager"

// import * as elasticache from "@aws-cdk/aws-elasticache"
import { FargateTaskDefinition } from '@aws-cdk/aws-ecs';
import { ServiceStackInputProps } from '../../util/ServiceStack';
import { InfraStack } from '../../core/InfraStack';
// import { Construct } from '@aws-cdk/core';

const deployEnv = process.env.DEPLOY_ENV || "QA";

export type BackgroundJobServiceInputProps = ServiceStackInputProps & InfraStack

export class BackgroundJobs extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: BackgroundJobServiceInputProps) {
    super(scope, id, props);

     const vpc = new ec2.Vpc(this, `WorkerVPC-${deployEnv}`, {
      maxAzs: 2 // Default is all AZs in region
    });

    const cluster = new ecs.Cluster(this, `WorkerCluster-${deployEnv}`, {
      vpc: vpc
    });

    const apiRepository = new ecr.Repository(this, `WorkerRepository-${deployEnv}`, {repositoryName:  `worker-repo-${deployEnv.toLowerCase()}`})

    new secrets.Secret(this, `WorkerEnvSecrets-${deployEnv}`)

    // Datadog 
    // Load multiple containers into a task 
      // Main container
      // Sidecar container containing datadog 
    
    // Create a load-balanced Fargate service and make it public
    
    // const cw = new cloudwatch.Dashboard(, `WorkerDashboard-${deployEnv}`, {widgets: []})

    // Environment variables for this stack
    // const env: ApiStackEnvironment = new ApiStackEnvironment(this);

    // ECS Task
    const taskDefinition = new FargateTaskDefinition(this, "task-api", {
      cpu: 512,
      memoryLimitMiB: 2048,
    });
    taskDefinition.addContainer(`worker-${deployEnv}`, {
      cpu: 512,
      // environment: env.getEnvironment(props),
      essential: true,
      image: ecs.ContainerImage.fromEcrRepository(apiRepository), // props.RepositoryStack.api
      logging: new ecs.AwsLogDriver({ streamPrefix: "ecs" }),
      memoryLimitMiB: 2048,
      // secrets: env.getSecrets(props),
    });
    taskDefinition.defaultContainer?.addPortMappings({ containerPort: 5000 });

    // ECS Service
    const service = new ecs.FargateService(this, "service-api", {
      cluster: cluster,
      desiredCount: 2,
      securityGroup: props.InfraStack.apiSecurityGroup,
      taskDefinition,
      vpcSubnets: { subnets: props.InfraStack.vpc.privateSubnets }, //  
    });



    // Outputs
    // new CfnOutput(this, "ApiEndpoint", {
    //   value: lb.loadBalancerDnsName,
    // });

  }
}
