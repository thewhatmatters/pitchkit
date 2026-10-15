import { ImageResponse } from "next/og";
import { geistBoldWoff } from "@/lib/og-fonts/geist-bold";
import { publicObjectUrl } from "@/lib/r2";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, sharePreview } from "@/lib/share-preview";
import { hiddenOverlayForHandle, loadPublicKit } from "@/lib/store";

/**
 * Link-preview card, 1200×630 PNG (Product Designer spec 2026-10-14).
 * Few, large words. Text stays inside the 60px safe inset; name + KPIs sit in
 * the centred 630 square. Read-only GET: no writes, no session.
 */
const BG = "#f3efe9";
const FG = "#1c1917";
const MUTED = "#57534e";

async function avatarDataUrl(r2Key: string | null): Promise<string | null> {
  const url = publicObjectUrl(r2Key);
  if (!url.startsWith("https://")) return null;
  try {
    const res = await fetch(url);
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(png|jpe?g)/.test(type)) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const kit = await loadPublicKit(handle, new Date(), await hiddenOverlayForHandle(handle));
  if (!kit) {
    return new Response("Not found", { status: 404 });
  }
  const preview = sharePreview(kit);
  const name = kit.user.name?.trim() || `@${kit.user.handle}`;
  const nameSize = name.length > 18 ? 60 : 76;
  const avatar = await avatarDataUrl(kit.user.avatar_r2_key);
  const initial = (name.replace(/^@/, "")[0] ?? "P").toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: BG, padding: 60, position: "relative", color: FG }}>
        <div style={{ width: 300, height: 300, borderRadius: 300, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} width={280} height={280} style={{ borderRadius: 280, objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ width: 280, height: 280, borderRadius: 280, background: "#d6cfc4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, color: FG }}>
              {initial}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, maxWidth: 664, gap: 8 }}>
          <div style={{ fontSize: nameSize, lineHeight: 1.1, fontFamily: "Geist Bold", fontWeight: 700, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 664 }}>{name}</div>
          <div style={{ fontSize: 40, color: MUTED }}>{`@${kit.user.handle}`}</div>
          {preview.kpis ? (
            <div style={{ display: "flex", gap: 48, marginTop: 36 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 60, lineHeight: 1 }}>{preview.kpis.followers}</div>
                <div style={{ fontSize: 28, color: MUTED, marginTop: 8 }}>followers</div>
              </div>
              {preview.kpis.engagement ? (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 60, lineHeight: 1 }}>{preview.kpis.engagement}</div>
                  <div style={{ fontSize: 28, color: MUTED, marginTop: 8 }}>engagement</div>
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ display: "flex", marginTop: 36 }}>
              <div style={{ fontSize: 32, padding: "12px 28px", borderRadius: 999, background: "#ffffff", color: FG }}>Instagram media kit</div>
            </div>
          )}
        </div>
        {preview.example ? (
          <div style={{ position: "absolute", top: 60, right: 60, fontSize: 28, color: MUTED, padding: "8px 20px", borderRadius: 999, border: `2px solid ${MUTED}` }}>Example data</div>
        ) : null}
        <div style={{ position: "absolute", bottom: 60, right: 60, fontSize: 28, color: FG }}>Pitchkit</div>
      </div>
    ),
    {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts: [{ name: "Geist Bold", data: geistBoldWoff(), weight: 700, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}
