import Section from "@/components/Section";
import { getMovieHome, getMovieTrending } from "@/lib/sansekai";

export const revalidate = 900;

export default async function MoviePage() {
  const [home, trending] = await Promise.allSettled([getMovieHome(), getMovieTrending()]);
  const a = home.status === "fulfilled" ? home.value : [];
  const b = trending.status === "fulfilled" ? trending.value : [];
  return <main className="page"><h1 className="page-title">Movie</h1><p className="page-subtitle">Film dan serial pilihan untuk menemani waktu santai.</p><Section title="Trending" items={b}/><Section title="Latest" items={a}/></main>;
}