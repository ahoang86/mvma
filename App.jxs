import { useState, useRef, useEffect } from "react";

const DRIVERS_INIT = [
  { id: 1, name: "Marcus T." },
  { id: 2, name: "Priya S." },
  { id: 3, name: "James R." },
];
const DEFAULT_LOCATIONS = [
  { id: 1, name: "Dulles Airport", address: "1 Saarinen Cir, Dulles, VA 20166" },
  { id: 2, name: "BWI Airport", address: "7050 Friendship Rd, Baltimore, MD 21240" },
];
const RIDE_STATUS_COLOR = { pending: "#f59e0b", accepted: "#8b5cf6", "in-progress": "#06b6d4", completed: "#22c55e", cancelled: "#ef4444" };
let rideCounter = 1, notifCounter = 1, locCounter = DEFAULT_LOCATIONS.length + 1, comboCounter = 1;
function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
const MAX_HIST = 30;
const ORS_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjYxNTNhZWI0MjI2ZjQ5NTc4YWZlMzhmN2VkNzI2MGUyIiwiaCI6Im11cm11cjY0In0=";

const CSS = `
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#2d3148;border-radius:4px}
  input,select{font-family:'Inter',sans-serif;background:#1a1d27!important;color:#e2e8f0!important;border:1px solid #2d3148;border-radius:8px;outline:none;box-sizing:border-box;width:100%;-webkit-appearance:none;appearance:none}
  select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2364748b' d='M5 7L0 2h10z'/%3E%3C/svg%3E")!important;background-repeat:no-repeat!important;background-position:right 10px center!important;padding-right:28px!important}
  select option{background:#1a1d27;color:#e2e8f0}
  input::placeholder{color:#475569}
  input:focus,select:focus{border-color:#6366f1!important;box-shadow:0 0 0 2px #6366f122}
`;

