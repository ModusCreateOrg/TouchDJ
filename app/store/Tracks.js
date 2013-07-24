/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/12/13
 * Time: 2:41 AM
 */
Ext.define('MDJ.store.Tracks', {
    extend : 'Ext.data.Store',
    config : {
        model    : 'MDJ.model.Track',
        proxy    : {
            type   : 'ajax',
            url    : '/getTracks',
            reader : {
                type         : 'json',
                rootProperty : 'tracks'
            }
        },
        autoLoad : true
    }
});