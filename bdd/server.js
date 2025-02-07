const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

const packageDef = protoLoader.loadSync('product.proto');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const productService = grpcObject.ProductService;

async function connectDb() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  return client.db('testdb').collection('products');
}

async function addProduct(call, callback) {
  const collection = await connectDb();
  const product = { name: call.request.name, price: call.request.price };
  const result = await collection.insertOne(product);
  callback(null, { id: result.insertedId.toString() });
}

async function getProduct(call, callback) {
  const collection = await connectDb();
  const id = call.request.id;
  if (!ObjectId.isValid(id)) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Invalid product ID'
    });
  }
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: 'Product not found'
    });
  }
  callback(null, { id: doc._id.toString(), name: doc.name, price: doc.price });
}

async function updateProduct(call, callback) {
  const collection = await connectDb();
  const id = call.request.id;
  if (!ObjectId.isValid(id)) {
    return callback(new Error('Invalid product ID'));
  }
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { name: call.request.name, price: call.request.price } }
  );
  callback(null, call.request);
}

async function deleteProduct(call, callback) {
  const collection = await connectDb();
  const id = call.request.id;
  if (!ObjectId.isValid(id)) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Invalid product ID'
    });
  }
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: 'Product not found'
    });
  }
  callback(null, { id: call.request.id });
}

async function listProducts(call) {
  const collection = await connectDb();
  const cursor = collection.find({});
  for await (const doc of cursor) {
    call.write({ id: doc._id.toString(), name: doc.name, price: doc.price });
  }
  call.end();
}

function main() {
  const server = new grpc.Server();
server.addService(productService.service, {
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Server binding failed:', err);
    return;
  }
  console.log(`gRPC server listening on port ${port}`);
  server.start();
});
}

main();