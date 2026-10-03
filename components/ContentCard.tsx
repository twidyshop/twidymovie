import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import type { CardItem } from "@/lib/types";

export default function ContentCard({ item }: { item: CardItem }) {
  return <Link href={item.href} className="content-card"><div className="poster">{item.image?<Image src={item.image} alt={item.title} fill sizes="180px" unoptimized/>:<div className="poster-fallback"><Play size={24}/></div>}<div className="poster-shade"/><div className="play-badge"><Play size={13} fill="currentColor"/></div></div><div className="card-title">{item.title}</div>{item.meta&&<div className="card-meta">{item.meta}</div>}</Link>;
}