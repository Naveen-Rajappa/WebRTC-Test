import {sourceId} from './sourceId';
import peerChannels from './peerChannels';
import peerConnections from './peerConnections';
import {createPeerConnectionFromNothing, createPeerConnectionFromOffer, cleanPeerDisconnection} from './peerConnectionFactory';
import {INIT, ICE_CANDIDATE, OFFER, ANSWER, TEXT, PEER_DISCONNECTION} from '../messages';
import {RTCIceCandidate, RTCSessionDescription} from './rtcApi';
import {addChatMessage} from './dom';

const relayMessage = (message, channel) => {
    const relayedChannel = peerChannels[message.destination];
    if (relayedChannel) {
        relayedChannel.send(JSON.stringify(message));
        console.log('Channel : ', channel);
        console.groupEnd();
    } else {
        console.error(`Tried to relay to ${message.destination} but no channel found for it.`);
    }
}


const onIceCandidate = (message, channel) => {
    const peerConnection = peerConnections[message.source];
    const ICECandidate = message[ICE_CANDIDATE];
    peerConnection.addIceCandidate(new RTCIceCandidate(ICECandidate));
    console.groupCollapsed(`Received ICE Candidate from %c${message.source}`, `color: #${message.source.substr(0, 6)}`);
    console.log('Channel : ', channel);
    console.groupEnd();
}

const onOffer = (message, signalingChannel) => {
    const offer = message[OFFER];
    const peerConnection = createPeerConnectionFromOffer(message.source, offer, message.usePeerAsSignalingRelay, signalingChannel);
    peerConnection.createAnswer(answer => {
        peerConnection.setLocalDescription(answer);
        signalingChannel.send(JSON.stringify({
            type: ANSWER,
            source: sourceId,
            destination: message.source,
            [ANSWER]: answer
        }));
        console.groupCollapsed(`Sent answer to %c${message.source}`, `color: #${message.source.substr(0, 6)}`);
        console.log('Channel : ', signalingChannel);
        console.groupEnd();
    }, err => {
        console.error(err);
    });
    console.groupCollapsed(`Received offer from %c${message.source}`, `color: #${message.source.substr(0, 6)}`);
    console.log('Channel : ', signalingChannel);
    console.groupEnd();
}

const onAnswer = (message, signalingChannel) => {
    const peerConnection = peerConnections[message.source];
    const answer = message[ANSWER];
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    console.groupCollapsed(`Received answer from %c${message.source}`, `color: #${message.source.substr(0, 6)}`);
    console.log('Channel : ', signalingChannel);
    console.groupEnd();
}

const onChat = (message, channel) => {
    const {source} = message;
    const text = message[TEXT];
    addChatMessage(source, text);
    console.groupCollapsed(`Received chat from %c${source}`, `color: #${source.substr(0, 6)}`);
    console.log('Channel : ', channel);
    console.log('Text : ', text);
    console.groupEnd();
}


const onPeerDisconnection = (message, channel) => {
    cleanPeerDisconnection(message[PEER_DISCONNECTION]);
}

const messageHandler = (message, signalingChannel) => {
    if (message.destination === sourceId) {
        switch (message.type) {
            case ICE_CANDIDATE:
                onIceCandidate(message, signalingChannel);
                break;
            case OFFER:
                onOffer(message, signalingChannel);
                break;
            case ANSWER:
                onAnswer(message, signalingChannel);
                break;
            case TEXT:
                onChat(message, signalingChannel);
                break;
            
            case PEER_DISCONNECTION:
                onPeerDisconnection(message, signalingChannel);
        }
    } else {
        relayMessage(message, signalingChannel);
    }
}

export default messageHandler;
