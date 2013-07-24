/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/12/13
 * Time: 12:52 AM
 */
var fs             = require('fs'),
    path           = require('path'),
    mm             = require('musicmetadata'),
    tracks         = [],
    tracksCount    = 0,
    processedCount = 0,
    TRACKS_DIR     = '../tracks',
    onMetadata;

onMetadata = function (result) {
    delete result.picture;

    var fileMeta = result,
        filePath = this.stream.path;

    fileMeta.path = filePath;
    tracks.push(fileMeta);
    processedCount++;
};

exports.loadTracks = function () {
    fs.readdir(TRACKS_DIR, function (err, files) {
        var filesLength = files.length,
            file,
            parser,
            i;

        for (i = 0; i < filesLength; i++) {
            file = files[i];

            if(file.indexOf('.mp3') !== -1) {
                tracksCount++;
                parser = new mm(fs.createReadStream(''.concat(TRACKS_DIR,'/',file)));
                parser.on('metadata', onMetadata);
            }
        }
    });
};

exports.getProcessedCount = function () {
    return processedCount;
};

exports.getTracksCount = function () {
    return tracksCount;
};

exports.getTracks = function () {
    return tracks;
};

exports.getCoverArt = function (filePath, callback) {
    var parser = new mm(fs.createReadStream(filePath));
    parser.on('picture', callback);
};
