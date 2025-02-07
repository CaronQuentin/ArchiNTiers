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

const client = new proto.NotificationService('localhost:50051', grpc.credentials.createInsecure());

const call = client.streamNotifications({});

call.on('data', (notification) => {
  console.log('Received notification:', notification);
});

call.on('end', () => {
  console.log('Stream ended');
});

call.on('error', (error) => {
  console.error('Stream error:', error);
});

console.log('Client connected to server at localhost:50051');
