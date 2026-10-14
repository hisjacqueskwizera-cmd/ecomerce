"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function SearchableSelect({ options = [], value, defaultValue = "", onChange, placeholder = "Choose an option", className = "", ariaLabel, name, disabled = false, required = false }) {
  const id = useId();
  const root = useRef(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const selectedValue = value === undefined ? uncontrolledValue : value;
  const normalized = options.map(option => typeof option === "string" ? { label: option, value: option } : option);
  const selected = normalized.find(option => option.value === selectedValue);
  const query = search.trim().toLowerCase();
  const visible = normalized.filter(option => `${option.label} ${option.value}`.toLowerCase().includes(query));
  const groupNames = [...new Set(visible.map(option => option.group).filter(Boolean))];
  const ungrouped = visible.filter(option => !option.group);

  useEffect(() => {
    function close(event) { if (!root.current?.contains(event.target)) setOpen(false); }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  function choose(option) {
    if (value === undefined) setUncontrolledValue(option.value);
    onChange?.({ target: { name, value: option.value } });
    setSearch("");
    setOpen(false);
  }
  function renderOption(option) {
    return <button type="button" role="option" aria-selected={selectedValue === option.value} className={`search-select-option ${selectedValue === option.value ? "chosen" : ""}`} key={`${id}-${option.value}`} onClick={() => choose(option)}>{option.label}{selectedValue === option.value && <span>✓</span>}</button>;
  }

  return <div className={`searchable-select ${open ? "search-select-open" : ""}`} ref={root}>
    {name && <input type="hidden" name={name} value={selectedValue || ""}/>}
    <button type="button" className={`search-select-trigger ${className}`} aria-label={ariaLabel || placeholder} aria-haspopup="listbox" aria-expanded={open} aria-required={required} disabled={disabled} onClick={() => { setOpen(current => !current); setSearch(""); }}><span className={selected ? "" : "search-select-placeholder"}>{selected?.label || placeholder}</span><i>{open ? "⌃" : "⌄"}</i></button>
    {open && <div className="search-select-menu"><div className="search-select-search-wrap"><span>⌕</span><input autoFocus value={search} onChange={event => setSearch(event.target.value)} onKeyDown={event => { if (event.key === "Escape") setOpen(false); if (event.key === "Enter" && visible.length === 1) { event.preventDefault(); choose(visible[0]); } }} placeholder="Type to search..." aria-label={`Search ${ariaLabel || "options"}`}/></div><div className="search-select-options" role="listbox" aria-label={ariaLabel || placeholder}>{groupNames.length ? <>{ungrouped.map(renderOption)}{groupNames.map(group => <div className="search-select-group" key={`${id}-${group}`}><span className="search-select-group-name">{group}</span>{visible.filter(option => option.group === group).map(renderOption)}</div>)}</> : visible.map(renderOption)}{!visible.length && <div className="search-select-empty">No matching options</div>}</div></div>}
  </div>;
}
