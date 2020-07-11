#! make

deploydir='/mnt/ext250/web-apps/cbg.rik.ai'

clean:
	rm -rf client/build
	rm -rf server/build

build:
	cd client && npm run build

move:
	mv client/build server

prep: clean build move

# just run this once
nginxSetup:
	scp devops/cbg.rik.ainginx root@dc.rik.ai:/etc/nginx/sites-enabled/
	echo "testing config:"
	ssh root@rik.ai "sudo nginx -t"
	echo "restarting nginx"
	ssh root@rik.ai "sudo nginx -t && sudo systemctl restart nginx"
	echo "now run certbot --nginx and follow the prompts"

firstDeploy:
	# make deploy dir
	ssh root@rik.ai "mkdir -p ${deploydir}"

sync:
	rsync -avi server/ root@rik.ai:${deploydir}
	echo "done"


fixPermissions:
	find server/static -type d -exec chmod 755 {} \;
	find server/static -type f -exec chmod 644 {} \;

renewCert:
	certbot certonly -n -d cbg.rik.ai --nginx

tailNginx:
	ssh root@rik.ai "tail -f /var/log/nginx/*log"

