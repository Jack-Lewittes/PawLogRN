import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { createActivity } from '../storage/firestore';
import { ALL_TYPES, getConfig, MEAL_TYPES } from '../models/ActivityType';
import { previewDuration } from '../utils/dateUtils';

export default function RetroActivityModal({ visible, onClose }) {
  const { householdId, selectedDog, currentUser } = useApp();
  const [type, setType] = useState('pee');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [includeEnd, setIncludeEnd] = useState(true);
  const [notes, setNotes] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [foodType, setFoodType] = useState('');
  const [feedingAmount, setFeedingAmount] = useState('');

  const cfg = getConfig(type);
  const isTimed = cfg.isTimedActivity;
  const isFeeding = type === 'feeding';

  function reset() {
    setType('pee'); setStartTime(new Date()); setEndTime(new Date());
    setIncludeEnd(true); setNotes(''); setMealType('Breakfast'); setFoodType(''); setFeedingAmount('');
  }

  async function save() {
    if (!householdId || !selectedDog || !currentUser) return;
    await createActivity(householdId, {
      type,
      timestamp: startTime.toISOString(),
      endTime: isTimed && includeEnd ? endTime.toISOString() : null,
      notes: notes.trim() || null,
      dogId: selectedDog.id,
      userId: currentUser.id,
      mealType: isFeeding ? mealType : null,
      foodType: isFeeding && foodType.trim() ? foodType.trim() : null,
      feedingAmount: isFeeding && feedingAmount.trim() ? feedingAmount.trim() : null,
    });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { reset(); onClose(); }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Log Past Activity</Text>
          <TouchableOpacity onPress={save}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionLabel}>ACTIVITY</Text>
          <View style={styles.card}>
            {ALL_TYPES.map((t, i) => {
              const c = getConfig(t);
              return (
                <React.Fragment key={t}>
                  {i > 0 && <View style={styles.sep} />}
                  <TouchableOpacity style={styles.typeRow} onPress={() => setType(t)}>
                    <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                    <Text style={[styles.typeName, c.isAccident && { color: '#FF3B30' }]}>{c.displayName}</Text>
                    {type === t && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>{isTimed ? `${cfg.displayName.toUpperCase()} TIMES` : 'TIME'}</Text>
          <View style={styles.card}>
            <Text style={styles.pickerLabel}>{isTimed ? 'Start time' : 'Time'}</Text>
            <DateTimePicker value={startTime} mode="datetime" display="spinner" maximumDate={new Date()}
              onChange={(_, d) => { if (d) { setStartTime(d); if (endTime < d) setEndTime(d); } }} style={{ height: 160 }} />
            {isTimed && <>
              <View style={styles.sep} />
              <View style={styles.toggleRow}>
                <Text style={styles.rowLabel}>Add end time</Text>
                <Switch value={includeEnd} onValueChange={setIncludeEnd} />
              </View>
              {includeEnd && <>
                <DateTimePicker value={endTime} mode="datetime" display="spinner"
                  minimumDate={startTime} maximumDate={new Date()}
                  onChange={(_, d) => { if (d) setEndTime(d); }} style={{ height: 160 }} />
                <View style={styles.toggleRow}>
                  <Text style={styles.rowLabel}>Duration</Text>
                  <Text style={{ fontSize: 16, color: '#8E8E93' }}>{previewDuration(startTime, endTime)}</Text>
                </View>
              </>}
            </>}
          </View>

          {isFeeding && <>
            <Text style={styles.sectionLabel}>MEAL TYPE</Text>
            <View style={styles.card}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealRow}>
                {MEAL_TYPES.map(m => (
                  <TouchableOpacity key={m} style={[styles.mealChip, mealType === m && styles.mealChipActive]} onPress={() => setMealType(m)}>
                    <Text style={[styles.mealChipText, mealType === m && styles.mealChipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.sectionLabel}>FOOD DETAILS</Text>
            <View style={styles.card}>
              <TextInput style={styles.input} placeholder="Food type" placeholderTextColor="#8E8E93" value={foodType} onChangeText={setFoodType} />
              <View style={styles.sep} />
              <TextInput style={styles.input} placeholder="Amount" placeholderTextColor="#8E8E93" value={feedingAmount} onChangeText={setFeedingAmount} />
            </View>
          </>}

          <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
          <View style={styles.card}>
            <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
              placeholder="Add a note…" placeholderTextColor="#8E8E93" multiline value={notes} onChangeText={setNotes} />
          </View>

          {currentUser && <>
            <Text style={styles.sectionLabel}>LOGGED BY</Text>
            <View style={styles.card}>
              <View style={styles.toggleRow}>
                <View style={[{ width: 12, height: 12, borderRadius: 6, backgroundColor: currentUser.colorHex }]} />
                <Text style={styles.rowLabel}>{currentUser.name}</Text>
              </View>
            </View>
          </>}
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
  typeRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  typeName: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  check: { fontSize: 16, color: '#007AFF', fontWeight: '700' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 14 },
  pickerLabel: { fontSize: 15, color: '#8E8E93', padding: 14, paddingBottom: 0 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, gap: 10 },
  rowLabel: { fontSize: 16, color: '#1C1C1E' },
  input: { padding: 14, fontSize: 16, color: '#1C1C1E' },
  mealRow: { flexDirection: 'row', gap: 8, padding: 12 },
  mealChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
  mealChipActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
  mealChipText: { fontSize: 14, fontWeight: '600', color: '#3C3C43' },
  mealChipTextActive: { color: '#fff' },
});
