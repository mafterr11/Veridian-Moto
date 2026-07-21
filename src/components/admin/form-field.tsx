import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AdminField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-steel text-xs leading-5">{hint}</p>}
    </div>
  );
}

export function AdminCheckbox({
  id,
  name,
  label,
  description,
  defaultChecked,
  value,
}: {
  id: string;
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  value?: string;
}) {
  return (
    <div className="border-obsidian/15 flex items-start gap-3 border p-3">
      <Checkbox
        id={id}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5"
      />
      <div>
        <Label htmlFor={id}>{label}</Label>
        {description && (
          <p className="text-steel mt-1 text-xs leading-5">{description}</p>
        )}
      </div>
    </div>
  );
}
