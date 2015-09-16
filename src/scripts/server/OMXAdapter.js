import process from 'child_process';
import fs from 'fs';
import sprintf_js from 'sprintf-js';

var sprintf = sprintf_js.sprintf;

const statuses = {
    playing: 0,
    paused: 1,
    stopped: 2
};

const session_name = 'OMXRemote';
const commands = {
    createTmuxSession: 'tmux new -d -s ' + session_name,
    tmux: 'tmux send-keys -t %s "%s"',
    play: 'sh src/bash/play.sh %s %s',
    pause: 'p',
    stop: 'q'
};

export class OMXAdapter {
    constructor() {
        this.createSession();
    }

    createSession(callback) {
        process.exec('tmux ls', (err, stdout, stderr) => {
            if (typeof stdout !== 'undefined' && stdout.indexOf(session_name) === -1) {
                process.execSync(commands.createTmuxSession);
                callback && callback();
            }
        });
    }

    play(path, subtitles = '') {
        let escapedPath = OMXAdapter.escapeShell(path);
        subtitles = OMXAdapter.escapeShell(subtitles);
        let cmd = sprintf(commands.play, escapedPath, subtitles);

        storage.setItem('current', path);
        storage.setItem('status', statuses.playing);
        this.sendKeys(cmd, true);
        this.watchForEnd(true);

        global.broadcast(this.createMessage(true, 'Playing'));
    }

    pause() {
        if (storage.getItem('status') === statuses.playing) {
            storage.setItem('status', statuses.paused);
            this.sendKeys(commands.pause);
            this.watchForEnd(false);
            global.broadcast(this.createMessage(true, 'Paused'));
        } else {
            this.resume();
        }
    }

    resume() {
        if (storage.getItem('status') === statuses.paused) {
            storage.setItem('status', statuses.playing);
            this.sendKeys(commands.pause);
            this.watchForEnd(true);
            global.broadcast(this.createMessage(true, 'Playing'));
        } else {
            global.broadcast(this.createMessage(false, 'Not playing!'));
        }
    }

    stop() {
        if (storage.getItem('status') !== statuses.stopped) {
            storage.setItem('status', statuses.stopped);
            this.sendKeys(commands.stop);
            this.watchForEnd(false);
            global.broadcast(this.createMessage(true, 'Stopped'));
        } else {
            global.broadcast(this.createMessage(false, 'Not playing!'));
        }
    }

    watchForEnd(watch) {
        if (watch) {
            fs.watch(dirname + '/done.txt', () => {
                if (storage.getItem('status') !== statuses.stopped) {
                    storage.setItem('status', statuses.stopped);
                    this.watchForEnd(false);
                    global.broadcast(this.createMessage(true, 'Finished'));
                }
            });
        } else {
            fs.unwatchFile(dirname + '/done.txt');
        }
    }

    command(command) {
        this.sendKeys(command);
        global.broadcast('success');
    }

    sendKeys(cmd, enter) {
        let tmuxCmd = sprintf(commands.tmux, session_name, cmd);
        process.execSync(tmuxCmd);

        if (enter) {
            let enterCmd = sprintf(commands.tmux, session_name, 'C-m');
            process.execSync(enterCmd);
        }
    }

    createMessage(success, message) {
        let statusString = success ? 'success' : 'failure';
        return {status: statusString, message: message};
    }

    static escapeShell(cmd) {
        return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
    }
}
