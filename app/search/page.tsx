"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import ContentCard from "@/components/ContentCard";
import type { CardItem } from "@/lib/sansekai";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{movies:CardItem[];anime:CardItem[];komik:CardItem[]}>({movies:[],anime:[],komik:[]});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try { const r = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`); setResult(await r.json()); }
    finally { setLoading(false); }
  }

  const all = [...result.movies, ...result.anime, ...result.komik];
  return <main className="page"><h1 className="page-title">Search</h1><p className="page-subtitle">Cari movie, anime, atau komik.</p><form className="search-box" onSubmit={submit}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari judul..." autoFocus/><button aria-label="Search"><Search size={19}/></button></form>{loading ? <div className="empty">Mencari...</div> : all.length ? <div className="grid">{all.map((x,i)=><ContentCard key={x.id+i} item={x}/>)}</div> : <div className="empty">Masukkan kata kunci untuk mulai mencari.</div>}</main>;
}