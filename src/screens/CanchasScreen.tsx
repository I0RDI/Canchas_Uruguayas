import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CanchaCard } from '../components/CanchaCard';
import { colors } from '../theme/colors';
import { actualizarCanchaReserva, crearReserva, liberarCancha, obtenerCanchas, obtenerDiaAbiertoActual } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Cancha = {
  id: string;
  nombre: string;
  estado: 'Libre' | 'Ocupada';
  alquiler?: {
    hora: string;
    cliente: string;
    fecha?: string;
  } | null;
};

export default function CanchasScreen() {
  const { user } = useAuth();
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [selectedCanchaId, setSelectedCanchaId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, { hora: string; cliente: string }>>({});
  const [registrando, setRegistrando] = useState(false);
  const [registrandoFuturo, setRegistrandoFuturo] = useState(false);
  const [showHourPicker, setShowHourPicker] = useState(false);
  const [showFutureHourPicker, setShowFutureHourPicker] = useState(false);
  const [showFutureCanchaPicker, setShowFutureCanchaPicker] = useState(false);
  const [diaAbiertoActual, setDiaAbiertoActual] = useState<string | null>(null);
  const [futureReserva, setFutureReserva] = useState<{ canchaId: string; cliente: string; fecha: string; hora: string }>({
    canchaId: '',
    cliente: '',
    fecha: '',
    hora: '',
  });

  const timeOptions = useMemo(() => {
    const base: string[] = [];
    for (let h = 6; h <= 22; h++) {
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const period = h >= 12 ? 'PM' : 'AM';
      base.push(`${String(displayHour).padStart(2, '0')}:00 ${period}`);
    }
    return base;
  }, []);

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

  const cargarCanchas = useCallback(async () => {
    if (!user) return;
    const data = await obtenerCanchas(user.token);
    setCanchas(data as Cancha[]);
    if (!selectedCanchaId && data.length) {
      setSelectedCanchaId(data[0].id);
    }
    if (!futureReserva.canchaId && data.length) {
      setFutureReserva((prev) => ({ ...prev, canchaId: data[0].id }));
    }
  }, [futureReserva.canchaId, selectedCanchaId, user]);

  const cargarDiaAbierto = useCallback(async () => {
    if (!user) return;
    const data = await obtenerDiaAbiertoActual();
    setDiaAbiertoActual(data.diaAbiertoActual || null);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarDiaAbierto();
      cargarCanchas();
    }, [cargarCanchas, cargarDiaAbierto]),
  );

  useEffect(() => {
    cargarDiaAbierto();
    cargarCanchas();
  }, [cargarCanchas, cargarDiaAbierto]);

  useEffect(() => {
    if (selectedCancha) {
      setFormValues((prev) => ({
        ...prev,
        [selectedCancha.id]: {
          hora: selectedCancha.alquiler?.hora || prev[selectedCancha.id]?.hora || '',
          cliente: selectedCancha.alquiler?.cliente || prev[selectedCancha.id]?.cliente || '',
        },
      }));
    }
  }, [selectedCancha]);

  const handleGuardarReserva = async () => {
    if (!selectedCanchaId || !user) return;
    const datos = formValues[selectedCanchaId] || { hora: '', cliente: '' };
    if (!datos.hora.trim() || !datos.cliente.trim()) {
      return;
    }

    if (!diaAbiertoActual) {
      Alert.alert('Día no abierto', 'Abre el día desde Ajustes para poder ocupar una cancha.');
      return;
    }

    setRegistrando(true);
    try {
      const fechaReserva = selectedCancha.alquiler?.fecha || diaAbiertoActual;
      if (selectedCancha?.estado === 'Ocupada') {
        await actualizarCanchaReserva(user.token, selectedCanchaId, {
          hora: datos.hora.trim(),
          cliente: datos.cliente.trim(),
          fecha: fechaReserva,
        });
        setCanchas((prev) =>
          prev.map((cancha) =>
            cancha.id === selectedCanchaId
              ? {
                  ...cancha,
                  alquiler: { ...(cancha.alquiler || { fecha: fechaReserva }), hora: datos.hora.trim(), cliente: datos.cliente.trim(), fecha: fechaReserva },
                }
              : cancha,
          ),
        );
        Alert.alert('Datos actualizados', 'Se actualizó la renta de la cancha.');
      } else {
        await crearReserva(user.token, {
          cancha: selectedCancha.nombre,
          cliente: datos.cliente.trim(),
          fecha: fechaReserva,
          horaInicio: datos.hora.trim(),
        });
        setCanchas((prev) =>
          prev.map((cancha) =>
            cancha.id === selectedCanchaId
              ? {
                  ...cancha,
                  estado: 'Ocupada',
                  alquiler: { hora: datos.hora.trim(), cliente: datos.cliente.trim(), fecha: fechaReserva },
                }
              : cancha,
          ),
        );
        Alert.alert('Reserva guardada', 'Se registró la renta para la cancha seleccionada.');
      }
    } catch (error: any) {
      Alert.alert('No se pudo registrar', error.message);
    } finally {
      setRegistrando(false);
    }
  };

  const handleGuardarReservaFutura = async () => {
    if (!user) return;
    if (!futureReserva.canchaId || !futureReserva.cliente.trim() || !futureReserva.fecha.trim() || !futureReserva.hora.trim()) {
      Alert.alert('Datos faltantes', 'Completa cancha, fecha, hora y nombre del cliente para registrar la reserva.');
      return;
    }

    const fechaValida = !Number.isNaN(new Date(futureReserva.fecha).getTime());
    if (!fechaValida) {
      Alert.alert('Fecha inválida', 'Usa el formato YYYY-MM-DD para la fecha de la reserva.');
      return;
    }

    setRegistrandoFuturo(true);
    try {
      const canchaSeleccionada = canchas.find((c) => c.id === futureReserva.canchaId);
      await crearReserva(user.token, {
        cancha: canchaSeleccionada?.nombre || futureReserva.canchaId,
        cliente: futureReserva.cliente.trim(),
        fecha: futureReserva.fecha.trim(),
        horaInicio: futureReserva.hora.trim(),
        marcarOcupada: false,
      });
      Alert.alert('Reserva futura guardada', 'La reserva se registró en el calendario sin afectar el estado actual.');
      setFutureReserva((prev) => ({ ...prev, cliente: '', fecha: '', hora: '' }));
      setShowFutureCanchaPicker(false);
      setShowFutureHourPicker(false);
    } catch (error: any) {
      Alert.alert('No se pudo registrar', error.message);
    } finally {
      setRegistrandoFuturo(false);
    }
  };

  const handleDesocupar = async () => {
    if (!selectedCanchaId || !user) return;
    await liberarCancha(user.token, selectedCanchaId);
    setCanchas((prev) => prev.map((c) => (c.id === selectedCanchaId ? { ...c, estado: 'Libre', alquiler: null } : c)));
    setFormValues((prev) => ({ ...prev, [selectedCanchaId]: { hora: '', cliente: '' } }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Canchas Disponibles</Text>
      <Text style={styles.meta}>
        Día abierto: {diaAbiertoActual ?? 'Ninguno (abre el día desde Ajustes para ocupar canchas en tiempo real)'}
      </Text>
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
            <View style={styles.detailInfoBox}>
              <Text style={styles.detailLabel}>
                {selectedCancha.estado === 'Ocupada' ? 'Editar renta de la cancha' : 'Registrar nueva renta'}
              </Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowHourPicker((prev) => !prev)}>
                <Text style={{ color: formValues[selectedCancha.id]?.hora ? colors.text : '#7F8C8D' }}>
                  {formValues[selectedCancha.id]?.hora || 'Selecciona hora y turno'}
                </Text>
              </TouchableOpacity>
              {showHourPicker && (
                <View style={styles.dropdown}>
                  {timeOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.dropdownItem}
                      onPress={() => {
                        updateFormValues('hora', opt);
                        setShowHourPicker(false);
                      }}
                    >
                      <Text style={{ color: colors.text }}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                placeholder="Nombre de quien renta"
                placeholderTextColor="#7F8C8D"
                value={formValues[selectedCancha.id]?.cliente || ''}
                onChangeText={(text) => updateFormValues('cliente', text)}
                style={styles.input}
              />
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.saveButton, styles.saveButtonCentered]} onPress={handleGuardarReserva} disabled={registrando}>
                  <Text style={styles.saveButtonText}>{registrando ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
                {selectedCancha.estado === 'Ocupada' && (
                  <TouchableOpacity style={[styles.saveButton, styles.secondaryBtn]} onPress={handleDesocupar}>
                    <Text style={styles.saveButtonText}>Desocupar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.detailHint}>Selecciona una cancha para ver sus detalles.</Text>
        )}
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Reservas para fechas futuras</Text>
        <Text style={styles.meta}>Registra rentas en otros días sin cambiar el estado actual de las canchas.</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowFutureCanchaPicker((prev) => !prev)}>
          <Text style={{ color: futureReserva.canchaId ? colors.text : '#7F8C8D' }}>
            {canchas.find((c) => c.id === futureReserva.canchaId)?.nombre || 'Selecciona una cancha'}
          </Text>
        </TouchableOpacity>
        {showFutureCanchaPicker && (
          <View style={styles.dropdown}>
            {canchas.map((cancha) => (
              <TouchableOpacity
                key={cancha.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setFutureReserva((prev) => ({ ...prev, canchaId: cancha.id }));
                  setShowFutureCanchaPicker(false);
                }}
              >
                <Text style={{ color: colors.text }}>{cancha.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TextInput
          placeholder="Fecha de la reserva (YYYY-MM-DD)"
          placeholderTextColor="#7F8C8D"
          value={futureReserva.fecha}
          onChangeText={(text) => setFutureReserva((prev) => ({ ...prev, fecha: text }))}
          style={styles.input}
        />
        <TouchableOpacity style={styles.input} onPress={() => setShowFutureHourPicker((prev) => !prev)}>
          <Text style={{ color: futureReserva.hora ? colors.text : '#7F8C8D' }}>
            {futureReserva.hora || 'Selecciona hora y turno'}
          </Text>
        </TouchableOpacity>
        {showFutureHourPicker && (
          <View style={styles.dropdown}>
            {timeOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => {
                  setFutureReserva((prev) => ({ ...prev, hora: opt }));
                  setShowFutureHourPicker(false);
                }}
              >
                <Text style={{ color: colors.text }}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TextInput
          placeholder="Nombre de quien renta"
          placeholderTextColor="#7F8C8D"
          value={futureReserva.cliente}
          onChangeText={(text) => setFutureReserva((prev) => ({ ...prev, cliente: text }))}
          style={styles.input}
        />
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.saveButton, styles.saveButtonCentered]}
            onPress={handleGuardarReservaFutura}
            disabled={registrandoFuturo}
          >
            <Text style={styles.saveButtonText}>{registrandoFuturo ? 'Guardando...' : 'Guardar reserva'}</Text>
          </TouchableOpacity>
        </View>
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
  meta: {
    color: '#566573',
    marginBottom: 12,
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
  secondaryBtn: {
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    marginBottom: 12,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  actionsRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  saveButtonCentered: { minWidth: '45%' },
});
