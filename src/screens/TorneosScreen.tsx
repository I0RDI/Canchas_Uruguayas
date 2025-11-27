import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { actualizarTorneo, crearTorneo, eliminarTorneo, obtenerTorneos } from '../services/api';

interface Torneo {
  id: string;
  nombre: string;
  fecha: string;
  canchas: string[];
}

export default function TorneosScreen() {
  const { user } = useAuth();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [canchasSeleccionadas, setCanchasSeleccionadas] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canchasDisponibles = ['Cancha Grande', 'Cancha 1', 'Cancha 2', 'Cancha 3'];
  const isEditing = editingId !== null;

  const resetForm = () => {
    setNombre('');
    setFecha('');
    setCanchasSeleccionadas([]);
    setEditingId(null);
  };

  const cargar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await obtenerTorneos(user.token);
      setTorneos(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [user]);

  const handleCreateOrUpdate = async () => {
    if (!user || !nombre.trim() || !fecha.trim() || canchasSeleccionadas.length === 0) {
      return;
    }

    try {
      if (editingId) {
        const updated = await actualizarTorneo(user.token, editingId, {
          nombre: nombre.trim(),
          fecha: fecha.trim(),
          canchas: [...canchasSeleccionadas],
        });
        setTorneos((prev) => prev.map((torneo) => (torneo.id === editingId ? updated : torneo)));
      } else {
        const nuevoTorneo: Torneo = await crearTorneo(user.token, {
          nombre: nombre.trim(),
          fecha: fecha.trim(),
          canchas: [...canchasSeleccionadas],
        });
        setTorneos((prev) => [nuevoTorneo, ...prev]);
      }
      resetForm();
    } catch (error: any) {
      Alert.alert('No se pudo guardar', error.message);
    }
  };

  const handleEdit = (torneo: Torneo) => {
    setNombre(torneo.nombre);
    setFecha(torneo.fecha);
    setCanchasSeleccionadas(torneo.canchas);
    setEditingId(torneo.id);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await eliminarTorneo(user.token, id);
      setTorneos((prev) => prev.filter((torneo) => torneo.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (error: any) {
      Alert.alert('No se pudo eliminar', error.message);
    }
  };

  const renderTorneo = ({ item }: { item: Torneo }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
        <Text style={styles.cardMeta}>{item.fecha}</Text>
      </View>
      <Text style={styles.cardMeta}>{item.canchas.join(', ')}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionButton, styles.editButton]}>
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar torneos</Text>
      <View style={styles.form}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{isEditing ? 'Editar torneo' : 'Crear nuevo torneo'}</Text>
          <TouchableOpacity onPress={cargar}>
            <Text style={{ color: colors.primary }}>{loading ? 'Actualizando...' : 'Refrescar'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          placeholder="Nombre del torneo"
          placeholderTextColor="#7F8C8D"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />
        <TextInput
          placeholder="Fecha"
          placeholderTextColor="#7F8C8D"
          value={fecha}
          onChangeText={setFecha}
          style={styles.input}
        />
        <Text style={styles.checkboxLabel}>Selecciona las canchas disponibles</Text>
        <View style={styles.checkboxGroup}>
          {canchasDisponibles.map((cancha) => {
            const isSelected = canchasSeleccionadas.includes(cancha);
            return (
              <TouchableOpacity
                key={cancha}
                style={[styles.checkboxItem, isSelected && styles.checkboxItemSelected]}
                onPress={() =>
                  setCanchasSeleccionadas((prev) =>
                    prev.includes(cancha) ? prev.filter((c) => c !== cancha) : [...prev, cancha],
                  )
                }
              >
                <View style={[styles.checkboxIndicator, isSelected && styles.checkboxIndicatorSelected]} />
                <Text style={styles.checkboxText}>{cancha}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.formActions}>
          <TouchableOpacity
            style={[styles.primaryButton, isEditing ? styles.updateButton : styles.createButton]}
            onPress={handleCreateOrUpdate}
          >
            <Text style={styles.primaryButtonText}>{isEditing ? 'Actualizar' : 'Crear'}</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity style={[styles.primaryButton, styles.cancelButton]} onPress={resetForm}>
              <Text style={styles.primaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Torneos programados</Text>
      <FlatList
        data={torneos}
        keyExtractor={(item) => item.id}
        renderItem={renderTorneo}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay torneos registrados aún.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  input: {
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5DBDB',
    backgroundColor: '#F8F9F9',
    marginRight: 8,
    marginBottom: 8,
  },
  checkboxItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E8F8F5',
  },
  checkboxIndicator: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    marginRight: 8,
  },
  checkboxIndicatorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxText: {
    color: colors.text,
    fontWeight: '500',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  updateButton: {
    backgroundColor: colors.accent,
  },
  cancelButton: {
    backgroundColor: '#AAB7B8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
    gap: 16,
  },
  emptyText: {
    color: '#7F8C8D',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardMeta: {
    fontSize: 14,
    color: '#566573',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  editButton: {
    backgroundColor: colors.accent,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
