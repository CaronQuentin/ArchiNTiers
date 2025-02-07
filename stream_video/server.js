const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const packageDef = protoLoader.loadSync('video.proto');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const videoService = grpcObject.VideoStreamer;

const serverCert = fs.readFileSync('../certs/server.crt');
const serverKey = fs.readFileSync('../certs/server.key');

function streamVideo(call) {
  const readStream = fs.createReadStream(call.request.filename);
  readStream.on('data', (chunk) => {
    call.write({ chunkData: chunk });
  });
  readStream.on('end', () => call.end());
}

function main() {
  const server = new grpc.Server();
  server.addService(videoService.service, { streamVideo });
  const sslCreds = grpc.ServerCredentials.createSsl(
    null,
    [{ private_key: serverKey, cert_chain: serverCert }],
    true
  );
  server.bindAsync('0.0.0.0:50051', sslCreds, () => {
    server.start();
  });
}

main();