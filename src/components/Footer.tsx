export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-6 text-center text-sm text-[var(--color-text-subtle)]">
      © {new Date().getFullYear()} Founders<span className="text-[var(--color-gold)]">.Club</span> — The club for people who build.
    </footer>
  )
}
