const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const packageDef = protoLoader.loadSync('video.proto');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const videoService = grpcObject.VideoStreamer;

const serverCert = fs.readFileSync('../certs/server.crt');

function main() {
    const sslCreds = grpc.credentials.createSsl(serverCert);
    const client = new videoService('localhost:50051', sslCreds);
    const call = client.streamVideo({ filename: 'input.mp4' });
    const writeStream = fs.createWriteStream('import/output.mp4');
    call.on('data', (chunk) => {
        writeStream.write(chunk.chunkData);
    });
    call.on('end', () => {
        writeStream.end();
    });
}

main();