"use client";

import { useEffect } from "react";
import { useAuth } from "../context/auth-context";

const ActivityTracker = () => {
  const { user } = useAuth();

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!user) return;

      const start = sessionStorage.getItem("sessionStart");
      const sessionStart = start ? parseInt(start) : null;
      const today = new Date().toISOString().split("T")[0];

      if (sessionStart) {
        const sessionTime = Math.floor((Date.now() - sessionStart) / 1000);

        navigator.sendBeacon(
          "/api/activity",
          new Blob(
            [
              JSON.stringify({
                pb_user_id: user.id,
                date: today,
                timeused: sessionTime,
                login: false,
              }),
            ],
            { type: "application/json" }
          )
        );
      }
      localStorage.removeItem("user");
      sessionStorage.removeItem("sessionStart");

    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  return null;
};

export default ActivityTracker;
