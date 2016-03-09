var scrollSpy = {

  spyCallbacks: {},
  spySetState: {},

  registerLink: function(name, stateHandler, spyHandler) {
    this.addHandler('spySetState', name, stateHandler);
    this.addHandler('spyCallbacks', name, spyHandler);
    // Calculate initial state
    var y = this.currentPositionY();
    forEach(this.spyCallbacks, name, function(handler) {
      handler(y)
    })
  },

  currentPositionY: function() {
    var supportPageOffset = window.pageXOffset !== undefined;
    var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
    return supportPageOffset ? window.pageYOffset : isCSS1Compat ?
            document.documentElement.scrollTop : document.body.scrollTop;
  },

  scrollHandler: function() {
    var y = this.currentPositionY();
    forEachFlat(this.spyCallbacks, function(handler) {
      handler(y);
    });
  },

  hasHandlers: function() {
    return isEmpty(this.spyCallbacks) || isEmpty(this.spySetState);
  },

  addHandler: function(queueKey, name, handler) {
    if (handler) {
      if (document && !this.hasHandlers()) {
        this._scrollHandler = this.scrollHandler.bind(this);
        document.addEventListener('scroll', this._scrollHandler);
      }
      if (!this[queueKey][name])
        this[queueKey][name] = [];
      this[queueKey][name].push(handler);
    }
  },

  removeHandler: function(queueKey, name, handler) {
    var queue = this[queueKey][name] || [];
    var i = queue.indexOf(handler);
    if (i !== -1) {
      queue.splice(i, 1);
      if (!queue.length)
        delete this[queueKey][name];
    }
    if (document && !this.hasHandlers()) {
      document.removeEventListener('scroll', this._scrollHandler);
    }
  },

  updateStates: function(){
    forEachFlat(this.spySetState, function(handler) {
      handler();
    });
  },

  unregisterLink: function(name, stateHandler, spyHandler) {
    this.removeHandler('spySetState', name, stateHandler);
    this.removeHandler('spyCallbacks', name, spyHandler);
  },

  registerElement: function(name) {
    // Send initial element information to spies
    var y = this.currentPositionY();
    forEach(this.spyCallbacks, name, function(handler) {
      handler(y);
    });
  },

  unregisterElement: function(name) {
    // NOP
  },
}

function isEmpty (obj) {
  if (!obj) return true;
  for (var key in obj)
    if (obj.hasOwnProperty(key))
      return false;
  return true;
}

function forEach(handlerMap, name, fn) {
  var queue = handlerMap[name] || [];
  for (var i = 0; i < queue.length; i++) {
    fn(queue[i]);
  }
}

function forEachFlat(handlerMap, fn) {
  for (var key in handlerMap) {
    for (var i = 0; i < handlerMap[key].length; i++) {
      fn(handlerMap[key][i]);
    }
  }
}

module.exports = scrollSpy;
window.scrollSpy = scrollSpy
