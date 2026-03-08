import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { updateActivity } from '../storage/firestore';
import { getConfig } from '../models/ActivityType';
import { formatTime } from '../utils/dateUtils';

export default function AddNoteModal({ visible, entry, onClose }) {
  const { householdId } = useApp();
  const [notes, setNotes] = useState('');

  if (!entry) return null;
  const cfg = getConfig(entry.type);

  async function saveNote() {
    await updateActivity(householdId, { ...entry, notes: notes.trim() });
    setNotes('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setNotes(''); onClose(); }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setNotes(''); onClose(); }}><Text style={styles.skip}>Skip</Text></TouchableOpacity>
          <Text style={styles.title}>Activity Added</Text>
          <TouchableOpacity onPress={saveNote} disabled={!notes.trim()}>
            <Text style={[styles.save, !notes.trim() && styles.saveDisabled]}>Save Note</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityInfo}>
          <Text style={{ fontSize: 52 }}>{cfg.emoji}</Text>
          <Text style={[styles.activityTitle, cfg.isAccident && { color: '#FF3B30' }]}>
            {formatTime(entry.timestamp)} : {cfg.displayName}
          </Text>
          <Text style={styles.logged}>Logged</Text>
        </View>
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Add a note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. outside for 5 min, seemed uncomfortable…"
            placeholderTextColor="#8E8E93"
            multiline value={notes} onChangeText={setNotes} autoFocus
          />
        </View>
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
  skip: { fontSize: 17, color: '#8E8E93' },
  save: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  saveDisabled: { opacity: 0.35 },
  activityInfo: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  activityTitle: { fontSize: 18, fontWeight: '700' },
  logged: { fontSize: 15, color: '#8E8E93' },
  noteSection: { marginHorizontal: 16, gap: 8 },
  noteLabel: { fontSize: 17, fontWeight: '600' },
  noteInput: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    fontSize: 16, minHeight: 110, textAlignVertical: 'top', color: '#1C1C1E',
  },
});
