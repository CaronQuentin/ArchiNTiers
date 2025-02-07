const clients = new Set();

function broadcast(message, sender) {
    clients.forEach(client => {
        if (client !== sender) {
            client.write(message);
        }
    });
}

function addClient(client) {
    clients.add(client);
}

function removeClient(client) {
    clients.delete(client);
}

function getClients() {
    return Array.from(clients);
}

module.exports = {
    broadcast,
    addClient,
    removeClient,
    getClients
};