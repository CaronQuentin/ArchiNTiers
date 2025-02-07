const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH = './todo.proto';

// Chargement du fichier .proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const todoProto = grpc.loadPackageDefinition(packageDefinition).todo;

// Création du client
const client = new todoProto.TodoService('localhost:50051', grpc.credentials.createInsecure());

// Ajouter une tâche
client.AddTask({ id: '1', description: 'Learn gRPC' }, (err, response) => {
  if (err) console.error(err);
  else console.log(response.message);

  // Récupérer les tâches
  client.GetTasks({}, (err, response) => {
    if (err) console.error(err);
    else console.log('Tasks:', response.tasks);

    // Ajouter un produit
    client.AddProduct({ id: '1', name: 'Product 1', description: 'Description 1', price: 10.0 }, (err, response) => {
      if (err) console.error(err);
      else console.log(response.message);

      // Récupérer les produits
      client.GetProducts({}, (err, response) => {
        if (err) console.error(err);
        else console.log('Products:', response.products);

        // Mettre à jour un produit
        client.UpdateProduct({ id: '1', name: 'Updated Product 1', description: 'Updated Description 1', price: 15.0 }, (err, response) => {
          if (err) console.error(err);
          else console.log(response.message);

          // Supprimer un produit
          client.DeleteProduct({ id: '1' }, (err, response) => {
            if (err) console.error(err);
            else console.log(response.message);
          });
        });
      });
    });
  });
});