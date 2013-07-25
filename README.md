# Touch DJ
Touch DJ is a Mobile DJ App targeted for tablet resolutions implemented in Sencha Touch 2.2.

Features:
- Two CDJ-style audio decks
 * Real Time Waveform Display
 * Play / Cue
 * Looping
 * Pitch Adjustment
 * Pitch Bending

- 2 Channel Audio Mixer
 * 3 Band Equalizer (High, Mid, Low)
 * Channel Volume Control
 * Channel Volume Meters
 * Deck Transport Buttons

- Track Browser
 * Display Track Metadata and Cover Art
 * Deck Load Buttons

# How to Run
> Node.js & Npm is required

## Ubuntu

This set of instructions adapted from https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager will install NodeJS on an Ubuntu system, along with the required librtmidi library:

    sudo apt-get update
    sudo apt-get install librtmidi-dev python-software-properties python g++ make
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs


> MP3 Files need to be added to /tracks directory

1. Go into server directory
2. `npm install`
3. `node app.js`
4. Point your browser or iPad to URL

# MIDI Support
MIDI Support is enabled via WebSocket connection through the Node.js server.

To begin sending MIDI messages to the client make sure you open a MIDI Connection between the MIDI Controller and your computer. (Audio MIDI Setup in Mac)

After the MIDI connection is opened, then you can start the Node.js server and run the app.

MIDI Messages are emitted to all connected clients.

# License
Licensed under the MIT License.

See license.txt for more information
