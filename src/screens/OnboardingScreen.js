import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Share,
} from 'react-native';
import { useApp } from '../context/AppContext';
import DateTimePickerRow from '../components/DateTimePickerRow';
import {
  createHousehold, findHouseholdByCode, createDog, createUser,
} from '../storage/firestore';

const AVATAR_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#FF2D55', '#FF6B35'];
const PET_EMOJIS = ['🐶','🐕','🦴','🐩','🐕‍🦺','🐈','🐱','🐰','🐹','🐻','🦁','🐯','🐨','🐼','🦊','🐴','🐢','🐠'];

export default function OnboardingScreen() {
  const { signIn } = useApp();

  // 'choose' | 'create-dog' | 'show-code' | 'join-code' | 'profile'
  const [step, setStep] = useState('choose');
  const [loading, setLoading] = useState(false);

  // Create flow
  const [dogName, setDogName] = useState('');
  const [petEmoji, setPetEmoji] = useState('🐶');
  const [dogBirthDate, setDogBirthDate] = useState(null); // Date object or null
  const [joinCode, setJoinCode] = useState('');     // shown after household created
  const [householdId, setHouseholdId] = useState(null);

  // Join flow
  const [codeInput, setCodeInput] = useState('');

  // Both flows
  const [userName, setUserName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);

  // ── Create flow ─────────────────────────────────────────────────────────────

  async function handleCreateHousehold() {
    if (!dogName.trim()) { Alert.alert("Enter your dog's name"); return; }
    setLoading(true);
    try {
      const household = await createHousehold();
      const birthDate = dogBirthDate ? dogBirthDate.toISOString() : null;
      await createDog(household.id, { name: dogName.trim(), birthDate, petEmoji });
      setPetEmoji('🐶');
      setHouseholdId(household.id);
      setJoinCode(household.joinCode);
      setStep('show-code');
    } catch (e) {
      Alert.alert('Error', 'Could not create household. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  // ── Join flow ────────────────────────────────────────────────────────────────

  async function handleJoinHousehold() {
    if (codeInput.trim().length !== 6) { Alert.alert('Enter the 6-character code'); return; }
    setLoading(true);
    try {
      const household = await findHouseholdByCode(codeInput.trim());
      if (!household) {
        Alert.alert('Code not found', 'Double-check the code and try again.');
        return;
      }
      setHouseholdId(household.id);
      setStep('profile');
    } catch (e) {
      Alert.alert('Error', 'Could not connect. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }

  // ── Finish (both flows) ──────────────────────────────────────────────────────

  async function handleFinish() {
    if (!userName.trim()) { Alert.alert('Enter your name'); return; }
    setLoading(true);
    try {
      const user = await createUser(householdId, {
        name: userName.trim(),
        colorHex: selectedColor,
      });
      await signIn(householdId, user.id);
    } catch (e) {
      Alert.alert('Error', 'Could not save your profile. Try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🐾</Text>
        <Text style={styles.appName}>PawLog</Text>

        {/* ── Choose ── */}
        {step === 'choose' && (
          <>
            <Text style={styles.heading}>Get started</Text>
            <Text style={styles.sub}>Are you setting up PawLog for the first time, or joining an existing household?</Text>

            <TouchableOpacity style={styles.btn} onPress={() => setStep('create-dog')}>
              <Text style={styles.btnText}>🏠  Create new household</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => setStep('join-code')}>
              <Text style={[styles.btnText, { color: '#007AFF' }]}>🔗  Join existing household</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Create: dog details ── */}
        {step === 'create-dog' && (
          <>
            <Text style={styles.heading}>Tell us about your dog</Text>
            <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 8 }}>{petEmoji}</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Pick an emoji for your pet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 8 }}>
                {PET_EMOJIS.map(e => (
                  <TouchableOpacity key={e} onPress={() => setPetEmoji(e)}
                    style={[styles.emojiOption, petEmoji === e && styles.emojiOptionActive]}>
                    <Text style={{ fontSize: 28 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Dog's Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Buddy" placeholderTextColor="#8E8E93"
                value={dogName} onChangeText={setDogName} autoFocus />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Birthday (optional)</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                <DateTimePickerRow
                  label={dogBirthDate
                    ? dogBirthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Tap to set birthday'}
                  value={dogBirthDate || new Date()}
                  onChange={d => setDogBirthDate(d)}
                  mode="date"
                  maximumDate={new Date()}
                />
                {dogBirthDate && (
                  <TouchableOpacity
                    style={{ padding: 10, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E5E5EA' }}
                    onPress={() => setDogBirthDate(null)}
                  >
                    <Text style={{ color: '#FF3B30', fontSize: 14 }}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep('choose')}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { flex: 1 }, (!dogName.trim() || loading) && styles.btnDisabled]}
                onPress={handleCreateHousehold}
                disabled={!dogName.trim() || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Next</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Create: show join code ── */}
        {step === 'show-code' && (
          <>
            <Text style={styles.heading}>Your household is ready!</Text>
            <Text style={styles.sub}>Share this code with anyone else who logs activities for {dogName}:</Text>

            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{joinCode}</Text>
            </View>

            <TouchableOpacity style={styles.copyBtn} onPress={() => Share.share({ message: joinCode })}>
              <Text style={styles.copyBtnText}>📋  Share / Copy Code</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>They'll enter this code when they first open PawLog.</Text>

            <TouchableOpacity style={styles.btn} onPress={() => setStep('profile')}>
              <Text style={styles.btnText}>Set up my profile →</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ── Join: enter code ── */}
        {step === 'join-code' && (
          <>
            <Text style={styles.heading}>Join a household</Text>
            <Text style={styles.sub}>Enter the 6-character code from the person who set up the household:</Text>
            <View style={styles.field}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="e.g. KPX72M"
                placeholderTextColor="#8E8E93"
                value={codeInput}
                onChangeText={t => setCodeInput(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={6}
                autoFocus
              />
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep('choose')}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { flex: 1 }, (codeInput.length !== 6 || loading) && styles.btnDisabled]}
                onPress={handleJoinHousehold}
                disabled={codeInput.length !== 6 || loading}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Join</Text>}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── Profile (both flows) ── */}
        {step === 'profile' && (
          <>
            <Text style={styles.heading}>Your profile</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Your Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. Sarah" placeholderTextColor="#8E8E93"
                value={userName} onChangeText={setUserName} autoFocus />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Pick a color</Text>
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map(c => (
                  <TouchableOpacity key={c}
                    style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotActive]}
                    onPress={() => setSelectedColor(c)}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.btn, (!userName.trim() || loading) && styles.btnDisabled]}
              onPress={handleFinish}
              disabled={!userName.trim() || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Get Started</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 34, fontWeight: '700', color: '#1C1C1E', marginBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, alignSelf: 'flex-start' },
  sub: { fontSize: 15, color: '#8E8E93', alignSelf: 'flex-start', marginBottom: 24, lineHeight: 22 },
  field: { width: '100%', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', color: '#3C3C43', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 16, color: '#1C1C1E', width: '100%',
    borderWidth: StyleSheet.hairlineWidth, borderColor: '#C6C6C8',
  },
  codeInput: { fontSize: 24, fontWeight: '700', letterSpacing: 6, textAlign: 'center' },
  codeBox: {
    backgroundColor: '#F2F2F7', borderRadius: 16,
    paddingHorizontal: 40, paddingVertical: 20, marginVertical: 16,
    borderWidth: 2, borderColor: '#007AFF',
  },
  codeText: { fontSize: 36, fontWeight: '800', letterSpacing: 8, color: '#007AFF' },
  hint: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginBottom: 24 },
  btn: {
    backgroundColor: '#007AFF', borderRadius: 14, padding: 16,
    alignItems: 'center', width: '100%', marginTop: 8,
  },
  btnSecondary: { backgroundColor: '#EBF3FF' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  backBtn: { backgroundColor: '#E5E5EA', borderRadius: 14, padding: 16, alignItems: 'center', paddingHorizontal: 24 },
  backBtnText: { color: '#1C1C1E', fontSize: 17, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotActive: { borderWidth: 3, borderColor: '#1C1C1E' },
  copyBtn: {
    backgroundColor: '#E8F0FE', borderRadius: 12, padding: 14,
    alignItems: 'center', width: '100%', marginTop: 8,
  },
  copyBtnText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  emojiOption: { padding: 8, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  emojiOptionActive: { borderColor: '#007AFF', backgroundColor: '#EBF3FF' },
});
