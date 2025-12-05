import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { calendarioDia } from '../services/api';
import { useAuth } from '../context/AuthContext';

const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const getDaysMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
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
};

export default function CalendarioScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservas, setReservas] = useState<any[]>([]);
  const [partidos, setPartidos] = useState<any[]>([]);
  const [torneos, setTorneos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDayString = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate]);
  const monthLabel = selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const calendar = useMemo(() => getDaysMatrix(selectedDate), [selectedDate]);

  const fetchEventos = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await calendarioDia(user.token, selectedDayString);
      setReservas(data.reservas || []);
      setPartidos(data.partidos || []);
      setTorneos(data.torneos || []);
    } catch (err: any) {
      setError(err.message || 'No se pudo cargar el calendario');
      setReservas([]);
      setPartidos([]);
      setTorneos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [selectedDayString, user]);

  const handleChangeMonth = (delta: number) => {
    const next = new Date(selectedDate);
    next.setMonth(selectedDate.getMonth() + delta);
    setSelectedDate(next);
  };

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day);
  };

  const renderEvento = ({ item }: { item: any }) => {
    const tipoLabel = item.tipo === 'partido' ? 'Partido' : item.tipo === 'torneo' ? 'Torneo' : 'Reserva';
    const horario = item.horaInicio || item.fecha || item.fecha_hora;
    const nombre = item.cliente || item.nombre || item.torneoId || 'Evento';
    return (
      <View style={styles.eventItem}>
        <View style={styles.eventBadge}>
          <Text style={styles.eventBadgeText}>{tipoLabel[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventName}>{tipoLabel}</Text>
          {nombre ? <Text style={styles.eventDetail}>{nombre}</Text> : null}
          {horario ? <Text style={styles.eventTime}>{horario}</Text> : null}
        </View>
      </View>
    );
  };

  const eventos = [...reservas, ...partidos, ...torneos];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendario de actividades</Text>
      <Text style={styles.subtitle}>Selecciona una fecha para ver reservas y eventos confirmados.</Text>

      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => handleChangeMonth(-1)}>
          <Text style={styles.monthNav}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={() => handleChangeMonth(1)}>
          <Text style={styles.monthNav}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekHeader}>
          {dayLabels.map((dia) => (
            <Text key={dia} style={styles.weekDay}>
              {dia}
            </Text>
          ))}
        </View>
        {calendar.map((week, index) => (
          <View key={index} style={styles.weekRow}>
            {week.map((day, idx) => {
              const isSelected = day && day.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayCell, day ? styles.dayActive : styles.dayEmpty, isSelected && styles.daySelected]}
                  disabled={!day}
                  onPress={() => day && handleSelectDay(day)}
                >
                  <Text style={day ? styles.dayText : styles.dayEmptyText}>{day ? day.getDate() : ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.eventsBox}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>Eventos del día {selectedDayString}</Text>
          <TouchableOpacity onPress={fetchEventos}>
            <Text style={{ color: colors.primary }}>{loading ? 'Actualizando...' : 'Refrescar'}</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : eventos.length === 0 ? (
          <Text style={styles.empty}>No hay eventos para esta fecha.</Text>
        ) : (
          <FlatList data={eventos} keyExtractor={(item) => item.id} renderItem={renderEvento} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} />
        )}
      </View>
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
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    color: '#566573',
  },
  calendar: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    width: 32,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.text,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: {
    backgroundColor: '#F4F6F6',
  },
  dayEmpty: {
    backgroundColor: 'transparent',
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.text,
    fontWeight: '600',
  },
  dayEmptyText: {
    color: 'transparent',
  },
  eventsBox: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    flex: 1,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  eventBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  eventName: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  eventTime: {
    color: '#7B8A8B',
  },
  eventDetail: {
    color: '#566573',
  },
  empty: {
    color: '#7F8C8D',
    marginTop: 8,
  },
  error: {
    color: '#C0392B',
    marginTop: 8,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  monthNav: {
    fontSize: 18,
    color: colors.primary,
    paddingHorizontal: 8,
  },
});
