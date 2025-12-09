const React = require('react');

function NavigationContainer({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function useFocusEffect(effect) {
  React.useEffect(effect, []);
}

module.exports = {
  NavigationContainer,
  useFocusEffect,
};
