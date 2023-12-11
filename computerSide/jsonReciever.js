////                        //////
//// JSON stream via socket //////
////                        //////

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Serve a simple HTML page with the socket.io client script
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle incoming connections
io.on('connection', (socket) => {
  console.log('Client connected');

  // Handle JSON data sent from Python script
  socket.on('json-data', (data) => {
    console.log('Received JSON data:', data);
    // You can perform additional processing with the received data here
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});