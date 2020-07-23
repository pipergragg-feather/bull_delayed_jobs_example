import * as ec2 from "@aws-cdk/aws-ec2";
import {
  ISecurityGroup,
  IVpc,
  Port,
  SecurityGroup,
  Vpc
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
  InfraStack: {
    apiALBSecurityGroup: ISecurityGroup;
    apiSecurityGroup: ISecurityGroup;
    esSecurityGroup: ISecurityGroup;
    cluster: ecs.ICluster;
    repository: ecr.IRepository;
    database: rds.IDatabaseInstance;
    rdsSecurityGroup: ISecurityGroup;
    vpc: ec2.Vpc;
    vpcSecurityGroup: ISecurityGroup;
    vpcSecurityGroupName: string;
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
  public readonly repository: ecr.IRepository;

  @prop
  public readonly esSecurityGroup: ISecurityGroup;

  @prop
  public readonly idALBSecurityGroup: ISecurityGroup;

  @prop
  public readonly vpc: IVpc;

  @prop
  public readonly vpcSecurityGroup: ISecurityGroup;

  @prop 
  public readonly vpcSecurityGroupName: string;


  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The VPC into which all resources will be deployed
    this.vpc = new Vpc(this, Variables.withSuffix("feather-vpc"), {
      cidr: ec2.Vpc.DEFAULT_CIDR_RANGE,
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
        cidrMask: 24,
        name: 'ingress',
        subnetType: ec2.SubnetType.PUBLIC,
      },
      {
        cidrMask: 19,
        name: 'private',
        subnetType: ec2.SubnetType.PRIVATE,
      },
      {
        cidrMask: 28,
        name: 'rds',
        subnetType: ec2.SubnetType.ISOLATED,
      }
      ]
    });

    // https://github.com/Netflix/asgard/issues/336
    this.vpcSecurityGroupName = Variables.withSuffix("feather-sg-vpc")
    // Security group granting access between VPC resources
    this.vpcSecurityGroup = new SecurityGroup(this, Variables.withSuffix("feather-sg-vpc"), {
      allowAllOutbound: true,
      vpc: this.vpc,
      securityGroupName: this.vpcSecurityGroupName
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
      clusterName: Variables.withSuffix("feather"),
      vpc: this.vpc,
    });

    this.cluster.addCapacity('DefaultCapacity', {
      instanceType: new ec2.InstanceType("t2.medium"),
      desiredCapacity: 2
    })
    
  
    // this.repository =  new ecr.Repository(this, Variables.withSuffix("WorkerRepository"), {repositoryName:  Variables.withSuffix("worker-repo")})

    this.repository = ecr.Repository.fromRepositoryName(
      this,
      Variables.withSuffix("WorkerRepository"),
      Variables.withSuffix("worker-repo")
    );
  }
}