#!/usr/bin/env node
import 'source-map-support/register';

const deployEnv = process.env.DEPLOY_ENV || "QA";
const region = 'us-west-1'
// const app = new cdk.App();


// new EcsConstructStack(app, `WorkerStack-${deployEnv}`, {env: {region}});

import * as cdk from "@aws-cdk/core";
import "source-map-support/register";
import { InfraStack } from "../lib/core/InfraStack";
import { RepositoryStack } from "../lib/core/RepositoryStack";
import { ServiceStackInputProps } from "../lib/util/ServiceStack";
import { CertStack } from "../lib/core/CertStack";
import {BackgroundJobs, BackgroundJobServiceInputProps} from '../lib/service/workers/BackgroundJobs'
import { worker } from 'cluster';

require("dotenv").config();

const app = new cdk.App();

// Shared infrastructure
const infraStack = new InfraStack(app, "infra");

// SSL Certificates
const certStack = new CertStack(app, "certs");

// ECR repositories
const repoStack = new RepositoryStack(app, "repos");

// Props to pass to services
const serviceProps: ServiceStackInputProps = {
  ...infraStack.getProps(),
  ...certStack.getProps(),
  ...repoStack.getProps(),
};

// API
const workerStackInputProps: BackgroundJobServiceInputProps = {
  ...serviceProps,
};

const workerStack = new BackgroundJobs(app, "worker", workerStackInputProps);
