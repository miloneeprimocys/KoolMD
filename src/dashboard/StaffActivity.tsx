"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import EditButton from "@/components/EditButton";
import { cardCls } from "@/providers/Shared";

const STAFF = [
  { count: 6, role: "Practitioners (MD)" },
  { count: 8, role: "Staff Members" },
  { count: 2, role: "Receptionists" },
  { count: 1, role: "Admin" },
];

const StaffActivity = () => {
  const router = useRouter();

  return (
    <section className={`${cardCls} flex h-full flex-col`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-heading sm:text-base">Staff Activity</h3>
        </div>
        <EditButton
          section="staff"
          variant="viewAll"
          onEdit={() => router.push("/provider/practitioner")}
        />
      </div>

      <ul className="divide-y divide-divider">
        {STAFF.map((s) => (
          <li key={s.role} className="flex items-center gap-3 py-3.5">
            <span className="w-6 shrink-0 text-base font-bold text-heading">{s.count}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-heading">{s.role}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-heading">
              <span className="h-2 w-2 rounded-full bg-success" />
              Online
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StaffActivity;