export function FormField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--text-h)]">
        {props.label}
      </span>
      <input
        type={props.type || "text"}
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3 text-[var(--text-h)] placeholder:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-border)] disabled:opacity-60"
      />
    </label>
  );
}
