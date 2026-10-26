"use client";

import React, { useState } from "react";
import { Plus, Trash2, Calendar } from "lucide-react";
import { cardCls } from "@/providers/Shared";

type ServiceLine = {
  id: string;
  cpt: string;
  description: string;
  modifiers: string;
  diagnosis: string;
  units: number;
};

const ServiceDetails = () => {
  const [lines, setLines] = useState<ServiceLine[]>([
    { id: "1", cpt: "99213", description: "Office or other outpatient visit...", modifiers: "25", diagnosis: "M54.5", units: 1 },
    { id: "2", cpt: "97110", description: "Therapeutic exercises", modifiers: "GP", diagnosis: "M54.5", units: 1 },
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), cpt: "", description: "", modifiers: "", diagnosis: "", units: 1 }]);
  };

  const removeLine = (id: string) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px] xl:gap-5">
      <div className="space-y-4 sm:space-y-5">
        <section className={`${cardCls} p-4 sm:p-6`}>
          <h3 className="mb-4 text-base font-semibold text-heading sm:text-lg">Service Details</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">
                Service Date <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                <input
                  type="date"
                  defaultValue="2024-04-15"
                  className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">
                Place of Service <span className="text-danger">*</span>
              </label>
              <select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>11 - Office</option>
                <option>12 - Home</option>
                <option>21 - Inpatient Hospital</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-heading">Rendering Provider (Optional)</label>
              <select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option>Dr. John Doe</option>
                <option>Dr. Jane Smith</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-heading">Service Lines</h4>
              <button
                onClick={addLine}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Service Line
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-heading/5 text-xs text-body">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">CPT/HCPCS</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium">Modifiers</th>
                    <th className="px-3 py-2 font-medium">Diagnosis</th>
                    <th className="px-3 py-2 font-medium text-center">Units</th>
                    <th className="px-3 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((line, i) => (
                    <tr key={line.id} className="hover:bg-heading/[0.02]">
                      <td className="px-3 py-2 text-body">{i + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          defaultValue={line.cpt}
                          placeholder="Code"
                          className="w-20 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          defaultValue={line.description}
                          placeholder="Description"
                          className="w-full min-w-[150px] rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          defaultValue={line.modifiers}
                          placeholder="Mod"
                          className="w-16 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          defaultValue={line.diagnosis}
                          placeholder="Dx"
                          className="w-20 rounded-md border border-border px-2 py-1 text-sm outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          defaultValue={line.units}
                          className="w-12 rounded-md border border-border px-2 py-1 text-sm text-center outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => removeLine(line.id)}
                          className="text-danger hover:text-danger/80 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-heading">Additional Information (Optional)</label>
            <textarea
              rows={3}
              placeholder="Enter any additional notes or information for this request..."
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            ></textarea>
          </div>
        </section>
      </div>

      <aside className="hidden xl:block">
        <div className={`${cardCls} p-5 sticky top-24`}>
          <h3 className="text-base font-semibold text-heading mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-body">Service Date</span>
              <span className="font-medium text-heading">Apr 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body">Place of Service</span>
              <span className="font-medium text-heading">11 - Office</span>
            </div>
            <div className="flex justify-between">
              <span className="text-body">Total Lines</span>
              <span className="font-medium text-heading">{lines.length}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ServiceDetails;