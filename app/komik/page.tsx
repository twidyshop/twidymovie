import Section from "@/components/Section";
import { getKomikLatest, getKomikPopular } from "@/lib/sansekai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function KomikPage() {
  const [latest, popular] = await Promise.allSettled([getKomikLatest(), getKomikPopular()]);
  const a = latest.status === "fulfilled" ? latest.value : [];
  const b = popular.status === "fulfilled" ? popular.value : [];
  return <main className="page"><h1 className="page-title">Komik</h1><p className="page-subtitle">Baca manga, manhwa dan manhua dari sumber Sansekai.</p><Section title="Latest" items={a}/><Section title="Popular" items={b}/></main>;
}