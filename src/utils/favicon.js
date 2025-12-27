export function updateFavicon(icon) {
  if (!icon) return;

  let link =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.type = "image/png";
  link.href = icon;
}
