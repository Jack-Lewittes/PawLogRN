/**
 * Device-local state only.
 * Stores which household this phone belongs to and which user is active.
 * All actual app data lives in Firestore.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pawlog:device';

export async function getDeviceState() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveDeviceState(state) {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
