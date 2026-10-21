import { MapPin, Video } from "lucide-react";

export type AppointmentType = "Video Visit" | "In-person";

type TypeTagProps = {
  type: AppointmentType;
};

const TypeTag = ({ type }: TypeTagProps) => {
  const isVideo = type === "Video Visit";
  const Icon = isVideo ? Video : MapPin;

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] font-medium ${
        isVideo ? "bg-violet/10 text-violet" : "bg-primary/10 text-primary"
      }`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />
      {type}
    </span>
  );
};

export default TypeTag;
