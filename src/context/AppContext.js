import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDeviceState, saveDeviceState } from '../storage/storage';
import {
  subscribeToDogs,
  subscribeToUsers,
  subscribeToActivities,
  subscribeToWeights,
} from '../storage/firestore';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Device-local (AsyncStorage)
  const [householdId, setHouseholdId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Firestore live data (shared across all phones in the household)
  const [dogs, setDogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [weights, setWeights] = useState([]);

  const [isLoadingDevice, setIsLoadingDevice] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Step 1: Load which household this device belongs to
  useEffect(() => {
    getDeviceState().then(state => {
      if (state.householdId) setHouseholdId(state.householdId);
      if (state.currentUserId) setCurrentUserId(state.currentUserId);
      setIsLoadingDevice(false);
    });
  }, []);

  // Step 2: When householdId is known, wire up real-time Firestore listeners.
  // All four listeners fire immediately with current data, then again on any change.
  // When Phone A writes anything, Phone B's listener fires within ~1 second.
  useEffect(() => {
    if (!householdId) return;

    setIsLoadingData(true);
    let initialised = 0;
    const total = 4;

    function onReady() {
      initialised++;
      if (initialised >= total) setIsLoadingData(false);
    }

    const unsubs = [
      subscribeToDogs(householdId, data => { setDogs(data); onReady(); }),
      subscribeToUsers(householdId, data => { setUsers(data); onReady(); }),
      subscribeToActivities(householdId, data => { setActivities(data); onReady(); }),
      subscribeToWeights(householdId, data => { setWeights(data); onReady(); }),
    ];

    // Tear down listeners if the household ever changes
    return () => unsubs.forEach(u => u());
  }, [householdId]);

  const isOnboarded = !!householdId;
  const isLoading = isLoadingDevice || (isOnboarded && isLoadingData);

  const selectedDog = dogs[0] || null; // single-dog for now
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || null;

  // Called by OnboardingScreen after household is created or joined
  async function signIn(newHouseholdId, newUserId) {
    await saveDeviceState({ householdId: newHouseholdId, currentUserId: newUserId });
    setHouseholdId(newHouseholdId);
    setCurrentUserId(newUserId);
  }

  async function switchUser(userId) {
    setCurrentUserId(userId);
    const state = await getDeviceState();
    await saveDeviceState({ ...state, currentUserId: userId });
  }

  return (
    <AppContext.Provider value={{
      householdId,
      currentUserId,
      dogs,
      users,
      activities,
      weights,
      selectedDog,
      currentUser,
      isLoading,
      isOnboarded,
      signIn,
      switchUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
