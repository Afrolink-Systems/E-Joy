import { useMemo, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

function setReducedMotionState(root: HTMLElement) {
  root.querySelectorAll(".gsap-hero [data-hero-item]").forEach((el) => {
    gsap.set(el as HTMLElement, { autoAlpha: 1, y: 0, scale: 1, clearProps: "transform" });
  });
  root.querySelectorAll(".gsap-reveal").forEach((el) => {
    gsap.set(el as HTMLElement, { autoAlpha: 1, y: 0, clearProps: "transform" });
  });
  root.querySelectorAll(".gsap-stagger").forEach((list) => {
    Array.from(list.children).forEach((child) => {
      gsap.set(child as HTMLElement, { autoAlpha: 1, y: 0, clearProps: "transform" });
    });
  });
  root.querySelectorAll(".gsap-parallax").forEach((el) => {
    gsap.set(el as HTMLElement, { y: 0, clearProps: "transform" });
  });
  root.querySelectorAll(".gsap-clip").forEach((el) => {
    gsap.set(el as HTMLElement, { clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
  });
  root.querySelectorAll(".gsap-float").forEach((el) => {
    gsap.set(el as HTMLElement, { y: 0, rotate: 0, clearProps: "transform" });
  });
}

/**
 * GSAP + ScrollTrigger scoped to a container ref (e.g. home page root).
 * Use class hooks: .gsap-reveal, .gsap-stagger (direct children), .gsap-parallax, .gsap-cta
 */
export function useMawaScrollAnimations(scope: RefObject<HTMLElement | null>) {
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return undefined;

      if (reducedMotion) {
        setReducedMotionState(root);
        return undefined;
      }

      const interactionCleanups: Array<() => void> = [];
      const mediaMatcher = gsap.matchMedia();

      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>(".gsap-hero");
        if (hero) {
          const heroItems = hero.querySelectorAll<HTMLElement>("[data-hero-item]");
          const heroMedia = hero.querySelectorAll<HTMLElement>("[data-hero-media]");
          const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
          heroTl
            .fromTo(
              heroItems,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 0.84, stagger: 0.08 },
            )
            .fromTo(
              heroMedia,
              { autoAlpha: 0, y: 34, scale: 0.97 },
              { autoAlpha: 1, y: 0, scale: 1, duration: 1, stagger: 0.1 },
              "<0.16",
            );
        }

        const reveals = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".gsap-reveal"),
        );
        reveals.forEach((item) => {
          gsap.fromTo(
            item,
            { autoAlpha: 0, y: 34 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.82,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 82%",
                once: true,
              },
            },
          );
        });

        const staggerLists = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".gsap-stagger"),
        );
        staggerLists.forEach((list) => {
          const items = list.children;
          if (items.length === 0) return;
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.68,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: list,
                start: "top 85%",
                once: true,
              },
            },
          );
        });

        const parallaxEls = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".gsap-parallax"),
        );
        mediaMatcher.add("(min-width: 768px)", () => {
          parallaxEls.forEach((el) => {
            gsap.fromTo(
              el,
              { y: -24 },
              {
                y: 28,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest("section") ?? root,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            );
          });
        });

        const clipEls = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".gsap-clip"),
        );
        clipEls.forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(12% 10% 12% 10%)", scale: 1.04 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 82%",
                once: true,
              },
            },
          );
        });

        const floatEls = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".gsap-float"),
        );
        floatEls.forEach((el, index) => {
          gsap.to(el, {
            y: index % 2 === 0 ? -10 : 10,
            rotate: index % 2 === 0 ? -0.6 : 0.6,
            duration: 3.6 + index * 0.25,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });

        const ctaButtons = gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(".gsap-cta, .mawa-pressable"),
        );
        ctaButtons.forEach((button) => {
          const enter = () => {
            gsap.to(button, { y: -2, duration: 0.18, ease: "power2.out", overwrite: "auto" });
          };
          const leave = () => {
            gsap.to(button, { y: 0, duration: 0.18, ease: "power2.out", overwrite: "auto" });
          };
          button.addEventListener("mouseenter", enter);
          button.addEventListener("mouseleave", leave);
          interactionCleanups.push(() => {
            button.removeEventListener("mouseenter", enter);
            button.removeEventListener("mouseleave", leave);
          });
        });

        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      }, root);

      return () => {
        interactionCleanups.forEach((fn) => fn());
        mediaMatcher.revert();
        ctx.revert();
      };
    },
    { scope, dependencies: [reducedMotion] },
  );
}
