import Image from "next/image";
import { getMovieDetail, getMovieSources } from "@/lib/sansekai";

export const dynamic = "force-dynamic";

function pickUrl(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickUrl(item);
      if (found) return found;
    }
    return "";
  }
  if (typeof value === "object") {
    for (const key of ["url", "streamUrl", "videoUrl", "src", "playUrl", "downloadUrl"]) {
      const found = pickUrl(value[key]);
      if (found) return found;
    }
    for (const key of ["sources", "streams", "data", "result", "response", "links"]) {
      const found = pickUrl(value[key]);
      if (found) return found;
    }
  }
  return "";
}

function pickPoster(value: any): string {
  if (!value || typeof value !== "object") return "";
  for (const key of ["thumb", "cover", "poster", "thumbnail", "image", "posterUrl", "coverUrl"]) {
    const candidate = value[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return "";
}

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ url?: string }>
}) {
  const { url = "" } = await searchParams;
  const movieUrl = url.trim();

  if (!movieUrl) {
    return <main className="watch-page"><div className="empty">Movie tidak ditemukan.</div></main>;
  }

  let detail: any;
  try {
    detail = await getMovieDetail(movieUrl);
  } catch (error) {
    console.error("[TWYMOVIE] Movie detail failed:", movieUrl, error);
    return (
      <main className="watch-page">
        <div className="empty">
          Gagal mengambil data movie dari Sansekai.
        </div>
      </main>
    );
  }

  let sources: any = null;
  try {
    sources = await getMovieSources(movieUrl);
  } catch (error) {
    console.warn("[TWYMOVIE] Movie sources failed:", movieUrl, error);
  }

  const poster = pickPoster(detail);
  const stream = pickUrl(sources);
  const title = detail?.title || detail?.name || detail?.subjectName || "Movie";
  const description =
    detail?.description ||
    detail?.intro ||
    detail?.synopsis ||
    detail?.overview ||
    "Nikmati tayangan ini di TWYMOVIE.";

  return (
    <main className="watch-page">
      <div className="player">
        {stream ? (
          <video controls playsInline poster={poster || undefined}>
            <source src={stream} />
          </video>
        ) : (
          <div className="empty">Sumber video belum tersedia dari API.</div>
        )}
      </div>

      <div className="detail-grid">
        {poster && (
          <div className="detail-poster">
            <Image src={poster} alt={title} fill unoptimized />
          </div>
        )}
        <div className="detail-copy">
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </main>
  );
}
