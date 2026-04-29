import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-base mb-3">SigM Laboratory</h3>
            <p className="text-sm leading-relaxed">
              Signal Processing, Information and Multimedia Content<br />
              Hanoi University of Science and Technology
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-3">Location</h3>
            <a
              href="https://maps.app.goo.gl/eV42uNUPw1zaYTu17"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm leading-relaxed hover:text-white transition-colors"
            >
              Room E.802–808, C7 Building<br />
              1 Dai Co Viet, Hai Ba Trung<br />
              Hanoi, Vietnam
            </a>
          </div>
          <div>
            <h3 className="text-white font-bold text-base mb-3">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/about#contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61552247136375" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@LabSigM" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SigM Laboratory, HUST. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
