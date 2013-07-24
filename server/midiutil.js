/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/17/13
 * Time: 11:40 AM
 */
var midi = require('midi'),
    input;

exports.initMidi = function (messageCallback) {
    input = new midi.input();
    if (input.getPortCount() > 0) {
        input.on('message', messageCallback);
        input.openPort(0);
    }
};

exports.closeMidi = function () {
    input.closePort();
};