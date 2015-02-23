import Ember from 'ember';

var keyCodes = {
  escape: 27,
  down_arrow: 40,
  up_arrow: 38,
  enter: 13
};

export default Ember.Mixin.create({
  layoutName: 'components/type-ahead',
  selectedFunction: '',
  placeHolderText: '',
  doDebounce: null,
  inputVal: '',
  selectedVal: '',
  suggestions: Ember.A(),
  suggestStylesOn: 'position: absolute; top: 100%; left: 0px; z-index: 100; display: block; right: auto;',
  suggestStyles: 'display:none;',
  selectedFromList: false,
  debounceTime: 0,
  miniumCharLength: 2,
  escapedChars: [
    keyCodes.down_arrow,
    keyCodes.up_arrow,
    keyCodes.enter
  ],
  hightlightIndex: -1,
  selectableSuggestion: null,

  actions: {
    selectItem: function(value){
      this.set('selectedFromList', true);
      this.send(this.selectedFunction, value);
    }
  },

  keyUp: function(event){
    var _scope = this;
    if(event.keyCode === keyCodes.escape){
      this.set('suggestStyles', 'display:none;');
    }
    else if(this.escapedChars.indexOf(event.keyCode) === -1){
      if(typeof this.get('targetObject').hideAlerts === 'function'){
        this.get('targetObject').hideAlerts();
      }
      var noSpace = $(event.target).val().replace(/(^\s+|\s+$)/g);
      if($(event.target).hasClass('typeahead') && noSpace.length > this.miniumCharLength ){
        this.set('inputVal', noSpace);
        Ember.run.debounce(this, this.doDebounce, this.debounceTime);
      }
    }
  },

  focusOut: function(){

    var _scope = this;
    var func = function(){
      if( _scope.isDestroyed ) return;
      _scope.set('suggestStyles', 'display:none;');
      if(!_scope.get('selectedFromList')){
        _scope.set('selectedVal', '');
      }
    };
    Ember.run.later(this, func, 200); // set a little delay so give the select a chance to set
  },

  showLoading: function(){
    this.get('suggestions').pushObject({});
    this.set('suggestStyles', this.get('suggestStylesOn'));
  },

  keyDown: function(event){
    this._super(event);
    if( this.get('suggestStyles') !== 'display:none;'){
      if (event.keyCode === keyCodes.down_arrow){
        this._highlightResult('down');
      }
      else if (event.keyCode === keyCodes.up_arrow){
        this._highlightResult('up');
      }
      else if(event.keyCode === keyCodes.enter){
        if(!Ember.isBlank(this.selectableSuggestion)){
          this.send('selectItem', this.selectableSuggestion);
          this.set('suggestStyles', 'display:none;');
        }
      }
    }
  },

  _highlightResult: function(direction){
    var newHighlightIndex = -1;
    if(direction === 'down'){
      newHighlightIndex = this.hightlightIndex + 1;
    }
    else if( this.hightlightIndex > 0){
      newHighlightIndex = this.hightlightIndex - 1;
    }

    if(newHighlightIndex < this.get('suggestions').length){
      if(this.hightlightIndex > -1){
        var currentResult = this.get('suggestions').objectAt(this.hightlightIndex);
        currentResult.set('highlight', false);
      }
      this.set('hightlightIndex', newHighlightIndex);

      if(this.hightlightIndex > -1){
        var nextResult = this.get('suggestions').objectAt(this.hightlightIndex);
        nextResult.set('highlight', true);
        this.set('selectableSuggestion', nextResult);
      }
    }
  }
});
