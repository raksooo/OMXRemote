'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _sprintfJs = require('sprintf-js');

var _sprintfJs2 = _interopRequireDefault(_sprintfJs);

var sprintf = _sprintfJs2['default'].sprintf;

var statuses = {
    playing: 0,
    paused: 1,
    stopped: 2
};

var session_name = 'OMXRemote';
var commands = {
    createTmuxSession: 'tmux new -d -s ' + session_name,
    tmux: 'tmux send-keys -t %s "%s"',
    play: 'sh src/bash/play.sh %s %s',
    pause: 'p',
    stop: 'q'
};

var OMXAdapter = (function () {
    function OMXAdapter() {
        _classCallCheck(this, OMXAdapter);

        this.createSession();
    }

    _createClass(OMXAdapter, [{
        key: 'createSession',
        value: function createSession(callback) {
            _child_process2['default'].exec('tmux ls', function (err, stdout, stderr) {
                if (typeof stdout !== 'undefined' && stdout.indexOf(session_name) === -1) {
                    _child_process2['default'].execSync(commands.createTmuxSession);
                    callback && callback();
                }
            });
        }
    }, {
        key: 'play',
        value: function play(path) {
            var subtitles = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

            var escapedPath = OMXAdapter.escapeShell(path);
            subtitles = OMXAdapter.escapeShell(subtitles);
            var cmd = sprintf(commands.play, escapedPath, subtitles);

            storage.setItem('current', path);
            storage.setItem('status', statuses.playing);
            this.sendKeys(cmd, true);
            this.watchForEnd(true);

            global.broadcast(this.createMessage(true, 'Playing'));
        }
    }, {
        key: 'pause',
        value: function pause() {
            if (storage.getItem('status') === statuses.playing) {
                storage.setItem('status', statuses.paused);
                this.sendKeys(commands.pause);
                this.watchForEnd(false);
                global.broadcast(this.createMessage(true, 'Paused'));
            } else {
                this.resume();
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            if (storage.getItem('status') === statuses.paused) {
                storage.setItem('status', statuses.playing);
                this.sendKeys(commands.pause);
                this.watchForEnd(true);
                global.broadcast(this.createMessage(true, 'Playing'));
            } else {
                global.broadcast(this.createMessage(false, 'Not playing!'));
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (storage.getItem('status') !== statuses.stopped) {
                storage.setItem('status', statuses.stopped);
                this.sendKeys(commands.stop);
                this.watchForEnd(false);
                global.broadcast(this.createMessage(true, 'Stopped'));
            } else {
                global.broadcast(this.createMessage(false, 'Not playing!'));
            }
        }
    }, {
        key: 'watchForEnd',
        value: function watchForEnd(watch) {
            var _this = this;

            if (watch) {
                _fs2['default'].watch(dirname + '/done.txt', function () {
                    if (storage.getItem('status') !== statuses.stopped) {
                        storage.setItem('status', statuses.stopped);
                        _this.watchForEnd(false);
                        global.broadcast(_this.createMessage(true, 'Finished'));
                    }
                });
            } else {
                _fs2['default'].unwatchFile(dirname + '/done.txt');
            }
        }
    }, {
        key: 'command',
        value: function command(_command) {
            this.sendKeys(_command);
            global.broadcast('success');
        }
    }, {
        key: 'sendKeys',
        value: function sendKeys(cmd, enter) {
            var tmuxCmd = sprintf(commands.tmux, session_name, cmd);
            _child_process2['default'].execSync(tmuxCmd);

            if (enter) {
                var enterCmd = sprintf(commands.tmux, session_name, 'C-m');
                _child_process2['default'].execSync(enterCmd);
            }
        }
    }, {
        key: 'createMessage',
        value: function createMessage(success, message) {
            var statusString = success ? 'success' : 'failure';
            return { status: statusString, message: message };
        }
    }], [{
        key: 'escapeShell',
        value: function escapeShell(cmd) {
            return '"' + cmd.replace(/(["\s'$`\\])/g, '\\$1') + '"';
        }
    }]);

    return OMXAdapter;
})();

exports.OMXAdapter = OMXAdapter;