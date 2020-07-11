clean:
	rm -rf client/build
	rm -rf server/build

build:
	cd client && npm run build

move:
	mv client/build server

prep: clean build move
