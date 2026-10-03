"use client";

import Link from "next/link";
import { Search, Clapperboard, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand"><span className="brand-mark">T</span><span>TWY<span>MOVIE</span></span></Link>
        <nav className="desktop-nav">
          <Link href="/">Home</Link><Link href="/movie">Movie</Link><Link href="/anime">Anime</Link><Link href="/komik">Komik</Link>
        </nav>
        <div className="header-actions">
          <Link className="icon-btn" href="/search" aria-label="Search"><Search size={19}/></Link>
          <button className="icon-btn mobile-menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X size={20}/> : <Menu size={20}/>}</button>
        </div>
      </div>
      {open && <div className="mobile-menu-panel"><Link href="/" onClick={()=>setOpen(false)}>Home</Link><Link href="/movie" onClick={()=>setOpen(false)}>Movie</Link><Link href="/anime" onClick={()=>setOpen(false)}>Anime</Link><Link href="/komik" onClick={()=>setOpen(false)}>Komik</Link></div>}
    </header>
  );
}