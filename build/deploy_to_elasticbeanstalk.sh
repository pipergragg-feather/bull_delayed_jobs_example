#!/usr/bin/env bash

# Exit script if you try to use an uninitialized variable.
set -o nounset
# Exit script if a statement returns a non-true return value.
set -o errexit
# Use the error status of the first failure, rather than that of the last item in a pipeline.
set -o pipefail

CURRENT_DIRECTORY=$(pwd)
cd $1

eb init --platform Node.js --region us-west-1 $EB_APPLICATION_NAME --profile eb-cli
eb use $EB_ENVIRONMENT --profile eb-cli

# Labels cannot contain `/` chars
BRANCH=$(echo $CIRCLE_BRANCH | tr "/" "-")
while [ $(eb status $EB_ENVIRONMENT | grep "Status" | cut -f2 -d":") != "Ready" ]
do
echo "Waiting for $EB_ENVIRONMENT to be ready for deploy...";
sleep 15s;
done
eb deploy -v --staged --profile eb-cli --timeout 60 --message $CIRCLE_SHA1 --label $CIRCLE_SHA1-${CIRCLE_TAG:=tag}-$BRANCH

cd $CURRENT_DIRECTORY
