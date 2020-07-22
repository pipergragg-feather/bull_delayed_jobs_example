import { IInfraStackProps } from "../core/InfraStack";
import { ICertStackProps } from "../core/CertStack";
import { IRepositoryStackProps } from "../core/RepositoryStack";
import { IQueueStackProps } from "../core/QueueStack";
import { StackBase } from "./StackBase";

// Define the props that should be passed to each service stack
export type ServiceStackInputProps = IInfraStackProps &
  ICertStackProps &
  IRepositoryStackProps &
  IQueueStackProps;

export abstract class ServiceStack extends StackBase {}
