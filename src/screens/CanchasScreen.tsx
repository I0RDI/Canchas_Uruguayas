import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CanchaCard } from '../components/CanchaCard';
import { colors } from '../theme/colors';

export default function CanchasScreen() {
  const canchas = [
    { nombre: 'Cancha Grande', estado: 'Libre' },
    { nombre: 'Cancha 1', estado: 'Ocupada' },
    { nombre: 'Cancha 2', estado: 'Libre' },
    { nombre: 'Cancha 3', estado: 'Libre' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Canchas Disponibles</Text>
      {canchas.map((c, i) => (
        <CanchaCard key={i} {...c} />
      ))}
      <Text style={styles.subtitle}>Eventos Recientes</Text>
      <View style={styles.eventBox}>
        <Text style={{ color: colors.text }}>Torneo de verano 2025</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: colors.text },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 8, color: colors.text },
  eventBox: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
