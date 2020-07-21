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

deploy:
	EB_APPLICATION_NAME=worker EB_ENVIRONMENT=worker-qa CIRCLE_BRANCH=feature/deploy CIRCLE_SHA1=fakesha5 BRANCH=feature/deploy CIRCLE_TAG=qa bash build/deploy_to_elasticbeanstalk.sh .