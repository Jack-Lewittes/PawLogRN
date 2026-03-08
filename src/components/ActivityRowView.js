import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getConfig, feedingDisplayLine } from '../models/ActivityType';
import { formatTime, getDuration, formatTimeRange } from '../utils/dateUtils';
import ActivityDetailModal from './ActivityDetailModal';

export default function ActivityRowView({ entry, user, onRefresh }) {
  const [showDetail, setShowDetail] = useState(false);
  const cfg = getConfig(entry.type);
  const duration = cfg.isTimedActivity ? getDuration(entry.timestamp, entry.endTime) : null;
  const feedLine = feedingDisplayLine(entry);

  return (
    <>
      <TouchableOpacity style={styles.row} onPress={() => setShowDetail(true)} activeOpacity={0.7}>
        {/* Emoji badge */}
        <View style={[styles.badge, { backgroundColor: cfg.color + '26' }]}>
          <Text style={styles.emoji}>{cfg.emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.time, cfg.isAccident && { color: '#FF3B30' }]}>
              {formatTime(entry.timestamp)}
            </Text>
            <Text style={[styles.sep]}>·</Text>
            <Text style={[styles.name, cfg.isAccident && { color: '#FF3B30' }]}>{cfg.displayName}</Text>
            {cfg.isAccident && (
              <View style={styles.accidentBadge}><Text style={styles.accidentText}>ACCIDENT</Text></View>
            )}
            {duration && (
              <Text style={styles.duration}>{duration}</Text>
            )}
            {entry.type === 'feeding' && entry.mealType && (
              <View style={styles.mealBadge}><Text style={styles.mealText}>{entry.mealType}</Text></View>
            )}
          </View>
          {feedLine && <Text style={styles.sub} numberOfLines={1}>{feedLine}</Text>}
          {entry.notes ? <Text style={styles.sub} numberOfLines={1}>{entry.notes}</Text> : null}
          {user && (
            <View style={styles.userRow}>
              <View style={[styles.dot, { backgroundColor: user.colorHex }]} />
              <Text style={styles.userName}>{user.name}</Text>
            </View>
          )}
        </View>

        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <ActivityDetailModal
        visible={showDetail}
        entry={entry}
        user={user}
        onClose={() => setShowDetail(false)}
        onDelete={onRefresh}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA',
  },
  badge: {
    width: 42, height: 42, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  emoji: { fontSize: 20 },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  time: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  sep: { fontSize: 15, color: '#C6C6C8' },
  name: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  duration: { fontSize: 12, color: '#8E8E93' },
  accidentBadge: {
    backgroundColor: '#FF3B3020', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  accidentText: { fontSize: 10, fontWeight: '700', color: '#FF3B30' },
  mealBadge: {
    backgroundColor: '#34C75920', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  mealText: { fontSize: 10, fontWeight: '700', color: '#34C759' },
  sub: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  userName: { fontSize: 11, color: '#8E8E93' },
  chevron: { fontSize: 20, color: '#C6C6C8', marginLeft: 8 },
});
