import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { movimientosCaja, registrarRenta } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

type Movimiento = {
  id: string;
  concepto: string;
  tipo: 'renta' | 'pago_arbitro' | string;
  monto: number;
  fecha: string;
  fecha_hora?: string;
  referencia?: string | null;
};

export default function CajaScreen() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [diaCerrado, setDiaCerrado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [montoRenta, setMontoRenta] = useState('');
  const [referencia, setReferencia] = useState('');

  const cargar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await movimientosCaja(user.token);
      if (Array.isArray(data)) {
        setMovimientos(data);
        setDiaCerrado(false);
      } else {
        setMovimientos(data.movimientos || []);
        setDiaCerrado(Boolean(data.cerrado));
      }
    } catch (error: any) {
      Alert.alert('No se pudo cargar caja', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [user]);

  const handleRegistrarRenta = async () => {
    if (!user || !montoRenta.trim()) return;
    if (diaCerrado) {
      Alert.alert('Día cerrado', 'No es posible registrar movimientos en un día cerrado.');
      return;
    }
    setLoading(true);
    try {
      const movimiento = await registrarRenta(user.token, { monto: Number(montoRenta), referencia: referencia.trim() || undefined });
      setMovimientos((prev) => [movimiento, ...prev]);
      setMontoRenta('');
      setReferencia('');
    } catch (error: any) {
      Alert.alert('No se pudo registrar la renta', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Movimiento }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{item.concepto}</Text>
        <Text style={[styles.badge, item.tipo === 'pago_arbitro' ? styles.badgeDanger : styles.badgeSuccess]}>
          {item.tipo === 'pago_arbitro' ? 'Pago árbitro' : 'Renta'}
        </Text>
      </View>
      <Text style={styles.meta}>{new Date(item.fecha || item.fecha_hora || '').toLocaleTimeString()}</Text>
      {item.referencia ? <Text style={styles.meta}>Ref: {item.referencia}</Text> : null}
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
      {diaCerrado ? <Text style={styles.warning}>El día está cerrado. Solo puedes consultar los movimientos.</Text> : null}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Registrar renta rápida</Text>
        <TextInput
          placeholder="Monto"
          placeholderTextColor="#7F8C8D"
          value={montoRenta}
          keyboardType="numeric"
          onChangeText={setMontoRenta}
          style={styles.input}
        />
        <TextInput
          placeholder="Referencia (opcional)"
          placeholderTextColor="#7F8C8D"
          value={referencia}
          onChangeText={setReferencia}
          style={styles.input}
        />
        <TouchableOpacity
          style={[styles.registerButton, !montoRenta.trim() && styles.registerButtonDisabled]}
          onPress={handleRegistrarRenta}
          disabled={!montoRenta.trim() || loading || diaCerrado}
        >
          <Text style={styles.registerText}>{loading ? 'Guardando...' : 'Registrar renta'}</Text>
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
  form: { backgroundColor: colors.card, padding: 14, borderRadius: 12, marginVertical: 12, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 12, gap: 6 },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { color: '#7F8C8D' },
  amount: { fontSize: 18, fontWeight: '700', color: colors.primary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: '#fff' },
  badgeDanger: { backgroundColor: '#E74C3C' },
  badgeSuccess: { backgroundColor: '#2ECC71' },
  warning: { color: '#D35400', marginTop: 4 },
});
