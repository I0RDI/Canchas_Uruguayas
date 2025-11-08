import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function AjustesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.subtitle}>Próximamente podrás personalizar tu experiencia.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  subtitle: { fontSize: 16, color: colors.text, textAlign: 'center' },
});
