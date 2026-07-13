"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Route enter as a tide swell. Reduced motion → instant.
 * key={pathname} remounts so the CSS enter animation re-fires.
 */
export function PageTide({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-tide">
      {children}
    </div>
  );
}
