import React, { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { abrirDia, cerrarDia, reporteMensual } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AjustesScreen() {
  const { user } = useAuth();
  const now = new Date();
  const months = useMemo(
    () => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    [],
  );
  const [mes, setMes] = useState(now.getMonth());
  const [anio, setAnio] = useState(now.getFullYear());
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [loadingCierre, setLoadingCierre] = useState(false);
  const [loadingApertura, setLoadingApertura] = useState(false);
  const [reporte, setReporte] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
  const [resumenCierre, setResumenCierre] = useState<any | null>(null);

  const calendarMatrix = useMemo(() => {
    const year = diaSeleccionado.getFullYear();
    const month = diaSeleccionado.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: startWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [diaSeleccionado]);

  const diaLegible = diaSeleccionado.toISOString().slice(0, 10);

  const handleGenerarReporte = async () => {
    if (!user) return;
    setLoadingReporte(true);
    try {
      const data = await reporteMensual(user.token, anio, mes + 1);
      setReporte(data);
    } catch (error: any) {
      Alert.alert('No se pudo generar', error.message);
      setReporte(null);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleCerrarDia = async () => {
    if (!user) return;
    if (password !== 'canchas123') {
      Alert.alert('Contraseña incorrecta', 'Solo el propietario puede cerrar el día.');
      return;
    }
    setLoadingCierre(true);
    try {
      const resp = await cerrarDia(user.token, diaLegible, password);
      setResumenCierre(resp);
      Alert.alert('Cierre completado', resp.message || 'Se cerró el día.');
    } catch (error: any) {
      Alert.alert('No se pudo cerrar', error.message);
    } finally {
      setLoadingCierre(false);
    }
  };

  const handleAbrirDia = async () => {
    if (!user) return;
    if (password !== 'canchas123') {
      Alert.alert('Contraseña incorrecta', 'Solo el propietario puede abrir un día.');
      return;
    }
    setLoadingApertura(true);
    try {
      const resp = await abrirDia(user.token, diaLegible, password);
      Alert.alert('Día abierto', resp.message || 'Se abrió el día.');
    } catch (error: any) {
      Alert.alert('No se pudo abrir', error.message);
    } finally {
      setLoadingApertura(false);
    }
  };

  const formatFechaMovimiento = (fecha: string, fallback?: string) => {
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return fallback || fecha;
    return parsed.toLocaleString('es-ES', { hour12: false });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.subtitle}>Reportes, cierres y herramientas administrativas.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reporte mensual</Text>
        <View style={styles.row}>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>Mes</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity onPress={() => setMes((prev) => (prev + 11) % 12)} style={styles.selectorBtn}>
                <Text style={styles.selectorText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.selectorValue}>{months[mes]}</Text>
              <TouchableOpacity onPress={() => setMes((prev) => (prev + 1) % 12)} style={styles.selectorBtn}>
                <Text style={styles.selectorText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.selector}>
            <Text style={styles.selectorLabel}>Año</Text>
            <View style={styles.selectorRow}>
              <TouchableOpacity onPress={() => setAnio((prev) => prev - 1)} style={styles.selectorBtn}>
                <Text style={styles.selectorText}>{'<'}</Text>
              </TouchableOpacity>
              <Text style={styles.selectorValue}>{anio}</Text>
              <TouchableOpacity onPress={() => setAnio((prev) => prev + 1)} style={styles.selectorBtn}>
                <Text style={styles.selectorText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGenerarReporte} disabled={loadingReporte}>
            <Text style={styles.primaryText}>{loadingReporte ? 'Consultando...' : 'Consultar'}</Text>
          </TouchableOpacity>
        </View>
        {reporte ? (
          <View style={styles.reportBox}>
            <Text style={styles.sectionTitle}>Totales</Text>
            <Text style={styles.meta}>Ingresos: ${reporte.ingresos}</Text>
            <Text style={styles.meta}>Egresos: -${reporte.egresos}</Text>
            <Text style={[styles.meta, styles.boldText]}>Saldo neto: ${reporte.saldoNeto}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Movimientos</Text>
            <View style={{ gap: 8 }}>
              {(reporte.detalleMovimientos || []).map((item: any, idx: number) => (
                <View key={`${item.id || 'mov'}-${idx}`} style={styles.reportItem}>
                  <Text style={styles.meta}>{item.fechaLegible || formatFechaMovimiento(item.fecha)}</Text>
                  <Text style={styles.reportConcept}>{item.concepto}</Text>
                  <Text style={[styles.meta, item.monto < 0 ? styles.danger : styles.success]}>${item.monto}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.meta}>Selecciona un mes y año para ver el detalle mensual.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Apertura y cierre</Text>
        <Text style={styles.meta}>Selecciona el día y confirma con la contraseña del propietario.</Text>
        <View style={styles.calendarBox}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() => setDiaSeleccionado(new Date(diaSeleccionado.getFullYear(), diaSeleccionado.getMonth() - 1, 1))}
            >
              <Text style={styles.selectorText}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.boldText}>
              {diaSeleccionado.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity
              onPress={() => setDiaSeleccionado(new Date(diaSeleccionado.getFullYear(), diaSeleccionado.getMonth() + 1, 1))}
            >
              <Text style={styles.selectorText}>{'>'}</Text>
            </TouchableOpacity>
          </View>
          {calendarMatrix.map((week, idx) => (
            <View key={idx} style={styles.weekRow}>
              {week.map((day, i) => {
                const isSelected = day && day.toISOString().slice(0, 10) === diaLegible;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.dayCell, isSelected && styles.daySelected]}
                    disabled={!day}
                    onPress={() => day && setDiaSeleccionado(day)}
                  >
                    <Text style={{ color: day ? colors.text : '#bdc3c7' }}>{day ? day.getDate() : ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        <Text style={styles.meta}>Día seleccionado: {diaLegible}</Text>
        <View style={styles.row}>
          <View style={[styles.selector, { flex: 1 }]}>
            <Text style={styles.selectorLabel}>Contraseña</Text>
            <View style={styles.passwordBox}>
              <TextInput
                placeholder="Ingresa la contraseña"
                placeholderTextColor="#7F8C8D"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ flex: 1, color: colors.text }}
              />
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={handleAbrirDia} disabled={loadingApertura}>
            <Text style={styles.secondaryText}>{loadingApertura ? 'Abriendo...' : 'Abrir día'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={handleCerrarDia} disabled={loadingCierre}>
            <Text style={styles.primaryText}>{loadingCierre ? 'Cerrando...' : 'Cerrar día'}</Text>
          </TouchableOpacity>
        </View>

        {resumenCierre ? (
          <View style={styles.reportBox}>
            <Text style={styles.sectionTitle}>Resumen de cierre</Text>
            <Text style={styles.meta}>Ingresos: ${resumenCierre.ingresos?.toFixed?.(2) ?? resumenCierre.ingresos}</Text>
            <Text style={styles.meta}>Egresos: -${resumenCierre.egresos?.toFixed?.(2) ?? resumenCierre.egresos}</Text>
            <Text style={[styles.meta, styles.boldText]}>Total: ${resumenCierre.total?.toFixed?.(2) ?? resumenCierre.total}</Text>
            <View style={{ gap: 6 }}>
              {(resumenCierre.movimientos || []).map((item: any, idx: number) => (
                <View key={`${item.id || 'cierre'}-${idx}`} style={styles.reportItem}>
                  <Text style={styles.reportConcept}>{item.concepto}</Text>
                  <Text style={styles.meta}>{formatFechaMovimiento(item.fecha)}</Text>
                  <Text style={[styles.meta, item.monto < 0 ? styles.danger : styles.success]}>${item.monto}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    backgroundColor: colors.background,
    padding: 24,
    gap: 16,
    paddingBottom: 48,
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  reportBox: {
    backgroundColor: '#F8F9F9',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  meta: {
    color: '#7F8C8D',
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  reportItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    gap: 2,
  },
  reportConcept: {
    color: colors.text,
    fontWeight: '600',
  },
  danger: {
    color: '#C0392B',
    fontWeight: '700',
  },
  success: {
    color: '#27AE60',
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: '700',
  },
  selector: { flex: 1, gap: 6 },
  selectorLabel: { color: '#7F8C8D', fontWeight: '600' },
  selectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#ECF0F1' },
  selectorText: { color: colors.primary, fontWeight: '700' },
  selectorValue: { color: colors.text, fontWeight: '700' },
  calendarBox: { backgroundColor: '#F8F9F9', padding: 12, borderRadius: 12, gap: 6 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelected: { backgroundColor: colors.primary },
  passwordBox: {
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
