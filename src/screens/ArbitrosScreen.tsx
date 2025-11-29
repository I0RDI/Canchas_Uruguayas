import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarArbitro, crearArbitro, eliminarArbitro, obtenerArbitros } from '../services/api';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

type Arbitro = { id: string; nombre: string; telefono?: string; activo?: boolean };

export default function ArbitrosScreen() {
  const { user } = useAuth();
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await obtenerArbitros(user.token);
      setArbitros(data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [user]);

  const reset = () => {
    setNombre('');
    setTelefono('');
    setEditing(null);
  };

  const handleGuardar = async () => {
    if (!user || !nombre.trim()) return;
    try {
      if (editing) {
        const updated = await actualizarArbitro(user.token, editing, { nombre: nombre.trim(), telefono });
        setArbitros((prev) => prev.map((a) => (a.id === editing ? updated : a)));
      } else {
        const created = await crearArbitro(user.token, { nombre: nombre.trim(), telefono });
        setArbitros((prev) => [created, ...prev]);
      }
      reset();
    } catch (error: any) {
      Alert.alert('No se pudo guardar', error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await eliminarArbitro(user.token, id);
      setArbitros((prev) => prev.filter((a) => a.id !== id));
    } catch (error: any) {
      Alert.alert('No se pudo eliminar', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Árbitros</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{editing ? 'Editar árbitro' : 'Nuevo árbitro'}</Text>
        <TextInput
          placeholder="Nombre"
          placeholderTextColor="#7F8C8D"
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          placeholder="Teléfono"
          placeholderTextColor="#7F8C8D"
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
        />
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={handleGuardar}>
            <Text style={styles.buttonText}>{editing ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
          {editing && (
            <TouchableOpacity style={[styles.button, styles.secondary]} onPress={reset}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Listado</Text>
        <TouchableOpacity onPress={cargar}>
          <Text style={{ color: colors.primary }}>{loading ? 'Actualizando...' : 'Refrescar'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={arbitros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>No hay árbitros registrados</Text>}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.itemTitle}>{item.nombre}</Text>
              {item.telefono ? <Text style={styles.itemMeta}>{item.telefono}</Text> : null}
              {item.activo === false && <Text style={styles.itemMeta}>Inactivo</Text>}
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.smallBtn, styles.primary]} onPress={() => {
                setEditing(item.id);
                setNombre(item.nombre);
                setTelefono(item.telefono || '');
              }}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.smallBtn, styles.danger]} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 12, gap: 10 },
  input: {
    backgroundColor: '#F8F9F9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  button: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: '#AAB7B8' },
  danger: { backgroundColor: '#E74C3C' },
  buttonText: { color: '#fff', fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listItem: { backgroundColor: colors.card, padding: 14, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  itemMeta: { color: '#7F8C8D' },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  empty: { textAlign: 'center', color: '#7F8C8D', marginTop: 12 },
});
