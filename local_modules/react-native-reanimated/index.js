const React = require('react');

const Animated = new Proxy(
  {},
  {
    get: () => React.Fragment,
  }
);

function useSharedValue(initialValue) {
  const state = React.useRef({ value: initialValue });
  return state.current;
}

function withTiming(value) {
  return value;
}

module.exports = {
  Animated,
  useSharedValue,
  withTiming,
  default: Animated,
};
