import $ from 'jQuery';

var instance;

export class Communicator {
    constructor(listener) {
        this.ws = new WebSocket(`ws://${remote_url}`);
        this.ws.onmessage = event => {
            let message = JSON.parse(event.data);
            listener(message);
        };
    }

    send(message) {
        this.ws.send(JSON.stringify(message));
    }

    getRootContent(callback) {
        this.navigate('', callback);
    }

    navigate(path, callback) {
        let data = {
            path: this.path,
            addition: path
        }
        $.getJSON(`http://${remote_url}/navigate`, data, response => {
            this.path = response.path;
            callback && callback(response);
        }.bind(this));
    }

    static getCommunicator(listener) {
        return instance || (instance = new Communicator(listener));
    }
}
