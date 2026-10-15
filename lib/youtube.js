const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function getYouTubeVideoId(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return "";

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
      else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1] || "";
    }

    return YOUTUBE_ID_PATTERN.test(id) ? id : "";
  } catch {
    return "";
  }
}

export function getYouTubeEmbedUrl(value) {
  const id = getYouTubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
}
