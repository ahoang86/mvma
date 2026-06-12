import 'react-native-gesture-handler';
import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { calcFare, formatRideLabel, useAppStore } from './src/store/useAppStore';
import { Ride } from './src/types';

const Tab = createBottomTabNavigator();

const colors = {
  bg: '#0f1117',
  card: '#1a1d27',
  border: '#2d3148',
  text: '#e2e8f0',
  muted: '#94a3b8',
  subtle: '#64748b',
  primary: '#6366f1',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

function Section({
  title,
  children,
  right
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

function Pill({
  label,
  active,
  onPress
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  tone = 'primary'
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger' | 'success';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        tone === 'primary' && styles.buttonPrimary,
        tone === 'secondary' && styles.buttonSecondary,
        tone === 'danger' && styles.buttonDanger,
        tone === 'success' && styles.buttonSuccess
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function RideCard({
  ride,
  currentDriverName,
  onClaim,
  onStart,
  onComplete,
  onCancel,
  fareBase,
  farePerMile
}: {
  ride: Ride;
  currentDriverName?: string;
  onClaim?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  fareBase: number;
  farePerMile: number;
}) {
  const fareLabel =
    ride.distMiles == null ? 'Distance unavailable' : `$${calcFare(fareBase, farePerMile, ride.distMiles)}`;

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{formatRideLabel(ride.createdAt)}</Text>
        <Text style={styles.status}>{ride.status}</Text>
      </View>

      <Text style={styles.cardLine}>{ride.pickup}</Text>
      <Text style={styles.cardLine}>{ride.dropoff}</Text>

      <Text style={styles.metaText}>
        {ride.distMiles == null ? 'Distance unavailable' : `${ride.distMiles} mi · ${fareLabel}`}
      </Text>

      {!!currentDriverName && <Text style={styles.metaText}>Driver: {currentDriverName}</Text>}

      <View style={styles.actionsRow}>
        {onClaim && <ActionButton label="Claim" onPress={onClaim} tone="success" />}
        {onStart && <ActionButton label="Start" onPress={onStart} tone="primary" />}
        {onComplete && <ActionButton label="Complete" onPress={onComplete} tone="success" />}
        {onCancel && <ActionButton label="Cancel" onPress={onCancel} tone="danger" />}
      </View>
    </View>
  );
}

function DispatchScreen() {
  const {
    locations,
    savedRoutes,
    rides,
    drivers,
    fare,
    busy,
    error,
    createRide,
    saveRoute,
    deleteRoute,
    cancelRide,
    clearError
  } = useAppStore();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [routeName, setRouteName] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  const history = useMemo(
    () => rides.filter((r) => r.status === 'completed' || r.status === 'cancelled'),
    [rides]
  );

  const activeRides = useMemo(
    () => rides.filter((r) => r.status !== 'completed' && r.status !== 'cancelled'),
    [rides]
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Create ride">
        <TextInput
          placeholder="Pickup address"
          placeholderTextColor={colors.subtle}
          value={pickup}
          onChangeText={setPickup}
          style={styles.input}
        />
        <View style={styles.chipsWrap}>
          {locations.map((loc) => (
            <Pill
              key={`pickup-${loc.id}`}
              label={loc.name}
              onPress={() => setPickup(`${loc.name} — ${loc.address}`)}
            />
          ))}
        </View>

        <TextInput
          placeholder="Dropoff address"
          placeholderTextColor={colors.subtle}
          value={dropoff}
          onChangeText={setDropoff}
          style={styles.input}
        />
        <View style={styles.chipsWrap}>
          {locations.map((loc) => (
            <Pill
              key={`dropoff-${loc.id}`}
              label={loc.name}
              onPress={() => setDropoff(`${loc.name} — ${loc.address}`)}
            />
          ))}
        </View>

        <ActionButton
          label={busy ? 'Calculating…' : 'Create ride'}
          onPress={async () => {
            await createRide(pickup, dropoff);
            setPickup('');
            setDropoff('');
          }}
        />

        <TextInput
          placeholder="Save current route as…"
          placeholderTextColor={colors.subtle}
          value={routeName}
          onChangeText={setRouteName}
          style={styles.input}
        />
        <ActionButton
          label="Save route"
          tone="secondary"
          onPress={() => {
            saveRoute(routeName, pickup, dropoff);
            setRouteName('');
          }}
        />

        {error ? (
          <Pressable onPress={clearError} style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </Pressable>
        ) : null}
      </Section>

      <Section
        title={`Saved routes (${savedRoutes.length})`}
        right={<ActionButton label="History" tone="secondary" onPress={() => setHistoryOpen(true)} />}
      >
        {savedRoutes.length === 0 ? (
          <Text style={styles.empty}>No saved routes yet.</Text>
        ) : (
          savedRoutes.map((route) => (
            <View key={route.id} style={styles.card}>
              <Text style={styles.cardTitle}>{route.name}</Text>
              <Text style={styles.cardLine}>{route.pickup}</Text>
              <Text style={styles.cardLine}>{route.dropoff}</Text>
              <View style={styles.actionsRow}>
                <ActionButton
                  label="Load"
                  tone="secondary"
                  onPress={() => {
                    setPickup(route.pickup);
                    setDropoff(route.dropoff);
                  }}
                />
                <ActionButton
                  label="Delete"
                  tone="danger"
                  onPress={() => deleteRoute(route.id)}
                />
              </View>
            </View>
          ))
        )}
      </Section>

      <Section title={`Active rides (${activeRides.length})`}>
        {activeRides.length === 0 ? (
          <Text style={styles.empty}>No active rides.</Text>
        ) : (
          activeRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              currentDriverName={drivers.find((d) => d.id === ride.driverId)?.name}
              onCancel={() => cancelRide(ride.id)}
              fareBase={fare.baseFare}
              farePerMile={fare.perMile}
            />
          ))
        )}
      </Section>

      <Modal visible={historyOpen} animationType="slide">
        <SafeAreaView style={styles.modalScreen}>
          <View style={styles.rowBetween}>
            <Text style={styles.modalTitle}>Ride history</Text>
            <ActionButton label="Close" tone="secondary" onPress={() => setHistoryOpen(false)} />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            {history.length === 0 ? (
              <Text style={styles.empty}>No completed or cancelled rides yet.</Text>
            ) : (
              history.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  currentDriverName={drivers.find((d) => d.id === ride.driverId)?.name}
                  fareBase={fare.baseFare}
                  farePerMile={fare.perMile}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

function DriverScreen() {
  const { drivers, rides, fare, claimRide, startRide, completeRide } = useAppStore();
  const [activeDriverId, setActiveDriverId] = useState(drivers[0]?.id ?? '');

  const available = rides.filter((r) => r.status === 'pending');
  const mine = rides.filter(
    (r) =>
      r.driverId === activeDriverId &&
      r.status !== 'completed' &&
      r.status !== 'cancelled'
  );
  const completed = rides.filter(
    (r) => r.driverId === activeDriverId && r.status === 'completed'
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Driving as">
        <View style={styles.chipsWrap}>
          {drivers.map((driver) => (
            <Pill
              key={driver.id}
              label={driver.name}
              active={driver.id === activeDriverId}
              onPress={() => setActiveDriverId(driver.id)}
            />
          ))}
        </View>
      </Section>

      <Section title={`Available rides (${available.length})`}>
        {available.length === 0 ? (
          <Text style={styles.empty}>No rides waiting for claim.</Text>
        ) : (
          available.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onClaim={() => claimRide(ride.id, activeDriverId)}
              fareBase={fare.baseFare}
              farePerMile={fare.perMile}
            />
          ))
        )}
      </Section>

      <Section title={`My rides (${mine.length})`}>
        {mine.length === 0 ? (
          <Text style={styles.empty}>No active rides assigned to this driver.</Text>
        ) : (
          mine.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onStart={ride.status === 'accepted' ? () => startRide(ride.id) : undefined}
              onComplete={ride.status === 'in-progress' ? () => completeRide(ride.id) : undefined}
              fareBase={fare.baseFare}
              farePerMile={fare.perMile}
            />
          ))
        )}
      </Section>

      <Section title={`Completed rides (${completed.length})`}>
        {completed.length === 0 ? (
          <Text style={styles.empty}>No completed rides yet.</Text>
        ) : (
          completed.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              fareBase={fare.baseFare}
              farePerMile={fare.perMile}
            />
          ))
        )}
      </Section>
    </ScrollView>
  );
}

