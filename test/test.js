var connecthingapi = require("../index.js");

connecthingapi.request({
	url: "/api/v1/devices"
}, function(err, resp, body){
	if(err){
		console.error("Error making request to connecthing api: " + err.stack);
		process.exit(1);
	}

	console.log("Call to devices api: " + resp.statusCode);
	console.dir(body);
	process.exit(0);
});