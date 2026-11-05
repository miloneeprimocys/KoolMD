"use client";

import React, { useState } from "react";

import Table from "@/components/Table";
import { type TableColumn } from "@/components/Tableheader";
import Name from "@/components/Name";
import Content from "@/components/Content";
import Tags from "@/components/Tags";
import Pagination from "@/components/Pagination";

/* ---------------------------------------------------------------- */
/*  Static data (replace with API / redux selector)                  */
/* ---------------------------------------------------------------- */
const USERS: { name: string; email: string; department: string; status: "Active" | "Inactive" }[] = [
  { name: "Dr. John Carter", email: "john.carter@koolmd.com", department: "Cardiology", status: "Active" },
  { name: "Dr. Anita Brown", email: "anita.brown@koolmd.com", department: "Internal Medicine", status: "Active" },
  { name: "Dr. Sarah Wilson", email: "sarah.wilson@koolmd.com", department: "Internal Medicine", status: "Active" },
  { name: "Dr. Michael Johnson", email: "michael.johnson@koolmd.com", department: "Cardiology", status: "Active" },
  { name: "Dr. Emily Parker", email: "emily.parker@koolmd.com", department: "Pediatrics", status: "Active" },
  { name: "Dr. Robert Williams", email: "robert.williams@koolmd.com", department: "Orthopedics", status: "Active" },
  { name: "Dr. David Brown", email: "david.brown@koolmd.com", department: "Dermatology", status: "Inactive" },
  { name: "Dr. Richard Kim", email: "richard.kim@koolmd.com", department: "Neurology", status: "Active" },
  { name: "Dr. Susan Davis", email: "susan.davis@koolmd.com", department: "Gynecology", status: "Active" },
  { name: "Dr. Thomas Patel", email: "thomas.patel@koolmd.com", department: "Ophthalmology", status: "Active" },
  { name: "Dr. Nancy Green", email: "nancy.green@koolmd.com", department: "Psychiatry", status: "Active" },
  { name: "Dr. Paul Adams", email: "paul.adams@koolmd.com", department: "Cardiology", status: "Inactive" },
];

const COLUMNS: TableColumn[] = [
  { key: "user", label: "User" },
  { key: "department", label: "Department / Provider" },
  { key: "status", label: "Status" },
];
const PAGE_SIZE = 5;

type Props = {
  roleName: string;
  /** Number of users assigned to the role. */
  count: number;
};

const AssignedUsers = ({ roleName, count }: Props) => {
  const [page, setPage] = useState(1);
  const users = USERS.slice(0, Math.min(count, USERS.length));
  const totalPages = Math.max(Math.ceil(users.length / PAGE_SIZE), 1);
  const safePage = Math.min(page, totalPages);
  const visible = users.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const rows = visible.map((u) => ({
    user: <Name name={u.name} sub={u.email} truncate />,
    department: <Content title={u.department} />,
    status: <Tags text={u.status} tone={u.status === "Active" ? "success" : "danger"} size="xs" />,
  }));

  return (
    <div className="space-y-3">
      <p className="text-sm text-body">Users currently assigned to the {roleName} role.</p>
      <div className="overflow-hidden rounded-[14px] border border-border bg-card">
        <Table columns={COLUMNS} rows={rows} bordered={false} />
      </div>
      <Pagination
        page={safePage}
        totalPages={totalPages}
        totalItems={users.length}
        pageSize={PAGE_SIZE}
        itemLabel="users"
        onChange={setPage}
      />
    </div>
  );
};

export default AssignedUsers;