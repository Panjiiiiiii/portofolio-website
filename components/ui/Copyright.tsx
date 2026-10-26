"use client";

import { useEffect, useState } from "react";
import { footerCopy } from "@/data/contact";

/** Starts at the fallback year so server and client markup match, then reads the real year. */
export function Copyright() {
  const [year, setYear] = useState(footerCopy.fallbackYear);

  useEffect(() => {
    // Runs once after hydration. Reading the date here keeps the year from freezing at build time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear());
  }, []);

  return (
    <p className="font-mono text-[13px] text-muted">
      &copy; {year} {footerCopy.ownerName}
    </p>
  );
}
