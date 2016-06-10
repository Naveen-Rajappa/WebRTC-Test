import peerChannels from './peerChannels';
import {TEXT} from '../messages';
import {sourceId} from './sourceId';

export const registerDomListeners = () => {
    document.getElementById('button').onclick = () => {
        const text = document.getElementById('textarea').value;
        const destination = document.getElementById('peer-select').value;
        if (destination) 
		{
            peerChannels[destination].send(JSON.stringify({
                type: TEXT,
                source: sourceId,
                destination,
                [TEXT]: text
            }));
            document.getElementById('textarea').value = '';
        } 
    }
    document.getElementById('peerId').innerHTML = sourceId;
    document.getElementById('peerId').style.color = `#${sourceId.substr(0, 6)}`;
}

export const addChatMessage = (id, text) => {
    const liMessage = document.createElement('li');
    liMessage.innerHTML = text;
    document.getElementById(`chat-${id}`).appendChild(liMessage);
}
