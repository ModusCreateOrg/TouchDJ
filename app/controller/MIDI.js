/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/17/13
 * Time: 12:02 PM
 */
Ext.define('MDJ.controller.MIDI', {
    extend           : 'Ext.app.Controller',
    config           : {
        refs    : {
            'mixer'   : 'mixer',
            'deckA'   : {
                selector : 'deck[deckType=A]',
                xtype    : 'deck'
            },
            'deckB'   : {
                selector : 'deck[deckType=B]',
                xtype    : 'deck'
            }
        },
        control : {

        },
        midiMap : null,
        socket  : null
    },
    init             : function () {
        var me = this;
        me.on({
            setVolume : me.onSetVolume,
            eqChange  : me.onEqChange,
            playPause : me.onPlayPause,
            cue       : me.onCue,
            xfade     : me.onXFade,
            scope     : me
        });
    },
    launch           : function () {
        var me = this;
        me.loadMidiMap();
        me.callParent();
    },
    loadMidiMap      : function () {
        var me = this;
        Ext.Ajax.request({
            url     : "data/midi.json",
            success : me.onMIDIMapSuccess,
            failure : me.onMIDIMapFailure,
            scope   : me
        });
    },
    onMIDIMapSuccess : function (response, opts) {
        var me = this;
        me.setMidiMap(Ext.decode(response.responseText));
        me.initSocket();
    },
    onMIDIMapFailure : function () {

    },
    initSocket       : function () {
        var me     = this,
            socket = io.connect('http://' + location.hostname);

        socket.on('midiMessage', Ext.bind(me.onMidiMessage, me));
        me.setSocket(socket);
    },
    onMidiMessage    : function (data) {
        var controlId = data[1],
            value     = data[2],
            mapping   = this.getMidiMap()[controlId];
        if (mapping) {
            if (mapping.param) {
                this.fireEvent(mapping.event, mapping.param, mapping.deck, value);
            } else {
                this.fireEvent(mapping.event, mapping.deck, value);
            }
        }
    },
    onSetVolume : function (deckType, value) {
        var mixer    = this.getMixer(),
            volFader = mixer['getVol' + deckType + 'Dealer'](),
            newValue = ((100 - value) / 100);

        volFader.setValue(0, newValue, false);
    },
    onEqChange  : function (eqType, deckType, value) {
        var mixer = this.getMixer(),
            eqDealer = mixer['getEq' + deckType + 'Dealers']()[eqType],
            newValue = ((100 - value) / 100);

        eqDealer.setValue(0, newValue, false);
    },
    onPlayPause : function (deckType, value) {
        var deck = this['getDeck' + deckType]();
        deck.fireEvent('playPause', deck);
    },
    onCue       : function (deckType, value) {
        if (value > 0) {
            var deck = this['getDeck' + deckType]();
            deck.fireEvent('cue', deck);
        }
    },
    onXFade     : function (deckType, value) {
        var mixer        = this.getMixer(),
            xfaderDealer = mixer.getXfaderDealer(),
            newValue     = ((100 - value) / 100);

        xfaderDealer.setValue(newValue, 0, false);
    }
});