export function isFormsUrl(url) {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    return (
      host === "forms.cloud.microsoft" ||
      host === "forms.office.com" ||
      host === "forms.microsoft.com"
    );
  } catch {
    return false;
  }
}
