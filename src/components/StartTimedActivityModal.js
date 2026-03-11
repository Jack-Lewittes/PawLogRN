import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getConfig } from '../models/ActivityType';
import DateTimePickerRow from './DateTimePickerRow';

export default function StartTimedActivityModal({ visible, type, onStart, onCancel }) {
  const [startTime, setStartTime] = useState(new Date());

  useEffect(() => {
    if (visible) setStartTime(new Date());
  }, [visible]);

  const cfg = type ? getConfig(type) : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{cfg?.emoji} Start {cfg?.displayName}</Text>
          <TouchableOpacity onPress={() => onStart(startTime)}>
            <Text style={styles.start}>Start</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>START TIME</Text>
        <View style={styles.card}>
          <DateTimePickerRow
            label="Date"
            value={startTime}
            onChange={setStartTime}
            mode="date"
            maximumDate={new Date()}
          />
          <DateTimePickerRow
            label="Time"
            value={startTime}
            onChange={setStartTime}
            mode="time"
            maximumDate={new Date()}
            showSeparator
          />
        </View>
        <Text style={styles.hint}>Defaults to now. Tap to adjust if it started earlier.</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8', backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  start: { fontSize: 17, fontWeight: '700', color: '#007AFF' },
  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#8E8E93',
    marginHorizontal: 20, marginTop: 24, marginBottom: 6,
  },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  hint: {
    fontSize: 13, color: '#8E8E93', textAlign: 'center',
    marginTop: 12, marginHorizontal: 24, lineHeight: 18,
  },
});
