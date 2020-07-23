import { IInfraStackProps } from "../core/InfraStack";
import { StackBase } from "./StackBase";
import { IPersistenceStackProps } from '../core/PersistenceStack';

// Define the props that should be passed to each service stack
export type ServiceStackInputProps = IInfraStackProps & IPersistenceStackProps

export abstract class ServiceStack extends StackBase {}
