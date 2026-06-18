export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 border-b-2 border-carbon pb-5 sm:mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="eyebrow mb-2 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 bg-hazard" />
              {eyebrow}
            </p>
          )}
          <h1 className="signage text-3xl leading-none sm:text-4xl">{title}</h1>
          {description && (
            <p className="mt-2.5 max-w-2xl text-sm text-ink-muted">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
