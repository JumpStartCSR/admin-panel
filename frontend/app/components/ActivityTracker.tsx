"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../context/auth-context";

const ActivityTracker = () => {
  const { user } = useAuth();
  const sessionStartRef = useRef<number | null>(null);
  const hasLoggedLogin = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    sessionStartRef.current = Date.now();
    const today = new Date().toISOString().split("T")[0];

    if (!hasLoggedLogin.current) {
      fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pb_user_id: user.id,
          date: today,
          timeused: 0,
          login: true,
        }),
      });
      hasLoggedLogin.current = true;
    }

    const handleUnload = () => {
      console.log(sessionStartRef.current);
      if (!sessionStartRef.current) return;

      const sessionDuration = Math.floor(
        (Date.now() - sessionStartRef.current) / 1000
      ); // in seconds

      console.log(sessionDuration)

      if (sessionDuration <= 0) return;

      navigator.sendBeacon(
        "/api/activity",
        new Blob(
          [
            JSON.stringify({
              pb_user_id: user.id,
              date: today,
              timeused: sessionDuration,
              login: false,
            }),
          ],
          { type: "application/json" }
        )
      );
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user]);

  return null;
};

export default ActivityTracker;
