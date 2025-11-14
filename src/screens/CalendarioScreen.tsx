import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const weeks = [
  ['1', '2', '3', '4', '5', '6', '7'],
  ['8', '9', '10', '11', '12', '13', '14'],
  ['15', '16', '17', '18', '19', '20', '21'],
  ['22', '23', '24', '25', '26', '27', '28'],
  ['29', '30', '31', '', '', '', ''],
];

const events = [
  { dia: '5', titulo: 'Liga empresarial', hora: '18:00' },
  { dia: '12', titulo: 'Torneo amistoso', hora: '20:00' },
  { dia: '25', titulo: 'Entrenamiento juvenil', hora: '16:30' },
];

export default function CalendarioScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendario de actividades</Text>
      <Text style={styles.subtitle}>Consulta rápidamente los eventos programados</Text>

      <View style={styles.calendar}>
        <View style={styles.weekHeader}>
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia) => (
            <Text key={dia} style={styles.weekDay}>
              {dia}
            </Text>
          ))}
        </View>
        {weeks.map((week, index) => (
          <View key={index} style={styles.weekRow}>
            {week.map((day, idx) => (
              <View key={idx} style={[styles.dayCell, day ? styles.dayActive : styles.dayEmpty]}>
                <Text style={day ? styles.dayText : styles.dayEmptyText}>{day}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.eventsBox}>
        <Text style={styles.eventsTitle}>Eventos del mes</Text>
        {events.map((evento) => (
          <View key={evento.dia} style={styles.eventItem}>
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{evento.dia}</Text>
            </View>
            <View>
              <Text style={styles.eventName}>{evento.titulo}</Text>
              <Text style={styles.eventTime}>{evento.hora}</Text>
            </View>
          </View>
        ))}
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
  dayText: {
    color: colors.text,
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
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
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
});
