(function(){
  var element = function(id){
    return document.getElementById(id);
  }

  //Get Elements
  var status = element('status');
  var messages = element('messages');
  var textarea = element('textarea');
  var username = element('username');
  var clear = element('clear');


  //Set default status
  var statusDefault = status.textContent;
  var setStatus = function (s){
    //Set status
    status.textContent = s;

    if (s !== statusDefault) {
      var delay = setTimeout(function(){
        setStatus(statusDefault);
      },4000);
    }
  }

  //Connect to socket.io
  var socket = io.connect('http://127.0.0.1:4000');

  //Check for connection
  if (socket != undefined) {
    console.log('Connect to socjer');
    //Headle output
    socket.on('output',function(data){
      //console.log(data);
      if (data.length) {
        for (var i = 0; i < data.length; i++) {
          //Build message div
          var message = document.createElement('div');
          message.setAttribute('class', 'chat-message');
          message.textContent = data[i].name+": "+data[i].message;
          messages.appendChild(message);
          messages.insertBefore(message, messages.firstChild);
        }
      }
    });

    //Get status from server
    socket.on('status',function(data){
      //get message status
      setStatus((typeof data == 'object')? data.message : data);
      //if status is clear
      if (data.clear) {
        textarea.value = '';
      }
    });

    //Handle input
    textarea.addEventListener('keydown',function(event){
      if (event.wich === 13 && event.shiftKey == false) {
        //Emit to server input
        socket.emit('input',{
          name:username.value,
          message:textarea.value
        });

        event.preventDefault();
      }
    });
  }
})();
