export function Card(props: {
  title?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white/5 p-4 shadow-sm">
      {props.title ? (
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-lg font-semibold text-[var(--text-h)]">
            {props.title}
          </h2>
          {props.right}
        </div>
      ) : null}
      <div className={props.title ? "mt-3" : undefined}>{props.children}</div>
    </section>
  );
}
