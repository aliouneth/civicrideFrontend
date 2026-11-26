"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export interface AddressSuggestion {
  label: string;
  lat: number;
  lng: number;
}

interface Props {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AddressSuggestion) => void;
  onBlur?: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
}

const MIN_QUERY_LENGTH = 4;
const DEBOUNCE_MS = 350;

/** Address field with Mapbox-backed suggestions and keyboard support. */
export function AddressAutocomplete({
  name,
  label,
  value,
  onChange,
  onSelect,
  onBlur,
  error,
  hint,
  required,
  className = "",
  autoComplete = "off",
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const listboxId = useId();
  const skipNextFetch = useRef(false);
  const describedBy = [error ? `${name}-error` : null, hint ? `${name}-hint` : null]
    .filter(Boolean).join(" ") || undefined;

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode/suggest?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data: unknown = res.ok ? await res.json() : [];
        const next = Array.isArray(data) ? (data as AddressSuggestion[]) : [];
        setSuggestions(next);
        setOpen(next.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if (!(err instanceof Error) || err.name !== "AbortError") {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  function select(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) return;

    // Selecting a suggestion changes the controlled value; that must not fire
    // another autocomplete request for the already-resolved address.
    skipNextFetch.current = true;
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setLoading(false);
    onSelect(suggestion);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && open) {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      select(activeIndex);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={name} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          setOpen(false);
          onBlur?.(event.currentTarget.value);
        }}
        autoComplete={autoComplete}
        required={required}
        className="min-h-[44px] w-full rounded-lg border border-line bg-card px-3 py-2 text-base placeholder:text-ink-500/60"
        suppressHydrationWarning
      />
      {loading && (
        <p className="mt-1 text-xs text-ink-500" role="status">Looking up addresses…</p>
      )}
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-auto rounded-lg border border-line bg-card p-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(index)}
              className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                index === activeIndex ? "bg-brand-50 text-brand-800" : "text-ink-900 hover:bg-paper"
              }`}
            >
              {suggestion.label}
            </li>
          ))}
        </ul>
      )}
      {hint && !error && <p id={`${name}-hint`} className="mt-1 text-sm text-ink-500">{hint}</p>}
      {error && <p id={`${name}-error`} role="alert" className="mt-1 text-sm font-medium text-bad-fg">{error}</p>}
    </div>
  );
}
