import $ from 'jQuery';
import {Communicator} from './communicator.js';
import {UIController} from './UIController.js';
import {Download} from './download.js';

window.remote_url = location.host;

$(() => {
    window.main = new Main();
});

class Main {
    constructor() {
        this.ui = UIController.getUIController();

        this.communicator = Communicator.getCommunicator(this.ui.updateStatus.bind(this.ui));
        this.communicator.getRootContent(this.ui.renderResult.bind(this.ui));
    }

    action(action, command) {
        let data = {
            action: action
        };
        if (command) {
            data.command = command;
        }

        this.communicator.send(data);
    }

    navigate(path) {
        this.communicator.navigate(path, this.ui.renderResult.bind(this.ui));
    }
}

