/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/25/13
 * Time: 1:22 AM
 */
Ext.define('MDJ.view.BrowserPanel', {
    extend : 'Ext.Panel',
    xtype  : 'browserpanel',
    config : {
        cls           : 'browser-panel',
        centered      : true,
        modal         : true,
        hideOnMaskTap : true,
        hidden        : true,
        showAnimation : {
            type     : 'popIn'
        },
        hideAnimation : {
            type     : 'popOut'
        },
        items         : [
            {
                xtype   : 'component',
                html    : 'Tracks',
                cls     : 'browser-header',
                docked  : 'top'
            },
            {
                xtype   : 'browser'
            }
        ]
    }
});