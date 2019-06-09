taskforce:
	 npx taskforce -n "transcoder connection" -t 8da06e23-0841-4da8-b7ba-d534b448b45e
redis:
	docker run -dp 6379:6379 redis