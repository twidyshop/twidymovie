import "server-only";

const BASE_URL = (process.env.SANSEKAI_BASE_URL || "https://api.sansekai.my.id/api").replace(/\/$/, "");

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
  accept: "application/json, text/plain, */*",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  referer: "https://sansekai.my.id/"
};

export async function sansekai<T = any>(endpoint: string, revalidate = 900): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const response = await fetch(BASE_URL + path, {
    headers,
    next: { revalidate }
  });

  if (!response.ok) {
    throw new Error(`Sansekai request failed: ${response.status} ${path}`);
  }

  const json = await response.json();

  // Keep the API envelope's data payload when present. Some endpoints may
  // return result/response instead, so preserve those too for normalization.
  if (json && typeof json === "object") {
    if (json.data !== undefined && json.data !== null) return json.data as T;
    if (json.result !== undefined && json.result !== null) return json.result as T;
    if (json.response !== undefined && json.response !== null) return json.response as T;
  }
  return json as T;
}

function unwrap(value: any): any {
  let current = value;
  for (let i = 0; i < 5; i++) {
    if (!current || typeof current !== "object" || Array.isArray(current)) break;
    if (current.data !== undefined) current = current.data;
    else if (current.result !== undefined) current = current.result;
    else if (current.response !== undefined) current = current.response;
    else break;
  }
  return current;
}

function asArray(value: any): any[] {
  const root = unwrap(value);
  const preferred = [
    "list", "items", "results", "subjects", "subjectList", "movieList",
    "animeList", "komikList", "dataList", "contents", "records"
  ];

  const isCard = (item: any) =>
    item && typeof item === "object" &&
    !Array.isArray(item) &&
    (item.subjectId || item.subject_id || item.id || item.url || item.slug ||
      item.thumb || item.cover || item.poster || item.thumbnail || item.image);

  const flatten = (arr: any[]): any[] => {
    // A direct list of content cards.
    if (arr.some(isCard)) return arr.filter((x) => x && typeof x === "object");

    // A list of homepage sections/wrappers. Extract their actual content.
    const nested: any[] = [];
    for (const row of arr) {
      if (!row || typeof row !== "object") continue;
      for (const key of preferred) {
        if (Array.isArray(row[key])) nested.push(...flatten(row[key]));
      }
      if (Array.isArray(row.rows)) nested.push(...flatten(row.rows));
      if (Array.isArray(row.sections)) nested.push(...flatten(row.sections));
      if (row.subject && isCard(row.subject)) nested.push(row.subject);
    }
    return nested;
  };

  if (Array.isArray(root)) return flatten(root);
  if (!root || typeof root !== "object") return [];

  for (const key of preferred) {
    if (Array.isArray(root[key])) {
      const found = flatten(root[key]);
      if (found.length) return found;
    }
  }

  for (const key of ["rows", "sections", "tabs", "categories"]) {
    if (Array.isArray(root[key])) {
      const found = flatten(root[key]);
      if (found.length) return found;
    }
  }

  // Last-resort search through shallow containers.
  for (const nested of Object.values(root)) {
    if (Array.isArray(nested)) {
      const found = flatten(nested);
      if (found.length) return found;
    }
  }

  return [];
}

