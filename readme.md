## Bull Delayed Jobs Proof of Concept

# TODO 
- inject env variables on container start, including REDIS_HOST 
- figure out which env variables should be private and confirm they are injected in the same way 
- ensure datadog logging works in dev 
- ensure datadog logging works in QA 
    - https://docs.datadoghq.com/integrations/ecs_fargate/ 
    - https://app.datadoghq.com/dashboard/rmq-p5k-2nz/pipers-timeboard-20-jul-2020-1639?from_ts=1595284348176&live=true&to_ts=1595457148176
- find out how to run task continuously (or if necessary on a schedule)
    - https://github.com/aws/aws-cdk/blob/v1.54.0/packages/%40aws-cdk/aws-ecs-patterns/lib/base/scheduled-task-base.ts
    - https://github.com/aws/aws-cdk/blob/v1.54.0/packages/@aws-cdk/aws-ecs-patterns/lib/fargate/scheduled-fargate-task.ts#L79
    
This project allows you to spin up multiple workers which can be seen on a taskforce dashboard. 

### Getting started

`make redis || true`

`npm i`

`tsc`

`npm run process`

Optionally, if you want worker stats:

`cd tick && docker-compose up`

then open up http://localhost:8888 in Chrome for Chronograf. Or http://localhost:3000 if you prefer Grafana. 

OR: 

Make an account at https://taskforce.sh/ 

Copy your API token into the taskforce command in the Makefile 

Run `make taskforce`


## See also 
https://github.com/influxdata/TICK-docker/blob/master/1.3/docker-compose.yml