type BackgroundVideoProps = {
  videoUrl?: string | null;
  posterUrl?: string | null;
};

export function BackgroundVideo({ videoUrl, posterUrl }: BackgroundVideoProps) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      <div
        className="background-still absolute inset-0 bg-cover bg-center"
        style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      />
      {videoUrl ? (
        <video
          className="absolute inset-0 hidden h-full w-full object-cover motion-safe:block"
          poster={posterUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src={videoUrl} />
        </video>
      ) : null}
      <div className="absolute inset-0 bg-black/58" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.28)_62%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}
