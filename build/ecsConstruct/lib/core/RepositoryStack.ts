import * as ecr from "@aws-cdk/aws-ecr";
import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import { exportsProps, prop } from "../util/Props";
import { StackBase } from "../util/StackBase";
import { IInfraStackProps } from "./InfraStack";

// Define the props that should be passed to this stack
export type RepositoryStackInputProps = IInfraStackProps;

// Define the props this stack exports to other stacks
export interface IRepositoryStackProps extends StackProps {
  [key: string]: any;
  RepositoryStack: {
    api: ecr.Repository;
  };
}

@exportsProps()
export class RepositoryStack extends StackBase {
  @prop
  public readonly api: ecr.IRepository;

  constructor(
    scope: cdk.Construct,
    id: string,
    props?: RepositoryStackInputProps
  ) {
    super(scope, id, props);

    // Reference to existing API repository in ECR
    this.api = ecr.Repository.fromRepositoryName(
      this,
      "repo-api",
      "feather/api"
    );
  }
}
