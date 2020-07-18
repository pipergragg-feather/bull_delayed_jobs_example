## Bull Delayed Jobs Proof of Concept

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