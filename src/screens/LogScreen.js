import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { formatShortDate, startOfDay, addDays } from '../utils/dateUtils';
import { ALL_TYPES, getConfig } from '../models/ActivityType';
import LogTimelineRow from '../components/LogTimelineRow';
import EndTimedActivityModal from '../components/EndTimedActivityModal';

export default function LogScreen() {
  const { selectedDog, activities, users } = useApp();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [endingActivity, setEndingActivity] = useState(null);

  const todayDate = startOfDay(new Date());
  const isSelectedToday = selectedDate.getTime() === todayDate.getTime();

  // Filter live Firestore data for the selected date — no fetches needed
  const dayActivities = useMemo(() => {
    if (!selectedDog) return [];
    const start = new Date(selectedDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(selectedDate); end.setHours(23, 59, 59, 999);
    return activities
      .filter(a => {
        if (a.dogId !== selectedDog.id) return false;
        const ts = new Date(a.timestamp);
        return ts >= start && ts <= end;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [activities, selectedDog, selectedDate]);

  function getUserForEntry(entry) {
    return users.find(u => u.id === entry.userId) || null;
  }

  function prevDay() { setSelectedDate(d => addDays(d, -1)); }
  function nextDay() {
    const next = addDays(selectedDate, 1);
    if (next <= todayDate) setSelectedDate(next);
  }

  const counts = {};
  ALL_TYPES.forEach(t => {
    const n = dayActivities.filter(a => a.type === t).length;
    if (n > 0) counts[t] = n;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Date navigator */}
      <View style={styles.datePicker}>
        <TouchableOpacity onPress={prevDay} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateCenter}>
          <Text style={styles.dateLabel}>{formatShortDate(selectedDate)}</Text>
          {!isSelectedToday && (
            <Text style={styles.dateSub}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={nextDay} style={styles.arrow} disabled={isSelectedToday}>
          <Text style={[styles.arrowText, isSelectedToday && { color: '#C6C6C8' }]}>›</Text>
        </TouchableOpacity>
      </View>

      {dayActivities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{isSelectedToday ? '🐾' : '🌙'}</Text>
          <Text style={styles.emptyText}>
            {isSelectedToday
              ? 'Nothing logged yet today'
              : `No activities on ${formatShortDate(selectedDate).toLowerCase()}`}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Summary bar */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryLeft}>
              {Object.entries(counts).map(([type, count]) => (
                <Text key={type} style={styles.summaryItem}>{getConfig(type).emoji} {count}</Text>
              ))}
            </View>
            <Text style={styles.summaryTotal}>{dayActivities.length} total</Text>
          </View>

          <View style={styles.timeline}>
            {dayActivities.map((entry, i) => (
              <React.Fragment key={entry.id}>
                <LogTimelineRow
                  entry={entry}
                  user={getUserForEntry(entry)}
                  onEndTimed={e => setEndingActivity(e)}
                />
                {i < dayActivities.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}

      <EndTimedActivityModal
        visible={!!endingActivity}
        entry={endingActivity}
        onClose={() => setEndingActivity(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  datePicker: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8',
    paddingVertical: 8,
  },
  arrow: { padding: 12 },
  arrowText: { fontSize: 28, color: '#007AFF', fontWeight: '300' },
  dateCenter: { flex: 1, alignItems: 'center' },
  dateLabel: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  dateSub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 52, opacity: 0.35 },
  emptyText: { fontSize: 17, color: '#8E8E93' },
  summaryBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F2F2F7',
  },
  summaryLeft: { flexDirection: 'row', gap: 12 },
  summaryItem: { fontSize: 15 },
  summaryTotal: { fontSize: 13, color: '#8E8E93' },
  timeline: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA', marginLeft: 84 },
});
