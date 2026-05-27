

// import React, { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Search, X } from "lucide-react";

// interface FilterRolesProps {
//   searchTerm: string;
//   setSearchTerm: (term: string) => void;
//   licenseFilter: string;
//   setLicenseFilter: (filter: string) => void;
//   isSearching?: boolean; 
// }

// const FilterRoles: React.FC<FilterRolesProps> = ({
//   searchTerm,
//   setSearchTerm,
//   licenseFilter,
//   setLicenseFilter,
//   isSearching = false,
// }) => {
//   const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       setSearchTerm(localSearchTerm);
//     }, 300); 

//     return () => clearTimeout(debounceTimer);
//   }, [localSearchTerm, setSearchTerm]);

//   useEffect(() => {
//     setLocalSearchTerm(searchTerm);
//   }, [searchTerm]);

//   const handleClearSearch = () => {
//     setLocalSearchTerm("");
//     setSearchTerm(""); 
//   };

//    return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <label className="block text-sm font-medium mb-2">
//           Search by Role ID or Description
//         </label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <Input
//             placeholder="Enter role ID or description (e.g., Z*DAP, Z%)"
//             value={localSearchTerm}
//             onChange={(e) => setLocalSearchTerm(e.target.value)}
//             className="pl-10 pr-10"
//           />
//           {localSearchTerm && (
//             <button
//               onClick={handleClearSearch}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           )}
//           {isSearching && (
//             <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
//             </div>
//           )}
//         </div>
//         {localSearchTerm && (
//           <p className="text-xs text-gray-500 mt-1">
//             Searching for: "{localSearchTerm}"
//           </p>
//         )}
//       </div>
//       <div>
//         <label className="block text-sm font-medium mb-2">License Type</label>
//         <Select value={licenseFilter} onValueChange={setLicenseFilter}>
//           <SelectTrigger>
//             <SelectValue placeholder="All License Types" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All License Types</SelectItem>
//             <SelectItem value="GB Advanced Use">GB Advanced Use</SelectItem>
//             <SelectItem value="GC Core Use">GC Core Use</SelectItem>
//             <SelectItem value="GD Self-Service Use">GD Self-Service Use</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//     </div>
//   );
// };

// export default FilterRoles;




// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, X, ChevronDown, Check } from "lucide-react";

export interface RoleOption {
  value: string;
  label: string;
  description?: string;
  classification?: string;
}

interface RoleSearchDropdownProps {
  options: RoleOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  disabled?: boolean;
  label?: string;
  maxDropdownHeight?: number;
  className?: string;
}

