import { CommandEmpty, CommandItem } from "./ui/command";
import { useState } from "react";
import { CommandInput, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { Command } from "./ui/command";

export function ComboBox({
  data,
  comboBoxValue,
  placeholder,
  setComboBoxValue,
}: {
  data: string[];
  comboBoxValue: string;
  placeholder: string;
  setComboBoxValue: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <span className="truncate">
            {comboBoxValue
              ? data.find((b) => b === comboBoxValue)
              : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {data.map((item) => (
              <CommandItem
                key={item}
                value={item}
                onSelect={() => {
                  setComboBoxValue(item);
                  setOpen(false);
                }}
              >
                {item}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
