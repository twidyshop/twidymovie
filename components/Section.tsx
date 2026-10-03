import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ContentCard from "./ContentCard";
import type { CardItem } from "@/lib/sansekai";

export default function Section({ title, items, href }: { title: string; items: CardItem[]; href?: string }) {
  if (!items.length) return null;
  return <section className="section">
    <div className="section-head"><h2>{title}</h2>{href && <Link href={href}>Lihat semua <ChevronRight size={16}/></Link>}</div>
    <div className="card-row">{items.map((item, i) => <ContentCard key={item.id + i} item={item}/>)}</div>
  </section>;
}