import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { movimientosCaja } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

type Movimiento = {
  id: string;
  concepto: string;
  tipo: 'renta' | 'pago_arbitro' | string;
  monto: number;
  fecha: string;
};

export default function CajaScreen() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await movimientosCaja(user.token);
      setMovimientos(data);
    } catch (error: any) {
      Alert.alert('No se pudo cargar caja', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [user]);

  const renderItem = ({ item }: { item: Movimiento }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{item.concepto}</Text>
        <Text style={[styles.badge, item.tipo === 'pago_arbitro' ? styles.badgeDanger : styles.badgeSuccess]}>
          {item.tipo === 'pago_arbitro' ? 'Pago árbitro' : 'Renta'}
        </Text>
      </View>
      <Text style={styles.meta}>{new Date(item.fecha).toLocaleTimeString()}</Text>
      <Text style={styles.amount}>$ {item.monto}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Caja - Movimientos del día</Text>
        <TouchableOpacity onPress={cargar}>
          <Text style={{ color: colors.primary }}>{loading ? 'Actualizando...' : 'Refrescar'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={movimientos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 12, paddingVertical: 10 }}
        ListEmptyComponent={<Text style={styles.meta}>No hay movimientos hoy.</Text>}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  screenTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { color: '#7F8C8D' },
  amount: { fontSize: 18, fontWeight: '700', color: colors.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: '#fff' },
  badgeDanger: { backgroundColor: '#E74C3C' },
  badgeSuccess: { backgroundColor: '#2ECC71' },
});
