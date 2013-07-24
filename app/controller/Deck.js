/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 5/22/13
 * Time: 2:49 PM
 */
Ext.define('MDJ.controller.Deck', {
    extend          : 'Ext.app.Controller',
    config          : {
        refs    : {
            'mixer'        : 'mixer',
            'deckA'        : {
                selector : 'deck[deckType=A]',
                xtype    : 'deck'
            },
            'deckB'        : {
                selector : 'deck[deckType=B]',
                xtype    : 'deck'
            },
            'browser'      : 'browser',
            'browserPanel' : 'browserpanel'
        },
        control : {
            'deck'    : {
                'playPause'    : 'onDeckPlayPause',
                'cue'          : 'onDeckCue',
                'changePitch'  : 'onChangePitch',
                'waveformSnap' : 'onWaveformSnap',
                'loopIn'       : 'onLoopIn',
                'loopOut'      : 'onLoopOut',
                'loopCancel'   : 'onLoopCancel',
                'bendStart'    : 'onBendStart',
                'bendStop'     : 'onBendStop',
                'audioUpdated' : 'onAudioUpdated'
            },
            'mixer'   : {
                'setVolume' : 'onSetVolume',
                'setEQ'     : 'onSetEQ',
                'cue'       : 'onDeckCue',
                'bendStart' : 'onBendStart',
                'bendStop'  : 'onBendStop',
                'xfade'     : 'onXFade'
            },
            'browser' : {
                'loadTrack' : 'onLoadTrack'
            }
        }
    },
    onDeckPlayPause : function (deck) {
        var me         = this,
            mixerData  = me.getMixer().getMixerData()[deck.getDeckType()],
            waveSurfer = deck.getWaveSurfer(),
            backend    = waveSurfer.backend;
        waveSurfer.playPause();
        if (!backend.paused) {
            me.initMixerNodes(backend);
            me.applyPitchAndMixerSettings(backend, deck.getPitchRate(), mixerData);
        }
        deck.setPlaying(!deck.getPlaying());
    },
    initMixerNodes : function (backend) {
        var ac        = backend.ac,
            master    = backend.masterGain = ac.createGainNode(),
            xfadeGain = backend.xfadeGain  = ac.createGainNode(),
            lowEQ     = backend.low        = ac.createBiquadFilter(),
            midEQ     = backend.mid        = ac.createBiquadFilter(),
            highEQ    = backend.high       = ac.createBiquadFilter();

        master.connect(ac.destination);

        backend.source.connect(highEQ);
        highEQ.connect(midEQ);
        midEQ.connect(lowEQ);
        lowEQ.connect(xfadeGain);
        xfadeGain.connect(master);

        lowEQ.type  = 5;
        lowEQ.frequency.value = 440;
        midEQ.type  = 5;
        midEQ.frequency.value = 1000;
        highEQ.type = 5;
        highEQ.frequency.value = 3000;
    },
    onAudioUpdated  : function (evt, deckType) {
        var input = evt.inputBuffer.getChannelData(0),
            len   = input.length,
            total = 0,
            i     = 0,
            meter = this.getMixer().element.down('.deck.' + deckType + ' .volume-meter .meter').dom,
            rms;
        while (i < len) {
            total += Math.abs(input[i++]);
        }
        rms = Math.sqrt(total / len) * 100;

        meter.style.height = 100 - rms + '%';

    },
    onDeckCue       : function (deck) {
        var me         = this,
            mixerData  = me.getMixer().getMixerData()[deck.getDeckType()],
            waveSurfer = deck.getWaveSurfer(),
            backend    = waveSurfer.backend,
            cuePosition;

        cuePosition = deck.getCuePosition();

        if (!cuePosition || backend.paused) {
            cuePosition = backend.getCurrentTime();
        }

        backend.play(cuePosition);
        me.initMixerNodes(backend);
        me.applyPitchAndMixerSettings(backend, deck.getPitchRate(), mixerData);

        delete waveSurfer.drawer.markers.cue;

        waveSurfer.mark({
            id    : 'cue',
            color : '#3498db'
        });

        deck.setCuePosition(cuePosition);
        deck.setPlaying(true);
    },
    onChangePitch   : function (offset, deck) {
        var baseRate    = 0.5 - offset,
            pitchOffset = baseRate.toFixed(2) * 2 * 10,
            newRate     = 1 - (pitchOffset / 100),
            backend     = deck.getWaveSurfer().backend;

        if (backend.source) {
            backend.source.playbackRate.value = newRate;
        }
        deck.setPitchOffset(pitchOffset);
        deck.setPitchRate(newRate);
    },
    onWaveformSnap : function (deck) {
        var me        = this,
            mixerData = me.getMixer().getMixerData()[deck.getDeckType()],
            backend   = deck.getWaveSurfer().backend;

        deck.setPlaying(true);
        deck.element.down('.play').addCls("pressed");
        me.initMixerNodes(backend);
        me.applyPitchAndMixerSettings(backend, deck.getPitchRate(), mixerData);
    },
    onSetVolume : function (faderPos, deckType) {
        var deck       = this['getDeck' + deckType](),
            mixer      = this.getMixer(),
            mixerData  = mixer.getMixerData()[deckType],
            waveSurfer = deck.getWaveSurfer(),
            backend    = waveSurfer && deck.getWaveSurfer().backend,
            volume     = ((-1 * faderPos) + 1);

        mixerData.vol = volume;
        mixerData.faders.vol = faderPos;

        if (backend && backend.source) {
            backend.masterGain.gain.value = volume;
        }
    },
    onSetEQ      : function (faderPos, eqType, deckType) {
        var deck       = this['getDeck' + deckType](),
            mixer      = this.getMixer(),
            mixerData  = mixer.getMixerData()[deckType],
            waveSurfer = deck.getWaveSurfer(),
            backend    = waveSurfer && deck.getWaveSurfer().backend,
            eqVal      = (((-1 * faderPos) + 1) * 40) - 20;

        mixerData[eqType] = eqVal;
        mixerData.faders[eqType] = faderPos;

        if (backend && backend[eqType]) {
            backend[eqType].gain.value = eqVal;
        }

    },
    applyPitchAndMixerSettings : function (backend, pitch, mixerData) {
        backend.source.playbackRate.value = pitch;
        backend.masterGain.gain.value     = mixerData.vol;
        backend.low.gain.value            = mixerData.low;
        backend.mid.gain.value            = mixerData.mid;
        backend.high.gain.value           = mixerData.high;
    },
    onLoopIn : function (deck) {
        var waveSurfer  = deck.getWaveSurfer(),
            backend     = waveSurfer.backend,
            currentPos  = backend.getCurrentTime(),
            cursorColor = deck.getLoopCursorColor(),
            markers     = waveSurfer.drawer.markers;

        clearInterval(deck.getLoop());
        deck.setLoopInPos(currentPos);
        deck.setLoopOutPos(null);

        delete markers.loopIn;
        delete markers.loopOut;

        waveSurfer.mark({
            id    : 'loopIn',
            color : cursorColor
        });
        waveSurfer.drawer.params.cursorColor = cursorColor;
    },
    onLoopOut : function (deck) {
        var me         = this,
            waveSurfer = deck.getWaveSurfer(),
            backend    = waveSurfer.backend,
            loopInPos  = deck.getLoopInPos(),
            currentPos = backend.getCurrentTime(),
            loopOutPos = deck.getLoopOutPos(),
            timer,
            interval;

        if (!loopOutPos) {
            deck.setLoopOutPos(currentPos);
            loopOutPos = currentPos;
            waveSurfer.mark({
                id    : 'loopOut',
                color : deck.getLoopCursorColor()
            });
        } else {
            clearInterval(deck.getLoop());
        }
        timer    = (loopOutPos - loopInPos) * 1000;
        interval = setInterval(me.getLoopFunc(me, backend, loopInPos, deck)(), timer);
        deck.setLoop(interval);
    },
    getLoopFunc : function (me, backend, loopInPos, deck) {
        return function fn() {
            backend.play(loopInPos);
            me.initMixerNodes(backend);
            me.applyPitchAndMixerSettings(backend, deck.getPitchRate(), me.getMixer().getMixerData()[deck.getDeckType()]);
            return fn;
        };
    },
    onLoopCancel  : function (deck) {
        var waveSurfer = deck.getWaveSurfer();
        clearInterval(deck.getLoop());
        waveSurfer.drawer.params.cursorColor = deck.getCursorColor();
    },
    onBendStart   : function (bendUp, deck) {
        var waveSurfer = deck.getWaveSurfer(),
            source     = waveSurfer.backend.source,
            interval   = setInterval(this.getBendFunc(source, bendUp)(), 50);
        deck.setBendInterval(interval);
    },
    onBendStop    : function (deck) {
        var waveSurfer = deck.getWaveSurfer(),
            source     = waveSurfer.backend.source,
            pitchRate  = deck.getPitchRate();

        clearInterval(deck.getBendInterval());
        source.playbackRate.value = pitchRate;
    },
    getBendFunc     : function (source, bendUp) {
        var rate = bendUp ? 1.001 : 0.999;
        return function fn() {
            source.playbackRate.value = source.playbackRate.value * rate;
            return fn;
        };
    },
    onXFade     : function (x) {
        var me        = this,
            wsA       = me.getDeckA().getWaveSurfer(),
            wsB       = me.getDeckB().getWaveSurfer(),
            backendA  = wsA && wsA.backend,
            backendB  = wsB && wsB.backend,
            deckAGain = backendA && backendA.xfadeGain,
            deckBGain = backendB && backendB.xfadeGain,
            gainA     = Math.cos(x * 0.5 * Math.PI),
            gainB     = Math.cos((1.0 - x) * 0.5 * Math.PI);

        me.getMixer().getMixerData().xfade = x;

        if (deckAGain) {
            deckAGain.gain.value = gainA;
        }

        if (deckBGain) {
            deckBGain.gain.value = gainB;
        }
    },
    onLoadTrack : function (path, deckType) {
        var me   = this,
            deck = me['getDeck' + deckType]();
        deck.loadSong(path);
        me.getBrowserPanel().hide();
    }
});