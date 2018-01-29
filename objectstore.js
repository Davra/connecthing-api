
function requestWrapper(opts){
  const cb = opts.callback
  opts.credentials = 'include'

  fetch(opts.url, opts)
  .then(r=>new Promise(function(resolve, reject) {
      r.statusCode = r.status
      if("Created" === r.statusText || "PUT" === opts.method || 204 === r.status){
        resolve([r])
      }else{
        r.json().then(t=>resolve([r,t]))
      }

}))
.then(([r,text])=>cb(null,r,text))
.catch(e=>cb(e))
}


function create(api){

var slash = /\//;
var existingDocuments = {}
function apiRequestPromise(scr,address,method="GET",data=undefined){


  const dropME = !!((method === "DROP") && (method = "DELETE"))

  if(dropME && address.search(slash) >= 0){
    throw new Error("You cant drop a collection that contants a slash: "+address)
  }

  address = address+""
  const rootaddress = address.split("/")[0]
  return new Promise(function(resolve, reject) {

    if(!!existingDocuments[rootaddress]){
      /*
      if(rootaddress === address && method === "DELETE"){
        //debugger
        //existingDocuments = existingDocuments.filter(add => add !== rootaddress)
        delete existingDocuments[rootaddress]
      }*/
    }
    else if(method === "POST" ){//if(method !== "GET" ){
        apiRequestPromise(scr,address)
        .then(coll=>{
          if(Array.isArray(coll)){
            //existingDocuments.push(rootaddress)
            existingDocuments[rootaddress] = existingDocuments[rootaddress] || true
            return true

          }else if(undefined === coll){
            return apiRequestPromise(scr,address,"PUT")
          } else {
            throw new Error("Unknown collation type:"+JSON.stringify(coll))
          }
        })
        .then(()=>apiRequestPromise(scr,address,method,data))
        .then(resolve)
        .catch(reject)
        return
    }

    const headers = {
      'content-type' : 'application/json',
    }

    if(dropME){
      if("string" === typeof existingDocuments[rootaddress]){
        headers['If-Match'] = existingDocuments[rootaddress];
          delete existingDocuments[rootaddress];
      }else {
         apiRequest.read(rootaddress) //get will set the "if-match"
                         .then(coll => coll && apiRequest.drop(rootaddress))
                         .then(resolve)
        return
      }
    }

    api({
      body:JSON.stringify(data),
      url: `/api/v1/${scr}/${address}`,
      method:method,
      headers: headers,
      callback: function(err, response, body){
        if(err){
          reject(err)
        } else {

          if(body && "string" === typeof body){
            body = JSON.parse(body)
          }
/*
          if(method === "PUT" && !existingDocuments.includes(rootaddress)){
            existingDocuments.push(rootaddress)
          }
*/
           if(response.statusCode === 404){
            resolve(undefined)
          }else if(method === "DELETE"||method === "PUT"){
              resolve(true)
          } else if(method === "POST" || undefined === body){
            const doc = JSON.parse(JSON.stringify(data))
            doc._etag = {$oid :response.headers.etag || response.headers.get("etag")}
            doc._id = {$oid : (response.headers.location || response.headers.get("location") || address).split("/").pop() }
            doc.toString = ()=>address+"/"+doc._id.$oid
            doc.update = ()=> apiRequest.replace(doc+"",doc)
            resolve(doc)

          }else if(undefined !== body._returned){

            if(body._etag && body._etag.$oid){
              existingDocuments[rootaddress] = body._etag.$oid
            }

            if(body._embedded)
            resolve(body._embedded["rh:doc"].map(doc=>{
              doc.toString = ()=>address+"/"+doc._id.$oid;
              doc.update = ()=> apiRequest.replace(doc+"",doc).then(()=>doc)
              return doc
            }))
            else
            resolve([])
          }else{
            body.toString = ()=>rootaddress+"/"+body._id.$oid
            body.update = ()=> apiRequest.replace(address,body).then(()=>body)
            resolve(body)
          }
        }// END else
      }// END callback
    });

  },data);
}
const apiRequest = {
  read:(address)=>apiRequestPromise("objectstore",address),
  add:(address,data)=>apiRequestPromise("objectstore",address,"POST",data),
  replace:(address,data)=>apiRequestPromise("objectstore",address,"PUT",data),
  remove:(address,data)=>apiRequestPromise("objectstore",address,"DELETE",data),
  drop:(address)=>apiRequestPromise("objectstore",address,"DROP")
}
return apiRequest
}
if (typeof exports === 'object') {
    module.exports = create(require("./request"));
} else {
    window.objectstore = create(requestWrapper);
}
