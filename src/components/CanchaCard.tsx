import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export function CanchaCard({ nombre, estado }: { nombre: string; estado: string }) {
  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{nombre}</Text>
      <Text style={[styles.estado, 
        estado === 'Libre' ? styles.libre : styles.ocupada
      ]}>
        {estado}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  estado: { marginTop: 6, fontSize: 16 },
  libre: { color: '#1FAA59' },
  ocupada: { color: '#E74C3C' },
});
