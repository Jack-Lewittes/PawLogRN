import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { createWeight, deleteWeight, updateDog, createVaccine, deleteVaccine } from '../storage/firestore';
import { getDogAge } from '../utils/dateUtils';
import DateTimePickerRow from '../components/DateTimePickerRow';

const PET_EMOJIS = ['🐶','🐕','🦴','🐩','🐕‍🦺','🐈','🐱','🐰','🐹','🐻','🦁','🐯','🐨','🐼','🦊','🐴','🐢','🐠'];

export default function ProfileScreen() {
  const { householdId, selectedDog, weights, vaccines } = useApp();

  // Weight modal
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [weightVal, setWeightVal] = useState('');
  const [unit, setUnit] = useState('lbs');

  // Edit dog modal
  const [showEditDog, setShowEditDog] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editFood, setEditFood] = useState('');
  const [editBirthDate, setEditBirthDate] = useState(null);
  const [editEmoji, setEditEmoji] = useState('🐶');

  // Vaccine modal
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineDate, setVaccineDate] = useState(new Date());
  const [vaccineNotes, setVaccineNotes] = useState('');

  const dogWeights = useMemo(() =>
    weights
      .filter(w => w.dogId === selectedDog?.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [weights, selectedDog]);

  const dogVaccines = useMemo(() =>
    vaccines
      .filter(v => v.dogId === selectedDog?.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [vaccines, selectedDog]);

  const latestWeight = dogWeights.length > 0 ? dogWeights[dogWeights.length - 1] : null;

  async function addWeight() {
    const num = parseFloat(weightVal);
    if (isNaN(num) || num <= 0) { Alert.alert('Enter a valid weight'); return; }
    await createWeight(householdId, { weight: num, unit, dogId: selectedDog.id });
    setWeightVal('');
    setShowAddWeight(false);
  }

  async function handleDeleteWeight(id) {
    Alert.alert('Delete weight entry?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWeight(householdId, id) },
    ]);
  }

  function openEditDog() {
    setEditName(selectedDog.name || '');
    setEditBreed(selectedDog.breed || '');
    setEditFood(selectedDog.regularFood || '');
    setEditBirthDate(selectedDog.birthDate ? new Date(selectedDog.birthDate) : null);
    setEditEmoji(selectedDog.petEmoji || '🐶');
    setShowEditDog(true);
  }

  async function saveEditDog() {
    if (!editName.trim()) { Alert.alert('Name is required'); return; }
    await updateDog(householdId, {
      ...selectedDog,
      name: editName.trim(),
      breed: editBreed.trim() || null,
      regularFood: editFood.trim() || null,
      birthDate: editBirthDate ? editBirthDate.toISOString() : null,
      petEmoji: editEmoji,
    });
    setShowEditDog(false);
  }

  async function addVaccine() {
    if (!vaccineName.trim()) { Alert.alert('Enter vaccine name'); return; }
    await createVaccine(householdId, {
      dogId: selectedDog.id,
      name: vaccineName.trim(),
      date: vaccineDate.toISOString(),
      notes: vaccineNotes.trim() || null,
    });
    setVaccineName(''); setVaccineDate(new Date()); setVaccineNotes('');
    setShowAddVaccine(false);
  }

  async function handleDeleteVaccine(id) {
    Alert.alert('Delete vaccine record?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteVaccine(householdId, id) },
    ]);
  }

  if (!selectedDog) {
    return <View style={styles.empty}><Text style={styles.emptyText}>No dog profile found</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{selectedDog.petEmoji || '🐶'}</Text>
          <Text style={styles.heroName}>{selectedDog.name}</Text>
          {selectedDog.breed && <Text style={styles.heroBreed}>{selectedDog.breed}</Text>}
          <Text style={styles.heroAge}>{getDogAge(selectedDog.birthDate)}</Text>
          {latestWeight && <Text style={styles.heroWeight}>{latestWeight.weight} {latestWeight.unit}</Text>}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>DOG INFO</Text>
          <TouchableOpacity onPress={openEditDog}>
            <Text style={styles.addLink}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{selectedDog.name}</Text>
          </View>
          {selectedDog.breed && <>
            <View style={styles.sep} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Breed</Text>
              <Text style={styles.rowValue}>{selectedDog.breed}</Text>
            </View>
          </>}
          {selectedDog.regularFood && <>
            <View style={styles.sep} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Regular Food</Text>
              <Text style={styles.rowValue}>{selectedDog.regularFood}</Text>
            </View>
          </>}
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

        {/* Vaccines */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>VACCINES</Text>
          <TouchableOpacity onPress={() => setShowAddVaccine(true)}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {dogVaccines.length === 0 ? (
            <View style={styles.row}><Text style={styles.rowLabel}>No vaccine records yet</Text></View>
          ) : (
            dogVaccines.map((v, i) => (
              <React.Fragment key={v.id}>
                {i > 0 && <View style={styles.sep} />}
                <TouchableOpacity style={styles.vaccineRow} onLongPress={() => handleDeleteVaccine(v.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vaccineName}>{v.name}</Text>
                    {v.notes && <Text style={styles.vaccineNotes}>{v.notes}</Text>}
                  </View>
                  <Text style={styles.rowValue}>
                    {new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))
          )}
        </View>
        {dogVaccines.length > 0 && <Text style={styles.hint}>Long-press to delete a vaccine record</Text>}

        {/* Weight */}
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

      {/* Edit Dog Modal */}
      <Modal visible={showEditDog} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditDog(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditDog(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Dog Profile</Text>
            <TouchableOpacity onPress={saveEditDog}><Text style={styles.save}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>PET EMOJI</Text>
            <View style={[styles.card, { padding: 12 }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {PET_EMOJIS.map(e => (
                  <TouchableOpacity key={e} onPress={() => setEditEmoji(e)}
                    style={[{ padding: 8, borderRadius: 10, borderWidth: 2, borderColor: editEmoji === e ? '#007AFF' : 'transparent', backgroundColor: editEmoji === e ? '#EBF3FF' : 'transparent' }]}>
                    <Text style={{ fontSize: 28 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.sectionLabel}>NAME</Text>
            <View style={styles.card}>
              <TextInput style={styles.fieldInput} placeholder="Dog's name" placeholderTextColor="#8E8E93" value={editName} onChangeText={setEditName} />
            </View>
            <Text style={styles.sectionLabel}>BREED (OPTIONAL)</Text>
            <View style={styles.card}>
              <TextInput style={styles.fieldInput} placeholder="e.g. Golden Retriever" placeholderTextColor="#8E8E93" value={editBreed} onChangeText={setEditBreed} />
            </View>
            <Text style={styles.sectionLabel}>REGULAR FOOD (OPTIONAL)</Text>
            <View style={styles.card}>
              <TextInput style={styles.fieldInput} placeholder="e.g. Royal Canin dry kibble" placeholderTextColor="#8E8E93" value={editFood} onChangeText={setEditFood} />
            </View>
            <Text style={styles.sectionLabel}>BIRTHDAY (OPTIONAL)</Text>
            <View style={styles.card}>
              <DateTimePickerRow
                label={editBirthDate ? 'Birthday' : 'Tap to set birthday'}
                value={editBirthDate || new Date()}
                onChange={d => setEditBirthDate(d)}
                mode="date"
                maximumDate={new Date()}
              />
              {editBirthDate && (
                <TouchableOpacity
                  style={{ padding: 12, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5EA' }}
                  onPress={() => setEditBirthDate(null)}
                >
                  <Text style={{ color: '#FF3B30', fontSize: 15 }}>Clear Birthday</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Vaccine Modal */}
      <Modal visible={showAddVaccine} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddVaccine(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddVaccine(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>Add Vaccine</Text>
            <TouchableOpacity onPress={addVaccine}><Text style={styles.save}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, backgroundColor: '#F2F2F7' }} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>VACCINE NAME</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Rabies, DHPP, Bordetella"
                placeholderTextColor="#8E8E93"
                value={vaccineName}
                onChangeText={setVaccineName}
                autoFocus
              />
            </View>
            <Text style={styles.sectionLabel}>DATE GIVEN</Text>
            <View style={styles.card}>
              <DateTimePickerRow
                label="Date"
                value={vaccineDate}
                onChange={setVaccineDate}
                mode="date"
                maximumDate={new Date()}
              />
            </View>
            <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
            <View style={styles.card}>
              <TextInput
                style={[styles.fieldInput, { minHeight: 70, textAlignVertical: 'top' }]}
                placeholder="e.g. Next booster due in 1 year"
                placeholderTextColor="#8E8E93"
                multiline
                value={vaccineNotes}
                onChangeText={setVaccineNotes}
              />
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Weight Modal */}
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
  heroBreed: { fontSize: 15, color: '#8E8E93' },
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
  vaccineRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  vaccineName: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  vaccineNotes: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8', backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  save: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  fieldInput: { padding: 14, fontSize: 16, color: '#1C1C1E' },
  weightInput: { padding: 14, fontSize: 24, fontWeight: '600', color: '#1C1C1E', textAlign: 'center' },
  unitRow: { flexDirection: 'row', padding: 10, gap: 10 },
  unitBtn: { flex: 1, padding: 10, borderRadius: 10, backgroundColor: '#F2F2F7', alignItems: 'center' },
  unitBtnActive: { backgroundColor: '#007AFF' },
  unitBtnText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  unitBtnTextActive: { color: '#fff' },
});
