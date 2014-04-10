* start server command: 

	bin/devserver

* start redis command: 

	redis-server

* start mongodb command:

	mongod

* start mongo console:

	mongo

* create a mongo collection:

	db.createCollection('collection name')

* use a specific database in mongo:

	use chat-salon; (or other database/collection name)

* show all mongodb collections:

	db.getCollectionNames()

* to start in production mode:

	NODE_ENV=production node app.js

* use curl to test api calls

	curl http://localhost:3000/user/create -d {} (the -d option is for a post...ur passing a blank object as post data)


* to run all tests:

	npm test

------------------------------


REDIS

* to connect with redis on the server, execute this command

	redis-cli -h <db_url> -p 6379 -a <db_user>

* "keys *" - will show you all keys in your redis dataset



------------------------------

MONGODB

* show dbs - show all databases

* use <db_name> - use a database

* db.getCollectionNames() - show all collections in a database

* db.<collection_name>.find() - show all records for a given collection

* connect to a remote mongodb instance:

	mongo <db_address>/<database_id> -u <user_name> -p <pass>

* if connecting to the remote mongo instance, apparently "show dbs doesn't work"...use "show collections"

* dropping a database:

	- use <database name>;
	- db.dropDatabase();

------------------------------

WebRTC Tutorials

* webrtc signalling code: http://rtc.io/module-rtc-signaller.html
* simplewebrtc signal master: https://github.com/andyet/signalmaster
* processing webrtc stream: http://rtc.io/tutorial-simple-manipulation.html
* peerCDN found Ferros: http://www.linkedin.com/profile/view?id=30905766&locale=en_US&trk=tyah2&trkInfo=tas%3Afeross%2Cidx%3A1-1-1