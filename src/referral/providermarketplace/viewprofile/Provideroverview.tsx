"use client";

import React, { useState } from "react";
import { Award, Briefcase, ChevronDown, Globe, GraduationCap, IndianRupee, Mail, MapPin, Phone } from "lucide-react";

import Tags from "@/components/Tags";
import { cardCls } from "@/providers/Shared";
import type { ProviderProfile } from "./Viewproviderprofile";

const TagList = ({ items, activeFirst = false }: { items: string[]; activeFirst?: boolean }) => (
  <div className="flex flex-wrap gap-2">
    {items.map((t, i) => (
      <Tags key={t} text={t} tone={activeFirst && i === 0 ? "info" : "neutral"} />
    ))}
  </div>
);

const InfoCard = ({
  icon: Icon,
  title,
  lines,
}: {
  icon: React.ElementType;
  title: string;
  lines: string[];
}) => (
  <div className={`${cardCls} flex items-start gap-3 sm:p-5`}>
    <Icon className="h-6 w-6 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-sm font-semibold text-heading">{title}</p>
      {lines.map((l) => (
        <p key={l} className="text-sm text-body">
          {l}
        </p>
      ))}
    </div>
  </div>
);

const ContactLine = ({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 text-sm text-heading">
    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
    <span className="min-w-0 break-words">{children}</span>
  </div>
);

const ProviderOverview = ({ profile }: { profile: ProviderProfile }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* About + specialties */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-3 text-base font-semibold text-heading">About</h3>
          <p className={`text-sm leading-relaxed text-body ${expanded ? "" : "line-clamp-4"}`}>{profile.about}</p>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {expanded ? "Show less" : "Read more"}
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </section>

        <section className={`${cardCls} sm:p-6`}>
          <h3 className="mb-3 text-base font-semibold text-heading">Specialties</h3>
          <TagList items={profile.specialties} activeFirst />
        </section>
      </div>

      {/* Education / certification / experience */}
      <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
        <InfoCard icon={GraduationCap} title="Education" lines={[profile.education.degree, profile.education.school]} />
        <InfoCard icon={Award} title="Board Certification" lines={[profile.certification.board, profile.certification.field]} />
        <InfoCard icon={Briefcase} title="Experience" lines={[profile.experience]} />
      </div>

      {/* Practice information */}
      <section className={`${cardCls} sm:p-6`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-heading">Practice Information</h3>
            <ContactLine icon={MapPin}>
              <span className="block font-medium">{profile.practice.name}</span>
              {profile.practice.address}
            </ContactLine>
            <ContactLine icon={Phone}>{profile.practice.phone}</ContactLine>
            <ContactLine icon={Mail}>{profile.practice.email}</ContactLine>
            <ContactLine icon={Globe}>{profile.practice.website}</ContactLine>
          </div>

          <div className="space-y-5 md:border-l md:border-divider md:pl-6">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-heading">Consultation Fee</h4>
              <div className="space-y-3">
                {[
                  { amount: profile.fee, label: "Initial Consultation" },
                  { amount: profile.followUpFee, label: "Follow-up Consultation" },
                ].map((f) => (
                  <div key={f.label} className="flex items-start gap-2">
                    {profile.currency === "₹" ? (
                      <IndianRupee className="mt-0.5 h-4 w-4 shrink-0 text-heading" />
                    ) : (
                      <span className="text-sm font-semibold text-heading">$</span>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-heading">{f.amount}</p>
                      <p className="text-xs text-body">{f.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-heading">Accepted Insurance</h4>
              <TagList items={profile.insurance} />
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-heading">Languages</h4>
              <TagList items={profile.languages} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProviderOverview;