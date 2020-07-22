import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import { exportsProps, prop } from "../util/Props";
import { StackBase } from "../util/StackBase";
import { IInfraStackProps } from "./InfraStack";
import { Queue } from "@aws-cdk/aws-sqs";

// Define the props that should be passed to this stack
export type QueueStackInputProps = IInfraStackProps;

// Define the props this stack exports to other stacks
export interface IQueueStackProps extends StackProps {
  [key: string]: any;
  QueueStack: {
    messageQueue: Queue;
  };
}

@exportsProps()
export class QueueStack extends StackBase {
  @prop
  public readonly messageQueue: Queue;

  constructor(scope: cdk.Construct, id: string, props?: QueueStackInputProps) {
    super(scope, id, props);

    // Create a standard SQS queue for holding messages for workers
    this.messageQueue = new Queue(this, "message-queue");
  }
}
