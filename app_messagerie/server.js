const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the proto file
const PROTO_PATH = path.join(__dirname, 'notification.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).app_messagerie;

console.log('Loaded proto:', proto);

if (!proto || !proto.NotificationService) {
  console.error('Failed to load NotificationService from proto file');
  process.exit(1);
}

const notifications = [];
const clients = [];

function streamNotifications(call) {
  console.log('Client connected for streaming notifications');
  clients.push(call);
  call.on('cancelled', () => {
    console.log('Client disconnected');
    const index = clients.indexOf(call);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
}

function sendNotification(notification) {
  console.log('Sending notification:', notification);
  notifications.push(notification);
  clients.forEach(client => client.write(notification));
}

const server = new grpc.Server();
server.addService(proto.NotificationService.service, { streamNotifications });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Server binding error:', error);
    return;
  }
  console.log(`Server running at http://0.0.0.0:${port}`);
  server.start();
});

// Example usage: send a notification every 5 seconds
setInterval(() => {
  const notification = {
    message: 'New notification',
    sender: 'Server',
    timestamp: Date.now(),
  };
  sendNotification(notification);
}, 5000);
