# MyIRC - Basic IRC Server in Node.js

MyIRC is a simple Internet Relay Chat (IRC) server implemented in Node.js. This project allows multiple users to connect via TCP, send messages to each other, and manage user connections.

## Features

- Accepts multiple TCP connections on port 6667.
- Prompts users for their nickname upon connection.
- Broadcasts messages to all connected users.
- Notifies users when someone joins or leaves the chat.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- npm (Node Package Manager) for managing dependencies.

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/MyIRC.git
   ```

2. Navigate to the project directory:

   ```
   cd MyIRC
   ```

3. Install the dependencies:

   ```
   npm install
   ```

### Running the Server

To start the IRC server, run the following command:

```
node src/server.js
```

The server will start listening on port 6667.

### Connecting to the Server

You can connect to the IRC server using Telnet. Open a terminal and run:

```
telnet localhost 6667
```

Upon connecting, you will be prompted to enter your nickname. After that, you can start chatting with other users.

### Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.