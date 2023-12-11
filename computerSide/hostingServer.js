// robot resolving
import dns from 'dns';
import net from 'net';
import { promisify } from 'util';

// client hosting
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// live streaming
import { Server } from 'socket.io';

const lookup = promisify(dns.lookup);

const lookupIpAddress= async (hostname)=> {
  try {
    const { address } = await lookup(hostname, { family: 4 });
    console.log(`IPv4 address for ${hostname}: ${address}`);
    return address;
  } catch (err) {
    console.error(`Error looking up IP address for ${hostname}: ${err.message}`);
    throw err;
  }
}

const sendRecievingInfoToRobot= async (hostname, recieving_port)=> {
  const robotIP= await lookupIpAddress(hostname);
  const robotPort= 3000;

  const client = new net.Socket();
  
  client.connect(robotPort, robotIP, () => {
    console.log("Sending destination info to RaspberryPI");

    const jsonData = {
      recievingPort: recieving_port,
    };

    const jsonString = JSON.stringify(jsonData);

    client.write(jsonString);
    client.end();
  });
  
  client.on("close", () => {
    console.log(`Connection protocol with ${hostname} terminated.`); // ckecking would be great
  });

  client.on("error", (err)=> {
    console.log(`Connection to ${hostname} failed.`);
  });
}

const hostPage= async (port)=> {
  const app = express();
  const server = http.createServer(app);
  
  // Serve static files (HTML, CSS, JS) from the "templates" directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  app.use(express.static(path.join(__dirname, 'templates')));
  const io= new Server(server);

  io.on('connection', (socket) => {
    console.log('Client connected');
  
    socket.on('frame', (data) => {
      io.emit('frameUpdate', data);
    });
    
    socket.on('mapUpdatePackage', (data) => {
      io.emit('mapUpdate', data);
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

async function main(){
  const hostname = "robotica.local";
  const RECIEVING_PORT = 5000;
  
  await sendRecievingInfoToRobot(hostname, RECIEVING_PORT);
  
  await hostPage(RECIEVING_PORT);
}

main();