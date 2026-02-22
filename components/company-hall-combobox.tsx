"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Building2, Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CompanyData, HallData } from "@/lib/types"
import {
  initialCompanies,
  initialHalls,
  searchCompanies,
  searchHalls,
} from "@/lib/types"

interface CompanyHallComboboxProps {
  selectedCompany: CompanyData | null
  selectedHall: HallData | null
  onSelectCompany: (company: CompanyData | null) => void
  onSelectHall: (hall: HallData | null) => void
}

export function CompanyHallCombobox({
  selectedCompany,
  selectedHall,
  onSelectCompany,
  onSelectHall,
}: CompanyHallComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<"company" | "hall">("company")
  const [query, setQuery] = useState("")

  const displayLabel = selectedHall
    ? selectedHall.name
    : selectedCompany
      ? selectedCompany.name
      : ""

  const placeholder = searchMode === "company" ? "法人名で検索..." : "ホール名で検索..."

  const filteredCompanies = searchCompanies(initialCompanies, query)
  const filteredHalls = searchHalls(
    initialHalls,
    query,
    selectedCompany?.id
  )

  const handleSelectCompany = (company: CompanyData) => {
    if (selectedCompany?.id === company.id) {
      onSelectCompany(null)
      onSelectHall(null)
    } else {
      onSelectCompany(company)
      onSelectHall(null)
    }
    setQuery("")
    setOpen(false)
  }

  const handleSelectHall = (hall: HallData) => {
    if (selectedHall?.id === hall.id) {
      onSelectHall(null)
      onSelectCompany(null)
    } else {
      onSelectHall(hall)
      const company = initialCompanies.find((c) => c.id === hall.companyId) ?? null
      onSelectCompany(company)
    }
    setQuery("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal h-10"
        >
          {displayLabel || (
            <span className="text-muted-foreground">法人名・ホール名を検索...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Tabs
          value={searchMode}
          onValueChange={(v) => {
            setSearchMode(v as "company" | "hall")
            setQuery("")
          }}
        >
          <div className="border-b px-2 pt-2">
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="company" className="text-xs gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                法人
              </TabsTrigger>
              <TabsTrigger value="hall" className="text-xs gap-1.5">
                <Store className="h-3.5 w-3.5" />
                ホール
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {searchMode === "company" ? "法人が見つかりません" : "ホールが見つかりません"}
            </CommandEmpty>

            {searchMode === "company" ? (
              <CommandGroup>
                {filteredCompanies.map((company) => (
                  <CommandItem
                    key={company.id}
                    value={String(company.id)}
                    onSelect={() => handleSelectCompany(company)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{company.name}</span>
                      <span className="text-xs text-muted-foreground">{company.companyId}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selectedCompany?.id === company.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandGroup>
                {filteredHalls.map((hall) => (
                  <CommandItem
                    key={hall.id}
                    value={String(hall.id)}
                    onSelect={() => handleSelectHall(hall)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{hall.name}</span>
                      <span className="text-xs text-muted-foreground">
                        担当: {hall.salesPersonName}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        selectedHall?.id === hall.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
