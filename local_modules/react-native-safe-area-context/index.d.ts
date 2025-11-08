import * as React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

type SafeAreaInsets = { top: number; right: number; bottom: number; left: number };

type ProviderProps = React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

type ViewProps = React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>;

export declare const SafeAreaProvider: React.ComponentType<ProviderProps>;
export declare const SafeAreaView: React.ComponentType<ViewProps>;
export declare function useSafeAreaInsets(): SafeAreaInsets;
