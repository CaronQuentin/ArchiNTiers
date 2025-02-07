const net = require('net');

const PORT = 6667;
const clients = [];
const nicknames = {};
const channels = { global: [] }; // Default channel

const server = net.createServer((socket) => {
    socket.write('Bienvenue sur le Chat ! Veuillez entrer votre pseudo : ');

    let username = null;
    let currentChannel = 'global';
    let buffer = ""; // Utilisé pour stocker les données incomplètes

    socket.on('data', (data) => {
        buffer += data.toString();

        // Traiter les lignes complètes
        let lines = buffer.split('\n');
        buffer = lines.pop(); // Garder la dernière partie incomplète

        for (let line of lines) {
            const message = line.trim();

            if (!username) {
                // Validate the nickname
                if (isValidNickname(message)) {
                    username = message;
                    nicknames[socket] = username;
                    clients.push({ username, socket, channel: currentChannel });
                    channels.global.push(socket);

                    console.log(`${username} vient de rejoindre le chat.`);
                    broadcast(`${username} a rejoint le chat.\r\n`, socket, currentChannel);
                    socket.write(`Bienvenue ${username} ! Vous pouvez maintenant envoyer des messages.\r\n`);
                } else {
                    socket.write('Pseudo invalide ou déjà pris. Veuillez entrer un autre pseudo : ');
                }
            } else {
                // Handle /list command
                if (message === '/list') {
                    const userList = clients.map(client => client.username).join(', ');
                    socket.write(`Utilisateurs connectes : ${userList}\r\n`);
                } else if (message.startsWith('/whisper ')) {
                    // Handle /whisper command
                    const parts = message.split(' ');
                    const targetUsername = parts[1];
                    const whisperMessage = parts.slice(2).join(' ');

                    const targetClient = clients.find(client => client.username === targetUsername);
                    if (targetClient) {
                        targetClient.socket.write(`[Whisper from ${username}] ${whisperMessage}\r\n`);
                        socket.write(`[Whisper to ${targetUsername}] ${whisperMessage}\r\n`);
                    } else {
                        socket.write(`User ${targetUsername} not found.\r\n`);
                    }
                } else if (message.startsWith('/channels ')) {
                    const parts = message.split(' ');
                    const command = parts[1];
                    const channelName = parts[2];

                    if (command === 'list') {
                        const channelList = Object.keys(channels).join(', ');
                        socket.write(`Canaux disponibles : ${channelList}\r\n`);
                    } else if (command === 'create') {
                        if (channelName && !channels[channelName]) {
                            channels[channelName] = [];
                            socket.write(`Canal ${channelName} créé.\r\n`);
                        } else {
                            socket.write(`Le canal ${channelName} existe déjà ou le nom est invalide.\r\n`);
                        }
                    } else if (command === 'join') {
                        if (channelName && channels[channelName]) {
                            // Remove from current channel
                            channels[currentChannel] = channels[currentChannel].filter(s => s !== socket);
                            // Add to new channel
                            currentChannel = channelName;
                            channels[currentChannel].push(socket);
                            clients.find(client => client.socket === socket).channel = currentChannel;
                            socket.write(`Vous avez rejoint le canal ${currentChannel}.\r\n`);
                        } else {
                            socket.write(`Le canal ${channelName} n'existe pas.\r\n`);
                        }
                    } else {
                        socket.write('Commande de canal invalide.\r\n');
                    }
                } else {
                    // Broadcast the message to all other clients in the same channel
                    broadcast(`[${username}] ${message}\r\n`, socket, currentChannel);
                }
            }
        }
    });

    socket.on('end', () => {
        if (username) {
            console.log(`${username} s'est deconnecte.`);
            clients.splice(clients.findIndex((client) => client.socket === socket), 1);
            channels[currentChannel] = channels[currentChannel].filter(s => s !== socket);
            broadcast(`${username} a quitte le chat.\r\n`, socket, currentChannel);
            delete nicknames[socket];
        }
    });

    socket.on('error', (err) => {
        console.log(`Erreur avec ${username || "un utilisateur"}: ${err.message}`);
    });
});

function isValidNickname(nickname) {
    if (!nickname || nickname.length === 0) {
        return false;
    }
    for (let key in nicknames) {
        if (nicknames[key] === nickname) {
            return false;
        }
    }
    return true;
}

function broadcast(message, senderSocket, channel) {
    const greenChannel = `\x1b[32m${channel}\x1b[0m`; // Green color for channel name
    clients.forEach((client) => {
        if (client.socket !== senderSocket && client.channel === channel) {
            client.socket.write(`[${greenChannel}] ${message}\r\n`);
        }
    });
}

function broadcastserver(message, senderSocket, channel) {
    const greenChannel = `\x1b[32m${channel}\x1b[0m`; // Green color for channel name
    const redMessage = `\x1b[31m${message}\x1b[0m`; // Red color for message

    clients.forEach((client) => {
        if (client.socket !== senderSocket && client.channel === channel) {
            client.socket.write(`[${greenChannel}] ${redMessage}\r\n`);
        }
    });
}

server.listen(PORT, () => {
    console.log(`Serveur IRC en ecoute sur le port ${PORT}...`);
});

// Handle signals
function handleSignal(signal) {
    console.log(`Reçu ${signal}. Fermeture du serveur dans 5 secondes...`);
    Object.keys(channels).forEach(channel => {
        broadcastserver('Le serveur va fermer dans 5 secondes.\r\n', null, channel);
    });
    setTimeout(() => {
        console.log('Le serveur est maintenant fermé.');
        process.exit(0);
    }, 5000);
}

process.on('SIGINT', () => handleSignal('SIGINT'));
process.on('SIGTERM', () => handleSignal('SIGTERM'));