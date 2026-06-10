import { useRef, type ReactNode } from "react";
import {
  ArrowUpRight,
  Coffee,
  MapPin,
  QrCode,
  ShoppingBag,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavigateFn } from "@/pages/types";
import { useMawaScrollAnimations } from "@/hooks/use-mawa-scroll-animations";
import {
  cafePromises,
  galleryItems,
  mawaFacts,
  photoLibrary,
  reviews,
  signatureMenu,
} from "@/data/mawa-content";

type Props = { navigate: NavigateFn };

export function HomePage({ navigate }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  useMawaScrollAnimations(rootRef);

  return (
    <div ref={rootRef} className="overflow-hidden bg-[#f3ebdc]">
      <section className="gsap-hero relative min-h-screen overflow-hidden bg-[#281309] text-[#fff8eb]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(246,168,62,0.32),transparent_25rem),linear-gradient(90deg,rgba(17,10,6,0.96),rgba(74,29,12,0.88),rgba(17,10,6,0.98))]" />
        <div className="absolute inset-0 opacity-45 [background-image:repeating-linear-gradient(90deg,rgba(255,216,151,0.12)_0_1px,transparent_1px_74px)]" />
        <div className="mawa-pattern absolute inset-0 opacity-[0.11]" />

        <div className="mawa-container relative z-10 flex min-h-screen flex-col py-6 lg:py-8">
          <nav className="flex items-center justify-between gap-4 rounded-full border border-[#fff8eb]/14 bg-[#fff8eb]/8 px-4 py-3 backdrop-blur-xl">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mawa-pressable flex items-center gap-3 text-left"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff8eb] font-serif text-xl font-black text-[#4a1d0c]">
                M
              </span>
              <span>
                <span className="block text-lg font-black leading-none">Mawa Coffee</span>
                <span className="mt-1 hidden text-[0.62rem] font-black uppercase tracking-[0.22em] text-[#f6a83e] sm:block">
                  Coffee And Roastery
                </span>
              </span>
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              {[
                ["Menu", "/menu"],
                ["Gallery", "/gallery"],
                ["About", "/about"],
                ["Contact", "/contact"],
              ].map(([label, path]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path as Parameters<NavigateFn>[0])}
                  className="mawa-pressable rounded-full px-4 py-2 text-sm font-bold text-[#f8e4c7] hover:bg-[#fff8eb]/12"
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => navigate("/order")}
              className="mawa-pressable rounded-full bg-[#f6a83e] px-5 font-black text-[#281309] hover:bg-[#d7ff25]"
            >
              Order Now
            </Button>
          </nav>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
            <div className="max-w-3xl">
              <p data-hero-item className="text-sm font-black uppercase tracking-[0.2em] text-[#f6a83e]">
                Mawa Coffee And Roastery
              </p>
              <h1
                data-hero-item
                className="mawa-bubble-title mt-5 max-w-4xl text-[clamp(4.2rem,10vw,8.6rem)] uppercase leading-[0.78] text-[#fff8eb]"
              >
                Fresh roast.
                <br />
                Warm room.
              </h1>
              <p
                data-hero-item
                className="mt-7 max-w-xl text-lg font-bold leading-8 text-[#f8e4c7]"
              >
                Fresh roast, warm interiors, and effortless web ordering on Africa Avenue.
              </p>
              <div data-hero-item className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={() => navigate("/menu")}
                  className="gsap-cta mawa-pressable h-13 rounded-full bg-[#fff8eb] px-7 text-base font-black text-[#4a1d0c] hover:bg-[#d7ff25]"
                >
                  View Menu
                  <ArrowUpRight size={18} />
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate("/order")}
                  className="mawa-pressable h-13 rounded-full bg-[#d95b36] px-7 text-base font-black text-[#fff8eb] hover:bg-[#f6a83e] hover:text-[#281309]"
                >
                  Order Now
                </Button>
              </div>

              <div data-hero-item className="mt-10 grid gap-3 sm:grid-cols-3">
                <HeroProof value={mawaFacts.rating} label="Google rating" />
                <HeroProof value={mawaFacts.hours.split(" - ")[0]} label="Open daily" />
                <HeroProof value="QR" label="Table ordering" />
              </div>
            </div>

            <div className="relative min-h-[38rem]">
              <div data-hero-media className="mawa-photo absolute left-0 top-8 h-[29rem] w-[72%] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/35">
                <img src={photoLibrary.hero} alt="Mawa cafe atmosphere" className="mawa-image-lift" />
              </div>
              <div data-hero-media className="mawa-photo absolute bottom-0 right-8 h-60 w-60 overflow-hidden rounded-full border-8 border-[#fff8eb] shadow-2xl shadow-black/30">
                <img src={photoLibrary.latte} alt="Mawa iced coffee" className="mawa-image-lift" />
              </div>
              <div className="absolute right-0 top-0 grid w-[18rem] gap-4">
                <HeroPickCard
                  title="Top Picks"
                  price="$10"
                  image={photoLibrary.latte}
                  tone="orange"
                  action="View Menu"
                  onClick={() => navigate("/menu")}
                />
                <HeroPickCard
                  title="Best Deals"
                  price="-15%"
                  image={photoLibrary.pastries}
                  tone="lime"
                  action="Order Now"
                  onClick={() => navigate("/order")}
                />
              </div>
              <div className="absolute bottom-20 left-8 rounded-full bg-[#d7ff25] px-4 py-3 text-sm font-black text-[#254100] shadow-xl shadow-black/20">
                100% Organic
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0b3b2d] px-2 pb-3 text-[#fff8eb]">
        <div className="overflow-hidden rounded-[2rem] bg-[#fff8eb] text-[#0b3b2d]">
          <div className="mawa-container grid gap-8 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-18">
            <div className="gsap-reveal relative overflow-hidden rounded-[1.75rem] bg-[#4a1d0c] p-6 text-[#fff8eb] shadow-2xl shadow-[#201914]/20 sm:p-8">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff8eb_1px,transparent_0)] [background-size:24px_24px]" />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
                <div>
                  <p className="mawa-label text-[#f6a83e]">Roastery promise</p>
                  <h2 className="mawa-bubble-title mt-4 max-w-2xl text-5xl uppercase leading-[0.86] text-[#fff8eb] sm:text-6xl lg:text-7xl">
                    Roasted slow.
                    <br />
                    Served warm.
                  </h2>
                  <p className="mt-6 max-w-xl text-base leading-8 text-[#f8e4c7]">
                    Mawa feels calm, green, and warm: coffee roasted with care, a room made for
                    lingering, and ordering that stays out of the guest's way.
                  </p>
                </div>
                <div className="mawa-photo gsap-clip aspect-4/5 rounded-[1.35rem]">
                  <img src={photoLibrary.roaster} alt="Coffee roasting at Mawa" />
                </div>
              </div>
            </div>

            <div className="gsap-stagger grid gap-3 sm:grid-cols-2">
              {cafePromises.map((item, index) => (
                <article
                  key={item}
                  className={[
                    "mawa-hover-card min-h-44 rounded-[1.5rem] border p-5 transition",
                    index === 0
                      ? "border-[#4a1d0c] bg-[#f6a83e] text-[#281309]"
                      : index === 2
                        ? "border-[#bce800] bg-[#d9fb28] text-[#254100]"
                        : "border-[#d8c19e] bg-[#fff3df] text-[#0b3b2d]",
                  ].join(" ")}
                >
                  <PromiseIcon index={index} />
                  <p className="mt-8 max-w-xs text-xl font-black leading-tight">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0b3b2d] px-2 pb-3 text-[#fff8eb]">
        <div className="overflow-hidden rounded-[2rem] bg-[#201914]">
          <div className="mawa-container grid gap-8 py-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:py-16">
            <div className="gsap-reveal">
              <p className="mawa-label text-[#f6a83e]">From roast to table</p>
              <h2 className="mawa-display mt-4 text-5xl leading-none text-[#fff8eb] sm:text-6xl">
                A smoother café rhythm.
              </h2>
              <p className="mt-5 max-w-md text-base leading-8 text-[#dfd2bd]">
                The experience moves from fresh roast to comfortable seating to fast ordering
                without breaking the mood of the room.
              </p>
            </div>
            <div className="gsap-stagger grid gap-3 md:grid-cols-3">
              {[
                ["01", "Roast", "Fresh beans, soft caramel notes, clean finish."],
                ["02", "Settle", "Warm interiors for quick cups or longer conversations."],
                ["03", "Order", "Menu, pickup, and table ordering stay effortless."],
              ].map(([step, title, copy]) => (
                <article key={step} className="mawa-dark-panel mawa-hover-card min-h-56 p-5 transition">
                  <p className="font-serif text-5xl text-[#f6a83e]">{step}</p>
                  <h3 className="mt-8 text-2xl font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#dfd2bd]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mawa-section-pad bg-[#f3ebdc]">
        <div className="mawa-container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="gsap-reveal mawa-panel bg-[#df9a35] p-6 text-[#201914] lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mawa-label text-[#5b3512]">Signature menu</p>
                <h2 className="mawa-display mt-3 text-5xl leading-none sm:text-6xl">
                  The first cup and the plate beside it.
                </h2>
              </div>
              <Coffee className="mt-2 shrink-0 text-[#201914]" size={34} />
            </div>
            <div className="mt-8 divide-y divide-[#201914]/25">
              {signatureMenu.slice(0, 4).map((item) => (
                <div key={item.name} className="grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <h3 className="text-lg font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#4c3821]">{item.detail}</p>
                  </div>
                  <p className="font-bold">{item.price}</p>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => navigate("/menu")}
              className="mawa-pressable mt-5 h-12 w-full rounded-full bg-[#201914] text-[#fff8eb] hover:bg-[#0b3b2d]"
            >
              Explore Full Menu
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="mawa-photo gsap-clip aspect-16/10 rounded-[1.75rem]">
              <img src={photoLibrary.latte} alt="Mawa latte" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="mawa-photo gsap-clip aspect-4/3 rounded-[1.5rem]">
                <img src={photoLibrary.pastries} alt="Fresh pastry" />
              </div>
              <div className="mawa-photo gsap-clip aspect-4/3 rounded-[1.5rem]">
                <img src={photoLibrary.beans} alt="Roasted coffee beans" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mawa-section-pad bg-[#0b3b2d] text-[#fff8eb]">
        <div className="mawa-container grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="gsap-reveal">
            <QrCode className="mb-5 text-[#df9a35]" size={40} />
            <h2 className="mawa-display text-5xl leading-none sm:text-6xl lg:text-7xl">
              Scan, order, and keep talking.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#eadbc6]">
              The website sells the experience. The E-Joy table QR flow handles the rush: guests
              scan, see the right cafe menu, pay, and the kitchen gets the order.
            </p>
            <Button
              type="button"
              onClick={() => navigate("/order")}
              className="mawa-pressable mt-8 h-12 rounded-full bg-[#df9a35] px-7 text-[#201914] hover:bg-[#c98222]"
            >
              Try Web Ordering
            </Button>
          </div>
          <div className="gsap-stagger grid gap-4 sm:grid-cols-3">
            {[
              ["1", "Choose from live menu"],
              ["2", "Send pickup or dine-in order"],
              ["3", "Kitchen confirms the flow"],
            ].map(([step, label]) => (
              <article key={step} className="mawa-dark-panel min-h-48 p-5">
                <p className="font-serif text-6xl text-[#df9a35]">{step}</p>
                <p className="mt-6 text-xl font-bold leading-tight">{label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mawa-section-pad bg-[#e7dac5]">
        <div className="mawa-container grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-2">
            {galleryItems.slice(0, 4).map((item, index) => (
              <article
                key={item.title}
                className={[
                  "mawa-photo gsap-clip mawa-hover-card relative min-h-64 overflow-hidden rounded-[1.5rem] transition",
                  index === 0 ? "sm:row-span-2" : "",
                ].join(" ")}
              >
                <img src={item.image} alt={item.title} className="mawa-image-lift" />
                <div className="absolute inset-0 bg-linear-to-t from-[#06271f]/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-[#fff8eb]">
                  <p className="mawa-label text-[#df9a35]">{item.category}</p>
                  <h3 className="mt-2 text-2xl font-bold">{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
          <div className="gsap-reveal">
            <p className="mawa-label">Inside Mawa</p>
            <h2 className="mawa-section-title mt-4">The room, the roast, the ritual.</h2>
            <p className="mawa-section-copy mt-6">
              A visual rhythm of coffee, pastry, green walls, and the kind of table that turns a
              quick cup into a longer conversation.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/gallery")}
              className="mawa-pressable mt-8 rounded-full border-[#0b3b2d] bg-transparent text-[#0b3b2d] hover:bg-[#0b3b2d] hover:text-[#fff8eb]"
            >
              View Gallery
            </Button>
          </div>
        </div>
      </section>

      <section className="mawa-section-pad bg-[#fff8eb]">
        <div className="mawa-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="gsap-reveal lg:sticky lg:top-28">
            <MapPin className="mb-5 text-[#df9a35]" size={34} />
            <h2 className="mawa-section-title">What people remember after the cup.</h2>
            <p className="mawa-section-copy mt-6">
              {mawaFacts.address}. {mawaFacts.rating} stars from {mawaFacts.reviewCount} reviews,
              with a room built for slow mornings and useful meetings.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/contact")}
              className="mawa-pressable mt-8 rounded-full border-[#0b3b2d] bg-transparent text-[#0b3b2d] hover:bg-[#0b3b2d] hover:text-[#fff8eb]"
            >
              Visit Mawa
            </Button>
          </div>
          <div className="gsap-stagger grid gap-4">
            {reviews.map((review) => (
              <article key={review.quote} className="mawa-panel mawa-hover-card p-6 transition">
                <div className="flex gap-1 text-[#df9a35]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-6 text-xl leading-8 text-[#201914]">"{review.quote}"</p>
                <p className="mt-8 mawa-label">{review.author}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroProof({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#fff8eb]/18 bg-[#fff8eb]/10 p-4 text-[#fff8eb] backdrop-blur">
      <p className="text-3xl font-black text-[#f6a83e]">{value}</p>
      <p className="mt-1 text-[0.68rem] font-black uppercase leading-4 text-[#f8e4c7]">
        {label}
      </p>
    </div>
  );
}

function HeroPickCard({
  title,
  price,
  image,
  tone,
  action,
  onClick,
}: {
  title: string;
  price: string;
  image: string;
  tone: "orange" | "lime";
  action: string;
  onClick: () => void;
}) {
  return (
    <article
      className={[
        "relative min-h-52 overflow-hidden rounded-[1.75rem] p-5 text-[#4a1d0c] shadow-2xl shadow-black/20",
        tone === "orange" ? "bg-[#f6a83e]" : "bg-[#d9fb28]",
      ].join(" ")}
    >
      <h2 className="mawa-bubble-title relative z-10 text-4xl leading-none sm:text-5xl">
        {title}
      </h2>
      <img
        src={image}
        alt=""
        className="absolute bottom-8 right-4 h-32 w-32 rounded-full border-8 border-[#fff8eb]/80 object-cover shadow-xl shadow-black/20"
      />
      <span className="absolute right-8 top-24 z-10 rounded-full bg-[#ffe06d] px-3 py-2 text-sm font-black text-[#9d4b15]">
        {price}
      </span>
      <button
        type="button"
        onClick={onClick}
        className="mawa-pressable absolute bottom-5 left-5 z-10 flex items-center gap-2 rounded-full bg-[#fff8eb] px-4 py-2 text-xs font-black text-[#4a1d0c]"
      >
        {action}
        <ShoppingBag size={14} />
      </button>
    </article>
  );
}

function PromiseIcon({ index }: { index: number }) {
  const icons: ReactNode[] = [
    <Coffee key="coffee" size={22} />,
    <ShoppingBag key="bag" size={22} />,
    <QrCode key="qr" size={22} />,
    <MapPin key="map" size={22} />,
  ];

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b3b2d] text-[#df9a35]">
      {icons[index % icons.length]}
    </div>
  );
}
