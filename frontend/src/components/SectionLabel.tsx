import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function SectionLabel({ children }: Props) {
  return (
    <p className="text-[11px] font-semibold text-[#9a9990] uppercase tracking-[0.07em] mb-4">
      {children}
    </p>
  );
}
