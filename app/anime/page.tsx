import Section from "@/components/Section";
import { getAnimeLatest, getAnimeRecommended } from "@/lib/sansekai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnimePage() {
  const [latest, recommended] = await Promise.allSettled([getAnimeLatest(), getAnimeRecommended()]);
  const a = latest.status === "fulfilled" ? latest.value : [];
  const b = recommended.status === "fulfilled" ? recommended.value : [];
  return <main className="page"><h1 className="page-title">Anime</h1><p className="page-subtitle">Temukan anime terbaru dan rekomendasi pilihan.</p><Section title="Latest Anime" items={a}/><Section title="Recommended" items={b}/></main>;
}