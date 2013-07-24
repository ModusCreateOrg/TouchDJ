/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 5/19/13
 * Time: 10:38 AM
 */
Ext.define('MDJ.view.Deck', {
    extend           : 'Ext.Component',
    xtype            : 'deck',
    config           : {
        cls             : 'deck-cmp',
        deckType        : 'A', //A or B
        tpl             : ''.concat(
            '<div class="deck-header">',
                '<div class="cover-art"></div>',
                '<div class="track-info">',
                    '<div class="title"></div>',
                    '<div class="artist"></div>',
                '</div>',
                '<div class="flex-spacer"></div>',
                '<div class="pitch-display">0</div>',
            '</div>',
            '<div class="deck">',
                '<div class="transport">',
                    '<div class="play btn btn-large btn-block" data-event="playPause"><div class="play-arrow"></div></div>',
                    '<div class="cue btn btn-large btn-block"  data-event="cue">CUE</div>',
                '</div>',
                '<div class="waveform">',
                    '<canvas id="wave-{deckType}" data-decktype="{deckType}"></canvas>',
                '</div>',
                '<div class="pitch-control">',
                    '<div class="dragdealer pitch">',
                        '<div class="pitch-bar handle"></div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="deck-controls">',
                '<div class="loop-in btn btn-large btn-block" data-event="loopIn">IN</div>',
                '<div class="loop-out btn btn-large btn-block" data-event="loopOut">OUT</div>',
                '<div class="loop-cancel btn btn-large btn-block" data-event="loopCancel">X</div>',
                '<div class="flex-spacer"></div>',
                '<div class="bend-down btn btn-large btn-block">-</div>',
                '<div class="bend-up btn btn-large btn-block">+</div>',
            '</div>'
        ),
        cursorColor     : '#3498db',
        loopCursorColor : '#2ecc71',
        waveSurfer      : null,
        tapCommands     : null,
        pitchOffset     : null,
        pitchRate       : 1,
        playing         : false,
        trackTags       : null,
        cuePosition     : null,
        loopInPos       : null,
        loopOutPos      : null,
        loop            : null,
        bendInterval    : null
    },

    initialize       : function () {
        var me = this;

        me.setData({
            deckType : me.getDeckType()
        });

        me.on({
            'painted' : me.onPainted
        });

        me.element.on({
            tap        : me.onTap,
            touchstart : me.onTouchStart,
            touchend   : me.onTouchEnd,
            scope      : me
        });

        me.callParent();
    },
    initWaveSurfer   : function () {
        var me           = this,
            element      = me.element,
            canvas       = element.down('canvas').dom,
            waveSurfer   = Object.create(WaveSurfer),
            processCount = 0;

        waveSurfer.init({
            canvas        : canvas,
            loadPercent   : true,
            fillParent    : true,
            waveColor     : '#2980b9',
            progressColor : '#34495e',
            cursorColor   : '#3498db'
        });
        waveSurfer.bindDragNDrop(element.dom);
        waveSurfer.bindClick(canvas, Ext.bind(me.onWaveformSnap, me));

        if (Ext.os.is.iOS) { // temp hack
            waveSurfer.onAudioProcess = function(evt) {
                processCount += 1;
                if (!waveSurfer.backend.isPaused() && (processCount % 2 == 0)) {
                    waveSurfer.drawer.progress(waveSurfer.backend.getPlayedPercents())
                }
                me.fireEvent('audioUpdated', evt, me.getDeckType(), waveSurfer.backend.analyser);
            };
        } else {
            waveSurfer.onAudioProcess = function(evt) {
                if (!waveSurfer.backend.isPaused()) {
                    waveSurfer.drawer.progress(waveSurfer.backend.getPlayedPercents())
                }
                me.fireEvent('audioUpdated', evt, me.getDeckType(), waveSurfer.backend.analyser);
            };
        }

        this.setWaveSurfer(waveSurfer);
    },
    initDragDealer   : function () {
        var me         = this,
            pitchFader = me.element.down('.pitch').dom;

        new Dragdealer(pitchFader, {
            horizontal        : false,
            vertical          : true,
            y                 : 0.5,
            slide             : false,
            steps             : 200,
            snap              : false,
            animationCallback : Ext.bind(me.onFaderDrag, me)
        });
    },

    onPainted        : function () {
        var me = this;
        me.initWaveSurfer();
        me.initDragDealer();
    },
    onWaveformSnap   : function () {
        this.fireEvent('waveformSnap', this);
    },
    onFaderDrag      : function (x, y) {
        var me = this;
        me.fireEvent('changePitch', y, me);
    },
    onTap            : function (evtObj) {
        var me    = this,
            btn   = evtObj.getTarget('.btn', null, true),
            event = btn && btn.dom.dataset.event;

        event && me.fireEvent(btn.dom.dataset.event, me);
    },
    onTouchStart     : function (evtObj) {
        var me          = this,
            button      = evtObj.getTarget('.btn', null, true),
            bendUpBtn   = evtObj.getTarget('.bend-up', null, true),
            bendDownBtn = evtObj.getTarget('.bend-down', null, true);
        if (button) {
            button.addCls("pressed");
        }
        if (bendUpBtn) {
            this.fireEvent("bendStart", true, this);
        } else if (bendDownBtn) {
            this.fireEvent("bendStart", false, this);
        }
    },
    onTouchEnd       : function (evtObj) {
        var playButton  = evtObj.getTarget('.play', null, true),
            button      = evtObj.getTarget('.btn', null, true),
            bendUpBtn   = evtObj.getTarget('.bend-up', null, true),
            bendDownBtn = evtObj.getTarget('.bend-down', null, true);

        if (!playButton && button) {
            button.removeCls("pressed");
        }

        if (bendUpBtn || bendDownBtn) {
            this.fireEvent("bendStop", this);
        }
    },

    loadSong         : function (url) {
        var me         = this,
            waveSurfer = me.getWaveSurfer();

        waveSurfer.drawer.clear();
        waveSurfer.load(url + '?_dc=' + Date.now());

        ID3.loadTags(url, function () {
            var tags = ID3.getAllTags(url);
            me.setTrackTags(tags);
        }, {tags : ["artist", "title", "album", "year", "comment", "track", "genre", "lyrics", "picture"]});
    },
    applyPlaying     : function (isPlaying) {
        var me         = this,
            playButton = me.element.down('.play');

        if (playButton) {
            if (isPlaying) {
                playButton.addCls("pressed");
            } else {
                playButton.removeCls("pressed");
            }
            clearInterval(this.getLoop());
            me.getWaveSurfer().drawer.params.cursorColor = me.getCursorColor();
        }

        return isPlaying;
    },
    applyTrackTags   : function (tags) {
        var element  = this.element,
            coverArt = tags.picture,
            coverArtData;

        if (coverArt) {
            coverArtData = ''.concat('url(data:', coverArt.format, ';base64,', Base64.encodeBytes(coverArt.data), ')');
            element.down('.cover-art').setStyle("background-image", coverArtData);
        }

        element.down('.title').setHtml(tags.title);
        element.down('.artist').setHtml(tags.artist);
        return tags;
    },
    applyPitchOffset : function (pitchOffset) {
        var pitchAmount = 0.0;
        if (pitchOffset > 0) {
            pitchAmount = "-" + pitchOffset.toFixed(1) + "%";
        } else if (pitchOffset < 0) {
            pitchAmount = "+" + (pitchOffset * -1).toFixed(1) + "%";
        }
        this.element.down('.pitch-display').setHtml(pitchAmount);
    }
});