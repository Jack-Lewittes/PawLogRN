import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useApp } from '../context/AppContext';
import { createActivity } from '../storage/firestore';
import { isToday } from '../utils/dateUtils';
import { getConfig } from '../models/ActivityType';
import ActivityFAB from '../components/ActivityFAB';
import RunningTimedActivityBanner from '../components/RunningTimedActivityBanner';
import ActivityRowView from '../components/ActivityRowView';
import AddNoteModal from '../components/AddNoteModal';
import AddFeedingModal from '../components/AddFeedingModal';
import EndTimedActivityModal from '../components/EndTimedActivityModal';
import RetroActivityModal from '../components/RetroActivityModal';

export default function HomeScreen() {
  const { householdId, selectedDog, currentUser, activities, users } = useApp();

  const [noteEntry, setNoteEntry] = useState(null);
  const [showAddFeeding, setShowAddFeeding] = useState(false);
  const [showRetro, setShowRetro] = useState(false);
  const [endingActivity, setEndingActivity] = useState(null);

  // Filter from live Firestore data — no manual refreshes needed
  const todayActivities = useMemo(() => {
    if (!selectedDog) return [];
    return activities
      .filter(a => a.dogId === selectedDog.id && isToday(a.timestamp))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [activities, selectedDog]);

  const runningNap = useMemo(() =>
    activities.find(a => a.dogId === selectedDog?.id && a.type === 'nap' && !a.endTime) || null,
    [activities, selectedDog]);

  const runningTraining = useMemo(() =>
    activities.find(a => a.dogId === selectedDog?.id && a.type === 'training' && !a.endTime) || null,
    [activities, selectedDog]);

  function getUserForEntry(entry) {
    return users.find(u => u.id === entry.userId) || null;
  }

  async function addNow(type) {
    if (!householdId || !selectedDog || !currentUser) return;
    const cfg = getConfig(type);

    if (cfg.isTimedActivity) {
      await createActivity(householdId, { type, dogId: selectedDog.id, userId: currentUser.id });
    } else if (type === 'feeding') {
      setShowAddFeeding(true);
    } else {
      const entry = await createActivity(householdId, { type, dogId: selectedDog.id, userId: currentUser.id });
      setTimeout(() => setNoteEntry(entry), 300);
    }
    // No manual refresh needed — Firestore onSnapshot fires on both phones automatically
  }

  const isEmpty = todayActivities.length === 0 && !runningNap && !runningTraining;

  return (
    <SafeAreaView style={styles.container}>
      {runningNap && (
        <RunningTimedActivityBanner entry={runningNap} onPress={() => setEndingActivity(runningNap)} />
      )}
      {runningTraining && (
        <RunningTimedActivityBanner entry={runningTraining} onPress={() => setEndingActivity(runningTraining)} />
      )}

      {isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>No activities yet today</Text>
          <Text style={styles.emptySub}>Tap + to log an activity</Text>
        </View>
      ) : (
        <FlatList
          data={todayActivities}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ActivityRowView entry={item} user={getUserForEntry(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
            <Text style={styles.header}>
              {todayActivities.length} activit{todayActivities.length === 1 ? 'y' : 'ies'} today
            </Text>
          }
        />
      )}

      <ActivityFAB onSelect={addNow} onRetro={() => setShowRetro(true)} />

      <AddNoteModal visible={!!noteEntry} entry={noteEntry} onClose={() => setNoteEntry(null)} />
      <AddFeedingModal visible={showAddFeeding} onClose={() => setShowAddFeeding(false)} />
      <EndTimedActivityModal visible={!!endingActivity} entry={endingActivity} onClose={() => setEndingActivity(null)} />
      <RetroActivityModal visible={showRetro} onClose={() => setShowRetro(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyIcon: { fontSize: 56, opacity: 0.35 },
  emptyTitle: { fontSize: 18, color: '#8E8E93' },
  emptySub: { fontSize: 15, color: '#8E8E93' },
  header: {
    fontSize: 13, fontWeight: '600', color: '#8E8E93',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, textTransform: 'uppercase',
  },
});
