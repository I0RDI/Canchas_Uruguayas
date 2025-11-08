const React = require('react');
const { View, Text, Pressable, StyleSheet } = require('react-native');

function createBottomTabNavigator() {
  function Screen() {
    return null;
  }

  function Navigator({ initialRouteName, screenOptions, children }) {
    const screens = React.Children.toArray(children)
      .filter(Boolean)
      .map((child) => child.props || {});

    const initialIndex = initialRouteName
      ? Math.max(0, screens.findIndex((screen) => screen.name === initialRouteName))
      : 0;

    const [activeIndex, setActiveIndex] = React.useState(
      initialIndex >= 0 && initialIndex < screens.length ? initialIndex : 0
    );

    const currentScreen = screens[activeIndex] || {};
    const CurrentComponent = currentScreen.component || React.Fragment;

    const getScreenOptions = (routeName) => {
      if (typeof screenOptions === 'function') {
        return screenOptions({ route: { name: routeName } }) || {};
      }
      return screenOptions || {};
    };

    const activeOptions = getScreenOptions(currentScreen.name);
    const baseActiveColor = activeOptions.tabBarActiveTintColor || '#007aff';
    const baseInactiveColor = activeOptions.tabBarInactiveTintColor || '#222';

    return React.createElement(
      View,
      { style: styles.container },
      React.createElement(
        View,
        { style: styles.scene },
        React.createElement(CurrentComponent, null)
      ),
      React.createElement(
        View,
        {
          style: [styles.tabBar, activeOptions.tabBarStyle || null],
        },
        screens.map((screen, index) => {
          const focused = index === activeIndex;
          const options = { ...getScreenOptions(screen.name), ...(screen.options || {}) };
          const activeColor = options.tabBarActiveTintColor || baseActiveColor;
          const inactiveColor = options.tabBarInactiveTintColor || baseInactiveColor;
          const tintColor = focused ? activeColor : inactiveColor;
          const label =
            options.tabBarLabel !== undefined ? options.tabBarLabel : screen.name;
          const iconFn = options.tabBarIcon;
          const icon = typeof iconFn === 'function'
            ? iconFn({ focused, color: tintColor, size: 24 })
            : null;

          return React.createElement(
            Pressable,
            {
              key: screen.name || index,
              style: [styles.tabItem, options.tabBarItemStyle || null],
              onPress: () => setActiveIndex(index),
            },
            icon,
            label != null
              ? React.createElement(
                  Text,
                  { style: [styles.tabLabel, options.tabBarLabelStyle || null, { color: tintColor }] },
                  label
                )
              : null
          );
        })
      )
    );
  }

  Screen.displayName = 'BottomTabScreen';
  Navigator.displayName = 'BottomTabNavigator';

  return { Navigator, Screen };
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scene: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
  },
});

module.exports = {
  createBottomTabNavigator,
};
