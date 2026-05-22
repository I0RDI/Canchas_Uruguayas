import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TorneosScreen from './src/screens/TorneosScreen';
import CanchasScreen from './src/screens/CanchasScreen';
import AjustesScreen from './src/screens/AjustesScreen';
import CalendarioScreen from './src/screens/CalendarioScreen';
import LoginScreen from './src/screens/LoginScreen';
import { colors } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ArbitrosScreen from './src/screens/ArbitrosScreen';
import CajaScreen from './src/screens/CajaScreen';

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

const TAB_CONFIG = [
  { name: 'Torneos', component: TorneosScreen, roles: ['propietario', 'empleado'] },
  { name: 'Arbitros', component: ArbitrosScreen, roles: ['propietario', 'empleado'] },
  { name: 'Canchas', component: CanchasScreen, roles: ['propietario', 'empleado'] },
  { name: 'Calendario', component: CalendarioScreen, roles: ['propietario', 'empleado'] },
  { name: 'Caja', component: CajaScreen, roles: ['propietario', 'empleado'] },
  { name: 'Ajustes', component: AjustesScreen, roles: ['propietario'] },
];

const Tab = createBottomTabNavigator();

function AppTabs() {
  const { user } = useAuth();
  const availableTabs = TAB_CONFIG.filter((tab) => tab.roles.includes(user?.rol || ''));
  const initialRouteName = availableTabs[0]?.name || 'Canchas';

  if (!availableTabs.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>No tienes permisos para ver esta sección.</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      key={user?.rol || 'guest'}
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
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
      {availableTabs.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <AppTabs /> : <LoginScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
