import { MapPin, Phone, Mail, Clock, Facebook, Instagram } from "lucide-react";

type Props = {
  settings: Record<string, string>;
};

export function ContactSection({ settings }: Props) {
  const {
    address,
    phone,
    email,
    hours_weekday,
    hours_weekend,
    facebook_url,
    instagram_url,
    google_maps_embed,
  } = settings;

  return (
    <section
      id="contact"
      className="py-12 md:py-20"
      style={{ backgroundColor: "var(--color-primary)", color: "#ffffff" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <h2
            className="text-3xl md:text-5xl"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--color-accent)",
            }}
          >
            Find Us
          </h2>
          <div
            className="mx-auto mt-4 h-[2px] w-16 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          {/* Contact info */}
          <div className="space-y-6">
            {address && (
              <InfoRow icon={<MapPin size={20} />} label="Address">
                {address}
              </InfoRow>
            )}
            {phone && (
              <InfoRow icon={<Phone size={20} />} label="Phone">
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </InfoRow>
            )}
            {email && (
              <InfoRow icon={<Mail size={20} />} label="Email">
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </InfoRow>
            )}
            {(hours_weekday || hours_weekend) && (
              <InfoRow icon={<Clock size={20} />} label="Hours">
                {hours_weekday && <div>{hours_weekday}</div>}
                {hours_weekend && <div>{hours_weekend}</div>}
              </InfoRow>
            )}

            {facebook_url && (
              <a
                href={facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-3 w-full md:w-auto px-6 py-4 rounded-xl text-base font-semibold transition-transform hover:scale-[1.02] shadow-lg"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#1a1a1a",
                }}
              >
                <Facebook size={22} />
                Send us a message on Facebook
              </a>
            )}
            {instagram_url && (
              <div className="flex gap-3 pt-2">
                <SocialLink href={instagram_url} label="Instagram">
                  <Instagram size={18} />
                </SocialLink>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="w-full">
            {google_maps_embed ? (
              <div
                className="rounded-xl overflow-hidden shadow-lg w-full"
                style={{ height: 300 }}
              >
                <iframe
                  src={google_maps_embed}
                  title="Map"
                  loading="lazy"
                  className="w-full h-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="rounded-xl flex flex-col items-center justify-center gap-3 w-full"
                style={{
                  height: 300,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px dashed rgba(255,255,255,0.2)",
                }}
              >
                <MapPin size={42} style={{ color: "var(--color-accent)" }} />
                <p className="text-sm opacity-80">Map coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "var(--color-accent)",
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider opacity-60 mb-1">
          {label}
        </div>
        <div className="text-sm md:text-base leading-relaxed text-white/90">
          {children}
        </div>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "#ffffff",
      }}
    >
      {children}
    </a>
  );
}
