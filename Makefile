.PHONY: build

aws_account_id=981204492539
aws_region=us-west-1
environment=qa 
local_tag=worker_$(environment)
ecr_tag=$(aws_account_id).dkr.ecr.$(aws_region).amazonaws.com/worker-repo-$(environment)

# 1 Deploy infra stack
# 2 Push image to ECR 
# 3 Deploy ECR stack 
deploy:
	cd build/ecsConstruct && \
	tsc && \
	npm run cdk deploy infra && \
	npm run cdk deploy persistence && \
	cd ../.. &&\
	$(MAKE) push && \
	cd build/ecsConstruct && \
	npm run cdk deploy worker

destroy:
	cd build/ecsConstruct && \
	tsc && \
	npm run cdk destroy infra persistence worker && \
	cd ../.. 

taskforce:
	npx taskforce -n "transcoder connection" -t eb6d571c-1a0e-496f-9162-d0acfc170eb1


# Find accountId using $aws sts get-caller-identity 
push:
	$(MAKE) build && $(MAKE) login && docker tag $(local_tag) $(ecr_tag) && docker push $(ecr_tag)

login: 
	aws ecr get-login-password --region $(aws_region) | docker login --username AWS --password-stdin $(aws_account_id).dkr.ecr.$(aws_region).amazonaws.com

build:
	docker build . -t $(local_tag)