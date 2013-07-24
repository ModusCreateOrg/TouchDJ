/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 5/19/13
 * Time: 10:35 AM
 */
Ext.define('MDJ.view.Browser', {
    extend : 'Ext.List',
    xtype  : 'browser',
    config : {
        cls              : 'browser',
        store            : 'Tracks',
        disableSelection : true,
        pressedCls       : '',
        itemTpl          : ''.concat(
            '<div class="track-item" data-path="{path}">',
                '<div class="cover-art" style="background-image: url(\'/getCoverArt?filePath={[encodeURIComponent(values.path)]} \')"></div>',
                '<span class="artist">{artist}</span>',
                ' - ',
                '<span class="title">{title}</span>',
                '<div class="flex-spacer"></div>',
                '<div class="load-btn btn btn-block A" data-deck="A">A</div>',
                '<div class="load-btn btn btn-block B" data-deck="B">B</div>',
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
        var loadDeckButton = evtObj.getTarget('.load-btn', null, true);

        if (loadDeckButton) {
            this.fireEvent('loadTrack', loadDeckButton.up('.track-item').dom.dataset.path, loadDeckButton.dom.dataset.deck);
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