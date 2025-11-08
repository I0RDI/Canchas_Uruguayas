const React = require('react');
const { View } = require('react-native');

function SafeAreaProvider({ children, style }) {
  return React.createElement(View, { style: [{ flex: 1 }, style || null] }, children);
}

function SafeAreaView({ children, style }) {
  return React.createElement(View, { style }, children);
}

function useSafeAreaInsets() {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

module.exports = {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
};
