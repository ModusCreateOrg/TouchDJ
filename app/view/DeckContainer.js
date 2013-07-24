/**
 * Created with JetBrains WebStorm.
 * User: stan229
 * Date: 5/19/13
 * Time: 10:35 AM
 */
Ext.define('MDJ.view.DeckContainer', {
    extend      : 'Ext.Container',
    xtype       : 'deckcontainer',
    config      : {
        cls   : 'deck-container',
        items : [
            {
                xtype  : 'controlbar'
            },
            {
                xtype    : 'deck',
                deckType : 'A'
            },
            {
                xtype    : 'deck',
                deckType : 'B'
            }
        ]
    }
});