const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { MongoClient, ObjectId } = require('mongodb');
const PROTO_PATH = './todo.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

const url = 'mongodb://localhost:27017';
const dbName = 'grpcdb';
let db;

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) throw err;
  db = client.db(dbName);
  console.log(`Connected to database ${dbName}`);

  const server = new grpc.Server();

  server.addService(todoProto.TodoService.service, {
    AddTask: (call, callback) => {
      const task = call.request;
      db.collection('tasks').insertOne(task, (err, result) => {
        if (err) callback(err);
        else callback(null, { message: 'Task added successfully' });
      });
    },
    GetTasks: (call, callback) => {
      db.collection('tasks').find().toArray((err, tasks) => {
        if (err) callback(err);
        else callback(null, { tasks });
      });
    },
    AddProduct: (call, callback) => {
      const product = call.request;
      db.collection('products').insertOne(product, (err, result) => {
        if (err) callback(err);
        else callback(null, { message: 'Product added successfully' });
      });
    },
    UpdateProduct: (call, callback) => {
      const product = call.request;
      const { id, ...update } = product;
      db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: update }, (err, result) => {
        if (err) callback(err);
        else callback(null, { message: 'Product updated successfully' });
      });
    },
    DeleteProduct: (call, callback) => {
      const { id } = call.request;
      db.collection('products').deleteOne({ _id: new ObjectId(id) }, (err, result) => {
        if (err) callback(err);
        else callback(null, { message: 'Product deleted successfully' });
      });
    },
    GetProducts: (call, callback) => {
      db.collection('products').find().toArray((err, products) => {
        if (err) callback(err);
        else callback(null, { products });
      });
    }
  });

  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running at http://0.0.0.0:50051');
    server.start();
  });
});