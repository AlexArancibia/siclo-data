"use client"

import { Filter, Search } from "lucide-react"
import { DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { InteractiveChartLegendProps } from "@/interfaces/interactive-chart-legend";

export function InteractiveChartLegend({ category, items, visibleItems, onToggle, showFinder }: InteractiveChartLegendProps) {

  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) => item.label.toLowerCase().includes(term));
  }, [items, searchTerm]);

  return (
    <div className="absolute right-4 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-xs">{category} ({visibleItems.size})</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs">Seleccionar {category}</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <div className="px-2 pb-2">
            <div className="relative">
              {showFinder ? (
                <>
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs"
                    onKeyDownCapture={(e) => e.stopPropagation()}
                  />
                </>) : ''}
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <DropdownMenuCheckboxItem
                  key={item.key}
                  checked={visibleItems.has(item.key)}
                  onCheckedChange={() => onToggle(item.key)}
                  onSelect={(e) => e.preventDefault()}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                No se encontraron resultados
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}