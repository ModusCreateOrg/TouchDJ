/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/11/13
 * Time: 2:36 PM
 */
var express   = require('express'),
    trackUtil = require('./trackutil.js'),
    midiUtil  = require('./midiutil.js'),
    async     = require('async'),
    app       = express(),
    server    = require('http').createServer(app),
    io        = require('socket.io').listen(server);


trackUtil.loadTracks();

server.listen(8080);

app.use("/getTracks", function (req, res, next) {
    async.until(
        function() {
            var tracksCount    = trackUtil.getTracksCount(),
                processedCount = trackUtil.getProcessedCount();
            return tracksCount > 0 && tracksCount === processedCount;
        },
        function() {

        },
        function () {
            res.json({tracks : trackUtil.getTracks()});
        }
    );
});

app.use('/getCoverArt', function (req, res, next) {
    trackUtil.getCoverArt(req.query.filePath, function (result) {
        res.send(result[0].data);
    });
});

app.use(express.static('../'));

midiUtil.initMidi(function (deltaTime, message) {
    io.sockets.emit('midiMessage', message);
});

io.sockets.on('connection', function (socket) {
});