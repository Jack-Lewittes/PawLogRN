import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { createWeight, deleteWeight } from '../storage/firestore';
import { getDogAge } from '../utils/dateUtils';

export default function ProfileScreen() {
  const { householdId, selectedDog, weights } = useApp();
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [weightVal, setWeightVal] = useState('');
  const [unit, setUnit] = useState('lbs');

  const dogWeights = useMemo(() =>
    weights
      .filter(w => w.dogId === selectedDog?.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [weights, selectedDog]);

  const latestWeight = dogWeights.length > 0 ? dogWeights[dogWeights.length - 1] : null;

  async function addWeight() {
    const num = parseFloat(weightVal);
    if (isNaN(num) || num <= 0) { Alert.alert('Enter a valid weight'); return; }
    await createWeight(householdId, { weight: num, unit, dogId: selectedDog.id });
    setWeightVal('');
    setShowAddWeight(false);
    // No refresh needed — onSnapshot fires automatically
  }

  async function handleDeleteWeight(id) {
    Alert.alert('Delete weight entry?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWeight(householdId, id) },
    ]);
  }

  if (!selectedDog) {
    return <View style={styles.empty}><Text style={styles.emptyText}>No dog profile found</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🐶</Text>
          <Text style={styles.heroName}>{selectedDog.name}</Text>
          <Text style={styles.heroAge}>{getDogAge(selectedDog.birthDate)}</Text>
          {latestWeight && <Text style={styles.heroWeight}>{latestWeight.weight} {latestWeight.unit}</Text>}
        </View>

        <Text style={styles.sectionLabel}>DOG INFO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{selectedDog.name}</Text>
          </View>
          {selectedDog.birthDate && <>
            <View style={styles.sep} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Birthday</Text>
              <Text style={styles.rowValue}>
                {new Date(selectedDog.birthDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.sep} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Age</Text>
              <Text style={styles.rowValue}>{getDogAge(selectedDog.birthDate)}</Text>
            </View>
          </>}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>WEIGHT</Text>
          <TouchableOpacity onPress={() => setShowAddWeight(true)}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {dogWeights.length === 0 ? (
            <View style={styles.row}><Text style={styles.rowLabel}>No weight entries yet</Text></View>
          ) : (
            dogWeights.slice().reverse().map((w, i) => (
              <React.Fragment key={w.id}>
                {i > 0 && <View style={styles.sep} />}
                <TouchableOpacity style={styles.row} onLongPress={() => handleDeleteWeight(w.id)}>
                  <Text style={styles.rowLabel}>
                    {new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.rowValue}>{w.weight} {w.unit}</Text>
                </TouchableOpacity>
              </React.Fragment>
            ))
          )}
        </View>
        {dogWeights.length > 0 && <Text style={styles.hint}>Long-press a weight entry to delete it</Text>}
      </ScrollView>

      <Modal visible={showAddWeight} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAddWeight(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddWeight(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Log Weight</Text>
            <TouchableOpacity onPress={addWeight}><Text style={styles.save}>Save</Text></TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#F2F2F7', flex: 1, padding: 20 }}>
            <Text style={styles.sectionLabel}>WEIGHT</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.weightInput}
                placeholder="0.0" placeholderTextColor="#8E8E93"
                keyboardType="decimal-pad" value={weightVal} onChangeText={setWeightVal} autoFocus
              />
            </View>
            <Text style={styles.sectionLabel}>UNIT</Text>
            <View style={styles.card}>
              <View style={styles.unitRow}>
                {['lbs', 'kg'].map(u => (
                  <TouchableOpacity key={u} style={[styles.unitBtn, unit === u && styles.unitBtnActive]} onPress={() => setUnit(u)}>
                    <Text style={[styles.unitBtnText, unit === u && styles.unitBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 17, color: '#8E8E93' },
  hero: { alignItems: 'center', paddingVertical: 28, gap: 4 },
  heroEmoji: { fontSize: 56 },
  heroName: { fontSize: 28, fontWeight: '700', color: '#1C1C1E' },
  heroAge: { fontSize: 16, color: '#8E8E93' },
  heroWeight: { fontSize: 15, color: '#8E8E93' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 16, marginBottom: 6 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginHorizontal: 20, marginTop: 16, marginBottom: 6 },
  addLink: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowLabel: { fontSize: 16, color: '#1C1C1E' },
  rowValue: { fontSize: 16, color: '#8E8E93' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 14 },
  hint: { fontSize: 12, color: '#8E8E93', textAlign: 'center', marginTop: 6 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8', backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  save: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  weightInput: { padding: 14, fontSize: 24, fontWeight: '600', color: '#1C1C1E', textAlign: 'center' },
  unitRow: { flexDirection: 'row', padding: 10, gap: 10 },
  unitBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#F2F2F7', alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#007AFF' },
  unitBtnText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  unitBtnTextActive: { color: '#fff' },
});
