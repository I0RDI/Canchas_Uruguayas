import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function TorneosScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Text style={styles.title}>Próximos torneos</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Liga Metropolitana</Text>
        <Text style={styles.cardSubtitle}>Inicio: 12 de diciembre</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Campeonato Juvenil</Text>
        <Text style={styles.cardSubtitle}>Inscripciones abiertas</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  cardSubtitle: { fontSize: 14, color: colors.text },
});
