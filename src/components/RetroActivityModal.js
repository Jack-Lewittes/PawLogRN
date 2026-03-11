import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { createActivity } from '../storage/firestore';
import { ALL_TYPES, getConfig, MEAL_TYPES } from '../models/ActivityType';
import { previewDuration } from '../utils/dateUtils';

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatTimeDisplay(date) {
  let h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

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

  // Picker modal states
  const [pickerTarget, setPickerTarget] = useState(null); // 'startDate' | 'startTime' | 'endDate' | 'endTime'

  // Reset every time the modal opens
  useEffect(() => {
    if (visible) {
      const now = new Date();
      setType('pee');
      setStartTime(now);
      setEndTime(now);
      setIncludeEnd(true);
      setNotes('');
      setMealType('Breakfast');
      setFoodType('');
      setFeedingAmount('');
      setPickerTarget(null);
    }
  }, [visible]);

  const cfg = getConfig(type);
  const isTimed = cfg.isTimedActivity;
  const isFeeding = type === 'feeding';

  async function save() {
    if (!householdId || !selectedDog || !currentUser) return;
    const savedType = type; // capture before any state changes
    await createActivity(householdId, {
      type: savedType,
      timestamp: startTime.toISOString(),
      endTime: isTimed && includeEnd ? endTime.toISOString() : null,
      notes: notes.trim() || null,
      dogId: selectedDog.id,
      userId: currentUser.id,
      mealType: isFeeding ? mealType : null,
      foodType: isFeeding && foodType.trim() ? foodType.trim() : null,
      feedingAmount: isFeeding && feedingAmount.trim() ? feedingAmount.trim() : null,
    });
    onClose();
  }

  // Picker modal: handles changes for date or time separately
  function handlePickerChange(_, d) {
    if (!d) return;
    if (pickerTarget === 'startDate') {
      const updated = new Date(startTime);
      updated.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
      setStartTime(updated);
      if (endTime < updated) setEndTime(updated);
    } else if (pickerTarget === 'startTime') {
      const updated = new Date(startTime);
      updated.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setStartTime(updated);
      if (endTime < updated) setEndTime(updated);
    } else if (pickerTarget === 'endDate') {
      const updated = new Date(endTime);
      updated.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
      setEndTime(updated);
    } else if (pickerTarget === 'endTime') {
      const updated = new Date(endTime);
      updated.setHours(d.getHours(), d.getMinutes(), 0, 0);
      setEndTime(updated);
    }
  }

  function pickerValue() {
    if (pickerTarget === 'startDate' || pickerTarget === 'startTime') return startTime;
    return endTime;
  }

  function pickerMode() {
    if (pickerTarget === 'startDate' || pickerTarget === 'endDate') return 'date';
    return 'time';
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Log Past Activity</Text>
          <TouchableOpacity onPress={save}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }} keyboardShouldPersistTaps="handled">

          {/* TIME — tap rows to change, no inline picker */}
          <Text style={styles.sectionLabel}>TIME</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.timeRow} onPress={() => setPickerTarget('startDate')}>
              <Text style={styles.timeRowLabel}>Date</Text>
              <Text style={styles.timeRowValue}>{formatDateDisplay(startTime)}</Text>
            </TouchableOpacity>
            <View style={styles.sep} />
            <TouchableOpacity style={styles.timeRow} onPress={() => setPickerTarget('startTime')}>
              <Text style={styles.timeRowLabel}>Time</Text>
              <Text style={styles.timeRowValue}>{formatTimeDisplay(startTime)}</Text>
            </TouchableOpacity>
          </View>

          {/* END TIME for timed activities */}
          {isTimed && <>
            <Text style={styles.sectionLabel}>{cfg.displayName.toUpperCase()} END TIME</Text>
            <View style={styles.card}>
              <View style={styles.timeRow}>
                <Text style={styles.timeRowLabel}>Add end time</Text>
                <Switch value={includeEnd} onValueChange={setIncludeEnd} />
              </View>
              {includeEnd && <>
                <View style={styles.sep} />
                <TouchableOpacity style={styles.timeRow} onPress={() => setPickerTarget('endDate')}>
                  <Text style={styles.timeRowLabel}>End date</Text>
                  <Text style={styles.timeRowValue}>{formatDateDisplay(endTime)}</Text>
                </TouchableOpacity>
                <View style={styles.sep} />
                <TouchableOpacity style={styles.timeRow} onPress={() => setPickerTarget('endTime')}>
                  <Text style={styles.timeRowLabel}>End time</Text>
                  <Text style={styles.timeRowValue}>{formatTimeDisplay(endTime)}</Text>
                </TouchableOpacity>
                <View style={styles.sep} />
                <View style={styles.timeRow}>
                  <Text style={styles.timeRowLabel}>Duration</Text>
                  <Text style={styles.durationText}>{previewDuration(startTime, endTime)}</Text>
                </View>
              </>}
            </View>
          </>}

          {/* ACTIVITY TYPE */}
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
            <TextInput
              style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
              placeholder="Add a note…"
              placeholderTextColor="#8E8E93"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {currentUser && <>
            <Text style={styles.sectionLabel}>LOGGED BY</Text>
            <View style={styles.card}>
              <View style={styles.timeRow}>
                <View style={[{ width: 12, height: 12, borderRadius: 6, backgroundColor: currentUser.colorHex }]} />
                <Text style={styles.timeRowLabel}>{currentUser.name}</Text>
              </View>
            </View>
          </>}
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker overlay modal — separate from ScrollView, no jumping */}
      <Modal
        visible={!!pickerTarget}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerTarget(null)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <View style={{ width: 60 }} />
              <Text style={styles.pickerTitle}>
                {pickerTarget === 'startDate' ? 'Select Date' :
                 pickerTarget === 'startTime' ? 'Select Time' :
                 pickerTarget === 'endDate' ? 'Select End Date' : 'Select End Time'}
              </Text>
              <TouchableOpacity onPress={() => setPickerTarget(null)} style={{ width: 60, alignItems: 'flex-end' }}>
                <Text style={styles.pickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={pickerValue()}
              mode={pickerMode()}
              display="spinner"
              maximumDate={new Date()}
              minimumDate={pickerTarget === 'endDate' || pickerTarget === 'endTime' ? startTime : undefined}
              onChange={handlePickerChange}
              style={{ height: 220 }}
              textColor="#1C1C1E"
            />
          </View>
        </View>
      </Modal>
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
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 16 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  timeRowLabel: { fontSize: 16, color: '#1C1C1E' },
  timeRowValue: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
  durationText: { fontSize: 16, color: '#8E8E93' },
  typeRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  typeName: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  check: { fontSize: 16, color: '#007AFF', fontWeight: '700' },
  input: { padding: 14, fontSize: 16, color: '#1C1C1E' },
  mealRow: { flexDirection: 'row', gap: 8, padding: 12 },
  mealChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
  mealChipActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
  mealChipText: { fontSize: 14, fontWeight: '600', color: '#3C3C43' },
  mealChipTextActive: { color: '#fff' },
  // Picker overlay
  pickerOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA',
  },
  pickerTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E' },
  pickerDone: { fontSize: 17, fontWeight: '700', color: '#007AFF' },
});
