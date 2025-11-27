import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import TorneosScreen from './src/screens/TorneosScreen';
import CanchasScreen from './src/screens/CanchasScreen';
import AjustesScreen from './src/screens/AjustesScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import LoginScreen from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ArbitrosScreen from './src/screens/ArbitrosScreen';
import CajaScreen from './src/screens/CajaScreen';

const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
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
            Arbitros: '🧑‍⚖️',
            Canchas: '🏟️',
            Calendario: '📅',
            Caja: '💰',
            Ajustes: '⚙️',
          };
          return <Text style={{ color }}>{icons[route.name] || '⬤'}</Text>;
        },
      })}
    >
      <Tab.Screen name="Torneos" component={TorneosScreen} />
      <Tab.Screen name="Arbitros" component={ArbitrosScreen} />
      <Tab.Screen name="Canchas" component={CanchasScreen} />
      <Tab.Screen name="Calendario" component={CalendarioScreen} />
      <Tab.Screen name="Caja" component={CajaScreen} />
      <Tab.Screen name="Ajustes" component={AjustesScreen} />
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <NavigationContainer>{user ? <AppTabs /> : <LoginScreen />}</NavigationContainer>;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