function stringValue(...values: any[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function imageOf(item: any): string {
  if (!item || typeof item !== "object") return "";

  const candidates = [
    item.poster, item.cover, item.thumb, item.thumbnail, item.image,
    item.posterUrl, item.coverUrl, item.thumbnailUrl, item.imageUrl,
    item.pic, item.picture, item.img, item.photo,
    item.horizontalPoster, item.horizontalCover, item.banner
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.startsWith("//") ? `https:${candidate}` : candidate;
    }
    if (candidate && typeof candidate === "object") {
      const nested = stringValue(candidate.url, candidate.src, candidate.image, candidate.path);
      if (nested) return nested.startsWith("//") ? `https:${nested}` : nested;
    }
  }

  for (const [key, value] of Object.entries(item)) {
    if (!/(poster|cover|thumb|thumbnail|image|picture|pic|banner)/i.test(key)) continue;
    if (typeof value === "string" && /^https?:|^\/\//i.test(value)) {
      return value.startsWith("//") ? `https:${value}` : value;
    }
  }

  return "";
}

function titleOf(item: any): string {
  return stringValue(
    item?.title, item?.name, item?.subjectName, item?.subject_name,
    item?.showTitle, item?.titleName, item?.itemName, item?.label,
    item?.keyword, item?.content
  ) || "Untitled";
}

function urlOf(item: any): string {
  return stringValue(
    item?.url, item?.detailPath, item?.detailUrl, item?.deepLink,
    item?.path, item?.slug, item?.subjectId, item?.subject_id, item?.id
  );
}

function metaOf(item: any): string | undefined {
  const value = stringValue(
    item?.type, item?.subjectType, item?.year, item?.releaseTime,
    item?.releaseDate, item?.status, item?.score
  );
  return value || undefined;
}

function toCard(item: any, kind: "movie" | "anime" | "komik"): CardItem {
  const url = urlOf(item);
  const title = titleOf(item);
  const encoded = encodeURIComponent(url);
  const href =
    kind === "movie" ? `/movie/watch?url=${encoded}` :
    kind === "anime" ? `/anime/watch?url=${encoded}` :
    `/komik/read?url=${encoded}`;

  return {
    id: url || title,
    title,
    image: imageOf(item),
    href,
    meta: metaOf(item),
    raw: item
  };
}

async function content(endpoint: string, kind: "movie" | "anime" | "komik", revalidate = 900): Promise<CardItem[]> {
  const data = await sansekai(endpoint, revalidate);
  const items = asArray(data);
  if (!items.length) {
    console.warn("[TWYMOVIE] Sansekai returned no content:", endpoint, JSON.stringify(data).slice(0, 1200));
  }
  return items
    .map((item) => {
      // Some section APIs wrap the actual subject in { subject: {...} }.
      const subject = item?.subject && typeof item.subject === "object" ? item.subject : item;
      return toCard(subject, kind);
    })
    .filter((item) => item.title !== "Untitled" || item.id);
}

export async function getMovieHome(): Promise<CardItem[]> {
  return content("/moviebox/homepage", "movie");
}

export async function getMovieTrending(): Promise<CardItem[]> {
  return content("/moviebox/trending", "movie");
}

export async function getAnimeLatest(): Promise<CardItem[]> {
  return content("/anime/latest", "anime");
}

export async function getAnimeRecommended(): Promise<CardItem[]> {
  return content("/anime/recommended", "anime");
}

export async function getKomikLatest(): Promise<CardItem[]> {
  return content("/komik/latest", "komik");
}

export async function getKomikPopular(): Promise<CardItem[]> {
  return content("/komik/popular", "komik");
}

export async function searchAll(query: string) {
  const q = encodeURIComponent(query);
  const [movies, anime, komik] = await Promise.allSettled([
    sansekai(`/moviebox/search?query=${q}`, 300),
    sansekai(`/anime/search?query=${q}`, 300),
    sansekai(`/komik/search?query=${q}`, 300)
  ]);

  const normalize = (result: PromiseSettledResult<any>, kind: "movie" | "anime" | "komik"): CardItem[] => {
    if (result.status !== "fulfilled") return [];
    return asArray(result.value).map((item) => {
      const subject = item?.subject && typeof item.subject === "object" ? item.subject : item;
      return toCard(subject, kind);
    });
  };

  return {
    movies: normalize(movies, "movie"),
    anime: normalize(anime, "anime"),
    komik: normalize(komik, "komik")
  };
}

export async function getMovieDetail(url: string) {
  const value = url.trim();
  try {
    return await sansekai(`/moviebox/detail?url=${encodeURIComponent(value)}`, 300);
  } catch (firstError) {
    // Some MovieBox responses expose subjectId instead of a canonical URL.
    // Retry with subjectId so cards remain playable across both response shapes.
    if (/^\\d+$/.test(value)) {
      return sansekai(`/moviebox/detail?subjectId=${encodeURIComponent(value)}`, 300);
    }
    throw firstError;
  }
}

export async function getMovieSources(url: string) {
  const value = url.trim();
  try {
    return await sansekai(`/moviebox/sources?url=${encodeURIComponent(value)}`, 120);
  } catch (firstError) {
    try {
      return await sansekai(`/moviebox/generate-link-stream-video?url=${encodeURIComponent(value)}`, 60);
    } catch {
      if (/^\\d+$/.test(value)) {
        try {
          return await sansekai(`/moviebox/sources?subjectId=${encodeURIComponent(value)}`, 120);
        } catch {}
        return sansekai(`/moviebox/generate-link-stream-video?subjectId=${encodeURIComponent(value)}`, 60);
      }
      throw firstError;
    }
  }
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
