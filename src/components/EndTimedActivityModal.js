import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { updateActivity } from '../storage/firestore';
import { getConfig } from '../models/ActivityType';
import { getDuration } from '../utils/dateUtils';

export default function EndTimedActivityModal({ visible, entry, onClose }) {
  const { householdId } = useApp();
  const [endTime, setEndTime] = useState(new Date());

  useEffect(() => { if (visible) setEndTime(new Date()); }, [visible]);

  if (!entry) return null;
  const cfg = getConfig(entry.type);
  const startDate = new Date(entry.timestamp);
  const duration = getDuration(entry.timestamp, null);
  const startStr = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  async function handleEnd() {
    await updateActivity(householdId, { ...entry, endTime: endTime.toISOString() });
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>End {cfg.displayName}</Text>
          <TouchableOpacity onPress={handleEnd}>
            <Text style={[styles.save, { color: cfg.color }]}>End {cfg.displayName}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoCard}>
          <Text style={{ fontSize: 36 }}>{cfg.emoji}</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.infoTitle}>{cfg.displayName} in progress</Text>
            <Text style={styles.infoSub}>Started {startStr}</Text>
            {duration && <Text style={[styles.infoElapsed, { color: cfg.color }]}>Elapsed: {duration}</Text>}
          </View>
        </View>
        <Text style={styles.sectionLabel}>END TIME</Text>
        <View style={styles.pickerCard}>
          <DateTimePicker value={endTime} mode="datetime" display="spinner"
            minimumDate={startDate} maximumDate={new Date()}
            onChange={(_, d) => { if (d) setEndTime(d); }} style={{ height: 180 }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8', backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  save: { fontSize: 17, fontWeight: '700' },
  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, padding: 16, backgroundColor: '#fff', borderRadius: 12,
  },
  infoTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  infoSub: { fontSize: 14, color: '#8E8E93', marginTop: 2 },
  infoElapsed: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginHorizontal: 20, marginBottom: 6 },
  pickerCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
});
