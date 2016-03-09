"use strict";

var React = require('react');
var ReactDOM = require('react-dom');

var animateScroll = require('./animate-scroll');
var scrollSpy = require('./scroll-spy');
var scroller = require('./scroller');

var Helpers = {

  Scroll: function (Component) {

    return React.createClass({

      propTypes: {
        to: React.PropTypes.string.isRequired,
        offset: React.PropTypes.number,
        onClick: React.PropTypes.func
      },

      getDefaultProps: function() {
        return {offset: 0};
      },

      scrollTo : function(to) {
        scroller.scrollTo(to, this.props.smooth, this.props.duration, this.props.offset);
      },

      handleClick: function(event) {

        /*
         * give the posibility to override onClick
         */

        if(this.props.onClick) {
          this.props.onClick(event);
        }

        /*
         * dont bubble the navigation
         */

        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();

        /*
         * do the magic!
         */

        this.scrollTo(this.props.to);
        
      },

      stateHandler: function() {
        if(scroller.getActiveLink() != this.props.to) {
            this.setState({ active : false });
        }
      },

      spyHandler: function(y) {
        var element = scroller.get(this.props.to);
        if (!element) return;
        var cords = element.getBoundingClientRect();
        var topBound = cords.top + y;
        var bottomBound = topBound + cords.height;
        var offsetY = y - this.props.offset;
        var to = this.props.to;
        var isInside = (offsetY >= topBound && offsetY <= bottomBound);
        var isOutside = (offsetY < topBound || offsetY > bottomBound);
        var activeLink = scroller.getActiveLink();

        if (isInside && activeLink != to) {
          scroller.setActiveLink(to);
          this.setState({ active : true });
          if(this.props.onSetActive) {
            this.props.onSetActive(to);
          }
          scrollSpy.updateStates();
          console.log('active!', scroller.getActiveLink())
         }
      },

      componentDidMount: function() {
        if (this.props.spy) {
          scrollSpy.registerLink(
              this.props.to, this.stateHandler, this.spyHandler);
        }
      },

      componentWillUnmount: function() {
        scrollSpy.unregisterLink(
            this.props.to, this.stateHandler, this.spyHandler);
      },

      render: function() {
        var className = "";
        if(this.state && this.state.active) {
          className = ((this.props.className || "") + " " + (this.props.activeClass || "active")).trim();
        } else {
          className = this.props.className
        }

        var props = {};
        for(var prop in this.props) {
          props[prop] = this.props[prop];
        }

        props.className = className;
        props.onClick = this.handleClick;

        return React.createElement(Component, props);
      }
    });
  },


  Element: function(Component) {
    return React.createClass({
      propTypes: {
        name: React.PropTypes.string.isRequired
      },

      componentDidMount: function() {
        var domNode = ReactDOM.findDOMNode(this);
        scroller.register(this.props.name, domNode);
        scrollSpy.registerElement(this.props.name);
      },
      componentWillUnmount: function() {
        scroller.unregister(this.props.name);
        scrollSpy.unregisterElement(this.props.name);
      },
      render: function() {
        return React.createElement(Component, this.props);
      }
    });
  }
};

module.exports = Helpers;
