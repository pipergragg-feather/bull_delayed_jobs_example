#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EcsConstructStack } from '../lib/ecs_construct-stack';

const app = new cdk.App();
new EcsConstructStack(app, 'EcsConstructStack');
