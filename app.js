var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');

var routes = require('./routes/index');
var users = require('./routes/user');

var app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/socket', function(req, res) {
  res.render('socket')
})

var usersOnline = {}

// io.on('connection', function(socket){
//   console.log('a user connected');
//   socket.on('chat', function(msg){
//     // people[socket.id] = msg;
//     console.log(`message:${msg}`)
//     // sends text from one client to all clients
//     io.emit('chatServer', msg)
//
//   })
  // socket.on('disconnect', function(){
  //   console.log('user disconnected');
  // });
// })

io.on('connection', function(socket) {
  socket.on('join', function(name) {
    usersOnline[socket.id] = name
    socket.emit('join', 'You have joined the chatroom.')
    socket.broadcast.emit('join', name + ' has joined the chatroom.')
    io.emit('usersUpdate', usersOnline)
  })

  socket.on('chat message', function(msg) {
    io.emit('chat message', usersOnline[socket.id] + ': ' + msg)
  })

  socket.on('disconnect', function() {
    socket.broadcast.emit('join', usersOnline[socket.id] + ' has left the chatroom.')
    delete usersOnline[socket.id]
    socket.broadcast.emit('usersUpdate', usersOnline)
  })

  socket.on('typing', function (data) {
    if(data){
      socket.broadcast.emit('typing', usersOnline[socket.id] + ' is typing...')
    } else {
      socket.broadcast.emit('typing', '')
    }
  })

  socket.on('personal chat', function (id){
    socket.to(id).emit('personal chat', usersOnline[socket.id] + ' says Hi.')
  })

})

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      title: 'error'
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
    title: 'error'
  });
});

app.set('port', process.env.PORT || 3000);

var server = http.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
