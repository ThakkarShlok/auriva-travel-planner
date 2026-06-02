function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-xl">
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-ink-500">Empty state</p>
        <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  )
}

export default EmptyState
