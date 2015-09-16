import $ from 'jQuery';
import {Communicator} from './communicator.js';
import * as Templates from '../../static/temlates.js';

var instance;

const statuses = {
    playing: 0,
    paused: 1,
    stopped: 2
};

export class UIController {
    constructor() {}

    static getUIController() {
        return instance || (instance = new UIController());
    }

    renderResult(data) {
        this.data = data;
        if (data.content) {
            this.showDirContent(data);
        } else {
            if (data.status !== undefined && data.status !== statuses.stopped
                    && data.current === data.path) {
                this.showVideoControls();
            } else {
                this.showSubtitlePicker(data.subtitles);
            }
        }
    }

    showSubtitlePicker(subtitles) {
        $('#fileBrowser').hide();

        if (subtitles && subtitles.length > 0) {
            $('#subtitles').html(Templates.subtitleList(subtitles));
            $('#subtitlePicker').show();
        } else {
            UIController.subtitlePicked();
        }
    }

    static subtitlePicked(subtitle) {
        self = UIController.getUIController();
        let communicator = Communicator.getCommunicator();
        communicator.send({action: 'play', path: self.data.path, subtitle: subtitle});
        self.showVideoControls();
    }

    showVideoControls() {
        $('#fileBrowser').hide();
        $('#subtitlePicker').hide();

        let statusText;
        switch (this.data.status) {
            case statuses.playing:
                statusText = 'Playing';
                break;
            case statuses.paused:
                statusText = 'Paused';
                break;
            case statuses.stopped:
            default:
                statusText = 'Not playing';
                break;
        }
        $('#status').text(statusText);
        $('.title').text(this.data.path);
        $('#videoControls').show();
    }

    updateStatus(message) {
        $('#status').text(message.message);
        if (message.status === 'success') {
            $('#status').removeClass('failure');
        } else {
            $('#status').addClass('failure');
        }
    }

    showDirContent(data) {
        $('#subtitlePicker').hide();
        $('#videoControls').hide();

        let first = {
            path: data.current
        };
        var name;
        if (data.current) {
            name = data.current.substring(data.current.lastIndexOf('/') + 1);
        }
        switch (data.status) {
            case statuses.playing:
            case statuses.paused:
                first.text = 'Now playing: ' + name;
                break;
            case statuses.stopped:
                first.text = 'Last played: ' + name;
                break;
            default:
                first.text = 'Not playing anything.';
                break;
        }

        $('#dirContent').html(Templates.fileList(first, data.content));
        $('.title').text(data.path);
        $('#fileBrowser').show();
    }
}

window.UIController = UIController;
