'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodePersist = require('node-persist');

var _nodePersist2 = _interopRequireDefault(_nodePersist);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressWs = require('express-ws');

var _expressWs2 = _interopRequireDefault(_expressWs);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _OMXAdapterJs = require('./OMXAdapter.js');

var _fileBrowserJs = require('./fileBrowser.js');

var _downloadJs = require('./download.js');

var app = (0, _express2['default'])();
var expressWs = (0, _expressWs2['default'])(app);
global.dirname = __dirname + '/../..';

app.use('/', (0, _serveStatic2['default'])(dirname + "/src/static/"));
app.use('/', (0, _serveStatic2['default'])(dirname + "/build/"));

_nodePersist2['default'].initSync({
    dir: 'data.js'
});
global.storage = _nodePersist2['default'];

var omx = new _OMXAdapterJs.OMXAdapter();

app.ws('/', function (ws, req) {
    ws.on('message', function (message) {
        message = JSON.parse(message);
        switch (message.action) {
            case 'play':
                omx.play(message.path, message.subtitle);
                break;
            case 'pause':
                omx.pause();
                break;
            case 'stop':
                omx.stop();
                break;
            case 'command':
                omx.command(message.command);
                break;
        }
    });
});

app.get('/navigate', function (req, res) {
    var fileBrowser = new _fileBrowserJs.FileBrowser(req.query.path);
    fileBrowser.add(req.query.addition);
    var content = fileBrowser.getContent();
    content.current = _nodePersist2['default'].getItem('current');
    content.status = _nodePersist2['default'].getItem('status');
    res.send(JSON.stringify(content));
});

app.get('/download', function (req, res) {
    _downloadJs.Download.download(req.query.magnet);
});

global.broadcast = function (message) {
    var wss = expressWs.getWss('/');
    wss.clients.forEach(function (client) {
        client.send(JSON.stringify(message));
    });
};

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});