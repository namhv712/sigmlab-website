// Hero banner for the World Cup tab — the "Nhà cái đến từ Hải Phòng" artwork.
// Plain <img> (the site uses static export with unoptimized images); the gold
// frame + glow comes from the .wc-banner class in wc-theme.css.
export default function WcBanner({ priority = false }: { priority?: boolean }) {
  return (
    <div className="wc-banner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/wc/banner.jpg"
        alt="Nhà cái đến từ Hải Phòng — World Cup 2026"
        width={1280}
        height={548}
        loading={priority ? 'eager' : 'lazy'}
        // @ts-expect-error fetchpriority is a valid HTML attr not yet typed
        fetchpriority={priority ? 'high' : undefined}
      />
    </div>
  )
}
