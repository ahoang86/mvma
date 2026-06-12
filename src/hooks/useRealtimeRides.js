import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function useRealtimeRides() {
  const [rides, setRides] = useState([]);

  async function loadRides() {
    const { data } = await supabase
      .from("rides")
      .select("*")
      .order("created_at", { ascending: false });

    setRides(data || []);
  }

  async function createRide(ride) {
    await supabase
      .from("rides")
      .insert([ride]);
  }

  async function claimRide(id, driverId) {
    await supabase
      .from("rides")
      .update({
        status: "accepted",
        driver_id: driverId
      })
      .eq("id", id);
  }

  async function startRide(id) {
    await supabase
      .from("rides")
      .update({
        status: "in-progress"
      })
      .eq("id", id);
  }

  async function completeRide(id) {
    await supabase
      .from("rides")
      .update({
        status: "completed"
      })
      .eq("id", id);
  }

  async function deleteRide(id) {
    await supabase
      .from("rides")
      .delete()
      .eq("id", id);
  }

  useEffect(() => {
    loadRides();

    const channel = supabase
      .channel("rides-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rides"
        },
        () => loadRides()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    rides,
    createRide,
    claimRide,
    startRide,
    completeRide,
    deleteRide
  };
}
