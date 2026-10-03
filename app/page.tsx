import Hero from "@/components/Hero";
import Section from "@/components/Section";
import { getMovieTrending, getMovieHome, getAnimeLatest, getKomikLatest } from "@/lib/sansekai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [movies, trending, anime, komik] = await Promise.allSettled([
    getMovieHome(), getMovieTrending(), getAnimeLatest(), getKomikLatest()
  ]);
  const movieItems = movies.status === "fulfilled" ? movies.value : [];
  const trendingItems = trending.status === "fulfilled" ? trending.value : [];
  const animeItems = anime.status === "fulfilled" ? anime.value : [];
  const komikItems = komik.status === "fulfilled" ? komik.value : [];
  return <main>
    <Hero item={trendingItems[0] || movieItems[0]}/>
    <Section title="Trending Now" items={trendingItems}/>
    <Section title="Movie" items={movieItems} href="/movie"/>
    <Section title="Anime" items={animeItems} href="/anime"/>
    <Section title="Komik" items={komikItems} href="/komik"/>
  </main>;
}