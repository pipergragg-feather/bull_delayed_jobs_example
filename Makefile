.PHONY: build

aws_account_id=981204492539
aws_region=us-west-1
environment=qa 

taskforce:
	 npx taskforce -n "transcoder connection" -t eb6d571c-1a0e-496f-9162-d0acfc170eb1
redis:
	docker run -dp 6379:6379 redis

# https://docs.datadoghq.com/agent/docker/?tab=standard 
monitoring:
	DOCKER_CONTENT_TRUST=1 docker run \
	-d --name dd-agent \
	-v /var/run/docker.sock:/var/run/docker.sock:ro \
	-v /proc/:/host/proc/:ro \
	-v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
	-e DD_API_KEY="89f02f00ee72014ba8f878db4729c6e1" \
	-e DD_ENV="development" \
	-e DD_DOGSTATSD_NON_LOCAL_TRAFFIC=true \
	-e DD_SERVICE="worker" \
	-e DD_VERSION="7" \
	-p 8125:8125/udp \
	datadog/agent:latest 

deploy_eb:
	EB_APPLICATION_NAME=worker EB_ENVIRONMENT=worker-$(environment) CIRCLE_BRANCH=feature/deploy CIRCLE_SHA1=$(shell git rev-parse HEAD) BRANCH=feature/deploy CIRCLE_TAG=$(environment) bash build/deploy_to_elasticbeanstalk.sh .

# 1 Deploy infra stack
# 2 Push image to ECR 
# 3 Deploy ECR stack 
deploy_fargate:
	cd build/ecsConstruct && \
	npm run cdk deploy infra && \
	cd ../.. &&\
	$(MAKE) push_ecr && \
	cd build/ecsConstruct && \
	npm run cdk deploy worker-qa

# Find accountId using $aws sts get-caller-identity 
push_ecr:
	$(MAKE) build && $(MAKE) login && docker tag worker_$(environment) $(aws_account_id).dkr.ecr.$(aws_region).amazonaws.com/worker-repo-$(environment) && docker push $(aws_account_id).dkr.ecr.$(aws_region).amazonaws.com/worker-repo-$(environment)

login: 
	aws ecr get-login-password --region $(aws_region) | docker login --username AWS --password-stdin 981204492539.dkr.ecr.$(aws_region).amazonaws.com

build:
	docker build . -t worker_$(environment)