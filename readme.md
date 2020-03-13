## Bull Delayed Jobs Proof of Concept

This project allows you to spin up multiple workers which can be seen on a taskforce dashboard. 

### Getting started

`make redis || true`

`npm i`

`tsc`

[in terminal window 1] `npm run process`

[in terminal window 2] `npm run produce`

Make an account at https://taskforce.sh/ 

Copy your API token into the taskforce command in the Makefile 

Run `make taskforce`