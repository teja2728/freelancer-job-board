export default function Footer() {
  return (
    <footer className="mt-8 border-t border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-6 text-sm text-slate-600 dark:text-slate-300 flex justify-between">
        <p>© {new Date().getFullYear()} Freelance Board</p>
        <p className="opacity-80">Built with MERN + Tailwind</p>
      </div>
    </footer>
  )
}
