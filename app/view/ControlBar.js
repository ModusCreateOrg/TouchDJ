/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/25/13
 * Time: 12:57 AM
 */
Ext.define('MDJ.view.ControlBar', {
    extend       : 'Ext.Component',
    xtype        : 'controlbar',
    config       : {
        styleHtmlContent : true,
        cls              : 'controlbar-cmp',
        html             : ''.concat(
            '<div class="control-bar">',
                '<div class="open-mixer btn btn-block" data-event="openMixer">Mixer</div>',
                '<div class="flex-spacer"></div>',
                '<div class="open-browser btn btn-block" data-event="openBrowser">Tracks</div>',
                '<div class="logo"></div>',
            '</div>'
        )
    },
    initialize   : function () {
        var me = this;
        me.element.on({
            tap        : me.onTap,
            touchstart : me.onTouchStart,
            touchend   : me.onTouchEnd,
            scope      : me
        });
        me.callParent();
    },
    onTap        : function (evtObj) {
        var btn = evtObj.getTarget('.btn', null, true);

        if (btn) {
            this.fireEvent(btn.dom.dataset.event);
        }
    },
    onTouchStart : function (evtObj) {
        var button = evtObj.getTarget('.btn', null, true);
        if (button) {
            button.addCls("pressed");
        }
    },
    onTouchEnd   : function (evtObj) {
        var button = evtObj.getTarget('.btn', null, true);
        if (button) {
            button.removeCls("pressed");
        }
    }
});