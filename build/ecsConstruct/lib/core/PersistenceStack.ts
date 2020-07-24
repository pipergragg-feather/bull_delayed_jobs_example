import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import { exportsProps, prop } from "../util/Props";
import { StackBase } from "../util/StackBase";
import { Variables } from '../util/Variables';
import * as elasticache from "@aws-cdk/aws-elasticache"
import { IInfraStackProps } from './InfraStack';

// Define the props this stack exports to other stacks
export interface IPersistenceStackProps extends StackProps {
  PersistenceStack: {
    workerRedisCluster: elasticache.CfnCacheCluster
  };
}

@exportsProps()
export class PersistenceStack extends StackBase {

  @prop
  private readonly workerRedisCluster: elasticache.CfnCacheCluster

  constructor(scope: cdk.Construct, id: string, props: IInfraStackProps) {
    super(scope, id, props);
    
    const cacheSubnetGroup = new elasticache.CfnSubnetGroup(
            this,
            Variables.withSuffix('worker-redis-subnet-group'),
            {
              subnetIds: props.InfraStack.vpc.privateSubnets.map((s) => s.subnetId), 
              description: 'Subnet group for redis',
              cacheSubnetGroupName: "private-subnets-for-redis"
            }
        )
        
    // When working with cloudFormation resources,
    // we use .ref instead of assigning directly.
    // [AZMode, CacheSubnetGroupName, SecurityGroupIds, PreferredAvailabilityZones, SnapshotArns, SnapshotRetentio
// nLimit, SnapshotWindow, Tags] cannot be specified along with CacheSecurityGroupNames,
// TODO -> Make this workerRedisCluster part of a stack that is created later 
// because it depends on the vpcSecurityGroup
    this.workerRedisCluster = new elasticache.CfnCacheCluster(
            this,
            Variables.withSuffix('worker-redis'), {
              engine: 'redis',
              cacheNodeType: 'cache.t2.medium',
              numCacheNodes: 1, // Can only be 1 if engine is redis
              cacheSubnetGroupName: cacheSubnetGroup.ref,
              // cacheSecurityGroupNames: [props.InfraStack.vpcSecurityGroupName],
              vpcSecurityGroupIds: [props.InfraStack.vpcSecurityGroup.securityGroupId]
            }
            
        )

    // new CfnOutput(this, "ApiEndpoint", {
    //   value: lb.loadBalancerDnsName,
    // });

    this.workerRedisCluster.addDependsOn(cacheSubnetGroup)
  }
}