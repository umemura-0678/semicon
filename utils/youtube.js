export function getYoutubeId(url) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return videoId;
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if ((parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") && parts[1]) {
        return parts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}
