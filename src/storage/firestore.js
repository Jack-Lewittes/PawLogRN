/**
 * All Firestore read/write operations.
 *
 * Firestore structure:
 *
 *   households/{householdId}
 *     joinCode:  "KPX72M"
 *     createdAt: ISO string
 *
 *   households/{householdId}/dogs/{dogId}
 *     name, birthDate, createdAt
 *
 *   households/{householdId}/users/{userId}
 *     name, colorHex, createdAt
 *
 *   households/{householdId}/activities/{activityId}
 *     type, timestamp, endTime, notes,
 *     dogId, userId,
 *     mealType, foodType, feedingAmount
 *
 *   households/{householdId}/weights/{weightId}
 *     weight, unit, date, dogId
 */

import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, where, onSnapshot, setDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateJoinCode() {
  // Unambiguous characters (no 0/O, 1/I/L)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function colRef(householdId, sub) {
  return collection(db, 'households', householdId, sub);
}

function docRef(householdId, sub, id) {
  return doc(db, 'households', householdId, sub, id);
}

function snap2arr(snapshot) {
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Households ────────────────────────────────────────────────────────────────

export async function createHousehold() {
  const joinCode = generateJoinCode();
  const ref = doc(collection(db, 'households')); // auto-id
  await setDoc(ref, { joinCode, createdAt: new Date().toISOString() });
  return { id: ref.id, joinCode };
}

export async function findHouseholdByCode(code) {
  const q = query(
    collection(db, 'households'),
    where('joinCode', '==', code.trim().toUpperCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ── Dogs ──────────────────────────────────────────────────────────────────────

export async function createDog(householdId, { name, birthDate }) {
  const ref = await addDoc(colRef(householdId, 'dogs'), {
    name,
    birthDate: birthDate || null,
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id, name, birthDate: birthDate || null };
}

export async function updateDog(householdId, dog) {
  const { id, ...data } = dog;
  await updateDoc(docRef(householdId, 'dogs', id), data);
}

export function subscribeToDogs(householdId, callback) {
  return onSnapshot(colRef(householdId, 'dogs'), snap => {
    callback(snap2arr(snap));
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function createUser(householdId, { name, colorHex }) {
  const ref = await addDoc(colRef(householdId, 'users'), {
    name,
    colorHex,
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id, name, colorHex };
}

export function subscribeToUsers(householdId, callback) {
  return onSnapshot(colRef(householdId, 'users'), snap => {
    callback(snap2arr(snap));
  });
}

// ── Activities ────────────────────────────────────────────────────────────────

export async function createActivity(householdId, {
  type, timestamp, endTime, notes,
  dogId, userId,
  mealType, foodType, feedingAmount,
}) {
  const data = {
    type,
    timestamp: timestamp || new Date().toISOString(),
    endTime: endTime || null,
    notes: notes?.trim() || null,
    dogId,
    userId,
    mealType: mealType || null,
    foodType: foodType || null,
    feedingAmount: feedingAmount || null,
  };
  const ref = await addDoc(colRef(householdId, 'activities'), data);
  return { id: ref.id, ...data };
}

export async function updateActivity(householdId, activity) {
  const { id, ...data } = activity;
  await updateDoc(docRef(householdId, 'activities', id), data);
}

export async function deleteActivity(householdId, activityId) {
  await deleteDoc(docRef(householdId, 'activities', activityId));
}

export function subscribeToActivities(householdId, callback) {
  return onSnapshot(colRef(householdId, 'activities'), snap => {
    callback(snap2arr(snap));
  });
}

// ── Weights ───────────────────────────────────────────────────────────────────

export async function createWeight(householdId, { weight, unit, dogId }) {
  const data = { weight, unit, date: new Date().toISOString(), dogId };
  const ref = await addDoc(colRef(householdId, 'weights'), data);
  return { id: ref.id, ...data };
}

export async function deleteWeight(householdId, weightId) {
  await deleteDoc(docRef(householdId, 'weights', weightId));
}

export function subscribeToWeights(householdId, callback) {
  return onSnapshot(colRef(householdId, 'weights'), snap => {
    callback(snap2arr(snap));
  });
}
