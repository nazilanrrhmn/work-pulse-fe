export default function InfoRow({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}>) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}
