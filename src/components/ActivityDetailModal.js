import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { updateActivity, deleteActivity } from '../storage/firestore';
import { getConfig, feedingDisplayLine } from '../models/ActivityType';
import { formatTime, getDuration, formatTimeRange } from '../utils/dateUtils';

export default function ActivityDetailModal({ visible, entry, user, onClose }) {
  const { householdId } = useApp();
  const [notes, setNotes] = useState('');

  useEffect(() => { if (entry) setNotes(entry.notes || ''); }, [entry]);

  if (!entry) return null;
  const cfg = getConfig(entry.type);
  const duration = cfg.isTimedActivity ? getDuration(entry.timestamp, entry.endTime) : null;
  const feedLine = feedingDisplayLine(entry);

  async function save() {
    await updateActivity(householdId, { ...entry, notes: notes.trim() || null });
    onClose();
  }

  function confirmDelete() {
    Alert.alert('Delete Activity', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteActivity(householdId, entry.id);
        onClose();
      }},
    ]);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Activity Detail</Text>
          <TouchableOpacity onPress={save}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>ACTIVITY</Text>
          <View style={styles.card}>
            <View style={styles.row}><Text style={styles.rowLabel}>Type</Text><Text style={styles.rowValue}>{cfg.emoji} {cfg.displayName}</Text></View>
            <View style={styles.sep} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Time</Text>
              <Text style={styles.rowValue}>{cfg.isTimedActivity ? formatTimeRange(entry.timestamp, entry.endTime) : formatTime(entry.timestamp)}</Text>
            </View>
            {duration && <><View style={styles.sep} /><View style={styles.row}><Text style={styles.rowLabel}>Duration</Text><Text style={styles.rowValue}>{duration}</Text></View></>}
            {user && <><View style={styles.sep} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Logged by</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={[styles.dot, { backgroundColor: user.colorHex }]} />
                  <Text style={styles.rowValue}>{user.name}</Text>
                </View>
              </View>
            </>}
          </View>

          {entry.type === 'feeding' && (entry.mealType || feedLine) && <>
            <Text style={styles.sectionLabel}>FEEDING DETAILS</Text>
            <View style={styles.card}>
              {entry.mealType && <View style={styles.row}><Text style={styles.rowLabel}>Meal</Text><Text style={styles.rowValue}>{entry.mealType}</Text></View>}
              {entry.foodType && <><View style={styles.sep} /><View style={styles.row}><Text style={styles.rowLabel}>Food</Text><Text style={styles.rowValue}>{entry.foodType}</Text></View></>}
              {entry.feedingAmount && <><View style={styles.sep} /><View style={styles.row}><Text style={styles.rowLabel}>Amount</Text><Text style={styles.rowValue}>{entry.feedingAmount}</Text></View></>}
            </View>
          </>}

          <Text style={styles.sectionLabel}>NOTES</Text>
          <View style={styles.card}>
            <TextInput style={styles.notesInput} placeholder="Add a note…" placeholderTextColor="#8E8E93"
              multiline value={notes} onChangeText={setNotes} />
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
            <Text style={styles.deleteBtnText}>Delete Activity</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8', backgroundColor: '#fff',
  },
  title: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  save: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowLabel: { fontSize: 16, color: '#1C1C1E' },
  rowValue: { fontSize: 16, color: '#8E8E93' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  notesInput: { padding: 14, fontSize: 16, minHeight: 80, textAlignVertical: 'top', color: '#1C1C1E' },
  deleteBtn: { margin: 16, marginTop: 24, padding: 14, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center' },
  deleteBtnText: { fontSize: 16, fontWeight: '600', color: '#FF3B30' },
});
