import { IInfraStackProps } from "../core/InfraStack";
import { StackBase } from "./StackBase";

// Define the props that should be passed to each service stack
export type ServiceStackInputProps = IInfraStackProps

export abstract class ServiceStack extends StackBase {}
