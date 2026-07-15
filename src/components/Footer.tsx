export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--color-bg-inverse)] bg-[var(--color-bg-inverse)] py-8 text-[var(--color-text-inverse)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center sm:px-6">
        <span className="text-sm font-black uppercase tracking-tight">
          Founders<span className="text-[var(--color-gold)]">.Club</span>
        </span>
        <p className="text-xs uppercase tracking-widest text-[var(--color-text-inverse)]/50">
          © {new Date().getFullYear()} — The club for people who build.
        </p>
      </div>
    </footer>
  )
}
