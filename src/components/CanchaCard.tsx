import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

type CanchaCardProps = {
  nombre: string;
  estado: string;
  isSelected: boolean;
  onPress: () => void;
  tieneReservasFuturas?: boolean;
};

export function CanchaCard({ nombre, estado, isSelected, onPress, tieneReservasFuturas }: CanchaCardProps) {
  return (
    <TouchableOpacity style={[styles.card, isSelected && styles.cardSelected]} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{nombre}</Text>
        {tieneReservasFuturas && <View style={styles.dot} />}
      </View>
      <Text style={[styles.estado, estado === 'Libre' ? styles.libre : styles.ocupada]}>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.text, flex: 1 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 6,
  },
  estado: { marginTop: 6, fontSize: 16 },
  libre: { color: '#1FAA59' },
  ocupada: { color: '#E74C3C' },
});
