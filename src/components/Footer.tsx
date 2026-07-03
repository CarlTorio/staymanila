type Props = {
  name: string;
  tagline?: string;
};

export function Footer({ name, tagline }: Props) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="py-8 px-6 text-center"
      style={{
        backgroundColor:
          "color-mix(in oklab, var(--color-primary) 80%, #000000)",
        color: "#ffffff",
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-2">
        <div
          className="text-2xl"
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--color-accent)",
          }}
        >
          {name}
        </div>
        {tagline && (
          <p className="text-sm text-white/70 max-w-md">{tagline}</p>
        )}
        <div className="w-16 h-px bg-white/20 my-4" />
        <p className="text-xs text-white/80">
          © {year} {name}. All rights reserved.
        </p>
        <p className="text-[11px] text-white/50">Powered by Stay Manila Diner</p>
      </div>
    </footer>
  );
}
