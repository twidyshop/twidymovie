import Link from "next/link";
import type { CardItem } from "@/lib/sansekai";

export default function Hero({ item }: { item?: CardItem }) {
  return <section className="hero">
    <div className="hero-backdrop" style={item?.image ? {backgroundImage:`linear-gradient(90deg, rgba(7,7,9,.98) 0%, rgba(7,7,9,.84) 42%, rgba(7,7,9,.15) 100%), linear-gradient(0deg, #070709 0%, transparent 35%), url("${item.image}")`} : undefined}/>
    <div className="hero-content">
      <div className="eyebrow"><span className="live-dot"/> CINEMATIC STREAMING</div>
      <h1>Film, anime &amp;<br/><em>komik</em> dalam satu tempat.</h1>
      <p>Temukan tontonan dan bacaan favoritmu dengan pengalaman yang cepat, bersih, dan nyaman di semua perangkat.</p>
      {item && <Link href={item.href} className="primary-btn">Mulai Menonton</Link>}
    </div>
  </section>;
}