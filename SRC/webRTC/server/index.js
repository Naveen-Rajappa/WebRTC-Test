// Dependencies
import {Server as WebSocketServer} from 'ws';

// Enums
import {INIT, ICE_CANDIDATE, OFFER, ANSWER, PEER_DISCONNECTION} from '../messages';

// Config
const {SERVER_PORT} = process.env;

const webSocketServer = new WebSocketServer({port: SERVER_PORT});
const connectedPeersWebSockets = new Map();

// Web socket server
webSocketServer.on('connection', webSocket => {
    console.log('New client connection');
    webSocket.on('message', message => {
        const parsedMessage = JSON.parse(message);
        messageHandler(webSocket, parsedMessage);
    });
    webSocket.on('close',() => {
        console.log(`Client disconnected ${webSocket.id}`);
        connectedPeersWebSockets.delete(webSocket.id);
        for (let [peerId, socket] of connectedPeersWebSockets) {
            socket.send(JSON.stringify({
                type: PEER_DISCONNECTION,
                destination: peerId,
                [PEER_DISCONNECTION]: webSocket.id
            }));
        }
    });
});


console.log(`WebSocket server started on port ${SERVER_PORT}`);
