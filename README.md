## Coffee Break Games

### Deploying

[Makefile](Makefile) has various deploy scripts

`server/build` is where the built files the client go before deploying

if you update/deploy the nginx script,
you might need to run certbot on the server again
check the certificate is in the correct place

### Notes

- NgInx permissions
https://www.ionos.com/community/server-cloud-infrastructure/nginx/solve-an-nginx-403-forbidden-error

- try_files
https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/#trying-several-options

