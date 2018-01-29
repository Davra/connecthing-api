
const collectionName = "objectstore_test"

function compare(o1, o2){

  const o1Keys = Object.keys(o1)
  const o2Keys = Object.keys(o2)

  if(o1Keys.length !== o2Keys.length){
    return false
  }

  return ! o1Keys.map( prop => {

      if( typeof o2[prop] === typeof o1[prop]){
        if("object" === typeof o1[prop] // is object
        && !Array.isArray(o1[prop])     // not array
        && ! compare(o1[prop], o2[prop])){ //is diffent
          return false
        }
        return JSON.stringify(o1[prop]) === JSON.stringify(o2[prop])
      }
      return false

  }).some(val => false)

};

const tests = [

//++++++++++++++ try and get a non-existing collection
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next => {
  console.log("try and get a non-existing collection")
  objectstore.read(collectionName)
                   .then(coll=>{
                     if("undefined" === typeof coll){
                       console.log("✓");
                       next()
                     } else {
                       console.log("✗");
                     }
              })
},

//+++++++++ add the first document to a new collection
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
  console.log("add the first document to a new collection")
  objectstore.add(collectionName,{name:"tom"})
    .then(user=>{
      // check the retured object
      if("tom" === user.name
      && "function" === typeof user.update
      && user.toString() !== "[object Object]"){
        return user
      } else {
        return false
      }
    })
    .then( user => {
      if(!user){
        console.log("✗")
        return
      }
      // if retured object is ok. check against server
      objectstore.read(user+"").then(serverUser =>{

        if(compare(user,serverUser)){
          console.log("✓");
          next()
        } else { console.log("✗"); }
      }).catch(console.error)

    })
    .catch(console.error)
},

//++++++++++++++++++++ all documents from a collection
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
  console.log("all documents from a collection")
  objectstore.read(collectionName)
                   .then(coll=>{
                     if(Array.isArray(coll)
                     && 1 === coll.length
                     && "tom" === coll[0].name){
                       console.log("✓");
                       next()
                     } else {
                       console.log("✗");
                     }
              })

},

//++++++++++++++++++++ update a document with 'update'
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("update a document with 'update'")

objectstore.read(collectionName)
                 .then(([user])=>{

                   user.age = 46
                   user.name = "tommy"
                   user.update()
                       .then(()=>objectstore.read(user+""))
                       .then(serverUser => {

                         //if(JSON.stringify(user) === JSON.stringify(serverUser)){
                         if(compare(user,serverUser)){
                           console.log("✓");
                           next()
                         } else { console.log("✗"); }
                       }).catch(console.error)
                 })
},

//+++++++++++++++++++ update a document with 'replace'
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("update a document with 'replace'")

objectstore.read(collectionName)
                 .then(([user])=>{

                   user.age = 47

                   objectstore.replace(collectionName+"/"+user._id.$oid,user)
                       .then(()=>objectstore.read(user+""))
                       .then(serverUser => {

                         //if(JSON.stringify(user) === JSON.stringify(serverUser)){
                          if(compare(user,serverUser)){
                           console.log("✓");
                           next()
                         } else { console.log("✗"); }
                       }).catch(console.error)
                 })
},

//++++++++++++++++ try and get a non-existing document
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("try and get a non-existing document")

objectstore.read(collectionName+"/something")
            .then(something=>{

             if("undefined" === typeof something){
               console.log("✓");
               next()
             } else {
               console.log("✗");
             }
      })
},

//+++++++++++++++++++++++++++++++++ add a 2nd document
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("add a 2nd document")

const localUser = {name:"ann",age:29}

objectstore.add(collectionName,localUser)
            .then(user=>{

             //if(JSON.stringify(user) === JSON.stringify(localUser)
              if(user.name === localUser.name
                && user.age === localUser.age
                && localUser !== user){
               return user
             } else {
               return false
             }
      }).then(user=>{

          if(user){
            objectstore.read(user)
                        .then(serverUser=>{
                            //if(JSON.stringify(user) === JSON.stringify(serverUser)
                            if(compare(user,serverUser)
                            && serverUser !== user){
                              console.log("✓");
                              next()
                            } else {
                              console.log("✗");
                            }
                        }).catch(console.error)
          } else {
            console.log("✗");
          }
      }).catch(console.error)
},

//++++++++++++++++++++++ remove a document by 'object'
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("remove a document by 'object'")

objectstore.read(collectionName)
          .then(coll=>{
            const domumentPath = coll[0]+"";
            objectstore.remove(coll[0])
                       .then(()=>objectstore.read(domumentPath))
                       .then(doc=> {
                         if(undefined === doc){
                           console.log("✓");
                           next()
                         } else {
                           console.log("✗");
                         }
                       })

          })

},

//++++++++++++++++++++++++ remove a document by 'path'
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("remove a document by 'path'")

objectstore.read(collectionName)
          .then(coll=>{
            const domumentPath = coll[0]+"";
            objectstore.remove(domumentPath)
                       .then(()=>objectstore.read(domumentPath))
                       .then(doc=> {
                         if(undefined === doc){
                           console.log("✓");
                           next()
                         } else {
                           console.log("✗");
                         }
                       })

          })

},

//++++++++++++++++++++++++++++++
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
  console.log("throw when a collection name is bad")
  try{
    objectstore.drop("foo/bar")
    console.log("✗");
  } catch(err){
    console.log("✓");
    next()
  }
},

//++++++++++++++++++++++++++++++ remove the collection
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("drop the collection")

objectstore.drop(collectionName)
           .then(()=>objectstore.read(collectionName))
           .then(coll=>{
              if("undefined" === typeof coll){
                console.log("✓");
                next()
              } else {
                console.log("✗");
              }
            })
},

//+++++++++++++ try removing a non-existing collection
//++++++++++++++++++++++++++++++++++++++++++++++++++++

next =>{
console.log("try removing a non-existing collection")

objectstore.drop(collectionName)
           .then(()=>objectstore.read(collectionName))
           .then(coll=>{
              if("undefined" === typeof coll){
                console.log("✓");
                next()
              } else {
                console.log("✗");
              }
            })
}]





let f = ()=> console.log("Finished tests!!")

for(let index = tests.length-1; index >= 0; --index){
  const next = f
  f=tests[index].bind(null,next)
}

f() // start tests
