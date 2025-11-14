import { useState } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TorneosScreen from './src/screens/TorneosScreen';
import CanchasScreen from './src/screens/CanchasScreen';
import AjustesScreen from './src/screens/AjustesScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import LoginScreen from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator
          initialRouteName="Canchas"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.text,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            tabBarStyle: {
              backgroundColor: colors.card,
              borderTopColor: colors.primary,
              borderTopWidth: 1,
            },
            tabBarIcon: ({ color }) => {
              const icons: Record<string, string> = {
                Torneos: '🏆',
                Canchas: '🏟️',
                Calendario: '📅',
                Ajustes: '⚙️',
              };
              return <Text style={{ color }}>{icons[route.name] || '⬤'}</Text>;
            },
          })}
        >
          <Tab.Screen name="Torneos" component={TorneosScreen} />
          <Tab.Screen name="Canchas" component={CanchasScreen} />
          <Tab.Screen name="Calendario" component={CalendarioScreen} />
          <Tab.Screen name="Ajustes" component={AjustesScreen} />
        </Tab.Navigator>
      ) : (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} />
      )}
    </NavigationContainer>
  );
}
