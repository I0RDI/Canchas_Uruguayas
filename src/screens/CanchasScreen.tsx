import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CanchaCard } from '../components/CanchaCard';
import { colors } from '../theme/colors';
import { registrarRenta } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Cancha = {
  id: string;
  nombre: string;
  estado: 'Libre' | 'Ocupada';
  alquiler?: {
    hora: string;
    cliente: string;
  } | null;
};

const initialCanchas: Cancha[] = [
  { id: 'cancha-grande', nombre: 'Cancha Grande', estado: 'Libre', alquiler: null },
  {
    id: 'cancha-1',
    nombre: 'Cancha 1',
    estado: 'Ocupada',
    alquiler: { hora: '18:00', cliente: 'Club Central' },
  },
  { id: 'cancha-2', nombre: 'Cancha 2', estado: 'Libre', alquiler: null },
  { id: 'cancha-3', nombre: 'Cancha 3', estado: 'Libre', alquiler: null },
];

export default function CanchasScreen() {
  const { user } = useAuth();
  const [canchas, setCanchas] = useState<Cancha[]>(initialCanchas);
  const [selectedCanchaId, setSelectedCanchaId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, { hora: string; cliente: string }>>({});
  const [registrando, setRegistrando] = useState(false);

  const selectedCancha = useMemo(
    () => canchas.find((cancha) => cancha.id === selectedCanchaId) || null,
    [canchas, selectedCanchaId],
  );

  const updateFormValues = (key: string, value: string) => {
    if (!selectedCanchaId) return;
    setFormValues((prev) => ({
      ...prev,
      [selectedCanchaId]: {
        ...(prev[selectedCanchaId] || { hora: '', cliente: '' }),
        [key]: value,
      },
    }));
  };

  const handleGuardarReserva = async () => {
    if (!selectedCanchaId || !user) return;
    const datos = formValues[selectedCanchaId] || { hora: '', cliente: '' };
    if (!datos.hora.trim() || !datos.cliente.trim()) {
      return;
    }

    setRegistrando(true);
    try {
      await registrarRenta(user.token, { monto: 240, referencia: `${selectedCanchaId}-${datos.cliente}` });
      setCanchas((prev) =>
        prev.map((cancha) =>
          cancha.id === selectedCanchaId
            ? {
                ...cancha,
                estado: 'Ocupada',
                alquiler: { hora: datos.hora.trim(), cliente: datos.cliente.trim() },
              }
            : cancha,
        ),
      );
      setFormValues((prev) => ({ ...prev, [selectedCanchaId]: { hora: '', cliente: '' } }));
      Alert.alert('Reserva guardada', 'Se registró la renta en caja.');
    } catch (error: any) {
      Alert.alert('No se pudo registrar', error.message);
    } finally {
      setRegistrando(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Canchas Disponibles</Text>
      <View style={styles.grid}>
        {canchas.map((cancha) => (
          <CanchaCard
            key={cancha.id}
            nombre={cancha.nombre}
            estado={cancha.estado}
            isSelected={selectedCanchaId === cancha.id}
            onPress={() => setSelectedCanchaId(cancha.id)}
          />
        ))}
      </View>

      <View style={styles.detailCard}>
        {selectedCancha ? (
          <>
            <Text style={styles.detailTitle}>{selectedCancha.nombre}</Text>
            <Text style={styles.detailStatus}>Estado: {selectedCancha.estado}</Text>
            {selectedCancha.estado === 'Ocupada' && selectedCancha.alquiler ? (
              <View style={styles.detailInfoBox}>
                <Text style={styles.detailLabel}>Detalles de la renta</Text>
                <Text style={styles.detailText}>Hora reservada: {selectedCancha.alquiler.hora}</Text>
                <Text style={styles.detailText}>Reservada por: {selectedCancha.alquiler.cliente}</Text>
              </View>
            ) : (
              <View style={styles.detailInfoBox}>
                <Text style={styles.detailLabel}>Registrar nueva renta</Text>
                <TextInput
                  placeholder="Hora (ej. 18:00)"
                  placeholderTextColor="#7F8C8D"
                  value={formValues[selectedCancha.id]?.hora || ''}
                  onChangeText={(text) => updateFormValues('hora', text)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Nombre de quien renta"
                  placeholderTextColor="#7F8C8D"
                  value={formValues[selectedCancha.id]?.cliente || ''}
                  onChangeText={(text) => updateFormValues('cliente', text)}
                  style={styles.input}
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleGuardarReserva} disabled={registrando}>
                  <Text style={styles.saveButtonText}>{registrando ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.detailHint}>Selecciona una cancha para ver sus detalles.</Text>
        )}
      </View>

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 24,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  detailStatus: {
    marginTop: 4,
    color: '#566573',
  },
  detailInfoBox: {
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#1F2D3D',
    marginBottom: 6,
  },
  detailHint: {
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8F9F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
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
