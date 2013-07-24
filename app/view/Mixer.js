/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 5/19/13q
 * Time: 10:35 AM
 */
Ext.define('MDJ.view.Mixer', {
    extend         : 'Ext.Panel',
    xtype          : 'mixer',
    config         : {
        cls           : 'mixer-cmp',
        centered      : true,
        modal         : true,
        hideOnMaskTap : true,
        hidden        : true,
        showAnimation : {
            type     : 'popIn',
            duration : 250,
            easing   : 'ease-out'
        },
        hideAnimation : {
            type     : 'popOut',
            duration : 250,
            easing   : 'ease-out'
        },
        html          : ''.concat(
            '<div class="mixer">',
                '<div class="deck A">',
                    '<div class="deck-transport">',
                        '<div class="cue btn btn-large btn-block"  data-event="cue" data-decktype="A">CUE</div>',
                        '<div class="bend-down btn btn-large btn-block" data-decktype="A">-</div>',
                        '<div class="bend-up btn btn-large btn-block" data-decktype="A">+</div>',
                    '</div>',
                    '<div class=eq-outer>',
                        '<div class="dragdealer eq low">',
                            '<span class="eq-label">LOW</span>',
                            '<div class="eq-bar handle"></div>',
                        '</div>',
                        '<div class="dragdealer eq mid">',
                            '<span class="eq-label">MID</span>',
                            '<div class="eq-bar handle"></div>',
                        '</div>',
                        '<div class="dragdealer eq high">',
                            '<span class="eq-label">HIGH</span>',
                            '<div class="eq-bar handle"></div>',
                        '</div>',
                    '</div>',
                    '<div class="volume-outer">',
                        '<div class="dragdealer volume">',
                            '<span class="vol-label">VOL</span>',
                            '<div class="volume-bar handle"></div>',
                        '</div>',
                    '</div>',
                    '<div class="volume-meter">',
                        '<div class="meter"></div>',
                    '</div>',
                '</div>',
                '<div class="deck B">',
                    '<div class="volume-meter">',
                        '<div class="meter"></div>',
                    '</div>',
                    '<div class="volume-outer">',
                        '<div class="dragdealer volume">',
                            '<span class="vol-label">VOL</span>',
                            '<div class="volume-bar handle"></div>',
                        '</div>',
                    '</div>',
                    '<div class=eq-outer>',
                        '<div class="dragdealer eq low">',
                            '<span class="eq-label">LOW</span>',
                            '<div class="eq-bar handle"></div>',
                        '</div>',
                        '<div class="dragdealer eq mid">',
                            '<span class="eq-label">MID</span>',
                            '<div class="eq-bar handle"></div>',
                        '</div>',
                        '<div class="dragdealer eq high">',
                            '<span class="eq-label">HIGH</span>',
                            '<div class="eq-bar handle"></div>',
                        '</div>',
                    '</div>',
                    '<div class="deck-transport">',
                        '<div class="cue btn btn-large btn-block"  data-event="cue" data-decktype="B">CUE</div>',
                        '<div class="bend-down btn btn-large btn-block" data-decktype="B">-</div>',
                        '<div class="bend-up btn btn-large btn-block" data-decktype="B">+</div>',
                    '</div>',
                '</div>',
            '</div>',
            '<div class="mixer-footer">',
                '<div class="xfader-outer">',
                    '<div class="dragdealer xfader">',
                        '<div class="xfader-bar handle"></div>',
                    '</div>',
                '</div>',
            '</div>'
        ),
        mixerData    : {
            A : {
                low    : 0,
                mid    : 0,
                high   : 0,
                vol    : 0.25,
                faders : {
                    low  : 0.5,
                    mid  : 0.5,
                    high : 0.5,
                    vol  : 0.75
                }
            },
            B : {
                low    : 0,
                mid    : 0,
                high   : 0,
                vol    : 0.25,
                faders : {
                    low  : 0.5,
                    mid  : 0.5,
                    high : 0.5,
                    vol  : 0.75
                }
            },
            xfade : 0.5
        },
        volADealer   : null,
        volBDealer   : null,
        eqADealers   : null,
        eqBDealers   : null,
        xfaderDealer : null,
        initComplete : false
    },
    initialize     : function () {
        var me = this;

        me.on({
            painted : me.onPainted,
            scope   : me
        });

        me.element.on({
            tap        : me.onTap,
            touchstart : me.onTouchStart,
            touchend   : me.onTouchEnd,
            scope      : me
        });

        me.callParent();
    },
    onPainted      : function () {
        if(!this.getInitComplete()) {
            this.initFaders();
        }
    },
    onTap          : function (evtObj) {
        var me    = this,
            btn   = evtObj.getTarget('.btn', null, true),
            event = btn && btn.dom.dataset.event;

        event && me.fireEvent(btn.dom.dataset.event, Ext.ComponentQuery.query('deck[deckType="' + btn.dom.dataset.decktype + '"]')[0]);
    },
    onTouchStart   : function (evtObj) {
        var me          = this,
            button      = evtObj.getTarget('.btn', null, true),
            bendUpBtn   = evtObj.getTarget('.bend-up', null, true),
            bendDownBtn = evtObj.getTarget('.bend-down', null, true);
        if(button) {
            button.addCls("pressed");
        }
        if (bendUpBtn) {
            me.fireEvent("bendStart", true, Ext.ComponentQuery.query('deck[deckType="' + bendUpBtn.dom.dataset.decktype + '"]')[0]);
        } else if (bendDownBtn) {
            me.fireEvent("bendStart", false, Ext.ComponentQuery.query('deck[deckType="' + bendDownBtn.dom.dataset.decktype + '"]')[0]);
        }
    },
    onTouchEnd     : function (evtObj) {
        var me          = this,
            playButton  = evtObj.getTarget('.play', null, true),
            button      = evtObj.getTarget('.btn', null, true),
            bendUpBtn   = evtObj.getTarget('.bend-up', null, true),
            bendDownBtn = evtObj.getTarget('.bend-down', null, true);

        if(!playButton && button) {
            button.removeCls("pressed");
        }

        if (bendUpBtn || bendDownBtn) {
            me.fireEvent("bendStop", Ext.ComponentQuery.query('deck[deckType="' + (bendUpBtn || bendDownBtn).dom.dataset.decktype + '"]')[0]);
        }
    },
    initFaders     : function () {
        var me         = this,
            element    = me.element,
            deckA      = element.down('.deck.A'),
            deckB      = element.down('.deck.B'),
            mixerData  = me.getMixerData(),
            faderDataA = mixerData.A.faders,
            faderDataB = mixerData.B.faders,
            baseConfig = {
                horizontal : false,
                vertical   : true,
                y          : 1.0,
                slide      : false
            },
            eqConfigA  = Ext.merge({}, baseConfig, {
                y                 : 0.5,
                animationCallback : Ext.bind(me.onEqFaderDrag, me, ['A'], true)
            }),
            eqConfigB  = Ext.merge({}, baseConfig, {
                y                 : 0.5,
                animationCallback : Ext.bind(me.onEqFaderDrag, me, ['B'], true)
            }),
            volConfigA = Ext.merge({}, baseConfig, {
                animationCallback : Ext.bind(me.onVolFaderDrag, me, ['A'], true)
            }),
            volConfigB = Ext.merge({}, baseConfig, {
                animationCallback : Ext.bind(me.onVolFaderDrag, me, ['B'], true)
            });


        me.setEqADealers({
            low  : new Dragdealer(deckA.down('.eq.low').dom, Ext.merge(eqConfigA, { y : faderDataA.low})),
            mid  : new Dragdealer(deckA.down('.eq.mid').dom, Ext.merge(eqConfigA, { y : faderDataA.mid})),
            high : new Dragdealer(deckA.down('.eq.high').dom, Ext.merge(eqConfigA, { y : faderDataA.high}))
        });

        me.setVolADealer(new Dragdealer(deckA.down('.volume').dom, Ext.merge(volConfigA, { y : faderDataA.vol})));

        me.setEqBDealers({
            low  : new Dragdealer(deckB.down('.eq.low').dom, Ext.merge(eqConfigB, { y : faderDataB.low})),
            mid  : new Dragdealer(deckB.down('.eq.mid').dom, Ext.merge(eqConfigB, { y : faderDataB.mid})),
            high : new Dragdealer(deckB.down('.eq.high').dom, Ext.merge(eqConfigB, { y : faderDataB.high}))
        });

        me.setVolBDealer(new Dragdealer(deckB.down('.volume').dom, Ext.merge(volConfigB, { y : faderDataB.vol})));

        me.setXfaderDealer(new Dragdealer(element.down(".xfader").dom, {
            horizontal        : true,
            vertical          : false,
            x                 : mixerData.xfade,
            animationCallback : Ext.bind(me.onXFaderDrag, me)
        }));

        me.setInitComplete(true);
    },
    onEqFaderDrag  : function (x, y, dealer, deckType) {
        this.fireEvent('setEQ', y, dealer.wrapper.classList[2], deckType);
    },
    onVolFaderDrag : function (x, y, dealer, deckType) {
        this.fireEvent('setVolume', y, deckType);
    },
    onXFaderDrag   : function (x) {
        var xfaderDealer = this.getXfaderDealer();
        if(xfaderDealer && x >= 0.47 && x <= 0.53) {
            xfaderDealer.setValue(0.5, 0, true);
            x = 0.5;
        }
        this.fireEvent('xfade', x);
    }
});