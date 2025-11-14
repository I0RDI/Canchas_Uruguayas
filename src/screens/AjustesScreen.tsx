import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function AjustesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.subtitle}>Próximamente podrás personalizar tu experiencia.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reportes y cierres</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTitle}>Generar reporte mensual</Text>
          <Text style={styles.actionDescription}>Descarga un resumen con ocupación y rentas.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionTitle}>Cerrar día</Text>
          <Text style={styles.actionDescription}>Registra los ingresos y libera canchas al finalizar la jornada.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    gap: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 16, color: colors.text },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#D5DBDB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F8F9F9',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  actionDescription: {
    marginTop: 4,
    color: '#7F8C8D',
  },
});
