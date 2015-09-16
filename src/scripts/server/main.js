import storage from 'node-persist';
import serveStatic from 'serve-static';
import express from 'express';
import express_ws from 'express-ws';
import fs from 'fs';
import {OMXAdapter} from './OMXAdapter.js';
import {FileBrowser} from './fileBrowser.js';
import {Download} from './download.js';

let app = express();
let expressWs = express_ws(app);
global.dirname = process.cwd();

app.use('/', serveStatic(dirname + "/src/static/"));
app.use('/', serveStatic(dirname + "/build/"));

storage.initSync({
    dir: 'data.js'
});
global.storage = storage;

let omx = new OMXAdapter();

app.ws('/', (ws, req) => {
    ws.on('message', (message) => {
        message = JSON.parse(message);
        switch(message.action) {
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

app.get('/navigate', (req, res) => {
    let fileBrowser = new FileBrowser(req.query.path);
    fileBrowser.add(req.query.addition);
    let content = fileBrowser.getContent();
    content.current = storage.getItem('current');
    content.status = storage.getItem('status');
    res.send(JSON.stringify(content));
});

app.get('/download', (req, res) => {
    Download.download(req.query.magnet);
});

global.broadcast = message => {
    let wss = expressWs.getWss('/');
    wss.clients.forEach((client) => {
        client.send(JSON.stringify(message));
    });
}

var server = app.listen(8080, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log('Listening at http://%s:%s', host, port);
});

