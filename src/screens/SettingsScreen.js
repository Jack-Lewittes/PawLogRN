import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';

const AVATAR_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#FF2D55', '#FF6B35'];

export default function SettingsScreen() {
  const { users, currentUser, addUser, switchUser } = useApp();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(AVATAR_COLORS[1]);

  async function handleAddUser() {
    if (!newName.trim()) { Alert.alert('Enter a name'); return; }
    const user = await addUser({ name: newName.trim(), colorHex: newColor });
    await switchUser(user.id);
    setNewName(''); setNewColor(AVATAR_COLORS[1]);
    setShowAddUser(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Current user */}
        <Text style={styles.sectionLabel}>CURRENT USER</Text>
        <View style={styles.card}>
          {users.map((u, i) => (
            <React.Fragment key={u.id}>
              {i > 0 && <View style={styles.sep} />}
              <TouchableOpacity style={styles.row} onPress={() => switchUser(u.id)}>
                <View style={[styles.avatar, { backgroundColor: u.colorHex }]}>
                  <Text style={styles.avatarText}>{u.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.userName}>{u.name}</Text>
                {currentUser?.id === u.id && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddUser(true)}>
          <Text style={styles.addBtnText}>+ Add Another User</Text>
        </TouchableOpacity>

        {/* App info */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>App</Text>
            <Text style={styles.rowValue}>PawLog</Text>
          </View>
          <View style={styles.sep} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add user modal */}
      <Modal visible={showAddUser} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAddUser(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddUser(false)}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add User</Text>
            <TouchableOpacity onPress={handleAddUser}>
              <Text style={styles.save}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#F2F2F7', flex: 1, padding: 20 }}>
            <Text style={styles.sectionLabel}>NAME</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.nameInput}
                placeholder="Your name"
                placeholderTextColor="#8E8E93"
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
            </View>
            <Text style={styles.sectionLabel}>COLOR</Text>
            <View style={[styles.card, { padding: 12 }]}>
              <View style={styles.colorRow}>
                {AVATAR_COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorDot, { backgroundColor: c }, newColor === c && styles.colorDotActive]}
                    onPress={() => setNewColor(c)}
                  />
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
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowLabel: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  rowValue: { fontSize: 16, color: '#8E8E93' },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#C6C6C8', marginLeft: 14 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  userName: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  check: { fontSize: 17, color: '#007AFF', fontWeight: '700' },
  addBtn: {
    margin: 16, padding: 14, backgroundColor: '#fff',
    borderRadius: 12, alignItems: 'center',
  },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#C6C6C8',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17, color: '#8E8E93' },
  save: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  nameInput: { padding: 14, fontSize: 16, color: '#1C1C1E' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18 },
  colorDotActive: { borderWidth: 3, borderColor: '#1C1C1E' },
});
