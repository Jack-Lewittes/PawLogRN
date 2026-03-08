import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getConfig, feedingDisplayLine } from '../models/ActivityType';
import { formatTime, getDuration } from '../utils/dateUtils';
import ActivityDetailModal from './ActivityDetailModal';

export default function LogTimelineRow({ entry, user, onEndTimed, onRefresh }) {
  const [showDetail, setShowDetail] = useState(false);
  const cfg = getConfig(entry.type);
  const isRunning = cfg.isTimedActivity && !entry.endTime;
  const duration = cfg.isTimedActivity ? getDuration(entry.timestamp, entry.endTime) : null;
  const feedLine = feedingDisplayLine(entry);

  function handleTap() {
    if (isRunning) {
      onEndTimed(entry);
    } else {
      setShowDetail(true);
    }
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.row, isRunning && { backgroundColor: cfg.color + '10' }]}
        onPress={handleTap}
        activeOpacity={0.7}
      >
        {/* Time column */}
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{formatTime(entry.timestamp)}</Text>
          {cfg.isTimedActivity && (
            <Text style={[styles.timeEnd, isRunning && { color: cfg.color }]}>
              {entry.endTime ? formatTime(entry.endTime) : 'running…'}
            </Text>
          )}
        </View>

        {/* Activity column */}
        <View style={styles.actCol}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>{cfg.emoji}</Text>
            <Text style={[styles.name, cfg.isAccident && { color: '#FF3B30' }]}>{cfg.displayName}</Text>

            {cfg.isAccident && (
              <View style={styles.badge}><Text style={[styles.badgeText, { color: '#FF3B30' }]}>ACCIDENT</Text></View>
            )}
            {isRunning && (
              <View style={[styles.badge, { backgroundColor: cfg.color + '20' }]}>
                <Text style={[styles.badgeText, { color: cfg.color }]}>IN PROGRESS</Text>
              </View>
            )}
            {!isRunning && duration && (
              <Text style={styles.duration}>{duration}</Text>
            )}
            {entry.type === 'feeding' && entry.mealType && (
              <View style={[styles.badge, { backgroundColor: '#34C75920' }]}>
                <Text style={[styles.badgeText, { color: '#34C759' }]}>{entry.mealType}</Text>
              </View>
            )}
          </View>

          {feedLine && <Text style={styles.sub} numberOfLines={1}>{feedLine}</Text>}
          {entry.notes ? <Text style={styles.sub} numberOfLines={2}>{entry.notes}</Text> : null}

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
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, paddingHorizontal: 0,
    backgroundColor: '#fff',
  },
  timeCol: {
    width: 72, alignItems: 'flex-end', paddingRight: 12,
    paddingTop: 12, paddingLeft: 16,
  },
  timeText: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'], color: '#1C1C1E' },
  timeEnd: { fontSize: 11, fontVariant: ['tabular-nums'], color: '#8E8E93', marginTop: 2 },
  actCol: { flex: 1, paddingTop: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  emoji: { fontSize: 16 },
  name: { fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  badge: {
    backgroundColor: '#FF3B3010', borderRadius: 3,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  badgeText: { fontSize: 10, fontWeight: '700' },
  duration: { fontSize: 11, color: '#8E8E93' },
  sub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  userName: { fontSize: 11, color: '#8E8E93' },
  chevron: { fontSize: 20, color: '#C6C6C8', paddingTop: 10, paddingRight: 12 },
});
