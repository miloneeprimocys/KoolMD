import React from "react";

type LinkComponentProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const LinkComponent = ({ children, href, onClick, className = "" }: LinkComponentProps) => {
  const baseClasses = "text-[14px] text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-colors";

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
};

export default LinkComponent;
