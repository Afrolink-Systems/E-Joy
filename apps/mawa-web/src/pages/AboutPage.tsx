import { useRef } from "react";
import { Coffee, Leaf, MapPin, Star } from "lucide-react";
import { mawaFacts, photoLibrary } from "@/data/mawa-content";
import { useMawaScrollAnimations } from "@/hooks/use-mawa-scroll-animations";

const values = [
  {
    title: "Roasted with attention",
    copy: "Mawa's mood is rooted in careful coffee: warm, green, simple, and made for daily rituals.",
    icon: Coffee,
  },
  {
    title: "A calm Addis room",
    copy: "A cafe experience that feels useful in the morning, relaxed in the afternoon, and welcoming at night.",
    icon: Leaf,
  },
  {
    title: "Designed for modern ordering",
    copy: "The physical table and the digital order flow work together so guests can stay in the moment.",
    icon: MapPin,
  },
];

export function AboutPage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useMawaScrollAnimations(rootRef);

  return (
    <div ref={rootRef} className="bg-[#f3ebdc]">
      <section className="mawa-container mawa-section-pad grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="gsap-reveal">
          <p className="mawa-label">About Mawa</p>
          <h1 className="mawa-display mt-4 text-6xl leading-none text-[#0b3b2d] sm:text-7xl lg:text-8xl">
            A coffee house with a roastery heart.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f564d]">
            Mawa Coffee and Roastery is built around the feeling of a good table: rich coffee,
            warm wood, quiet service, and a brand language that belongs to Addis Ababa.
          </p>
        </div>
        <div className="mawa-photo gsap-clip aspect-4/5 rounded-[1.75rem]">
          <img src={photoLibrary.roaster} alt="Coffee roasting at Mawa" />
        </div>
      </section>

      <section className="mawa-section-pad bg-[#0b3b2d] text-[#fff8eb]">
        <div className="gsap-stagger mawa-container grid gap-6 lg:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="mawa-dark-panel mawa-hover-card p-6 transition">
                <Icon className="text-[#df9a35]" size={34} />
                <h2 className="mt-8 text-2xl font-bold">{value.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#eadbc6]">{value.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mawa-container mawa-section-pad grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="gsap-reveal mawa-panel p-8">
          <div className="flex gap-1 text-[#df9a35]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={18} fill="currentColor" />
            ))}
          </div>
          <p className="mt-5 text-6xl font-black text-[#0b3b2d]">{mawaFacts.rating}</p>
          <p className="mawa-label mt-2">{mawaFacts.reviewCount} Google reviews</p>
          <p className="mt-6 leading-8 text-[#5f564d]">
            A young cafe with a strong first signal: guests are already rating the room, service,
            and coffee highly.
          </p>
        </div>
        <div className="mawa-photo gsap-clip aspect-16/10 rounded-[1.75rem]">
          <img src={photoLibrary.table} alt="Mawa cafe seating" />
        </div>
      </section>
    </div>
  );
}