function SettingsScreen() {
  const {
    drivers,
    locations,
    fare,
    addDriver,
    removeDriver,
    addLocation,
    removeLocation,
    updateFare
  } = useAppStore();

  const [driverName, setDriverName] = useState('');
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [baseFare, setBaseFare] = useState(String(fare.baseFare));
  const [perMile, setPerMile] = useState(String(fare.perMile));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Fare settings">
        <TextInput
          placeholder="Base fare"
          placeholderTextColor={colors.subtle}
          value={baseFare}
          onChangeText={setBaseFare}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <TextInput
          placeholder="Per-mile fare"
          placeholderTextColor={colors.subtle}
          value={perMile}
          onChangeText={setPerMile}
          keyboardType="decimal-pad"
          style={styles.input}
        />
        <ActionButton
          label="Save fare settings"
          onPress={() => updateFare(parseFloat(baseFare), parseFloat(perMile))}
        />
      </Section>

      <Section title="Drivers">
        <TextInput
          placeholder="New driver name"
          placeholderTextColor={colors.subtle}
          value={driverName}
          onChangeText={setDriverName}
          style={styles.input}
        />
        <ActionButton
          label="Add driver"
          tone="secondary"
          onPress={() => {
            addDriver(driverName);
            setDriverName('');
          }}
        />

        {drivers.map((driver) => (
          <View key={driver.id} style={styles.card}>
            <Text style={styles.cardTitle}>{driver.name}</Text>
            <ActionButton label="Remove" tone="danger" onPress={() => removeDriver(driver.id)} />
          </View>
        ))}
      </Section>

      <Section title="Locations">
        <TextInput
          placeholder="Location name"
          placeholderTextColor={colors.subtle}
          value={locName}
          onChangeText={setLocName}
          style={styles.input}
        />
        <TextInput
          placeholder="Location address"
          placeholderTextColor={colors.subtle}
          value={locAddress}
          onChangeText={setLocAddress}
          style={styles.input}
        />
        <ActionButton
          label="Add location"
          tone="secondary"
          onPress={() => {
            addLocation(locName, locAddress);
            setLocName('');
            setLocAddress('');
          }}
        />

        {locations.map((loc) => (
          <View key={loc.id} style={styles.card}>
            <Text style={styles.cardTitle}>{loc.name}</Text>
            <Text style={styles.cardLine}>{loc.address}</Text>
            <ActionButton label="Remove" tone="danger" onPress={() => removeLocation(loc.id)} />
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            background: colors.bg,
            card: colors.card,
            primary: colors.primary,
            text: colors.text,
            border: colors.border
          }
        }}
      >
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTintColor: colors.text,
            tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.subtle
          }}
        >
          <Tab.Screen name="Dispatch" component={DispatchScreen} />
          <Tab.Screen name="Driver" component={DriverScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  modalScreen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 12 },
  section: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    gap: 10
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18
  },
  modalTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 22,
    padding: 16
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  card: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    gap: 6
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  cardLine: {
    color: colors.muted,
    fontSize: 14
  },
  metaText: {
    color: colors.subtle,
    fontSize: 13
  },
  status: {
    color: colors.primary,
    textTransform: 'capitalize',
    fontWeight: '700'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: '#6366f122'
  },
  pillText: {
    color: colors.muted,
    fontWeight: '600'
  },
  pillTextActive: {
    color: colors.primary
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6
  },
  button: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: '#334155' },
  buttonDanger: { backgroundColor: colors.danger },
  buttonSuccess: { backgroundColor: colors.success },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  empty: {
    color: colors.subtle
  },
  errorBox: {
    backgroundColor: '#450a0a',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12
  },
  errorText: {
    color: '#fecaca',
    fontWeight: '600'
  }
});
