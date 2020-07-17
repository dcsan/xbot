#! make

deployDir='/mnt/ext250/web-apps/cbg.rik.ai'
login=root@rik.ai

login:
	ssh ${login}

# just run this once
nginxSetup:
	scp devops/cbg.rik.ai.nginx ${login}:/etc/nginx/sites-enabled/
	# echo "testing config:"
	ssh ${login} "sudo nginx -t"
	# echo "restarting nginx"
	ssh ${login} "sudo nginx -t && sudo systemctl restart nginx"

firstDeploy:
	# make deploy dir
	ssh ${login} "mkdir -p ${deployDir}"

pm2first:
	ssh ${login} "cd ${deployDir} && NODE_ENV=production pm2 --name=cbg start server.js"

pm2restart:
	ssh ${login} "pm2 restart cbg"

pm2logs:
	ssh ${login} "pm2 logs cbg"

clean:
	rm -rf client/build
	rm -rf server/build

# image files can have wrong permissions when copied from internet
fixPermissions:
	# directories 755
	find server/cdn -type d -exec chmod 755 {} \;
	# files 644
	find server/cdn -type f -exec chmod 644 {} \;

build: clean fixPermissions
	cd client && npm run build

move:
	mv client/build server

prep: clean build move

sync: fixPermissions
	rsync -avi --delete \
		server/ ${login}:${deployDir}

	echo "done"

deploy: prep sync pm2restart

renewCert:
	certbot certonly -n -d cbg.rik.ai --nginx

tailNginx:
	ssh ${login} "tail -f /var/log/nginx/*log"

testDeploy:
	curl http://cbg.rik.ai/assets/items/chest-closed.png

testLocalImages:
	curl http://localhost:33010/cdn/assets/items/key.png

