import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

export const ShadcnSelect = React.forwardRef(({ options = [], value, onChange, placeholder = "Selecione...", disabled = false, className = "" }, ref) => {
  const [search, setSearch] = React.useState("");
  const filteredOptions = options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange} disabled={disabled}>
      <SelectPrimitive.Trigger ref={ref} className={`border rounded-lg px-3 py-2 h-[40px] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-between ${className}`} aria-label={placeholder}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Content className="bg-white border rounded-lg shadow-lg z-50 min-w-[220px]" position="popper" sideOffset={4}>
        <div className="px-3 pt-2 pb-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
        </div>
        <SelectPrimitive.Viewport>
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-muted-foreground text-sm">Nenhum resultado</div>
          ) : (
            filteredOptions.map(opt => (
              <SelectPrimitive.Item key={opt.value} value={opt.value} className="px-3 py-2 cursor-pointer hover:bg-primary/10 focus:bg-primary/20 focus:outline-none text-sm">
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))
          )}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  );
});

ShadcnSelect.displayName = "ShadcnSelect";