const RoleSearchDropdown: React.FC<RoleSearchDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search roles...",
  multiSelect = false,
  disabled = false,
  label,
  maxDropdownHeight = 280,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedValues = multiSelect
    ? Array.isArray(value) ? value : []
    : typeof value === "string" && value ? [value] : [];

  // Calculate portal panel position from trigger bounding rect
  const updatePanelPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = Math.min(maxDropdownHeight + 80, 360);
    const openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(openAbove
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [maxDropdownHeight]);

  // Close on outside click — checks both trigger and portal panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedPanel = panelRef.current?.contains(target);
      if (!clickedTrigger && !clickedPanel) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("resize", updatePanelPosition);
    return () => {
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("resize", updatePanelPosition);
    };
  }, [isOpen, updatePanelPosition]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Wildcard matching — same as CreateSimulation & FilterRoles
  const wildcardToRegExp = (pattern: string): RegExp => {
    const hasWildcard =
      pattern.includes("*") || pattern.includes("%") || pattern.includes("?");
    if (hasWildcard) {
      const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      const regexStr = escaped.replace(/[*%]/g, ".*").replace(/\?/g, ".");
      return new RegExp(`^${regexStr}$`, "i");
    }
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "i");
  };

  const filteredOptions = useCallback(() => {
    if (!searchTerm.trim()) return options;
    const regex = wildcardToRegExp(searchTerm.trim());
    return options.filter(
      (opt) =>
        regex.test(opt.value) ||
        regex.test(opt.label) ||
        regex.test(opt.description || "")
    );
  }, [options, searchTerm])();

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePanelPosition();
      setSearchTerm("");
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (optValue: string) => {
    if (multiSelect) {
      const current = Array.isArray(value) ? value : [];
      const updated = current.includes(optValue)
        ? current.filter((v) => v !== optValue)
        : [...current, optValue];
      onChange(updated);
    } else {
      onChange(optValue);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiSelect ? [] : "");
    setSearchTerm("");
  };

  const getDisplayLabel = () => {
    if (selectedValues.length === 0) return null;
    if (!multiSelect) {
      const opt = options.find((o) => o.value === selectedValues[0]);
      return opt?.label || selectedValues[0];
    }
    if (selectedValues.length === 1) {
      const opt = options.find((o) => o.value === selectedValues[0]);
      return opt?.label || selectedValues[0];
    }
    return `${selectedValues.length} roles selected`;
  };

  const displayLabel = getDisplayLabel();
  const hasSelection = selectedValues.length > 0;

  // Portal panel — renders at document.body level, escapes all overflow:hidden
  const dropdownPanel =
    isOpen
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-multiselectable={multiSelect}
            style={{
              ...panelStyle,
              background: "var(--color-background-primary, #fff)",
              border:
                "0.5px solid var(--color-border-secondary, rgba(0,0,0,0.2))",
              borderRadius: "var(--border-radius-md, 8px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Search header */}
            <div
              style={{
                padding: "8px 10px",
                borderBottom:
                  "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
                background: "var(--color-background-secondary, #f9f9f9)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Search
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 8,
                    width: 13,
                    height: 13,
                    color: "var(--color-text-tertiary, #aaa)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsOpen(false);
                      setSearchTerm("");
                    }
                  }}
                  placeholder="Type to filter... (e.g. z*fi*, Z%DISPLAY)"
                  aria-label="Filter roles"
                  style={{
                    width: "100%",
                    height: 32,
                    padding: "0 30px 0 28px",
                    fontSize: 13,
                    border:
                      "0.5px solid var(--color-border-secondary, rgba(0,0,0,0.2))",
                    borderRadius: "var(--border-radius-md, 8px)",
                    background: "var(--color-background-primary, #fff)",
                    color: "var(--color-text-primary, #111)",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                {searchTerm && (
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchTerm("");
                    }}
                    aria-label="Clear search"
                    style={{
                      position: "absolute",
                      right: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      padding: 0,
                      color: "var(--color-text-tertiary, #aaa)",
                    }}
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--color-text-tertiary, #aaa)",
                  marginTop: 5,
                }}
              >
                {filteredOptions.length === options.length
                  ? `${options.length} roles`
                  : `${filteredOptions.length} of ${options.length} roles`}
                {multiSelect &&
                  selectedValues.length > 0 &&
                  ` · ${selectedValues.length} selected`}
              </div>
            </div>

            {/* Options list */}
            <div
              style={{
                maxHeight: maxDropdownHeight,
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: "20px 12px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--color-text-tertiary, #aaa)",
                  }}
                >
                  No roles match "{searchTerm}"
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(opt.value);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "7px 12px",
                        cursor: "pointer",
                        background: isSelected
                          ? "var(--color-background-info, #e6f1fb)"
                          : "transparent",
                        borderBottom:
                          "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.08))",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected)
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.background =
                            "var(--color-background-secondary, #f5f5f5)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          isSelected
                            ? "var(--color-background-info, #e6f1fb)"
                            : "transparent";
                      }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          marginTop: 1,
                          flexShrink: 0,
                          border: `0.5px solid ${
                            isSelected
                              ? "var(--color-border-info, #378ADD)"
                              : "var(--color-border-secondary, rgba(0,0,0,0.2))"
                          }`,
                          borderRadius: multiSelect ? 4 : 8,
                          background: isSelected
                            ? "var(--color-background-info, #e6f1fb)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && (
                          <Check
                            style={{
                              width: 10,
                              height: 10,
                              color: "var(--color-text-info, #185FA5)",
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? 500 : 400,
                            color: isSelected
                              ? "var(--color-text-info, #185FA5)"
                              : "var(--color-text-primary, #111)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {opt.label}
                        </div>
                        {opt.description && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-tertiary, #aaa)",
                              marginTop: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {opt.description}
                          </div>
                        )}
                      </div>

                      {opt.classification && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: 10,
                            padding: "2px 6px",
                            borderRadius: "var(--border-radius-md, 8px)",
                            background:
                              "var(--color-background-secondary, #f0f0f0)",
                            border:
                              "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.1))",
                            color: "var(--color-text-secondary, #666)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {opt.classification}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={containerRef}
      className={`role-search-dropdown ${className}`}
      style={{ position: "relative", width: "100%" }}
    >
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 6,
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
          if (e.key === "Escape") {
            setIsOpen(false);
            setSearchTerm("");
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px",
          height: 36,
          background: "var(--color-background-primary)",
          border: `0.5px solid ${
            isOpen
              ? "var(--color-border-primary)"
              : "var(--color-border-secondary)"
          }`,
          borderRadius: "var(--border-radius-md)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          userSelect: "none",
          transition: "border-color 0.15s",
          outline: isOpen ? "2px solid var(--color-border-info)" : "none",
          outlineOffset: 1,
        }}
      >
        <Search
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            flexShrink: 0,
            color: "var(--color-text-tertiary)",
          }}
        />

        <span
          style={{
            flex: 1,
            fontSize: 13,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: hasSelection
              ? "var(--color-text-primary)"
              : "var(--color-text-tertiary)",
          }}
        >
          {displayLabel || placeholder}
        </span>

        {hasSelection && (
          <button
            onClick={handleClearAll}
            aria-label="Clear selection"
            style={{
              display: "flex",
              alignItems: "center",
              padding: 2,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-tertiary)",
              borderRadius: 4,
            }}
          >
            <X style={{ width: 12, height: 12 }} />
          </button>
        )}

        <ChevronDown
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            flexShrink: 0,
            color: "var(--color-text-tertiary)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </div>

      {/* Portal renders outside all overflow:hidden ancestors */}
      {dropdownPanel}
    </div>
  );
};

export default RoleSearchDropdown;