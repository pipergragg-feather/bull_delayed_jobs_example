#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { InfraStack } from "../lib/core/InfraStack";
import {BackgroundJobs, BackgroundJobsInputProps} from '../lib/service/workers/BackgroundJobs'
import { Variables } from '../lib/util/Variables';
import { PersistenceStack } from '../lib/core/PersistenceStack';

const app = new cdk.App();

const sharedStackProps = {env: {region: Variables.region()}}

// Shared infrastructure
const infraStack = new InfraStack(app, "infra", sharedStackProps);

const persistenceStackInputProps = {
  ...infraStack.getProps(),
  ...sharedStackProps
}

const persistenceStack = new PersistenceStack(app, "persistence", persistenceStackInputProps)

// Props to pass to services
const workerStackInputProps: BackgroundJobsInputProps = {
  ...infraStack.getProps(),
  ...persistenceStack.getProps(),
  ...sharedStackProps
};

new BackgroundJobs(app, "worker", workerStackInputProps);