export default function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn);
  }, []);

  const [view, setView] = useState("dispatcher");
  const [dispatchTab, setDispatchTab] = useState("rides");
  const [activeDriverId, setActiveDriverId] = useState(1);

  // Dispatcher state
  const [drivers, setDrivers] = useState(DRIVERS_INIT);
  const [bin, setBin] = useState([]);
  const [showBin, setShowBin] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newName, setNewName] = useState("");
  const driverCounter = useRef(DRIVERS_INIT.length + 1);
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [showEditLocations, setShowEditLocations] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [newLocAddress, setNewLocAddress] = useState("");
  const [editingLocId, setEditingLocId] = useState(null);
  const [editLocName, setEditLocName] = useState("");
  const [editLocAddress, setEditLocAddress] = useState("");
  const [savedCombos, setSavedCombos] = useState([]);
  const [showSavedCombos, setShowSavedCombos] = useState(false);
  const [routeSearch, setRouteSearch] = useState("");
  const [newComboName, setNewComboName] = useState("");
  const [savingCombo, setSavingCombo] = useState(false);
  const [editingComboId, setEditingComboId] = useState(null);
  const [editComboName, setEditComboName] = useState("");
  const [editComboPickup, setEditComboPickup] = useState("");
  const [editComboDropoff, setEditComboDropoff] = useState("");
  const [rides, setRides] = useState([]);
  const [rideHistory, setRideHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [baseFare, setBaseFare] = useState(10);
  const [perMile, setPerMile] = useState(2.50);
  const [editingFare, setEditingFare] = useState(false);
  const [tempBase, setTempBase] = useState("10");
  const [tempPerMile, setTempPerMile] = useState("2.50");
  const [pickupId, setPickupId] = useState(DEFAULT_LOCATIONS[0].id);
  const [dropoffId, setDropoffId] = useState(DEFAULT_LOCATIONS[1].id);
  const [pickupMode, setPickupMode] = useState("select");
  const [dropoffMode, setDropoffMode] = useState("select");
  const [pickupCustom, setPickupCustom] = useState("");
  const [dropoffCustom, setDropoffCustom] = useState("");
  const [clearedTotals, setClearedTotals] = useState({});

  // Driver state
  const [driverRideHistory, setDriverRideHistory] = useState([]);
  const [driverHiddenRides, setDriverHiddenRides] = useState(new Set());
  const [driverBin, setDriverBin] = useState([]);
  const [showDriverBin, setShowDriverBin] = useState(false);
  const [editingDriverNameId, setEditingDriverNameId] = useState(null);
  const [editDriverName, setEditDriverName] = useState("");

  // Undo/redo
  const [dispUndoStack, setDispUndoStack] = useState([]);
  const [dispRedoStack, setDispRedoStack] = useState([]);
  const [drivUndoStack, setDrivUndoStack] = useState([]);
  const [drivRedoStack, setDrivRedoStack] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const notifColors = { info: "#3b82f6", success: "#22c55e", warning: "#f59e0b" };

  function pushNotif(msg, type = "info") {
    const id = notifCounter++;
    setNotifications(prev => [{ id, msg, type }, ...prev].slice(0, 3));
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500);
  }
  function calcFare(dist) {
    if (!dist || dist === "N/A") return "N/A";
    return (baseFare + perMile * parseFloat(dist)).toFixed(2);
  }
  function distDisplay(ride) {
    const dist = ride?.dist;
    if (!dist || dist === "N/A") return <span style={{ color: "#64748b" }}>Distance unavailable</span>;
    const fare = calcFare(dist);
    return <>{dist} mi{fare !== "N/A" ? <> · <span style={{ color: "#22c55e", fontWeight: 600 }}>${fare}</span></> : null}</>;
  }
  function driverTotal(driverId) {
    const cutoff = clearedTotals[driverId] || 0;
    const completed = driverRideHistory.filter(r => r.driverId === driverId && r.dist && r.dist !== "N/A" && (r.completedAt || 0) > cutoff);
    if (!completed.length) return null;
    return completed.reduce((sum, r) => sum + baseFare + perMile * parseFloat(r.dist), 0).toFixed(2);
  }

  // Snapshot / undo
  function dispSnap() { return { drivers: [...drivers], bin: [...bin], locations: [...locations], savedCombos: [...savedCombos], rides: [...rides], rideHistory: [...rideHistory], baseFare, perMile, clearedTotals: { ...clearedTotals } }; }
  function drivSnap() { return { rides: [...rides], driverRideHistory: [...driverRideHistory], driverHiddenRides: new Set(driverHiddenRides), driverBin: [...driverBin], drivers: [...drivers] }; }
  function pushDisp() { const snap = dispSnap(); setDispUndoStack(prev => [snap, ...prev].slice(0, MAX_HIST)); setDispRedoStack([]); }
  function pushDriv() { const snap = drivSnap(); setDrivUndoStack(prev => [snap, ...prev].slice(0, MAX_HIST)); setDrivRedoStack([]); }
  function restoreDisp(s) { setDrivers(s.drivers); setBin(s.bin); setLocations(s.locations); setSavedCombos(s.savedCombos); setRides(s.rides); setRideHistory(s.rideHistory); setBaseFare(s.baseFare); setPerMile(s.perMile); setClearedTotals(s.clearedTotals || {}); }
  function restoreDriv(s) { setRides(s.rides); setDriverRideHistory(s.driverRideHistory); setDriverHiddenRides(s.driverHiddenRides); setDriverBin(s.driverBin); setDrivers(s.drivers); }
  function undoDispatcher() { if (!dispUndoStack.length) return; const [snap, ...rest] = dispUndoStack; const cur = dispSnap(); setDispRedoStack(prev => [cur, ...prev].slice(0, MAX_HIST)); setDispUndoStack(rest); restoreDisp(snap); pushNotif("Undone", "info"); }
  function redoDispatcher() { if (!dispRedoStack.length) return; const [snap, ...rest] = dispRedoStack; const cur = dispSnap(); setDispUndoStack(prev => [cur, ...prev].slice(0, MAX_HIST)); setDispRedoStack(rest); restoreDisp(snap); pushNotif("Redone", "info"); }
  function undoDriver() { if (!drivUndoStack.length) return; const [snap, ...rest] = drivUndoStack; const cur = drivSnap(); setDrivRedoStack(prev => [cur, ...prev].slice(0, MAX_HIST)); setDrivUndoStack(rest); restoreDriv(snap); pushNotif("Undone", "info"); }
  function redoDriver() { if (!drivRedoStack.length) return; const [snap, ...rest] = drivRedoStack; const cur = drivSnap(); setDrivUndoStack(prev => [cur, ...prev].slice(0, MAX_HIST)); setDrivRedoStack(rest); restoreDriv(snap); pushNotif("Redone", "info"); }

  // Dispatcher actions
  function saveDriverName(id) { if (!editDriverName.trim()) return; pushDisp(); setDrivers(prev => prev.map(d => d.id === id ? { ...d, name: editDriverName.trim() } : d)); pushNotif("Name updated", "success"); setEditingDriverNameId(null); }
  function addDriver() { if (!newName.trim()) return; pushDisp(); const d = { id: driverCounter.current++, name: newName.trim() }; setDrivers(prev => [...prev, d]); pushNotif(`${d.name} joined`, "success"); setNewName(""); setShowAddDriver(false); }
  function removeDriver(id) { pushDisp(); const d = drivers.find(x => x.id === id); setDrivers(prev => prev.filter(x => x.id !== id)); setBin(prev => [{ ...d, type: "driver", removedAt: now() }, ...prev]); setRides(prev => prev.map(r => r.driverId === id ? { ...r, driverId: null, status: "pending" } : r)); pushNotif(`${d.name} moved to bin`, "warning"); }
  function restoreDriver(id) { pushDisp(); const d = bin.find(x => x.id === id && x.type === "driver"); setBin(prev => prev.filter(x => !(x.id === id && x.type === "driver"))); setDrivers(prev => [...prev, { id: d.id, name: d.name }]); pushNotif(`${d.name} restored`, "success"); }
  function deletePermanently(id) { pushDisp(); setBin(prev => prev.filter(x => !(x.id === id && x.type === "driver"))); }
  function clearDriverTotal(driverId) { pushDisp(); setClearedTotals(prev => ({ ...prev, [driverId]: Date.now() })); pushNotif("Total cleared", "success"); }
  function clearAllTotals() { pushDisp(); const ts = Date.now(); setClearedTotals(prev => { const n = { ...prev }; drivers.forEach(d => { n[d.id] = ts; }); return n; }); pushNotif("All totals cleared", "success"); }
  function addLocation() { const n = newLocName.trim(), a = newLocAddress.trim(); if (!n || !a) return; pushDisp(); setLocations(prev => [...prev, { id: locCounter++, name: n, address: a }]); setNewLocName(""); setNewLocAddress(""); }
  function removeLocation(id) { pushDisp(); const loc = locations.find(l => l.id === id); setLocations(prev => prev.filter(l => l.id !== id)); setBin(prev => [{ ...loc, type: "address", removedAt: now() }, ...prev]); if (pickupId === id) setPickupId(locations.find(l => l.id !== id)?.id); if (dropoffId === id) setDropoffId(locations.find(l => l.id !== id)?.id); }
  function restoreAddress(id) { pushDisp(); const a = bin.find(x => x.id === id && x.type === "address"); setBin(prev => prev.filter(x => !(x.id === id && x.type === "address"))); setLocations(prev => [...prev, { id: a.id, name: a.name, address: a.address }]); pushNotif(`"${a.name}" restored`, "success"); }
  function permanentDeleteAddress(id) { pushDisp(); setBin(prev => prev.filter(x => !(x.id === id && x.type === "address"))); }
  function saveEditLoc(id) { const n = editLocName.trim(), a = editLocAddress.trim(); if (!n || !a) return; pushDisp(); setLocations(prev => prev.map(l => l.id === id ? { ...l, name: n, address: a } : l)); setEditingLocId(null); }
  function saveCombo() { const pu = getPickupLabel(), dr = getDropoffLabel(); if (!pu.trim() || !dr.trim() || !newComboName.trim()) return; pushDisp(); const combo = { id: comboCounter++, name: newComboName.trim(), pickup: pu, dropoff: dr, pickupId, dropoffId, pickupMode, dropoffMode, pickupCustom, dropoffCustom }; setSavedCombos(prev => [...prev, combo]); setNewComboName(""); setSavingCombo(false); pushNotif(`Route "${combo.name}" saved`, "success"); }
  function loadCombo(c) { setPickupMode(c.pickupMode); setDropoffMode(c.dropoffMode); if (c.pickupMode === "select") setPickupId(c.pickupId); else setPickupCustom(c.pickupCustom); if (c.dropoffMode === "select") setDropoffId(c.dropoffId); else setDropoffCustom(c.dropoffCustom); setShowSavedCombos(false); pushNotif(`Route "${c.name}" loaded`, "info"); }
  function deleteCombo(id) { pushDisp(); const c = savedCombos.find(x => x.id === id); setSavedCombos(prev => prev.filter(x => x.id !== id)); setBin(prev => [{ ...c, type: "route", removedAt: now() }, ...prev]); }
  function restoreCombo(id) { pushDisp(); const c = bin.find(x => x.id === id && x.type === "route"); setBin(prev => prev.filter(x => !(x.id === id && x.type === "route"))); setSavedCombos(prev => [...prev, c]); pushNotif(`Route "${c.name}" restored`, "success"); }
  function permanentDeleteCombo(id) { pushDisp(); setBin(prev => prev.filter(x => !(x.id === id && x.type === "route"))); }
  function saveEditCombo(id) { if (!editComboName.trim() || !editComboPickup.trim() || !editComboDropoff.trim()) return; pushDisp(); setSavedCombos(prev => prev.map(c => c.id === id ? { ...c, name: editComboName.trim(), pickup: editComboPickup.trim(), dropoff: editComboDropoff.trim(), pickupMode: "type", dropoffMode: "type", pickupCustom: editComboPickup.trim(), dropoffCustom: editComboDropoff.trim() } : c)); pushNotif("Route updated", "success"); setEditingComboId(null); }
  function removeHistoryRide(id) { pushDisp(); const r = rideHistory.find(x => x.id === id); setRideHistory(prev => prev.filter(x => x.id !== id)); setBin(prev => [{ ...r, type: "history", removedAt: now() }, ...prev]); }
  function clearAllHistory() { pushDisp(); setRideHistory(prev => { prev.forEach(r => setBin(b => [{ ...r, type: "history", removedAt: now() }, ...b])); return []; }); }
  function restoreHistory(id) { pushDisp(); const r = bin.find(x => x.id === id && x.type === "history"); setBin(prev => prev.filter(x => !(x.id === id && x.type === "history"))); setRideHistory(prev => [r, ...prev]); pushNotif("Ride restored", "success"); }
  function permanentDeleteHistory(id) { pushDisp(); setBin(prev => prev.filter(x => !(x.id === id && x.type === "history"))); }
  function deleteActiveRide(ride) { pushDisp(); const cancelled = { ...ride, status: "cancelled", driverName: drivers.find(d => d.id === ride.driverId)?.name ?? "Unassigned" }; setRides(prev => prev.filter(r => r.id !== ride.id)); setRideHistory(prev => [cancelled, ...prev]); }
  function saveFare() { pushDisp(); setBaseFare(parseFloat(tempBase) || 0); setPerMile(parseFloat(tempPerMile) || 0); setEditingFare(false); pushNotif("Fare updated", "success"); }

  // Driver actions
  function driverSaveName(id) { if (!editDriverName.trim()) return; pushDriv(); setDrivers(prev => prev.map(d => d.id === id ? { ...d, name: editDriverName.trim() } : d)); pushNotif("Name updated", "success"); setEditingDriverNameId(null); }
  function claimRide(rideId, driverId) { pushDriv(); const driver = drivers.find(d => d.id === driverId), ride = rides.find(r => r.id === rideId); setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: "accepted", driverId } : r)); pushNotif(`${ride.label} claimed by ${driver.name}`, "success"); }
  function driverAction(ride, action) {
    pushDriv();
    if (action === "start") { setRides(prev => prev.map(r => r.id === ride.id ? { ...r, status: "in-progress" } : r)); pushNotif(`${ride.label} in progress`, "info"); }
    else if (action === "complete") { const done = { ...ride, status: "completed", driverName: drivers.find(d => d.id === ride.driverId)?.name, completedAt: Date.now() }; setRides(prev => prev.filter(r => r.id !== ride.id)); setRideHistory(prev => [done, ...prev]); setDriverRideHistory(prev => [done, ...prev]); pushNotif(`${ride.label} completed!`, "success"); }
  }
  function driverClearRide(id) { pushDriv(); const r = driverRideHistory.find(x => x.id === id); setDriverHiddenRides(prev => new Set([...prev, id])); setDriverBin(prev => [{ ...r, removedAt: now() }, ...prev]); }
  function driverClearAll(driverId) { pushDriv(); const toHide = driverRideHistory.filter(r => r.driverId === driverId && !driverHiddenRides.has(r.id)); setDriverHiddenRides(prev => new Set([...prev, ...toHide.map(r => r.id)])); setDriverBin(prev => [...toHide.map(r => ({ ...r, removedAt: now() })), ...prev]); }
  function driverRestoreRide(id) { pushDriv(); setDriverBin(prev => prev.filter(x => x.id !== id)); setDriverHiddenRides(prev => { const s = new Set(prev); s.delete(id); return s; }); }
  function driverPermanentDelete(id) { pushDriv(); setDriverBin(prev => prev.filter(x => x.id !== id)); }

  // Shared
  function getPickupLabel() { if (pickupMode === "type") return pickupCustom; const l = locations.find(x => x.id === pickupId); return l ? `${l.name} — ${l.address}` : ""; }
  function getDropoffLabel() { if (dropoffMode === "type") return dropoffCustom; const l = locations.find(x => x.id === dropoffId); return l ? `${l.name} — ${l.address}` : ""; }
  function extractAddress(label) { const parts = label.split(" — "); return parts.length > 1 ? parts.slice(1).join(" — ").trim() : label.trim(); }

  async function geocodeORS(address) {
    try {
      const res = await fetch(`https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(address)}&size=1`);
      const data = await res.json();
      const coords = data.features?.[0]?.geometry?.coordinates;
      return coords ? { lon: coords[0], lat: coords[1] } : null;
    } catch { return null; }
  }
  async function getDrivingDistance(pickup, dropoff) {
    const pu = extractAddress(pickup), dr = extractAddress(dropoff);
    try {
      const [g1, g2] = await Promise.all([geocodeORS(pu), geocodeORS(dr)]);
      if (g1 && g2) {
        const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", { method: "POST", headers: { "Authorization": ORS_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ coordinates: [[g1.lon, g1.lat], [g2.lon, g2.lat]] }) });
        const data = await res.json();
        const meters = data.routes?.[0]?.summary?.distance;
        if (meters) return (meters / 1609.34).toFixed(1);
      }
    } catch {}
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 50, messages: [{ role: "user", content: `Driving distance in miles between "${pu}" and "${dr}". Reply with ONLY a single decimal number.` }] }) });
      const data = await res.json();
      const num = parseFloat(data.content?.[0]?.text?.trim());
      return isNaN(num) ? null : num.toFixed(1);
    } catch { return null; }
  }
  async function createRide() {
    const pu = getPickupLabel(), dr = getDropoffLabel();
    if (!pu.trim() || !dr.trim() || pu.trim() === dr.trim()) return;
    pushDisp();
    const ts = new Date();
    const label = ts.toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    pushNotif("Calculating distance...", "info");
    const dist = await getDrivingDistance(pu, dr) ?? "N/A";
    const ride = { id: rideCounter++, pickup: pu, dropoff: dr, status: "pending", driverId: null, created: now(), label, dist };
    setRides(prev => [ride, ...prev]);
    pushNotif(`${label} created · ${dist !== "N/A" ? dist + " mi" : "distance unavailable"}`, "info");
  }

  const activeDriver = drivers.find(d => d.id === activeDriverId);
  const myRides = rides.filter(r => r.driverId === activeDriverId);
  const pad = isMobile ? "12px 14px" : "10px 12px";
  const inp = (extra = {}) => ({ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8, color: "#e2e8f0", padding: pad, fontSize: 16, outline: "none", boxSizing: "border-box", width: "100%", ...extra });
  const cardS = (extra = {}) => ({ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 12, padding: isMobile ? "16px 18px" : "14px 16px", marginBottom: isMobile ? 12 : 10, ...extra });
  const btnP = { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, padding: isMobile ? "15px 0" : "11px 0", cursor: "pointer", fontSize: isMobile ? 17 : 16, width: "100%" };
  const btnS = (col = "#6366f1", bg = "#6366f122") => ({ background: bg, border: `1px solid ${col}44`, borderRadius: 6, color: col, cursor: "pointer", fontSize: isMobile ? 14 : 13, padding: isMobile ? "8px 14px" : "6px 12px", fontWeight: 700 });
  const undoBtn = (on) => ({ background: on ? "#2d3148" : "#1a1d27", border: `1px solid ${on ? "#475569" : "#2d3148"}`, borderRadius: 6, color: on ? "#94a3b8" : "#374151", cursor: on ? "pointer" : "not-allowed", fontSize: 14, padding: "5px 12px", fontWeight: 700 });

  function binItem(item, idx) {
    const colorMap = { route: "#6366f1", address: "#f59e0b", history: "#22c55e", driver: "#94a3b8" };
    const col = colorMap[item.type] || "#94a3b8";
    const label = { route: "ROUTE", address: "ADDRESS", history: "HISTORY", driver: "DRIVER" }[item.type] || "ITEM";
    return (
      <div key={idx} style={{ background: "#0f1117", border: "1px solid #2d3148", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: col, fontWeight: 700, marginBottom: 3 }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#94a3b8" }}>{item.name || item.label}</div>
        <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>
          {item.type === "route" && <><div>📍 {item.pickup}</div><div>🏁 {item.dropoff}</div>{item.dist && item.dist !== "N/A" && <div style={{ marginTop: 2 }}>📏 {distDisplay(item)}</div>}</>}
          {item.type === "address" && <div>{item.address}</div>}
          {item.type === "history" && <><div>📍 {item.pickup}</div><div>🏁 {item.dropoff}</div>{item.dist && item.dist !== "N/A" && <div style={{ marginTop: 2 }}>📏 {distDisplay(item)}</div>}<div>👤 {item.driverName}</div></>}
          <div style={{ color: "#374151", marginTop: 2 }}>Removed {item.removedAt}</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { if (item.type === "driver") restoreDriver(item.id); else if (item.type === "address") restoreAddress(item.id); else if (item.type === "route") restoreCombo(item.id); else restoreHistory(item.id); }} style={{ ...btnS("#22c55e", "#14532d"), flex: 1, padding: "6px 0" }}>↩ Restore</button>
          <button onClick={() => { if (item.type === "driver") deletePermanently(item.id); else if (item.type === "address") permanentDeleteAddress(item.id); else if (item.type === "route") permanentDeleteCombo(item.id); else permanentDeleteHistory(item.id); }} style={{ ...btnS("#ef4444", "#450a0a"), flex: 1, padding: "6px 0" }}>✕ Delete</button>
        </div>
      </div>
    );
  }

  function rideRequestPanel() {
    return (
      <div style={cardS()}>
        {!isMobile && <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", marginBottom: 10, letterSpacing: 0.5 }}>NEW RIDE REQUEST</div>}
        {/* Fare */}
        <div style={{ background: "#0f1117", border: "1px solid #2d3148", borderRadius: 8, padding: "9px 12px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editingFare ? 8 : 0 }}>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>💲 Fare: <span style={{ color: "#22c55e" }}>${baseFare.toFixed(2)} + ${perMile.toFixed(2)}/mi</span></span>
            <button onClick={() => { setEditingFare(v => !v); setTempBase(String(baseFare)); setTempPerMile(String(perMile)); }} style={{ fontSize: 13, background: "none", border: "none", color: editingFare ? "#f59e0b" : "#6366f1", cursor: "pointer", fontWeight: 600 }}>{editingFare ? "✕ Cancel" : "✏️ Edit"}</button>
          </div>
          {editingFare && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>BASE ($)</div><input type="number" value={tempBase} onChange={e => setTempBase(e.target.value)} style={{ ...inp({ padding: "8px 10px" }) }} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>PER MILE ($)</div><input type="number" value={tempPerMile} onChange={e => setTempPerMile(e.target.value)} style={{ ...inp({ padding: "8px 10px" }) }} /></div>
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Preview: ${(parseFloat(tempBase)||0).toFixed(2)} + ${(parseFloat(tempPerMile)||0).toFixed(2)} × miles</div>
              <button onClick={saveFare} style={{ ...btnS("#22c55e", "#14532d"), width: "100%", padding: "9px 0", textAlign: "center" }}>✓ Save Formula</button>
            </div>
          )}
        </div>
        {/* Pickup/Dropoff */}
        {[["PICKUP", pickupId, setPickupId, pickupMode, setPickupMode, pickupCustom, setPickupCustom],
          ["DROPOFF", dropoffId, setDropoffId, dropoffMode, setDropoffMode, dropoffCustom, setDropoffCustom]].map(([lbl, locId, setLocId, mode, setMode, custom, setCustom]) => (
          <div key={lbl}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 13, color: "#64748b" }}>{lbl}</label>
              <button onClick={() => setMode(m => m === "select" ? "type" : "select")} style={{ fontSize: 13, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>{mode === "select" ? "✏️ Type" : "📋 Preset"}</button>
            </div>
            {mode === "select"
              ? <select value={locId} onChange={e => setLocId(Number(e.target.value))} style={{ ...inp(), marginBottom: 10 }}>{locations.map(l => <option key={l.id} value={l.id}>{l.name} — {l.address}</option>)}</select>
              : <input value={custom} onChange={e => setCustom(e.target.value)} placeholder={`Enter ${lbl.toLowerCase()}...`} style={{ ...inp({ border: `1px solid ${custom.trim() ? "#6366f1" : "#2d3148"}` }), marginBottom: 10 }} />}
          </div>
        ))}
        {/* Edit Addresses */}
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setShowEditLocations(v => !v)} style={{ ...btnS(showEditLocations ? "#f59e0b" : "#6366f1"), width: "100%", padding: "9px 0", textAlign: "center" }}>{showEditLocations ? "✕ Close Addresses" : "✏️ Edit Addresses"}</button>
          {showEditLocations && (
            <div style={{ background: "#0f1117", border: "1px solid #2d3148", borderRadius: 8, padding: "10px", marginTop: 6 }}>
              {locations.map(loc => (
                <div key={loc.id} style={{ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8, marginBottom: 6 }}>
                  {editingLocId === loc.id ? (
                    <div style={{ padding: "10px 12px" }}>
                      <input value={editLocName} onChange={e => setEditLocName(e.target.value)} placeholder="Name" style={{ ...inp({ marginBottom: 6, border: `1px solid ${editLocName.trim() ? "#6366f1" : "#2d3148"}` }) }} />
                      <input value={editLocAddress} onChange={e => setEditLocAddress(e.target.value)} placeholder="Address" style={{ ...inp({ marginBottom: 8, border: `1px solid ${editLocAddress.trim() ? "#6366f1" : "#2d3148"}` }) }} />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => saveEditLoc(loc.id)} style={{ ...btnS("#22c55e", "#14532d"), flex: 1, padding: "7px 0" }}>✓ Save</button>
                        <button onClick={() => setEditingLocId(null)} style={{ ...btnS("#94a3b8", "#1f2937"), flex: 1, padding: "7px 0" }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: 8 }}>
                      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{loc.name}</div><div style={{ fontSize: 13, color: "#64748b" }}>{loc.address}</div></div>
                      <button onClick={() => { setEditingLocId(loc.id); setEditLocName(loc.name); setEditLocAddress(loc.address); }} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 16 }}>✏️</button>
                      <button onClick={() => removeLocation(loc.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>✕</button>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ borderTop: "1px solid #2d3148", paddingTop: 10 }}>
                <input value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="Name" style={{ ...inp({ marginBottom: 6, border: `1px solid ${newLocName.trim() ? "#6366f1" : "#2d3148"}` }) }} />
                <input value={newLocAddress} onChange={e => setNewLocAddress(e.target.value)} placeholder="Address" style={{ ...inp({ marginBottom: 8, border: `1px solid ${newLocAddress.trim() ? "#6366f1" : "#2d3148"}` }) }} />
                <button onClick={addLocation} style={btnP}>+ Add Address</button>
              </div>
            </div>
          )}
        </div>
        {/* Saved Routes */}
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setShowSavedCombos(v => !v)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", ...inp({ padding: "9px 10px", borderRadius: showSavedCombos ? "8px 8px 0 0" : 8, cursor: "pointer", color: "#94a3b8" }) }}>
            <span style={{ fontSize: isMobile ? 15 : 13, fontWeight: 700 }}>⭐ Saved Routes {savedCombos.length > 0 && `(${savedCombos.length})`}</span>
            <span>{showSavedCombos ? "▲" : "▼"}</span>
          </button>
          {showSavedCombos && (
            <div style={{ background: "#0f1117", border: "1px solid #2d3148", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "10px" }}>
              <input value={routeSearch} onChange={e => setRouteSearch(e.target.value)} placeholder="🔍 Search routes..." style={{ ...inp({ marginBottom: 8, padding: "8px 10px", border: `1px solid ${routeSearch ? "#6366f1" : "#2d3148"}` }) }} />
              {(() => {
                const q = routeSearch.toLowerCase();
                const filtered = savedCombos.filter(c => c.name.toLowerCase().includes(q) || c.pickup.toLowerCase().includes(q) || c.dropoff.toLowerCase().includes(q));
                if (filtered.length === 0) return <div style={{ fontSize: 14, color: "#475569", textAlign: "center", padding: "8px 0" }}>{savedCombos.length === 0 ? "No saved routes yet." : "No routes match."}</div>;
                return filtered.map(c => (
                  <div key={c.id} style={{ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8, marginBottom: 8, padding: "10px 12px" }}>
                    {editingComboId === c.id ? (
                      <div>
                        {[["NAME", editComboName, setEditComboName], ["PICKUP", editComboPickup, setEditComboPickup], ["DROPOFF", editComboDropoff, setEditComboDropoff]].map(([l, val, set]) => (
                          <div key={l}><div style={{ fontSize: 12, color: "#64748b", marginBottom: 3 }}>{l}</div><input value={val} onChange={e => set(e.target.value)} style={{ ...inp({ marginBottom: 7, border: `1px solid ${val.trim() ? "#6366f1" : "#2d3148"}` }) }} /></div>
                        ))}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => saveEditCombo(c.id)} style={{ ...btnS("#22c55e", "#14532d"), flex: 1, padding: "7px 0" }}>✓ Save</button>
                          <button onClick={() => setEditingComboId(null)} style={{ ...btnS("#94a3b8", "#1f2937"), flex: 1, padding: "7px 0" }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                          <span style={{ fontWeight: 700, fontSize: isMobile ? 16 : 14 }}>{c.name}</span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => { setEditingComboId(c.id); setEditComboName(c.name); setEditComboPickup(c.pickup); setEditComboDropoff(c.dropoff); }} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 16 }}>✏️</button>
                            <button onClick={() => deleteCombo(c.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>✕</button>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}><div>📍 {c.pickup}</div><div>🏁 {c.dropoff}</div></div>
                        <button onClick={() => loadCombo(c)} style={{ ...btnS("#818cf8", "#2d3148"), width: "100%", padding: "7px 0", textAlign: "center" }}>↗ Load Route</button>
                      </div>
                    )}
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
        {/* Save route */}
        {savingCombo ? (
          <div style={{ background: "#0f1117", border: "1px solid #6366f144", borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>SAVE ROUTE AS</div>
            <input value={newComboName} onChange={e => setNewComboName(e.target.value)} placeholder="Route name" style={{ ...inp({ marginBottom: 8, border: `1px solid ${newComboName.trim() ? "#6366f1" : "#2d3148"}` }) }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveCombo} style={{ ...btnP, flex: 1 }}>⭐ Save</button>
              <button onClick={() => { setSavingCombo(false); setNewComboName(""); }} style={{ ...btnS("#94a3b8", "#1f2937"), flex: 0.4, padding: "11px 0" }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setSavingCombo(true)} style={{ width: "100%", background: "none", border: "1px dashed #2d3148", borderRadius: 8, color: "#64748b", fontWeight: 600, padding: "10px 0", cursor: "pointer", fontSize: isMobile ? 15 : 14, marginBottom: 10 }}>⭐ Save as route</button>
        )}
        <button onClick={createRide} style={btnP}>+ Create Ride</button>
        <button onClick={() => setShowHistory(true)} style={{ ...btnS("#94a3b8", "#1f2937"), width: "100%", padding: "10px 0", textAlign: "center", marginTop: 8 }}>{"📋 History (" + rideHistory.length + ")"}</button>
      </div>
    );
  }

  function activeRidesPanel() {
    return (
      <div>
        {rides.length === 0 && !isMobile && <div style={{ fontSize: 14, color: "#475569", textAlign: "center", padding: "16px 0" }}>No active rides yet.</div>}
        {rides.map(ride => (
          <div key={ride.id} style={cardS({ borderColor: RIDE_STATUS_COLOR[ride.status] + "44" })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 13 }}>{ride.label}</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 5, background: RIDE_STATUS_COLOR[ride.status] + "22", color: RIDE_STATUS_COLOR[ride.status], textTransform: "capitalize" }}>{ride.status}</span>
                <button onClick={() => deleteActiveRide(ride)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, fontWeight: 700, padding: 0 }}>✕</button>
              </div>
            </div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>📍 {ride.pickup}</div>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>🏁 {ride.dropoff}</div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>📏 {distDisplay(ride)}</div>
            {ride.driverId && <div style={{ fontSize: 14, color: "#6366f1", marginTop: 4 }}>👤 {drivers.find(d => d.id === ride.driverId)?.name}</div>}
          </div>
        ))}
      </div>
    );
  }

  function driversPanel() {
    const anyTotal = drivers.some(d => driverTotal(d.id));
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <button onClick={() => { setShowBin(v => !v); setShowAddDriver(false); }} style={{ ...btnS(bin.length ? "#f59e0b" : "#6b7280", bin.length ? "#78350f" : "#1f2937"), flex: 1, padding: "9px 0", textAlign: "center" }}>
            🗑 Bin{bin.length > 0 ? ` (${bin.length})` : ""}
          </button>
          {anyTotal && <button onClick={clearAllTotals} style={{ ...btnS("#06b6d4", "#0e3a45"), flex: 1, padding: "9px 0", textAlign: "center" }}>↺ Clear All Totals</button>}
          <button onClick={() => { setShowAddDriver(v => !v); setShowBin(false); }} style={{ flex: 1, padding: "9px 0", background: showAddDriver ? "#2d3148" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 6, color: "#fff", fontWeight: 700, fontSize: isMobile ? 14 : 13, cursor: "pointer" }}>
            {showAddDriver ? "✕ Cancel" : "+ Add Driver"}
          </button>
        </div>

        {showBin && (
          <div style={cardS({ borderColor: "#f59e0b33" })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", marginBottom: 10 }}>🗑 RECYCLING BIN</div>
            {bin.length === 0 && <div style={{ fontSize: 14, color: "#475569", textAlign: "center" }}>Bin is empty.</div>}
            {bin.length > 0 && <button onClick={() => setBin([])} style={{ ...btnS("#ef4444", "#450a0a"), width: "100%", padding: "8px 0", textAlign: "center", marginBottom: 10 }}>🗑 Empty Bin</button>}
            {bin.map((item, idx) => binItem(item, idx))}
          </div>
        )}

        {showAddDriver && (
          <div style={cardS({ borderColor: "#6366f144" })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>NEW DRIVER</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" style={{ ...inp({ marginBottom: 10, border: `1px solid ${newName.trim() ? "#6366f1" : "#2d3148"}` }) }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={addDriver} style={{ ...btnP, flex: 1 }}>Add to Fleet</button>
              <button onClick={() => setNewName("")} style={{ ...btnS("#94a3b8", "#1f2937"), padding: "11px 14px" }}>🗑 Clear</button>
            </div>
          </div>
        )}

        {drivers.map(d => {
          const activeRide = rides.find(r => r.driverId === d.id && ["accepted","in-progress"].includes(r.status));
          const total = driverTotal(d.id);
          return (
            <div key={d.id} style={cardS()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: activeRide ? 10 : 0 }}>
                <div style={{ flex: 1 }}>
                  {editingDriverNameId === d.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <input value={editDriverName} onChange={e => setEditDriverName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveDriverName(d.id)} style={{ ...inp({ flex: 1, padding: "5px 8px" }) }} />
                      <button onClick={() => saveDriverName(d.id)} style={btnS("#22c55e", "#14532d")}>✓</button>
                      <button onClick={() => setEditingDriverNameId(null)} style={btnS("#94a3b8", "#1f2937")}>✕</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</div>
                      <button onClick={() => { setEditingDriverNameId(d.id); setEditDriverName(d.name); }} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 14 }}>✏️</button>
                    </div>
                  )}
                  {total && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ fontSize: 14, color: "#22c55e" }}>💰 Total: ${total}</div>
                      <button onClick={() => clearDriverTotal(d.id)} style={{ background: "none", border: "none", color: "#06b6d4", cursor: "pointer", fontSize: 12, fontWeight: 700, padding: 0 }}>↺ Clear</button>
                    </div>
                  )}
                </div>
                <button onClick={() => removeDriver(d.id)} style={{ ...btnS("#ef4444", "#450a0a"), marginLeft: 10 }}>✕</button>
              </div>
              {activeRide && (
                <div style={{ paddingTop: 8, borderTop: "1px solid #2d3148", fontSize: 13, color: "#64748b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ color: "#94a3b8", fontWeight: 600 }}>{activeRide.label}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 4, background: RIDE_STATUS_COLOR[activeRide.status] + "22", color: RIDE_STATUS_COLOR[activeRide.status], fontWeight: 700, textTransform: "capitalize" }}>{activeRide.status}</span>
                  </div>
                  <div>📍 {activeRide.pickup}</div>
                  <div>🏁 {activeRide.dropoff}</div>
                  <div style={{ marginTop: 3 }}>📏 {distDisplay(activeRide)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function driverDashboard() {
    const total = driverTotal(activeDriverId);
    return (
      <div style={{ padding: isMobile ? 16 : 20 }}>
        {isMobile && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600, marginBottom: 6 }}>DRIVING AS</div>
            <select value={activeDriverId} onChange={e => setActiveDriverId(Number(e.target.value))} style={inp()}>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </div>
        )}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, justifyContent: "flex-end" }}>
          <button onClick={undoDriver} disabled={!drivUndoStack.length} style={undoBtn(drivUndoStack.length > 0)}>↩ Undo</button>
          <button onClick={redoDriver} disabled={!drivRedoStack.length} style={undoBtn(drivRedoStack.length > 0)}>↪ Redo</button>
        </div>
        <div style={cardS()}>
          {editingDriverNameId === activeDriverId ? (
            <div style={{ display: "flex", gap: 6 }}>
              <input value={editDriverName} onChange={e => setEditDriverName(e.target.value)} onKeyDown={e => e.key === "Enter" && driverSaveName(activeDriverId)} style={{ ...inp({ flex: 1, padding: "8px 10px" }) }} />
              <button onClick={() => driverSaveName(activeDriverId)} style={btnS("#22c55e", "#14532d")}>✓</button>
              <button onClick={() => setEditingDriverNameId(null)} style={btnS("#94a3b8", "#1f2937")}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: isMobile ? 18 : 16, fontWeight: 700 }}>{activeDriver?.name}</div>
              <button onClick={() => { setEditingDriverNameId(activeDriverId); setEditDriverName(activeDriver?.name || ""); }} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 15 }}>✏️</button>
            </div>
          )}
          {total && <div style={{ fontSize: 15, color: "#22c55e", fontWeight: 600, marginTop: 6 }}>💰 Total earned: ${total}</div>}
        </div>

        {(() => {
          const available = rides.filter(r => r.status === "pending" && r.driverId === null);
          return available.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>AVAILABLE RIDES ({available.length})</div>
              {available.map(ride => (
                <div key={ride.id} style={cardS({ borderColor: "#f59e0b44" })}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 13 }}>{ride.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 5, background: "#f59e0b22", color: "#f59e0b" }}>Pending</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 2 }}>📍 {ride.pickup}</div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 2 }}>🏁 {ride.dropoff}</div>
                  <div style={{ fontSize: 13, color: "#475569", marginBottom: 10 }}>📏 {distDisplay(ride)}</div>
                  <button onClick={() => claimRide(ride.id, activeDriverId)} style={btnP}>✋ Claim Ride</button>
                </div>
              ))}
            </div>
          );
        })()}

        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>MY ACTIVE RIDES</div>
        {myRides.length === 0 && (
          <div style={{ ...cardS(), textAlign: "center", padding: "28px 16px", color: "#475569" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🚗</div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>No active rides</div>
            <div style={{ fontSize: 14, marginTop: 4 }}>Waiting for dispatch...</div>
          </div>
        )}
        {myRides.map(ride => (
          <div key={ride.id} style={cardS({ borderColor: RIDE_STATUS_COLOR[ride.status] + "55" })}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: isMobile ? 15 : 13 }}>{ride.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 5, background: RIDE_STATUS_COLOR[ride.status] + "22", color: RIDE_STATUS_COLOR[ride.status], textTransform: "capitalize" }}>{ride.status}</span>
            </div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>📍 <strong>From:</strong> {ride.pickup}</div>
            <div style={{ fontSize: 14, marginBottom: 4 }}>🏁 <strong>To:</strong> {ride.dropoff}</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>📏 {distDisplay(ride)}</div>
            {ride.status === "accepted" && <button onClick={() => driverAction(ride, "start")} style={{ ...btnP, background: "#1e3a5f", border: "1px solid #3b82f6", color: "#60a5fa" }}>🚗 Start Ride</button>}
            {ride.status === "in-progress" && <button onClick={() => driverAction(ride, "complete")} style={{ ...btnP, background: "#14532d", border: "1px solid #22c55e", color: "#22c55e" }}>✓ Complete Ride</button>}
          </div>
        ))}

        {(() => {
          const myDriverBin = driverBin.filter(r => r.driverId === activeDriverId);
          const myCompleted = driverRideHistory.filter(r => r.driverId === activeDriverId && !driverHiddenRides.has(r.id));
          if (myCompleted.length === 0 && myDriverBin.length === 0) return null;
          return (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 1 }}>COMPLETED RIDES</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setShowDriverBin(v => !v)} style={{ ...btnS(myDriverBin.length ? "#f59e0b" : "#6b7280", myDriverBin.length ? "#78350f" : "#1f2937"), padding: "5px 12px" }}>
                    🗑{myDriverBin.length > 0 ? ` (${myDriverBin.length})` : ""}
                  </button>
                  {myCompleted.length > 0 && <button onClick={() => driverClearAll(activeDriverId)} style={btnS("#ef4444", "#450a0a")}>Clear All</button>}
                </div>
              </div>
              {showDriverBin && myDriverBin.length > 0 && (
                <div style={{ background: "#0f1117", border: "1px solid #f59e0b33", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>🗑 RIDE BIN</div>
                  <button onClick={() => setDriverBin(prev => prev.filter(r => r.driverId !== activeDriverId))} style={{ ...btnS("#ef4444", "#450a0a"), width: "100%", padding: "8px 0", textAlign: "center", marginBottom: 8 }}>🗑 Empty Bin</button>
                  {myDriverBin.map(r => (
                    <div key={r.id} style={{ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#94a3b8", marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>{r.pickup} → {r.dropoff}</div>
                      <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>📏 {distDisplay(r)}<br /><span style={{ color: "#374151" }}>Removed {r.removedAt}</span></div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => driverRestoreRide(r.id)} style={{ ...btnS("#22c55e", "#14532d"), flex: 1, padding: "7px 0" }}>↩ Restore</button>
                        <button onClick={() => driverPermanentDelete(r.id)} style={{ ...btnS("#ef4444", "#450a0a"), flex: 1, padding: "7px 0" }}>✕ Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {myCompleted.map(r => (
                <div key={r.id} style={cardS({ borderLeft: "3px solid #22c55e", opacity: 0.9 })}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</div>
                    <button onClick={() => driverClearRide(r.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>✕</button>
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{r.pickup} → {r.dropoff}</div>
                  <div style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>📏 {distDisplay(r)}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    );
  }

  function historyModal() {
    if (!showHistory) return null;
    return (
      <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 500, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center" }} onClick={() => setShowHistory(false)}>
        <div style={{ background: "#1a1d27", borderRadius: isMobile ? "20px 20px 0 0" : 14, padding: 20, width: isMobile ? "100%" : 500, maxHeight: "80vh", overflow: "auto", border: "1px solid #2d3148" }} onClick={e => e.stopPropagation()}>
          {isMobile && <div style={{ width: 40, height: 4, background: "#2d3148", borderRadius: 2, margin: "0 auto 14px" }} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>Ride History</span>
            <div style={{ display: "flex", gap: 8 }}>
              {rideHistory.length > 0 && <button onClick={clearAllHistory} style={btnS("#ef4444", "#450a0a")}>🗑 Clear All</button>}
              <button onClick={() => setShowHistory(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 22 }}>✕</button>
            </div>
          </div>
          {rideHistory.length === 0 && <div style={{ color: "#475569", textAlign: "center", padding: 30, fontSize: 16 }}>No rides yet.</div>}
          {rideHistory.map(r => (
            <div key={r.id} style={cardS({ borderLeft: `3px solid ${r.status === "cancelled" ? "#ef4444" : "#22c55e"}` })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.label}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {r.status === "cancelled" && <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>cancelled</span>}
                  <button onClick={() => removeHistoryRide(r.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8" }}>📍 {r.pickup}</div>
              <div style={{ fontSize: 14, color: "#94a3b8" }}>🏁 {r.dropoff}</div>
              <div style={{ fontSize: 13, color: "#475569", marginTop: 3 }}>📏 {distDisplay(r)}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>👤 {r.driverName} · {r.created}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const undoRedoBar = (
    <div style={{ display: "flex", gap: 6 }}>
      <button onClick={undoDispatcher} disabled={!dispUndoStack.length} style={undoBtn(dispUndoStack.length > 0)}>↩ Undo</button>
      <button onClick={redoDispatcher} disabled={!dispRedoStack.length} style={undoBtn(dispRedoStack.length > 0)}>↪ Redo</button>
    </div>
  );

  const header = (
    <div style={{ background: "#1a1d27", borderBottom: "1px solid #2d3148", padding: isMobile ? "12px 16px" : "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚗</div>
        <span style={{ fontWeight: 700, fontSize: isMobile ? 18 : 20 }}>DispatchHQ</span>
      </div>
      {isMobile
        ? <span style={{ fontSize: 11, background: "#6366f122", color: "#818cf8", padding: "3px 9px", borderRadius: 4, fontWeight: 600 }}>LIVE</span>
        : <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {view === "dispatcher" && undoRedoBar}
            <div style={{ display: "flex", gap: 6 }}>
              {["dispatcher","driver"].map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: "7px 18px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: view===v?"#6366f1":"#2d3148", color: view===v?"#fff":"#94a3b8" }}>
                  {v==="dispatcher"?"🗂 Dispatcher":"🙋 Driver"}
                </button>
              ))}
            </div>
          </div>
      }
    </div>
  );

  const toasts = (
    <div style={{ position: "fixed", top: 60, ...(isMobile ? { left: "50%", transform: "translateX(-50%)", width: "92%", maxWidth: 440 } : { right: 16, width: 300 }), zIndex: 999, pointerEvents: "none" }}>
      {notifications.map(n => (
        <div key={n.id} style={{ background: "#1a1d27", border: `1px solid ${notifColors[n.type]}66`, borderLeft: `3px solid ${notifColors[n.type]}`, borderRadius: 10, padding: "10px 14px", marginBottom: 6, boxShadow: "0 4px 20px #0008", fontSize: isMobile ? 14 : 13 }}>
          <div style={{ color: notifColors[n.type], fontWeight: 700 }}>{n.msg}</div>
        </div>
      ))}
    </div>
  );

  if (isMobile) return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <style>{CSS}</style>
      {toasts}{historyModal()}{header}
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 80 }}>
        {view === "dispatcher" && (
          <div>
            <div style={{ display: "flex", background: "#13151f", borderBottom: "1px solid #2d3148", padding: "0 16px", alignItems: "center" }}>
              {[["rides","🚕 Rides"],["drivers","👥 Drivers"]].map(([t,l]) => (
                <button key={t} onClick={() => setDispatchTab(t)} style={{ flex: 1, padding: "13px 0", background: "none", border: "none", borderBottom: `2px solid ${dispatchTab===t?"#6366f1":"transparent"}`, color: dispatchTab===t?"#818cf8":"#64748b", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>{l}</button>
              ))}
              <div style={{ display: "flex", gap: 4, padding: "0 6px" }}>
                <button onClick={undoDispatcher} disabled={!dispUndoStack.length} style={{ ...undoBtn(dispUndoStack.length > 0), fontSize: 13, padding: "5px 10px" }}>↩</button>
                <button onClick={redoDispatcher} disabled={!dispRedoStack.length} style={{ ...undoBtn(dispRedoStack.length > 0), fontSize: 13, padding: "5px 10px" }}>↪</button>
              </div>
            </div>
            {dispatchTab === "rides" && <div style={{ padding: 16 }}>{rideRequestPanel()}{activeRidesPanel()}</div>}
            {dispatchTab === "drivers" && <div style={{ padding: 16 }}>{driversPanel()}</div>}
          </div>
        )}
        {view === "driver" && driverDashboard()}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#1a1d27", borderTop: "1px solid #2d3148", display: "flex", zIndex: 100 }}>
        {[["dispatcher","🗂","Dispatch"],["driver","🙋","Driver"]].map(([v,icon,label]) => (
          <button key={v} onClick={() => setView(v)} style={{ flex: 1, padding: "13px 0 11px", background: "none", border: "none", cursor: "pointer", color: view===v?"#818cf8":"#64748b", borderTop: `2px solid ${view===v?"#6366f1":"transparent"}` }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: "#0f1117", minHeight: "100vh", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      <style>{CSS}</style>
      {toasts}{historyModal()}{header}
      {view === "dispatcher" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", letterSpacing: 1, marginBottom: 12 }}>ALL DRIVERS ({drivers.length})</div>
            {driversPanel()}
          </div>
          <div style={{ width: 340, background: "#1a1d27", borderLeft: "1px solid #2d3148", overflow: "auto", padding: 16 }}>
            {rideRequestPanel()}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>ACTIVE RIDES ({rides.length})</div>
              {activeRidesPanel()}
            </div>
          </div>
        </div>
      )}
      {view === "driver" && (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ width: 220, background: "#1a1d27", borderRight: "1px solid #2d3148", padding: 16, overflow: "auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 12, letterSpacing: 0.5 }}>SELECT DRIVER</div>
            {drivers.map(d => (
              <div key={d.id} onClick={() => setActiveDriverId(d.id)} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: activeDriverId===d.id?"#2d3148":"transparent", border: `1px solid ${activeDriverId===d.id?"#6366f1":"transparent"}` }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                {driverTotal(d.id) && <div style={{ fontSize: 13, color: "#22c55e", marginTop: 3 }}>💰 ${driverTotal(d.id)}</div>}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>{driverDashboard()}</div>
        </div>
      )}
    </div>
  );
}
