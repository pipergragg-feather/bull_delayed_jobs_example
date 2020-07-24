#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { InfraStack } from "../lib/core/InfraStack";
import {Worker, WorkerInputProps} from '../lib/service/workers/Worker'
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
const workerStackInputProps: WorkerInputProps = {
  ...infraStack.getProps(),
  ...persistenceStack.getProps(),
  ...sharedStackProps
};

new Worker(app, "worker", workerStackInputProps);
