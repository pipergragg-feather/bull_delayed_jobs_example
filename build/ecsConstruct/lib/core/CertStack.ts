import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import { exportsProps, prop } from "../util/Props";
import { StackBase } from "../util/StackBase";
import { IInfraStackProps } from "./InfraStack";
import * as certmgr from "@aws-cdk/aws-certificatemanager";
import { ICertificate } from "@aws-cdk/aws-certificatemanager";

// Define the props that should be passed to this stack
export type CertStackInputProps = IInfraStackProps;

// Define the props this stack exports to other stacks
export interface ICertStackProps extends StackProps {
  [key: string]: any;
  CertStack: {
    prod: ICertificate;
  };
}

@exportsProps()
export class CertStack extends StackBase {
  @prop
  public readonly prod: certmgr.ICertificate;

  constructor(scope: cdk.Construct, id: string, props?: CertStackInputProps) {
    super(scope, id, props);

    // Import the SSL certificate for the stack
    // NOTE:
    //  For simplicity, the certificate was created *outside* of IaC (i.e.: by some system
    //  administrator). Rest assured it is entirely possible to provision certificates from
    //  within IaC code, as might be necessary when building ephemeral environments for
    //  which SSL support is desirable.
    this.prod = certmgr.Certificate.fromCertificateArn(
      this,
      "cert-prod",
      "arn:aws:acm:us-east-2:<REST_OF_CERTIFICATE_ARN>"
    );
  }
}
