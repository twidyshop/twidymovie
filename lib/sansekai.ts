import "server-only";

const BASE_URL = process.env.SANSEKAI_BASE_URL || "https://api.sansekai.my.id/api";

export type ApiEnvelope<T> = { status?: boolean; message?: string; data?: T };

export type CardItem = {
  id: string;
  title: string;
  image: string;
  href: string;
  meta?: string;
  raw?: any;
};

const headers = {
  accept: "application/json",
  "user-agent": "Mozilla/5.0 (compatible; TWYMOVIE/1.0)",
  referer: "https://api.sansekai.my.id/"
};

export async function sansekai<T = any>(endpoint: string, revalidate = 900): Promise<T> {
  const response = await fetch(BASE_URL + endpoint, {
    headers,
    next: { revalidate }
  });
  if (!response.ok) throw new Error(`Sansekai request failed: ${response.status}`);
  const json = await response.json();
  return (json?.data ?? json) as T;
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.list)) return value.list;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function imageOf(item: any) {
  return item?.thumb || item?.cover || item?.poster || item?.image || item?.thumbnail || "";
}

export async function getMovieHome(): Promise<CardItem[]> {
  const data = await sansekai("/moviebox/homepage");
  return asArray(data).map((x) => ({ id: x.url || x.subjectId || x.id || x.title, title: x.title || "Untitled", image: imageOf(x), href: `/movie/watch?url=${encodeURIComponent(x.url || x.subjectId || "")}`, meta: x.type || x.year, raw: x }));
}

export async function getMovieTrending(): Promise<CardItem[]> {
  const data = await sansekai("/moviebox/trending");
  return asArray(data).map((x) => ({ id: x.url || x.subjectId || x.id || x.title, title: x.title || "Untitled", image: imageOf(x), href: `/movie/watch?url=${encodeURIComponent(x.url || x.subjectId || "")}`, meta: x.type || x.year, raw: x }));
}

export async function getAnimeLatest(): Promise<CardItem[]> {
  const data = await sansekai("/anime/latest");
  return asArray(data).map((x) => ({ id: x.url || x.title, title: x.title || "Untitled", image: imageOf(x), href: `/anime/watch?url=${encodeURIComponent(x.url || "")}`, meta: x.type || x.status, raw: x }));
}

export async function getAnimeRecommended(): Promise<CardItem[]> {
  const data = await sansekai("/anime/recommended");
  return asArray(data).map((x) => ({ id: x.url || x.title, title: x.title || "Untitled", image: imageOf(x), href: `/anime/watch?url=${encodeURIComponent(x.url || "")}`, meta: x.type || x.status, raw: x }));
}

export async function getKomikLatest(): Promise<CardItem[]> {
  const data = await sansekai("/komik/latest");
  return asArray(data).map((x) => ({ id: x.url || x.title, title: x.title || "Untitled", image: imageOf(x), href: `/komik/read?url=${encodeURIComponent(x.url || "")}`, meta: x.type, raw: x }));
}

export async function getKomikPopular(): Promise<CardItem[]> {
  const data = await sansekai("/komik/popular");
  return asArray(data).map((x) => ({ id: x.url || x.title, title: x.title || "Untitled", image: imageOf(x), href: `/komik/read?url=${encodeURIComponent(x.url || "")}`, meta: x.type, raw: x }));
}

export async function searchAll(query: string) {
  const q = encodeURIComponent(query);
  const [movies, anime, komik] = await Promise.allSettled([
    sansekai(`/moviebox/search?query=${q}`, 300),
    sansekai(`/anime/search?query=${q}`, 300),
    sansekai(`/komik/search?query=${q}`, 300)
  ]);
  const normalize = (result: PromiseSettledResult<any>, kind: "movie"|"anime"|"komik"): CardItem[] => {
    if (result.status !== "fulfilled") return [];
    return asArray(result.value).map((x) => {
      const url = x.url || x.subjectId || "";
      return {
        id: url || x.title,
        title: x.title || "Untitled",
        image: imageOf(x),
        href: kind === "movie" ? `/movie/watch?url=${encodeURIComponent(url)}` : kind === "anime" ? `/anime/watch?url=${encodeURIComponent(url)}` : `/komik/read?url=${encodeURIComponent(url)}`,
        meta: x.type || x.year,
        raw: x
      };
    });
  };
  return { movies: normalize(movies, "movie"), anime: normalize(anime, "anime"), komik: normalize(komik, "komik") };
}

export async function getMovieDetail(url: string) {
  return sansekai(`/moviebox/detail?url=${encodeURIComponent(url)}`, 300);
}

export async function getMovieSources(url: string) {
  return sansekai(`/moviebox/sources?url=${encodeURIComponent(url)}`, 120);
}

export async function getAnimeDetail(url: string) {
  return sansekai(`/anime/detail?url=${encodeURIComponent(url)}`, 300);
}

export async function getAnimeVideo(url: string) {
  return sansekai(`/anime/getvideo?url=${encodeURIComponent(url)}`, 60);
}

export async function getKomikDetail(url: string) {
  return sansekai(`/komik/detail?url=${encodeURIComponent(url)}`, 300);
}

export async function getKomikChapters(url: string) {
  return sansekai(`/komik/chapterlist?url=${encodeURIComponent(url)}`, 300);
}

export async function getKomikImages(url: string) {
  return sansekai<string[]>(`/komik/getimage?url=${encodeURIComponent(url)}`, 60);
}