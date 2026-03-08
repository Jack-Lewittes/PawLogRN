import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../context/AppContext';
import { createActivity } from '../storage/firestore';
import { MEAL_TYPES } from '../models/ActivityType';

export default function AddFeedingModal({ visible, onClose }) {
  const { householdId, selectedDog, currentUser } = useApp();
  const [mealType, setMealType] = useState('Breakfast');
  const [foodType, setFoodType] = useState('');
  const [feedingAmount, setFeedingAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(new Date());

  function reset() {
    setMealType('Breakfast'); setFoodType(''); setFeedingAmount('');
    setNotes(''); setUseCustomTime(false); setCustomTime(new Date());
  }

  async function save() {
    if (!householdId || !selectedDog || !currentUser) return;
    await createActivity(householdId, {
      type: 'feeding',
      timestamp: useCustomTime ? customTime.toISOString() : new Date().toISOString(),
      notes: notes.trim() || null,
      dogId: selectedDog.id,
      userId: currentUser.id,
      mealType,
      foodType: foodType.trim() || null,
      feedingAmount: feedingAmount.trim() || null,
    });
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { reset(); onClose(); }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { reset(); onClose(); }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.title}>Log Feeding</Text>
          <TouchableOpacity onPress={save}><Text style={styles.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }} keyboardShouldPersistTaps="handled">
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
            <TextInput style={styles.input} placeholder="Food type (e.g. dry kibble)" placeholderTextColor="#8E8E93" value={foodType} onChangeText={setFoodType} />
            <View style={styles.sep} />
            <TextInput style={styles.input} placeholder="Amount (e.g. 1 cup)" placeholderTextColor="#8E8E93" value={feedingAmount} onChangeText={setFeedingAmount} />
          </View>
          <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
          <View style={styles.card}>
            <TextInput style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
              placeholder="Add a note…" placeholderTextColor="#8E8E93" multiline value={notes} onChangeText={setNotes} />
          </View>
          <Text style={styles.sectionLabel}>TIME</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Use custom time</Text>
              <Switch value={useCustomTime} onValueChange={setUseCustomTime} />
            </View>
            {useCustomTime && (
              <DateTimePicker value={customTime} mode="datetime" display="spinner" maximumDate={new Date()}
                onChange={(_, d) => { if (d) setCustomTime(d); }} style={{ height: 180 }} />
            )}
          </View>
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
  mealRow: { flexDirection: 'row', gap: 8, padding: 12 },
  mealChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F2F2F7', borderWidth: 1, borderColor: '#E5E5EA' },
  mealChipActive: { backgroundColor: '#34C759', borderColor: '#34C759' },
  mealChipText: { fontSize: 14, fontWeight: '600', color: '#3C3C43' },
  mealChipTextActive: { color: '#fff' },
  input: { padding: 14, fontSize: 16, color: '#1C1C1E' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLabel: { fontSize: 16, color: '#1C1C1E' },
});
