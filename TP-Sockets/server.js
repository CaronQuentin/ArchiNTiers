const net = require("net");

const PORT = 5001;

const server = net.createServer((socket) => {
  console.log("--- Client connecté.");

  socket.on("data", (data) => {
    const request = JSON.parse(data.toString());

    if (request.request === "echo") {
      const response = {
        response: request.params.text
      };

      socket.write(JSON.stringify(response));
    }
  });

  socket.on("end", () => {
    console.log("--- Client déconnecté.");
  });
});

server.listen(PORT, () => {
  console.log(`--- Serveur en écoute sur le port ${PORT}`);
});