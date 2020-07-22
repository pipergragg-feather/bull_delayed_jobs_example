import * as ec2 from "@aws-cdk/aws-ec2";
import {
  ISecurityGroup,
  IVpc,
  Port,
  SecurityGroup,
  Vpc,
} from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as rds from "@aws-cdk/aws-rds";
import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import { exportsProps, prop } from "../util/Props";
import { StackBase } from "../util/StackBase";
import * as ecr from "@aws-cdk/aws-ecr";
import { Variables } from '../util/Variables';

// Define the props this stack exports to other stacks
export interface IInfraStackProps extends StackProps {
  [key: string]: any;
  InfraStack: {
    apiALBSecurityGroup: ISecurityGroup;
    apiSecurityGroup: ISecurityGroup;
    esSecurityGroup: ISecurityGroup;
    cluster: ecs.ICluster;
    repository: ecr.Repository;
    database: rds.IDatabaseInstance;
    rdsSecurityGroup: ISecurityGroup;
    vpc: ec2.Vpc;
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
  public readonly cluster: ecs.Cluster;

  @prop
  public readonly repository: ecr.Repository;

  @prop
  public readonly esSecurityGroup: ISecurityGroup;

  @prop
  public readonly idALBSecurityGroup: ISecurityGroup;

  @prop
  public readonly vpc: IVpc;

  @prop
  public readonly vpcSecurityGroup: ISecurityGroup;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The VPC into which all resources will be deployed
    this.vpc = new Vpc(this, Variables.withSuffix("feather-vpc"), {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
    });

    // Security group granting access between VPC resources
    this.vpcSecurityGroup = new SecurityGroup(this, Variables.withSuffix("feather-sg-vpc"), {
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
    //     1. None
    this.apiSecurityGroup = new SecurityGroup(this, Variables.withSuffix("feather-sg-api"), {
      allowAllOutbound: true,
      description: "Traffic to/from API service",
      vpc: this.vpc,
    });

    // ECS cluster (Fargate services)
    this.cluster = new ecs.Cluster(this, Variables.withSuffix("feather-cluster"), {
      clusterName: "feather",
      vpc: this.vpc,
    });

    this.cluster.addCapacity('DefaultCapacity', {
      instanceType: new ec2.InstanceType("t2.medium"),
      desiredCapacity: 2
    })

    this.repository =  new ecr.Repository(this, Variables.withSuffix("WorkerRepository"), {repositoryName:  Variables.withSuffix("worker-repo")})
  }
}
