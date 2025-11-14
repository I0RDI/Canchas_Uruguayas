import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

type CanchaCardProps = {
  nombre: string;
  estado: string;
  isSelected: boolean;
  onPress: () => void;
};

export function CanchaCard({ nombre, estado, isSelected, onPress }: CanchaCardProps) {
  return (
    <TouchableOpacity style={[styles.card, isSelected && styles.cardSelected]} onPress={onPress}>
      <Text style={styles.title}>{nombre}</Text>
      <Text
        style={[
          styles.estado,
          estado === 'Libre' ? styles.libre : styles.ocupada,
        ]}
      >
        {estado}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  estado: { marginTop: 6, fontSize: 16 },
  libre: { color: '#1FAA59' },
  ocupada: { color: '#E74C3C' },
});
