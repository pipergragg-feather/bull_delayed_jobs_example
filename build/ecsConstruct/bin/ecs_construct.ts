#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsConstructStack } from '../lib/ecs_construct-stack';

const deployEnv = process.env.DEPLOY_ENV || "QA";
const region = 'us-west-1'
const app = new cdk.App();


new EcsConstructStack(app, `WorkerStack-${deployEnv}`, {env: {region}});
