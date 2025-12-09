import React, { useEffect, useMemo, useState } from 'react';
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
  detalle?: Record<string, any>;
};

export default function CajaScreen() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [diaCerrado, setDiaCerrado] = useState(false);
  const [diaAbierto, setDiaAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [monto, setMonto] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState<'cancha' | 'torneo'>('cancha');
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [horaCancha, setHoraCancha] = useState('');
  const [torneoNombre, setTorneoNombre] = useState('');
  const [torneoCanchas, setTorneoCanchas] = useState<string[]>([]);
  const [torneoFecha, setTorneoFecha] = useState('');
  const [torneoHora, setTorneoHora] = useState('');

  const canchasDisponibles = useMemo(() => ['Cancha Pasto', 'Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4'], []);

  const cargar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await movimientosCaja(user.token);
      if (Array.isArray(data)) {
        setMovimientos(data);
        setDiaCerrado(false);
        setDiaAbierto(true);
      } else {
        setMovimientos(data.movimientos || []);
        setDiaCerrado(Boolean(data.cerrado));
        setDiaAbierto(Boolean(data.abierto));
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

  const validarMonto = (valor: string) => /^\d+(\.\d{0,2})?$/.test(valor);

  const limpiarFormulario = () => {
    setMonto('');
    setCanchaSeleccionada('');
    setHoraCancha('');
    setTorneoNombre('');
    setTorneoCanchas([]);
    setTorneoFecha('');
    setTorneoHora('');
  };

  const handleRegistrarMovimiento = async () => {
    if (!user) return;
    if (diaCerrado) {
      Alert.alert('Día cerrado', 'No es posible registrar movimientos en un día cerrado.');
      return;
    }
    if (!diaAbierto) {
      Alert.alert('Día no abierto', 'Abre el día desde Ajustes para registrar ventas.');
      return;
    }
    if (!monto.trim() || !validarMonto(monto.trim())) {
      Alert.alert('Monto inválido', 'Ingresa un monto con hasta 2 decimales. Ejemplo: 100.00');
      return;
    }

    if (tipoMovimiento === 'cancha') {
      if (!canchaSeleccionada || !horaCancha.trim()) {
        Alert.alert('Datos faltantes', 'Selecciona la cancha y la hora de la renta.');
        return;
      }
    } else {
      if (!torneoNombre.trim() || torneoCanchas.length === 0 || !torneoFecha.trim() || !torneoHora.trim()) {
        Alert.alert('Datos faltantes', 'Completa nombre, canchas, fecha y hora del torneo.');
        return;
      }
    }

    setLoading(true);
    try {
      const detalle =
        tipoMovimiento === 'cancha'
          ? { cancha: canchaSeleccionada, hora: horaCancha.trim(), motivo: 'Renta Cancha' }
          : { torneo: torneoNombre.trim(), canchas: torneoCanchas, fecha: torneoFecha.trim(), horaInicio: torneoHora.trim() };
      const concepto =
        tipoMovimiento === 'cancha'
          ? `Renta ${canchaSeleccionada}`
          : `Venta torneo ${torneoNombre.trim()}`;

      const movimiento = await registrarRenta(user.token, {
        monto: Number(monto),
        concepto,
        tipo: tipoMovimiento,
        detalle,
      });
      setMovimientos((prev) => [movimiento, ...prev]);
      limpiarFormulario();
    } catch (error: any) {
      Alert.alert('No se pudo registrar la venta', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha: string) => {
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return fecha;
    return parsed.toLocaleString('es-ES', { hour12: false });
  };

  const renderItem = ({ item }: { item: Movimiento }) => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.title}>{item.concepto}</Text>
        <Text style={[styles.badge, item.monto < 0 ? styles.badgeDanger : styles.badgeSuccess]}>{
          item.tipo === 'torneo' ? 'Torneo' : 'Renta'
        }</Text>
      </View>
      <Text style={styles.meta}>{formatFecha(item.fecha || item.fecha_hora || '')}</Text>
      {item.detalle?.cancha ? <Text style={styles.meta}>Cancha: {item.detalle.cancha}</Text> : null}
      {item.detalle?.hora ? <Text style={styles.meta}>Hora: {item.detalle.hora}</Text> : null}
      {item.detalle?.torneo ? <Text style={styles.meta}>Torneo: {item.detalle.torneo}</Text> : null}
      {item.detalle?.canchas ? <Text style={styles.meta}>Canchas: {item.detalle.canchas.join(', ')}</Text> : null}
      {item.detalle?.fecha ? <Text style={styles.meta}>Fecha: {item.detalle.fecha}</Text> : null}
      {item.detalle?.horaInicio ? <Text style={styles.meta}>Hora de inicio: {item.detalle.horaInicio}</Text> : null}
      <Text style={styles.amount}>$ {Number(item.monto).toFixed(2)}</Text>
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
      {!diaAbierto ? (
        <Text style={styles.warning}>Debes abrir el día desde Ajustes para registrar ventas.</Text>
      ) : null}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Registrar venta</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, tipoMovimiento === 'cancha' && styles.toggleButtonActive]}
            onPress={() => setTipoMovimiento('cancha')}
          >
            <Text style={[styles.toggleText, tipoMovimiento === 'cancha' && styles.toggleTextActive]}>Renta Cancha</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, tipoMovimiento === 'torneo' && styles.toggleButtonActive]}
            onPress={() => setTipoMovimiento('torneo')}
          >
            <Text style={[styles.toggleText, tipoMovimiento === 'torneo' && styles.toggleTextActive]}>Torneo</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          placeholder="Monto (ej. 100.00)"
          placeholderTextColor="#7F8C8D"
          value={monto}
          keyboardType="decimal-pad"
          onChangeText={(text) => {
            const clean = text.replace(',', '.');
            if (clean === '' || validarMonto(clean)) {
              setMonto(clean);
            }
          }}
          onBlur={() => monto && setMonto(parseFloat(monto).toFixed(2))}
          style={styles.input}
        />

        {tipoMovimiento === 'cancha' ? (
          <>
            <Text style={styles.label}>Cancha rentada</Text>
            <View style={styles.tagsRow}>
              {canchasDisponibles.map((cancha) => {
                const selected = canchaSeleccionada === cancha;
                return (
                  <TouchableOpacity
                    key={cancha}
                    style={[styles.tag, selected && styles.tagSelected]}
                    onPress={() => setCanchaSeleccionada(cancha)}
                  >
                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{cancha}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              placeholder="Hora de la renta (ej. 09:00)"
              placeholderTextColor="#7F8C8D"
              value={horaCancha}
              onChangeText={setHoraCancha}
              style={styles.input}
            />
          </>
        ) : (
          <>
            <TextInput
              placeholder="Nombre del torneo"
              placeholderTextColor="#7F8C8D"
              value={torneoNombre}
              onChangeText={setTorneoNombre}
              style={styles.input}
            />
            <Text style={styles.label}>Canchas solicitadas</Text>
            <View style={styles.tagsRow}>
              {canchasDisponibles.map((cancha) => {
                const selected = torneoCanchas.includes(cancha);
                return (
                  <TouchableOpacity
                    key={cancha}
                    style={[styles.tag, selected && styles.tagSelected]}
                    onPress={() =>
                      setTorneoCanchas((prev) =>
                        prev.includes(cancha) ? prev.filter((c) => c !== cancha) : [...prev, cancha],
                      )
                    }
                  >
                    <Text style={[styles.tagText, selected && styles.tagTextSelected]}>{cancha}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput
              placeholder="Fecha del torneo (AAAA-MM-DD)"
              placeholderTextColor="#7F8C8D"
              value={torneoFecha}
              onChangeText={setTorneoFecha}
              style={styles.input}
            />
            <TextInput
              placeholder="Hora de inicio"
              placeholderTextColor="#7F8C8D"
              value={torneoHora}
              onChangeText={setTorneoHora}
              style={styles.input}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.registerButton, (!monto.trim() || loading || diaCerrado || !diaAbierto) && styles.registerButtonDisabled]}
          onPress={handleRegistrarMovimiento}
          disabled={!monto.trim() || loading || diaCerrado || !diaAbierto}
        >
          <Text style={styles.registerText}>{loading ? 'Guardando...' : 'Registrar Venta'}</Text>
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
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleButtonActive: { backgroundColor: '#E8F8F5', borderColor: colors.primary },
  toggleText: { color: colors.text, fontWeight: '600' },
  toggleTextActive: { color: colors.primary },
  label: { color: colors.text, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    backgroundColor: '#F8F9F9',
  },
  tagSelected: { backgroundColor: '#E8F8F5', borderColor: colors.primary },
  tagText: { color: colors.text },
  tagTextSelected: { color: colors.primary, fontWeight: '700' },
});
