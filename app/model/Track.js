/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 6/12/13
 * Time: 10:55 AM
 */
Ext.define('MDJ.model.Track', {
    extend : 'Ext.data.Model',
    config : {
        fields : [
            {
                name : 'title',
                type : 'string'
            },
            {
                name : 'artist',
                type : 'auto'
            },
            {
                name : 'album',
                type : 'string'
            },
            {
                name : 'year',
                type : 'string'
            },
            {
                name : 'path',
                type : 'string'
            }
        ]
    }
});