import Path from 'path';
import fs from 'fs';
import mime from 'mime';
import process from 'child_process';

var base_url = '/downloads';

(function completeBaseURL() {
    let pwd = process.execSync('cd ~; pwd;').toString().trim();
    base_url = pwd + base_url;
})();

export class FileBrowser {
    constructor(path) {
        if (path) {
            this.path = Path.parse(path);
        }
        if (!this.path || !this.isValid()) {
            this.path = Path.parse(base_url);
        }
    }

    add(addition) {
        if (addition) {
            if (this.isValid(addition)) {
                this.path = Path.parse(addition);
            } else {
                let newPath = Path.join(Path.format(this.path), addition);
                if (this.isValid(newPath)) {
                    this.path = Path.parse(newPath);
                }
            }
        }
    }

    isValid(path) {
        if (!path) {
            path = Path.format(this.path);
        }

        try {
            fs.accessSync(path, fs.F_OK);
        } catch (err) {
            return false;
        }
        return path.indexOf(base_url) === 0;
    }

    getContent() {
        let content = {
            path: Path.format(this.path)
        };
        if (fs.lstatSync(content.path).isDirectory()) {
            content.content = fs.readdirSync(content.path);
            content.content = this.removeHiddenFiles(content.content);
            content.content = this.filterFiles(content.content);
        } else {
            content.subtitles = this.findSubtitles();
        }
        return content;
    }

    filterFiles(files) {
        return files.filter(file => {
            let mimetype = mime.lookup(file);
            let type = mimetype.substring(0, mimetype.indexOf('/'));
            return type === 'video' || mimetype === 'application/octet-stream';
        });
    }

    findSubtitles() {
        let dirContents = fs.readdirSync(this.path.dir);
        let subtitles = [];
        dirContents.forEach(file => {
            let path = Path.parse(Path.join(this.path.dir, file));
            if (path.ext === '.sub' || path.ext === '.srt') {
                subtitles.push({path: Path.format(path), name: path.base});
            }
        });

        return subtitles;
    }

    removeHiddenFiles(list) {
        return list.filter(item => {
            return item.indexOf('.') !== 0;
        });
    }
}
