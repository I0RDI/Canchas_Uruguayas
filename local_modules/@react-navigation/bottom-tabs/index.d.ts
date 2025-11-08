import * as React from 'react';
import { StyleProp, ViewStyle, TextStyle } from 'react-native';

type IconProps = { focused: boolean; color: string; size: number };

type NavigatorScreenOptions = {
  headerShown?: boolean;
  tabBarActiveTintColor?: string;
  tabBarInactiveTintColor?: string;
  tabBarStyle?: StyleProp<ViewStyle>;
  tabBarLabelStyle?: StyleProp<TextStyle>;
  tabBarIcon?: (props: IconProps) => React.ReactNode;
  tabBarItemStyle?: StyleProp<ViewStyle>;
};

type TabScreenOptions = NavigatorScreenOptions & {
  tabBarLabel?: string;
};

type TabScreenProps = {
  name: string;
  component: React.ComponentType<any>;
  options?: TabScreenOptions;
};

type ScreenOptionsInput =
  | NavigatorScreenOptions
  | ((props: { route: { name: string } }) => NavigatorScreenOptions);

type NavigatorProps = {
  initialRouteName?: string;
  screenOptions?: ScreenOptionsInput;
  children?: React.ReactNode;
};

interface TabNavigator {
  Navigator: React.ComponentType<NavigatorProps>;
  Screen: React.ComponentType<TabScreenProps>;
}

export declare function createBottomTabNavigator(): TabNavigator;
