import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { cerrarDia, reporteMensual } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AjustesScreen() {
  const { user } = useAuth();
  const now = new Date();
  const [mes, setMes] = useState(String(now.getMonth() + 1));
  const [anio, setAnio] = useState(String(now.getFullYear()));
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [loadingCierre, setLoadingCierre] = useState(false);
  const [reporte, setReporte] = useState<any | null>(null);

  const handleGenerarReporte = async () => {
    if (!user) return;
    setLoadingReporte(true);
    try {
      const data = await reporteMensual(user.token, Number(anio), Number(mes));
      setReporte(data);
    } catch (error: any) {
      Alert.alert('No se pudo generar', error.message);
      setReporte(null);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleCerrarDia = () => {
    Alert.alert('Cerrar día', '¿Estás seguro de cerrar el día actual? No podrás modificar los movimientos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar',
        style: 'destructive',
        onPress: async () => {
          if (!user) return;
          setLoadingCierre(true);
          try {
            const resp = await cerrarDia(user.token);
            Alert.alert('Cierre completado', resp.message || 'Se cerró el día.');
          } catch (error: any) {
            Alert.alert('No se pudo cerrar', error.message);
          } finally {
            setLoadingCierre(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>
      <Text style={styles.subtitle}>Reportes, cierres y herramientas administrativas.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Reporte mensual</Text>
        <View style={styles.row}>
          <TextInput
            placeholder="Mes"
            placeholderTextColor="#7F8C8D"
            keyboardType="numeric"
            style={styles.input}
            value={mes}
            onChangeText={setMes}
          />
          <TextInput
            placeholder="Año"
            placeholderTextColor="#7F8C8D"
            keyboardType="numeric"
            style={styles.input}
            value={anio}
            onChangeText={setAnio}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleGenerarReporte} disabled={loadingReporte}>
            <Text style={styles.primaryText}>{loadingReporte ? 'Consultando...' : 'Consultar'}</Text>
          </TouchableOpacity>
        </View>
        {reporte ? (
          <View style={styles.reportBox}>
            <Text style={styles.sectionTitle}>Totales</Text>
            <Text style={styles.meta}>Ingresos por renta: ${reporte.ingresosRenta}</Text>
            <Text style={styles.meta}>Egresos por árbitros: -${reporte.egresosArbitros}</Text>
            <Text style={[styles.meta, styles.boldText]}>Saldo neto: ${reporte.saldoNeto}</Text>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Movimientos</Text>
            <FlatList
              data={reporte.detalleMovimientos}
              keyExtractor={(_, idx) => `${idx}`}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
                <View style={styles.reportItem}>
                  <Text style={styles.meta}>{item.fecha}</Text>
                  <Text style={styles.reportConcept}>{item.concepto}</Text>
                  <Text style={[styles.meta, item.monto < 0 ? styles.danger : styles.success]}>${item.monto}</Text>
                </View>
              )}
            />
          </View>
        ) : (
          <Text style={styles.meta}>Selecciona un mes y año para ver el detalle mensual.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cierre de día</Text>
        <Text style={styles.meta}>Bloquea la edición de movimientos del día y guarda un resumen.</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCerrarDia} disabled={loadingCierre}>
          <Text style={styles.secondaryText}>{loadingCierre ? 'Cerrando...' : 'Cerrar día'}</Text>
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
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
});
