// console.log('Worked');
 var mongo = require('mongodb').MongoClient,
 	 client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat',function(err,db) {
	if(err) throw err;

	client.on('connection',function(socket){
		
		var col= db.collection('messages');
		var sendStatus = function(s){
			socket.emit('status', s);
		};

		//Emit all messages
		//Force this to all client that is open
		//every client is listening when a new message is inserted
		//we will not retrieve all the message again, we will only get the new message
		col.find().limit(100).sort({_id : 1}).toArray(function(err,res){
			if (err) throw err;
			socket.emit('output',res);
		});

		//Wait for input
		socket.on('input', function(data){
			var name = data.name,
				message = data.message,
				whitespacePattern=/^\s*$/;

				if(whitespacePattern.test(name)||whitespacePattern.test(message)){
					sendStatus('Name and message is required.');
				}	
				else{
					col.insert({name:name, message:message},function(){
						//Emit latest message to All clients
						client.emit('output',[data])

						sendStatus({
							message:"Message sent",
							clear: true
						});
						// console.log('Inserted');
					});

				}
		});
	});
 });



// var socket = io.connect('http://localhost:8080'); use socket.io
// socket.emit('input', {"name":"Alex","message":"Hello"}); insert data in db