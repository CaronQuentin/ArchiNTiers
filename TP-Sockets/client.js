const net = require("net");

const PORT = 5001;

// Connexion au serveur
const client = net.createConnection(PORT, "localhost", () => {
  console.log("--- Connecté au serveur.");

  // Requête pour appeler le serveur avec votre nom.
  const request = {
    request: "echo",
    params: {
      text: "This is a test."
    }
  };

  client.write(JSON.stringify(request));
});

// Réception des réponses du serveur RPC
client.on("data", (data) => {
  const response = JSON.parse(data.toString());

  console.log(response);
});