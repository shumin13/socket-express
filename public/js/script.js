$(function() {
  // alert('jquery is ready')
// opens connection from client-side
  var socket = io()

  // $m = $('#m')
  // $button = $('button')
  // $form = $('form')
  // $form.on('submit', function(e){
  //   e.preventDefault()
  //   console.log('submit through ajax')
  //   let msgVal = $m.val()
  //   console.log(msgVal)
  //   // sending message to server thru socket
  //   socket.emit('chat', msgVal);
  // })
  // socket.on('chatServer', function(msgServer){
  //   console.log(`new broadcast: ${msgServer}`)
  //   $('#messages').append(`<li>${msgServer}</li>`)
  // })

  $('#chatDiv').hide()
  $('#messageDiv').hide()
  $('form').submit(function(e) {
    e.preventDefault()
  })

  $('#join').on('click', function() {
    var name = $('#name').val()
    if (name !== '') {
      socket.emit('join', name)
      $('#joinDiv').hide()
      $('#chatDiv').show()
      $('#messageDiv').show()
    }
  })

  socket.on('join', function(msg) {
    $('#messages').append($('<li>').text(msg))
  })

  socket.on('usersUpdate', function(usersOnline) {
    $('#users').empty()
    $.each(usersOnline, function(socketid, name) {
      $('#users').append($('<li>').text(name), $(`<button id="${socketid}" class="chatButton">Chat</button>`))
    })
  })

  $('#send').on('click', function() {
    socket.emit('chat message', $('#m').val())
    $('#m').val('')
  })

  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg))
  })

  var timeout

  function timeoutFunction() {
    typing = false
    socket.emit("typing", false)
  }

  $('#m').keydown(function(e) {
    typing = true
    socket.emit('typing', true)
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFunction, 500)
  })

  socket.on('typing', function(msg) {
    $('#typingStatus').text(msg)
  })

  $('#users').on('click', "button", function() {
    socket.emit('personal chat', this.id)
  })

  socket.on('personal chat', function(msg){
    $('#personal').append($('<li>').text(msg))
  })
})
