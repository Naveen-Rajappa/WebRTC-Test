import {sourceId} from './sourceId';
import peerChannels from './peerChannels';
import {INIT} from '../messages';
import messageHandler from './messageHandler';
import {registerDomListeners} from './dom';

// TODO : with more time available, organise the mess with Redux :)

const webSockerURI = `ws://localhost:${__SERVER_PORT__}/`;

export const initializer = question => {
    document.addEventListener('DOMContentLoaded', () => {
        registerDomListeners();
     
        const webSocket = new WebSocket(webSockerURI);
        webSocket.onopen = () => {
            webSocket.send(JSON.stringify({
                type: INIT,
                source: sourceId,
                question
            }));
        };
        webSocket.onmessage = ({data}) => {
            const message = JSON.parse(data);
            messageHandler(message, webSocket);
        }

        window.onbeforeunload = () => {
            Object.keys(peerChannels).map(peerId => {
                peerChannels[peerId].close();
            });
        }
    });
}
