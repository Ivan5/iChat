const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//Connect MongoDB
mongo.connect('mongodb://127.0.0.1/ichat',(err,db)=>{
  if (err) {
    throw err;
  }
  console.log('MongoDB connected ');

  //Connect to Socket.io
  client.on('connection',(socket)=>{
    let chat = db.collection('chats');
    //Create fun to send status
    sendStatus = function(s){
      socket.emit('status',s);
    }

    //Get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray((err,res)=>{
      if (err) {
        throw err;
      }

      //Emit the messages
      socket.emit('output',res);
    });

    //Handle input events
    socket.on('input',(data)=>{
      let name = data.name;
      let message = data.message;

      //check for name and message
      if (name == '' || message == '') {
        //Send status
        sendStatus('Please enter a name and message');
      }else {
        //insert message
        chat.insert({name: name,message:message},()=>{
          client.emit('output',[data]);

          //Send status object
          sendStatus({
            message: 'Message send',
            clear: true
          });
        });
      }
    });
    //Headle clear
    socket.on('clear',(data)=>{
      //Remove all chats
      chat.remove({},()=>{
        //Emit cleard
        socket.emit('Clear');
      });
    });
  });
});
