export default function Footer() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-slate-400">
          &copy; {year} VitaCheck.
        </p>
      </div>
    </footer>
  )
}
