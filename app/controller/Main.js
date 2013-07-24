/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 5/19/13
 * Time: 9:38 AM
 */
Ext.define('MDJ.controller.Main', {
    extend        : 'Ext.app.Controller',
    config        : {
        refs    : {
            deckContainer : {
                selector   : 'deckcontainer',
                xtype      : 'deckcontainer',
                autoCreate : true
            },
            mixer         : {
                selector   : 'mixer',
                xtype      : 'mixer',
                autoCreate : true
            },
            browserPanel  : {
                selector   : 'browserpanel',
                xtype      : 'browserpanel',
                autoCreate : true
            },
            controlBar    : 'controlbar'
        },
        control : {
            'controlbar' : {
                'openMixer'   : 'onOpenMixer',
                'openBrowser' : 'onOpenBrowser'
            }
        }
    },
    launch        : function () {
        var me       = this,
            viewport = Ext.Viewport;

        viewport.add([
            me.getDeckContainer(),
            me.getMixer(),
            me.getBrowserPanel()
        ]);

        viewport.on({
            resize            : me.onResize,
            orientationchange : me.onResize,
            scope             : me
        });
    },
    onResize : function () {
        var mixer = this.getMixer();
        if (mixer.getInitComplete()) {
            mixer.setInitComplete(false);
        }
    },
    onOpenMixer   : function () {
        this.getMixer().show();
    },
    onOpenBrowser : function () {
        this.getBrowserPanel().show();
    }
});