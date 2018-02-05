const rq = require("request");
const fs = require("fs");

var token = null;

function request(opts, cb){

	if(!token){
		token = fs.readFileSync("/etc/connecthing-api/token");
	}

	if(opts.url.indexOf("/") == 0){
		opts.url = "http://api.connecthing" + opts.url;
	}
	opts.headers = opts.headers || {};
	opts.headers["Authorization"] = "Bearer " + token;
	delete opts.auth;
	return rq(opts, cb||opts.callback);
}

module.exports = request
