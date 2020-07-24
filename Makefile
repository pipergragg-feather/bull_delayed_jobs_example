.PHONY: build

aws_account_id=981204492539
aws_region=us-west-1
environment=qa 
local_tag=worker_$(environment)
ecr_tag=$(aws_account_id).dkr.ecr.$(aws_region).amazonaws.com/worker-repo-$(environment)

start:
	export UID=$(shell id -u) && \
	export GID=$(shell id -g) && \
	export DD_API_KEY=89f02f00ee72014ba8f878db4729c6e1 && \
	docker-compose up 

tsc:
	sudo rm -rf ./dist && tsc

diff:
	cd build/ecsConstruct && \
	tsc && \
	cdk diff


# 1 Deploy [infra, persistence] stacks
# 2 Push image to ECR 
# 3 Deploy [worker] stack 
deploy:
	cd build/ecsConstruct && \
	tsc && \
	cdk deploy infra && \
	cdk deploy persistence && \
	cd ../.. &&\
	$(MAKE) push && \
	cd build/ecsConstruct && \
	cdk deploy worker

destroy:
	cd build/ecsConstruct && \
	tsc && \
	npm run cdk destroy infra persistence worker && \
	cd ../.. 

taskforce:
	npx taskforce -n "transcoder connection" -t bfccdd4c-3052-4e38-9e66-5ad99f288d75


# Find accountId using $aws sts get-caller-identity 
push:
	$(MAKE) build && $(MAKE) login && docker tag $(local_tag) $(ecr_tag) && docker push $(ecr_tag)

login: 
	aws ecr get-login-password --region $(aws_region) | docker login --username AWS --password-stdin $(aws_account_id).dkr.ecr.$(aws_region).amazonaws.com

build:
	docker build . -t $(local_tag)