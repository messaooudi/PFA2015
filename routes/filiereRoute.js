
var express = require('express');
var async = require('async')
var conEnsure= require('connect-ensure-login');
var databaseModels = require('../models/databaseModels')

var errorMessage = function(code,message){
    return {code : code,message : message}
}

var okMessage = function(code,message,data){
    return {code : code,message : message , data : data}
}


var router = express.Router();

//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getFiliere",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
           res.setHeader('Content-Type', 'application/json');
           console.log("response is : ");
           console.log(JSON.stringify(req.body))
           async.series([
               function(callback){
                  var query =  databaseModels.filiere.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                   }
                   //.populate('updatedBy')
                   //.populate({path : 'sendTo.id',select :'nom'})
                   query.exec(
                   function(err,profs){
                        if(err) return callback({code : '002',message :"database problem!!"},null);
                        callback(null,profs);
                   });
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'))
               }
               
           });

});

//{intitulee : String,cordId : _id,
// userId : _id }
router.post("/creeFiliere",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       
       console.log(req.connection.remoteAddress+" requested "+req.path);
       console.log("request is : "+JSON.stringify(req.body,null));
       res.setHeader('Content-Type', 'application/json');

           console.log("connection to database ");
           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.filiere.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem!",data : err})
                       if(doc.length>0) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                   var filiere = new databaseModels.filiere({
                                        intitulee : req.body.intitulee,
                                        createdBy : req.body.userId,
                                        status : 'incomplet'});
                   filiere.save(function(err){
                       if(err) return callback({code : '002',message :"database problem!"});
                       callback(null,module._id);
                   });
               },
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               
               
           }
           )

});


module.exports = router;