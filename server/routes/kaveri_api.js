var express = require('express');
var router = express.Router();
var requestify = require('requestify');
var vcapServices = require("vcap_services");
var Cloudant = require('@cloudant/cloudant');
var credentials = {};
if(process.env.VCAP_SERVICES){ //for bluemix env
	credentials = vcapServices.getCredentials('cloudantNoSQLDB', null, 'cloudant_land_records'); //get the cloudant_land_records service instance credentials
	console.log("credentials",credentials);
}
var cloudant_url = process.env.CLOUDANT_DB_URL || credentials.url;
var cloudant = Cloudant(cloudant_url);
//create the document in the db if not available
var kaveriDBName = process.env.KAVERI_DB || "mojani";

cloudant.db.create(kaveriDBName, function(err) {
        if (err) {
            console.log('Could not create new db: ' + kaveriDBName+ ', it might already exist.');
        }
		
});
//connect to Kaveri DB
var kaveri = cloudant.use(kaveriDBName);
  
  //create index in db on ward no if not existing
  var ward = {name:'ward', type:'json', index:{fields:['wardNo']}};
	kaveri.index(ward, function(er, response) {
	  if (er) {
		console.log("Error creating index on ward no:"+ er);
	  }else{
		console.log('Index creation result on ward:'+ response.result);
	  }
	});
	
  //create index in db on PID if not existing
  var pid = {name:'pid', type:'json', index:{fields:['pid']}};
	kaveri.index(pid, function(er, response) {
	  if (er) {
		console.log("Error creating index on pid:"+ er);
	  }else{
		console.log('Index creation result on pid:'+ response.result);
	  }
	});

 //Create index in db on txn ID if not existing
 var txnID= {name:'txnID', type:'json', index:{fields:['txnID']}};
 kaveri.index(txnID, function(er, response){
    if (er) {
		console.log("Error creating index on txnid:"+ er);
    }else{
        console.log('Index creation result on txnid:'+ response.result);
    }
 });

 //Create index in db on timestamp if not existing
 var TimeStamp= {name:'TimeStamp', type:'json', index:{fields:['TimeStamp']}};
 kaveri.index(TimeStamp, function(er, response){
    if (er) {
		console.log("Error creating index on TimeStamp:"+ er);
    }else{
        console.log('Index creation result on TimeStamp:'+ response.result);
    }
 });

/* POST API to create a new land record in Kaveri*/
router.post('/api/addLandRecordKaveri', (req, res) => {
  console.log('Inside Express api to add new land record kaveri');
  console.log("Received txnid: " + req.body.txnid);
  var record = req.body;
    kaveri.insert(record, function(err, doc) {
        if (err) {
            console.log("Error saving record to kaveri" +err);
            res.json({success:false, message: err.toString()});
        }else{
            console.log("success inserting record to kaveri");
            res.json({success : true, message : "Land record added successfully to kaveri"});
            }
										
    });	
});

/* POST API to update approved records in kaveri*/
router.post('/api/updateKaveriApprovedRecords', (req, res) => {
    console.log('Inside Express api to update new land record');
    var records = req.body; //Array of land records
    console.log("list of documents" + JSON.stringify(records));
    var documentIdsAdded = [];
    kaveri.find({
        selector: {
            txnID: records[0].txnID
        }
    }, function(er, result) {
        if (er) {
            console.log("Error finding documents");
        }
        console.log('Found documents with Txn ID ' + records[0].txnID + ":" + result.docs.length);
        for (var i = 0; i < records.length; i++) {
            for (var j = 0; j < result.docs.length; j++) {
                console.log('Doc id:' + result.docs[i].id);
                if (records[i].txnID == result.docs[j].txnID) {
                    records[i]["_id"] = result.docs[j]["_id"];
                    records[i]["_rev"] = result.docs[j]["_rev"];
                    documentIdsAdded.push(result.docs[i].txnID);
										console.log('calling block chain code');    
										// New Owner Details
										var ownerReq = {
											"$class": "org.bhoomi.landrecords.AddOwner",
											"owner" : {
											"$class": "org.bhoomi.landrecords.Owner",
											"aadharNo": result.docs[j].newOwnerDetails.aadharNo+"",
											"ownerName": result.docs[j].newOwnerDetails.ownerName+"",
											"gender": result.docs[j].newOwnerDetails.gender+"",
											"mobileNo": result.docs[j].newOwnerDetails.mobileNo+"",
											"emailID": result.docs[j].newOwnerDetails.emailID+"",
											"address": result.docs[j].newOwnerDetails.address+""    
											}
										}										 
										var landUpdateReq = {
											"$class": "org.bhoomi.landrecords.UpdateLandDetails",
											"landrecord": "resource:org.bhoomi.landrecords.LandRecord#"+result.docs[j].pid+"",
											"newOwner": "resource:org.bhoomi.landrecords.Owner#"+result.docs[j].newOwnerDetails.aadharNo+""
										}
										//Land Record Updation
										requestify.request('https://13.232.73.187:3000/api/AddOwner', {
											method: 'POST',
											body: ownerReq,
											dataType: 'json'
										})
										.then(function(response) {
											// get the response body
											console.log(response.getBody());
											requestify.request('https://13.232.73.187:3000/api/UpdateLandDetails', {
												method: 'POST',
												body: landUpdateReq,
												dataType: 'json'
											})
											.then(function(response) {
												// get the response body
												console.log(response.getBody());
											});
										});
                }
            }
        }
        kaveri.bulk({
            docs: records
        }, function(err, doc) {
            if (err) {
                console.log("Error updating records to Kaveri" + err);
                res.json({
                    success: false,
                    message: err + ""
                });
            } else {
                console.log("success saving records to Kaveri");
                res.json({
                    success: true,
                    documentIdsAdded: documentIdsAdded
                });
            }
        });
    });
});

