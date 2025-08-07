import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useBackend } from "../hooks/useBackend"
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
import { Skeleton } from "@/components/ui/skeleton"
import type { College } from "~backend/colleges/types"

interface CollegeComboboxProps {
  value?: College | null
  onSelect: (college: College | null) => void
  onCreateNew?: (name: string) => void
  placeholder?: string
  className?: string
}

export function CollegeCombobox({
  value,
  onSelect,
  onCreateNew,
  placeholder = "Search colleges...",
  className,
}: CollegeComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedQuery, setDebouncedQuery] = React.useState("")

  const backend = useBackend()

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["colleges", "search", debouncedQuery],
    queryFn: () => backend.colleges.search({ query: debouncedQuery, limit: 20 }),
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const colleges = searchResults?.colleges || []

  const handleSelect = (college: College) => {
    onSelect(college)
    setOpen(false)
    setSearchQuery("")
  }

  const handleCreateNew = () => {
    if (onCreateNew && searchQuery.trim()) {
      onCreateNew(searchQuery.trim())
      setOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? (
            <span className="truncate">{value.name}</span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search colleges..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && searchQuery.length > 0 && (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {!isLoading && searchQuery.length > 0 && colleges.length === 0 && (
              <CommandEmpty>
                <div className="text-center py-4">
                  <p className="text-sm text-slate-600 mb-3">
                    No colleges found for "{searchQuery}"
                  </p>
                  {onCreateNew && (
                    <Button
                      size="sm"
                      onClick={handleCreateNew}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add "{searchQuery}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
            )}

            {colleges.length > 0 && (
              <CommandGroup>
                {colleges.map((college) => (
                  <CommandItem
                    key={college.id}
                    value={college.name}
                    onSelect={() => handleSelect(college)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{college.name}</div>
                        {college.location && (
                          <div className="text-sm text-slate-500 truncate">
                            📍 {college.location}
                          </div>
                        )}
                        {college.acceptanceRate && (
                          <div className="text-xs text-slate-400">
                            {college.acceptanceRate}% acceptance rate
                          </div>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0",
                          value?.id === college.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {searchQuery.length > 0 && colleges.length > 0 && onCreateNew && (
              <>
                <div className="border-t border-slate-200 my-1" />
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Add "{searchQuery}" as new college
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
