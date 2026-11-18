"use client";

import React, { useEffect } from "react";
import EmojiPickerReact, { Categories, EmojiStyle, SuggestionMode, Theme, type EmojiClickData } from "emoji-picker-react";

type Props = {
  /** Called with the chosen emoji. The picker stays open so several can be added. */
  onSelect: (emoji: string) => void;
  onClose: () => void;
  className?: string;
};

const EmojiPicker = ({ onSelect, onClose, className = "" }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label="Emoji picker"
      className={`emoji-picker-wrap mb-4 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-border/60 ${className}`}
    >
      <EmojiPickerReact
        onEmojiClick={(data: EmojiClickData) => onSelect(data.emoji)}
        width="100%"
        height={340}
        theme={Theme.LIGHT} /* colours come from the global CSS above */
        emojiStyle={EmojiStyle.NATIVE}
        suggestedEmojisMode={SuggestionMode.RECENT}
        searchPlaceholder="Search emoji..."
        lazyLoadEmojis
        skinTonesDisabled
        previewConfig={{ showPreview: false }}
        categories={[
          { category: Categories.SUGGESTED, name: "Recent" },
          { category: Categories.SMILEYS_PEOPLE, name: "Smileys & People" },
          { category: Categories.ANIMALS_NATURE, name: "Nature" },
          { category: Categories.FOOD_DRINK, name: "Food" },
          { category: Categories.ACTIVITIES, name: "Activities" },
          { category: Categories.OBJECTS, name: "Objects" },
          { category: Categories.SYMBOLS, name: "Symbols" },
        ]}
      />
    </div>
  );
};

export default EmojiPicker;