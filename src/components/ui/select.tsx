import { Select } from "@base-ui/react/select";
import { cn } from "cn";
import { ChevronDown, Check } from "lucide-react";

/* ───── Root ───── */
const SelectRoot = Select.Root;

/* ───── Trigger ───── */
function SelectTrigger({
  className,
  children,
  placeholder = "Pilih...",
  ...props
}: React.ComponentProps<typeof Select.Trigger> & { placeholder?: string }) {
  return (
    <Select.Trigger
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "dark:bg-input/30",
        className,
      )}
      {...props}
    >
      <Select.Value placeholder={placeholder} />
      <Select.Icon>
        <ChevronDown className="size-4 text-muted-foreground" />
      </Select.Icon>
    </Select.Trigger>
  );
}

/* ───── Portal + Positioner + Popup ───── */
function SelectPopup({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Select.Popup>) {
  return (
    <Select.Portal>
      <Select.Positioner>
        <Select.Popup
          className={cn(
            "z-50 max-h-60 overflow-auto rounded-lg border border-border bg-card p-1 shadow-lg",
            "transition-all duration-150",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        >
          {children}
        </Select.Popup>
      </Select.Positioner>
    </Select.Portal>
  );
}

/* ───── Item ───── */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Select.Item>) {
  return (
    <Select.Item
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none",
        "data-[highlighted]:bg-muted data-[highlighted]:text-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <Select.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
        <Check className="size-3.5" />
      </Select.ItemIndicator>
      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  );
}

/* ───── Group + Label ───── */
const SelectGroup = Select.Group;

function SelectGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof Select.GroupLabel>) {
  return (
    <Select.GroupLabel
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  SelectRoot,
  SelectTrigger,
  SelectPopup,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
};
