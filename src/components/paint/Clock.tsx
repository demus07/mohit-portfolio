"use client";

import { useEffect, useState } from "react";

// The time where he is.
export function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    const tick = () => setTime(fmt.format(new Date()).toLowerCase());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  return <span className="clock">{time ? `It’s ${time} in Mumbai.` : " "}</span>;
}
