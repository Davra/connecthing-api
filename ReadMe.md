# connecthing-api

[![npm version](https://badge.fury.io/js/%40connecthing.io%2Fconnecthing-api.svg)](https://badge.fury.io/js/%40connecthing.io%2Fconnecthing-api) [![CDN link](https://img.shields.io/badge/CDN_link-api:_objectstore-red.svg)](https://cdn.jsdelivr.net/npm/@connecthing.io/connecthing-api@latest/objectstore.min.js)

connecthing-api offers two module. **[objectstore](#objectstore)** to create, read, update and delete with the [connecthing objectstore](http://help.connecthing.io/#/widget-ide?id=storage-using-objectstore) and **[request](#request)** for making Rest calls between microservices

## objectstore

The `objectstore` object allows you to perform CRUD operations on the [connecthing objectstore](http://help.connecthing.io/#/widget-ide?id=storage-using-objectstore).
With each call a javascript [promise] will be returned.

This module shares the same function api across node microservices and javascript widget.

The support operations are:

* **read**: get a collection or document from a collection ( `address` )
* **add**: insert a new document into a collection ( `address` , `js_object` ),
* **replace**: replace a document in a collection ( `address` ,` js_object` ),
* **remove**: remove a document in a collection ( `address` ),
* **drop**: delete a collection( `address` )

> The `address` can be a `String` or `objectStore_Object`(as return from an objectstore promise)
> The `js_object` should be a javacript `object`

### Examples

#### microservices - setup for exampels
```js
// get objectstore helper
const { objectstore } = require("connecthing-api")
// some data to save
const myMobileSensor = { device:123, name:"mobile sensor" }
```

#### widget - setup for exampels
```html
<script src="https://cdn.jsdelivr.net/npm/@connecthing.io/connecthing-api@latest/objectstore.min.js"></script>
<script>
  const myMobileSensor = { device:123, name:"mobile sensor" }
</script>
```

### Using objectstore:

#### add an object to the store

```js
objectstore.add("sensors",myMobileSensor)
.then( objectStore_MyMobileSensor => {
  console.log("your sensor has been added to the objectstore")
})
```

### get all values from a collection
```js
objectstore.read("sensors")
.then( objectStore_Sensors => {
  console.log("You have " objectStore_Sensors.length " sensors in the objectstore")
})
```

### get a value from a collection
```js
// if you know the objectstore id

objectstore.read("sensors/5a6f0d713174acbdfd07eabe")
.then( objectStore_Sensor => {
  console.log("Your sensor:"+JSON.stringify(objectStore_Sensor))
})
```

### to update the value in a collection
```js
objectstore.read("sensors/5a6f0d713174acbdfd07eabe")
.then( objectStore_Sensor => {
  objectStore_Sensor.owner = "John"
  return objectStore_Sensor.update()
})
.then(objectStore_Sensor=>{
  console.log("sensor updated")
})
```

### to remove value in a collection
```js
objectstore.read("sensors")
.then( objectStore_Sensors => {
  // find your device
  const johnsSensor = objectStore_Sensor.find(sensor => sensor.owner = "John")

  // remove your device
  return objectstore.remove(johnsSensor)
})
.then(()=>{
  console.log("sensor remove")
})
```

### to remove a collection
```js
objectstore.drop("sensors")
.then(()=>{
  console.log("sensors deleted!")
})
```



## request

The *"request"* module is for making Rest calls between microservices.

```js
const { request } = require("connecthing-api")

request({
	url: "/api/v1/devices"
}, function(err, resp, body){
	if(err){
		throw new Error("Error making request to connecthing api: " + err.stack);
	}

	console.log("Call to devices api: " + resp.statusCode);
	console.dir(body);
});
```

[promise]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises
