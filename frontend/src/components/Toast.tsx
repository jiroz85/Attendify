export function Toast(props: { type: "error" | "success"; message: string }) {
  return (
    <div
      className={
        props.type === "error"
          ? "rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-[var(--text-h)]"
          : "rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-[var(--text-h)]"
      }
    >
      {props.message}
    </div>
  );
}
