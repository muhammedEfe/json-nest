// ───────── Analytics (GTM dataLayer) ─────────
// Tek tool'lu uygulama (JSON Tools). Event'leri GTM dataLayer'a manuel push
// ediyoruz; her event'e sabit tool_id ve güncel sayfa konumu eklenir. SSR
// olduğu için typeof window guard zorunlu.

const TOOL_ID = "json-tools";

interface DataLayerObject {
  event: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
  }
}

/**
 * GTM dataLayer'a bir event push eder. tool_id sabittir (tek tool); page_path /
 * page_location otomatik eklenir, böylece GTM'de URL path bazlı kural yazılabilir.
 */
export function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    tool_id: TOOL_ID,
    page_path: window.location.pathname,
    page_location: window.location.href,
    ...params,
  });
}
