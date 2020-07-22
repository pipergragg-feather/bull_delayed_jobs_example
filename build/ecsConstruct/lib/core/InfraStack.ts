import * as ec2 from "@aws-cdk/aws-ec2";
import {
  InstanceType,
  ISecurityGroup,
  IVpc,
  Port,
  SecurityGroup,
  Vpc,
} from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as elasticsearch from "@aws-cdk/aws-elasticsearch";
import * as rds from "@aws-cdk/aws-rds";
import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  IDatabaseInstance,
} from "@aws-cdk/aws-rds";
import * as cdk from "@aws-cdk/core";
import { CfnOutput, StackProps } from "@aws-cdk/core";
import { exportsProps, prop } from "../util/Props";
import { StackBase } from "../util/StackBase";

// Define the props this stack exports to other stacks
export interface IInfraStackProps extends StackProps {
  [key: string]: any;
  InfraStack: {
    apiALBSecurityGroup: ISecurityGroup;
    apiSecurityGroup: ISecurityGroup;
    esSecurityGroup: ISecurityGroup;
    cluster: ecs.ICluster;
    database: rds.IDatabaseInstance;
    elasticsearch: elasticsearch.CfnDomain;
    rdsSecurityGroup: ISecurityGroup;
    vpc: ec2.IVpc;
    vpcSecurityGroup: ISecurityGroup;
  };
}

@exportsProps()
export class InfraStack extends StackBase {
  @prop
  public readonly apiSecurityGroup: ISecurityGroup;
  @prop
  public readonly apiALBSecurityGroup: ISecurityGroup;

  @prop
  public readonly cluster: ecs.ICluster;

  @prop
  public readonly database: IDatabaseInstance;

  @prop
  public readonly elasticsearch: elasticsearch.CfnDomain;

  @prop
  public readonly esSecurityGroup: ISecurityGroup;

  @prop
  public readonly idALBSecurityGroup: ISecurityGroup;

  @prop
  public readonly rdsSecurityGroup: ISecurityGroup;

  @prop
  public readonly vpc: IVpc;

  @prop
  public readonly vpcSecurityGroup: ISecurityGroup;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The VPC into which all resources will be deployed
    this.vpc = new Vpc(this, "feather-vpc", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
    });

    // Security group granting access between VPC resources
    this.vpcSecurityGroup = new SecurityGroup(this, "feather-sg-vpc", {
      allowAllOutbound: true,
      vpc: this.vpc,
    });
    this.vpcSecurityGroup.addIngressRule(
      this.vpcSecurityGroup,
      Port.allTraffic(),
      "Allow all traffic from the VPC"
    );

    // API service security group
    // - External dependencies
    //     1. RDS
    //     2. ES
    //     3. SQS
    this.apiSecurityGroup = new SecurityGroup(this, "feather-sg-api", {
      allowAllOutbound: true,
      description: "Traffic to/from API service",
      vpc: this.vpc,
    });

    // API ALB security group
    // - External dependencies:
    //     None
    // - Configured by:
    //     API Application load balancer config
    this.apiALBSecurityGroup = new SecurityGroup(this, "feather-sg-api-alb", {
      allowAllOutbound: true,
      description: "API service ALB traffic",
      vpc: this.vpc,
    });

    // RDS security group
    // - Inbound:
    //   1. API service
    this.rdsSecurityGroup = new SecurityGroup(this, "feather-sg-rds", {
      allowAllOutbound: true,
      description: "RDS Database access",
      vpc: this.vpc,
    });
    this.rdsSecurityGroup.addIngressRule(
      this.apiSecurityGroup,
      Port.tcp(5432),
      "Allow from API service"
    );

    // Elasticsearch security group
    // - Inbound
    //   1. API service
    this.esSecurityGroup = new SecurityGroup(this, "feather-sg-es", {
      allowAllOutbound: true,
      description: "ES access",
      vpc: this.vpc,
    });
    this.esSecurityGroup.addIngressRule(
      this.apiSecurityGroup,
      Port.tcp(443),
      "Allow from API service"
    );

    // RDS database instance (postgres)
    this.database = new DatabaseInstance(this, "feather-rds-postgres", {
      databaseName: "feather",
      engine: DatabaseInstanceEngine.POSTGRES,
      instanceClass: new InstanceType("t3.small"),
      instanceIdentifier: "feather-postgres",
      masterUsername: "voqOUqgrTcX6pEkS",
      // Grant access to VPC resources and explicitly allowed services
      securityGroups: [this.vpcSecurityGroup, this.rdsSecurityGroup],
      vpc: this.vpc,
    });

    // ECS cluster (Fargate services)
    this.cluster = new ecs.Cluster(this, "feather-cluster", {
      clusterName: "feather",
      vpc: this.vpc,
    });

    // Elasticsearch cluster
    this.elasticsearch = new elasticsearch.CfnDomain(this, "feather-es", {
      ebsOptions: {
        ebsEnabled: true,
        volumeSize: 10,
        volumeType: "gp2",
      },
      elasticsearchClusterConfig: {
        instanceCount: 1,
        instanceType: "t2.small.elasticsearch",
      },
      elasticsearchVersion: "7.1",
      vpcOptions: {
        // Grant access to VPC resources and explicitly allowed services
        securityGroupIds: [
          this.vpcSecurityGroup.securityGroupId,
          this.esSecurityGroup.securityGroupId,
        ],
        subnetIds: [this.vpc.publicSubnets[0].subnetId], // exactly 1
      },
    });

    // Outputs
    new CfnOutput(this, "DatabaseEndpoint", {
      value: this.database.instanceEndpoint.hostname,
    });
  }
}