router.post('/api/updateKaveriRejectedRecords', (req, res) => {
	console.log('Inside Express api to update new land record');
	var records = req.body; //Array of land records
	console.log("list of documents" + JSON.stringify(records));
	var documentIdsAdded = [];
	kaveri.find({
			selector: {
					txnID: records[0].txnID
			}
	}, function(er, result) {
			if (er) {
					console.log("Error finding documents");
			}
			console.log('Found documents with Txn ID ' + records[0].txnID + ":" + result.docs.length);
			for (var i = 0; i < records.length; i++) {
					for (var j = 0; j < result.docs.length; j++) {
							console.log('Doc id:' + result.docs[i].id);
							if (records[i].txnID == result.docs[j].txnID) {
									records[i]["_id"] = result.docs[j]["_id"];
									records[i]["_rev"] = result.docs[j]["_rev"];
									documentIdsAdded.push(result.docs[i].txnID);
									console.log('calling block chain code');
							}
					}
			}
			kaveri.bulk({
					docs: records
			}, function(err, doc) {
					if (err) {
							console.log("Error updating records to Kaveri" + err);
							res.json({
									success: false,
									message: err + ""
							});
					} else {
							console.log("success saving records to Kaveri");
							res.json({
									success: true,
									documentIdsAdded: documentIdsAdded
							});
					}
			});
	});
});


/* GET API to get land records from MOJANI using ward No*/
router.get('/api/getLandRecordsKaveriByWard/:id', (req, res) => {
  console.log('Inside Express api to get land records');
	kaveri.find({selector:{wardNo:req.params.id}}, function(er, result) {
	  if (er) {
		console.log("Error finding documents");
		res.json({success : false,message:"Error finding documents",landRecords:null});
	  }
	  console.log('Found documents with wardNo count: '+ req.params.id +":"+ result.docs.length);
/* 	  for (var i = 0; i < result.docs.length; i++) {
		console.log('Doc:'+ JSON.stringify(result.docs[i]));
	  } */
	  res.json({success : true, message:"Found "+result.docs.length+" documents", landRecords:result.docs});
	});
});

/* GET API to get land records from Kaveri using PID*/
router.get('/api/getLandRecordsKaveriByPid/:id', (req, res) => {
  console.log('Inside Express api to get land records by Pid kaveri');
  kaveri.find({selector:{pid:Number(req.params.id)},sort:[{TimeStamp:"desc"}]}, function(er, result) {
	  if (er) {
		console.log("Error finding documents");
		res.json({success : false,message:"Error finding documents",landRecords:null});
	  }
	  console.log('Found documents with PID count kaveri:'+ req.params.id +":"+ result.docs.length);
	  res.json({success : true, message:"Found "+result.docs.length+" documents", landRecords:result.docs});
	});
});

/* GET API to get land records from Kaveri using TXNID*/
router.get('/api/getLandRecordsKaveriBytxnId/:id', (req, res) => {
  console.log('Inside Express api to get land records by Txn id');
  kaveri.find({selector:{txnID:String(req.params.id)}}, function(er, result) {
	  if (er) {
		console.log("Error finding documents");
		res.json({success : false,message:"Error finding documents",landRecords:null});
	  }
	  console.log('Found documents with Txn ID count:'+ req.params.id +":"+ result.docs.length);
	  res.json({success : true, message:"Found "+result.docs.length+" documents", landRecords:result.docs});
	});
});

module.exports = router;
