const React = require('react');

function enableScreens() {
  // no-op for local implementation
}

function Screen({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function ScreenContainer({ children }) {
  return React.createElement(React.Fragment, null, children);
}

module.exports = {
  enableScreens,
  Screen,
  ScreenContainer,
};
