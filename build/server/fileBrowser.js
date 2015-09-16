'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var base_url = '/downloads';

(function completeBaseURL() {
    var pwd = _child_process2['default'].execSync('cd ~; pwd;').toString().trim();
    base_url = pwd + base_url;
})();

var FileBrowser = (function () {
    function FileBrowser(path) {
        _classCallCheck(this, FileBrowser);

        if (path) {
            this.path = _path2['default'].parse(path);
        }
        if (!this.path || !this.isValid()) {
            this.path = _path2['default'].parse(base_url);
        }
    }

    _createClass(FileBrowser, [{
        key: 'add',
        value: function add(addition) {
            if (addition) {
                if (this.isValid(addition)) {
                    this.path = _path2['default'].parse(addition);
                } else {
                    var newPath = _path2['default'].join(_path2['default'].format(this.path), addition);
                    if (this.isValid(newPath)) {
                        this.path = _path2['default'].parse(newPath);
                    }
                }
            }
        }
    }, {
        key: 'isValid',
        value: function isValid(path) {
            if (!path) {
                path = _path2['default'].format(this.path);
            }

            try {
                _fs2['default'].accessSync(path, _fs2['default'].F_OK);
            } catch (err) {
                return false;
            }
            return path.indexOf(base_url) === 0;
        }
    }, {
        key: 'getContent',
        value: function getContent() {
            var content = {
                path: _path2['default'].format(this.path)
            };
            if (_fs2['default'].lstatSync(content.path).isDirectory()) {
                content.content = _fs2['default'].readdirSync(content.path);
                content.content = this.removeHiddenFiles(content.content);
                content.content = this.filterFiles(content.content);
            } else {
                content.subtitles = this.findSubtitles();
            }
            return content;
        }
    }, {
        key: 'filterFiles',
        value: function filterFiles(files) {
            return files.filter(function (file) {
                var mimetype = _mime2['default'].lookup(file);
                var type = mimetype.substring(0, mimetype.indexOf('/'));
                return type === 'video' || mimetype === 'application/octet-stream';
            });
        }
    }, {
        key: 'findSubtitles',
        value: function findSubtitles() {
            var _this = this;

            var dirContents = _fs2['default'].readdirSync(this.path.dir);
            var subtitles = [];
            dirContents.forEach(function (file) {
                var path = _path2['default'].parse(_path2['default'].join(_this.path.dir, file));
                if (path.ext === '.sub' || path.ext === '.srt') {
                    subtitles.push({ path: _path2['default'].format(path), name: path.base });
                }
            });

            return subtitles;
        }
    }, {
        key: 'removeHiddenFiles',
        value: function removeHiddenFiles(list) {
            return list.filter(function (item) {
                return item.indexOf('.') !== 0;
            });
        }
    }]);

    return FileBrowser;
})();

exports.FileBrowser = FileBrowser;