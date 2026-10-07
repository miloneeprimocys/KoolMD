import React from "react";

type NameProps = {
  name: string;
  sub?: React.ReactNode; // email, role, id … shown below the name
  subIcon?: React.ReactNode;
  image?: string; // optional avatar url, falls back to initials
};

const getInitials = (n: string) =>
  n
    .split(" ")
    .filter((w) => w && !w.endsWith("."))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const Name = ({ name, sub, subIcon, image }: NameProps) => {
  return (
    <div className="flex items-center gap-3">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={name}
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-end text-xs font-semibold text-heading ring-1 ring-border">
          {getInitials(name)}
        </span>
      )}

      <div className="min-w-0 leading-snug">
        <p className="whitespace-nowrap text-sm font-medium text-heading">{name}</p>
        {sub && (
          <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs text-body">
            {subIcon}
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};

export default Name;