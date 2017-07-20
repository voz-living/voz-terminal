const _ = require('lodash');

class Component {
  constructor(props) {
    this.props = props;
    this.state = {};
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state);
  }

  setState(nextState) {
    if (this.shouldComponentUpdate(this.props, nextState)) {
      this._render();
    }
    this.state = state;
  }

  _updateProps(props) {
    if (this.shouldComponentUpdate(props)) {
      this._render();
    }
    this.props = props;
  }

  _render() {

  }

  render() {

  }
}

module.exports = Component;