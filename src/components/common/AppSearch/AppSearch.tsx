import { useEffect, useRef, type ChangeEvent, type KeyboardEvent, type Ref } from "react";
import { Search, X } from "lucide-react";

import "./AppSearch.css";

export interface AppSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  ariaLabel?: string;
  debounceMs?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  inputRef?: Ref<HTMLInputElement>;
  ariaActivedescendant?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
}

export default function AppSearch({
  value,
  onChange,
  onSearch,
  onKeyDown,
  placeholder = "Pesquisar",
  label,
  ariaLabel,
  debounceMs = 250,
  disabled = false,
  autoFocus = false,
  className = "",
  inputClassName = "",
  inputRef,
  ariaActivedescendant,
  ariaControls,
  ariaExpanded,
}: AppSearchProps) {
  const internalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!onSearch) return;

    const timeout = window.setTimeout(() => onSearch(value), debounceMs);
    return () => window.clearTimeout(timeout);
  }, [debounceMs, onSearch, value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && value) {
      onChange("");
      return;
    }

    onKeyDown?.(event);
  }

  function clear() {
    onChange("");
    internalInputRef.current?.focus();
  }

  return (
    <div className={`app-search ${className}`.trim()}>
      {label ? <span className="app-search__label">{label}</span> : null}
      <div className="app-search__control">
        <Search className="app-search__icon" size={17} aria-hidden="true" />
        <input
          ref={inputRef || internalInputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel || label || placeholder}
          aria-activedescendant={ariaActivedescendant}
          aria-controls={ariaControls}
          aria-expanded={ariaExpanded}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`app-search__input ${inputClassName}`.trim()}
        />
        {value ? (
          <button
            type="button"
            className="app-search__clear"
            onClick={clear}
            aria-label="Limpar pesquisa"
            title="Limpar pesquisa"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
