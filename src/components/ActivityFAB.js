import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import { FAB_MENU_TYPES, getConfig } from '../models/ActivityType';

export default function ActivityFAB({ onSelect, onRetro }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  function toggle() {
    const toValue = open ? 0 : 1;
    Animated.spring(anim, { toValue, useNativeDriver: true, friction: 7 }).start();
    setOpen(!open);
  }

  function handleSelect(type) {
    toggle();
    setTimeout(() => onSelect(type), 200);
  }

  function handleRetro() {
    toggle();
    setTimeout(() => onRetro(), 200);
  }

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const menuOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // All menu items: retro + activity types
  const allItems = [
    { key: '__retro__', label: 'Log past activity', emoji: '🕐', color: '#8E8E93' },
    ...FAB_MENU_TYPES.map(type => ({ key: type, ...getConfig(type) })),
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <TouchableWithoutFeedback onPress={toggle}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.wrapper} pointerEvents="box-none">
        {/* Menu items */}
        <Animated.View style={[styles.menu, { opacity: menuOpacity, display: open ? 'flex' : 'none' }]}>
          {allItems.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              activeOpacity={0.8}
              onPress={() => item.key === '__retro__' ? handleRetro() : handleSelect(item.key)}
            >
              <View style={styles.menuLabel}>
                <Text style={[styles.menuLabelText, item.isAccident && { color: '#FF3B30' }]}>
                  {item.displayName || item.label}
                </Text>
              </View>
              <View style={[styles.menuCircle, { backgroundColor: item.color + '30' }]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Main button */}
        <TouchableOpacity onPress={toggle} style={styles.fab} activeOpacity={0.9}>
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate }] }]}>＋</Animated.Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    zIndex: 10,
  },
  wrapper: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    alignItems: 'flex-end',
    zIndex: 20,
  },
  menu: {
    alignItems: 'flex-end',
    marginBottom: 14,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuLabel: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuLabelText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  menuCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: { fontSize: 20 },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabIcon: { fontSize: 30, color: '#fff', lineHeight: 36 },
});
