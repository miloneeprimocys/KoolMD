import { ArrowRight } from "lucide-react";

interface SubmitButtonContentProps {
  isLoading: boolean;
  label: string;
  loadingLabel: string;
}

/** Spinner / label + arrow content used inside the auth primary buttons. */
const SubmitButtonContent = ({ isLoading, label, loadingLabel }: SubmitButtonContentProps) =>
  isLoading ? (
    <span className="flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      {loadingLabel}
    </span>
  ) : (
    <span className="flex items-center gap-2">
      {label}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </span>
  );

export default SubmitButtonContent;
