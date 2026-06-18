export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-1.5 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-hazard" />
            {eyebrow}
          </p>
        )}
        <h1 className="signage text-3xl leading-none sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
