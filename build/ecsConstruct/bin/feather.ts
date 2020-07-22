#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { InfraStack } from "../lib/core/InfraStack";
import {BackgroundJobs, BackgroundJobsInputProps} from '../lib/service/workers/BackgroundJobs'
import { Variables } from '../lib/util/Variables';

const app = new cdk.App();

const sharedStackProps = {env: {region: Variables.region()}}

// Shared infrastructure
const infraStack = new InfraStack(app, "infra", sharedStackProps);

// Props to pass to services
const workerStackInputProps: BackgroundJobsInputProps = {
  ...infraStack.getProps(),
  ...sharedStackProps
};

new BackgroundJobs(app, Variables.withSuffix("worker"), workerStackInputProps);
