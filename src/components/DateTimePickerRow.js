/**
 * DateTimePickerRow — reusable tappable row that opens a bottom-sheet picker.
 *
 * Usage:
 *   <DateTimePickerRow label="Date" value={date} mode="date" onChange={setDate} maximumDate={new Date()} />
 *   <DateTimePickerRow label="Time" value={date} mode="time" onChange={setDate} />
 *
 * mode: 'date' | 'time'
 * The parent manages a single Date object; this component only sets the date portion
 * or the time portion of that Date, leaving the other portion unchanged.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTime(d) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export default function DateTimePickerRow({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
  style,
  showSeparator = false,
}) {
  const [open, setOpen] = useState(false);

  function handleChange(_, d) {
    if (!d) return;
    // Merge only the relevant portion into a new Date
    const merged = new Date(value);
    if (mode === 'date') {
      merged.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
    } else {
      merged.setHours(d.getHours(), d.getMinutes(), 0, 0);
    }
    onChange(merged);
  }

  const displayValue = mode === 'date' ? formatDate(value) : formatTime(value);

  return (
    <>
      {showSeparator && <View style={styles.sep} />}
      <TouchableOpacity style={[styles.row, style]} onPress={() => setOpen(true)}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{displayValue}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHeader}>
              <View style={{ width: 60 }} />
              <Text style={styles.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} style={{ width: 60, alignItems: 'flex-end' }}>
                <Text style={styles.done}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={value}
              mode={mode}
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={handleChange}
              style={{ height: 220 }}
              textColor="#1C1C1E"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// Exported helpers for parent components that want consistent formatting
export { formatDate, formatTime };

const styles = StyleSheet.create({
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 16 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 14,
  },
  label: { fontSize: 16, color: '#1C1C1E' },
  value: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
  overlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA',
  },
  sheetTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  done: { fontSize: 17, fontWeight: '700', color: '#007AFF' },
});
