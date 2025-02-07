const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');

const packageDef = protoLoader.loadSync('product.proto');
const grpcObject = grpc.loadPackageDefinition(packageDef);
const ProductService = grpcObject.ProductService;

function main() {
  const client = new ProductService('localhost:50051', grpc.credentials.createInsecure());
  
  client.addProduct({ name: 'Product A', price: 10.99 }, (err, res) => {
    if (err) {
      console.error('Error adding product:', err);
    } else {
      console.log('New product ID:', res.id);
      const productId = res.id;

      // Valid getProduct call
      client.getProduct({ id: productId }, (err, res) => {
        if (err) {
          if (err.code === grpc.status.INVALID_ARGUMENT) {
            console.error('Invalid product ID:', err.message);
          } else if (err.code === grpc.status.NOT_FOUND) {
            console.error('Product not found:', err.message);
          } else {
            console.error('Error getting product:', err);
          }
        } else {
          console.log('Product details:', res);
        }
      });

      // Invalid getProduct call (invalid ID format)
      client.getProduct({ id: 'invalid-id' }, (err, res) => {
        if (err) {
          if (err.code === grpc.status.INVALID_ARGUMENT) {
            console.error('Invalid product ID:', err.message);
          } else if (err.code === grpc.status.NOT_FOUND) {
            console.error('Product not found:', err.message);
          } else {
            console.error('Error getting product:', err);
          }
        } else {
          console.log('Product details:', res);
        }
      });

      // Invalid getProduct call (non-existent ID)
      client.getProduct({ id: '000000000000000000000000' }, (err, res) => {
        if (err) {
          if (err.code === grpc.status.INVALID_ARGUMENT) {
            console.error('Invalid product ID:', err.message);
          } else if (err.code === grpc.status.NOT_FOUND) {
            console.error('Product not found:', err.message);
          } else {
            console.error('Error getting product:', err);
          }
        } else {
          console.log('Product details:', res);
        }
      });

      const call = client.listProducts({});
      call.on('data', (product) => {
        console.log('Product:', product);
      });
      call.on('error', (err) => {
        console.error('Error listing products:', err);
      });
      call.on('end', () => {
        console.log('Finished listing products');
      });

      client.updateProduct({ id: productId, name: 'Updated Product A', price: 12.99 }, (err, res) => {
        if (err) {
          console.error('Error updating product:', err);
        } else {
          console.log('Updated product:', res);
        }
      });

      client.deleteProduct({ id: productId }, (err, res) => {
        if (err) {
          if (err.code === grpc.status.INVALID_ARGUMENT) {
            console.error('Invalid product ID:', err.message);
          } else if (err.code === grpc.status.NOT_FOUND) {
            console.error('Product not found:', err.message);
          } else {
            console.error('Error deleting product:', err);
          }
        } else {
          console.log('Deleted product:', res);
        }
      });

      // Invalid deleteProduct call (invalid ID format)
      client.deleteProduct({ id: 'invalid-id' }, (err, res) => {
        if (err) {
          if (err.code === grpc.status.INVALID_ARGUMENT) {
            console.error('Invalid product ID:', err.message);
          } else if (err.code === grpc.status.NOT_FOUND) {
            console.error('Product not found:', err.message);
          } else {
            console.error('Error deleting product:', err);
          }
        } else {
          console.log('Deleted product:', res);
        }
      });

      // Invalid deleteProduct call (non-existent ID)
      client.deleteProduct({ id: '000000000000000000000000' }, (err, res) => {
        if (err) {
          if (err.code === grpc.status.INVALID_ARGUMENT) {
            console.error('Invalid product ID:', err.message);
          } else if (err.code === grpc.status.NOT_FOUND) {
            console.error('Product not found:', err.message);
          } else {
            console.error('Error deleting product:', err);
          }
        } else {
          console.log('Deleted product:', res);
        }
      });
    }
  });
}

main();