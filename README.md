# Simple authenticated proxy

1. `cp .env-default .env``
2. modify .env file according to proxy requirements, `REDIRECT_*` variables are for where to redirect the incoming request
3. `docker-compose up -d`