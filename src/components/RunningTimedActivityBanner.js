import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getConfig } from '../models/ActivityType';
import { getDuration } from '../utils/dateUtils';

export default function RunningTimedActivityBanner({ entry, onPress }) {
  const [, setTick] = useState(0);
  const cfg = getConfig(entry.type);

  // Update elapsed time every minute
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const duration = getDuration(entry.timestamp, null);
  const startTime = new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: cfg.color + '14' }]}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{cfg.emoji}</Text>
      <View style={styles.info}>
        <Text style={[styles.title, { color: cfg.color }]}>
          {cfg.displayName} in progress{duration ? `  ·  ${duration}` : ''}
        </Text>
        <Text style={styles.sub}>Started {startTime}</Text>
      </View>
      <View style={[styles.btn, { backgroundColor: cfg.color }]}>
        <Text style={styles.btnText}>End {cfg.displayName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
  },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, color: '#8E8E93', marginTop: 1 },
  btn: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
