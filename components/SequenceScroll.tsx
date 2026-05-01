"use client";

import type { MotionValue } from "framer-motion";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import MagneticButton from "@/components/MagneticButton";

const TOTAL_FRAMES = 240;

type Alignment = "left" | "center" | "right";

type StoryScene = {
  title: string;
  subtitle?: string;
  align: Alignment;
  range: [number, number, number, number];
  cta?: boolean;
};

const scenes: StoryScene[] = [
  {
    title: "Faste Coffee",
    subtitle: "Brewed for Your Daily Energy",
    align: "center",
    range: [0, 0.08, 0.17, 0.28],
  },
  {
    title: "Crafted from premium beans",
    subtitle: "Rich flavor, bold aroma",
    align: "center",
    range: [0.18, 0.27, 0.38, 0.49],
  },
  {
    title: "From farm to your cup",
    subtitle: "Freshly roasted every day",
    align: "left",
    range: [0.39, 0.48, 0.59, 0.7],
  },
  {
    title: "Experience modern coffee culture",
    subtitle: "Fast / Fresh / Flavorful",
    align: "right",
    range: [0.6, 0.69, 0.8, 0.89],
  },
  {
    title: "Start your day with Faste Coffee",
    align: "center",
    range: [0.8, 0.87, 0.93, 0.975],
  },
  {
    title: "Order your coffee now",
    align: "center",
    range: [0.92, 0.965, 1, 1],
    cta: true,
  },
];

function frameSource(index: number) {
  return `/sequence/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
}

function StoryOverlay({
  progress,
  scene,
}: {
  progress: MotionValue<number>;
  scene: StoryScene;
}) {
  const opacity = useTransform(progress, scene.range, [0, 1, 1, 0]);
  const y = useTransform(progress, scene.range, [72, 0, 0, -40]);
  const blur = useTransform(progress, scene.range, [18, 0, 0, 18]);
  const filter = useMotionTemplate`blur(${blur}px)`;
  const titleY = useTransform(progress, scene.range, [92, 0, 0, -48]);
  const subtitleY = useTransform(progress, scene.range, [112, 16, 0, -36]);
  const badgeY = useTransform(progress, scene.range, [56, 0, 0, -24]);

  const alignmentClass =
    scene.align === "left"
      ? "left-[8vw] items-start text-left md:left-[10vw]"
      : scene.align === "right"
        ? "right-[8vw] items-end text-right md:right-[10vw]"
        : "left-1/2 -translate-x-1/2 items-center text-center";

  return (
    <motion.div
      style={{ opacity, y, filter }}
      className={`absolute top-[20vh] flex max-w-[34rem] flex-col gap-4 ${alignmentClass}`}
    >
      <motion.div
        style={{ y: badgeY }}
        className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-sand/82 backdrop-blur-md"
      >
        Premium coffee scrollytelling
      </motion.div>
      <motion.h2
        style={{ y: titleY }}
        className="text-balance text-[clamp(2.6rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-cream"
      >
        {scene.title}
      </motion.h2>
      {scene.subtitle ? (
        <motion.p
          style={{ y: subtitleY }}
          className="max-w-md text-balance text-base leading-7 text-sand/78 md:text-lg"
        >
          {scene.subtitle}
        </motion.p>
      ) : null}

      {scene.cta ? (
        <div className="pointer-events-auto mt-4">
          <MagneticButton href="#menu">Explore Menu</MagneticButton>
        </div>
      ) : null}
    </motion.div>
  );
}

export default function SequenceScroll() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const renderedFrameRef = useRef(-1);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const animationFrameRef = useRef(0);
  const [isReady, setIsReady] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const image = imagesRef.current[index];

    if (!canvas || !image) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;

    if (!width || !height) {
      return;
    }

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#140c08";
    context.fillRect(0, 0, width, height);

    const scale = Math.max(
      width / image.naturalWidth,
      height / image.naturalHeight,
    );
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    renderedFrameRef.current = index;
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(Math.max(renderedFrameRef.current, 0));
  }, [drawFrame]);

  useEffect(() => {
    let loadedCount = 0;
    let isCancelled = false;

    const images = Array.from({ length: TOTAL_FRAMES }, (_, index) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = frameSource(index);

      const markLoaded = () => {
        loadedCount += 1;

        if (loadedCount === TOTAL_FRAMES && !isCancelled) {
          imagesRef.current = images;
          setIsReady(true);
          renderedFrameRef.current = 0;
          currentFrameRef.current = 0;
          targetFrameRef.current = 0;

          window.requestAnimationFrame(() => {
            resizeCanvas();
            drawFrame(0);
          });
        }
      };

      image.onload = markLoaded;
      image.onerror = markLoaded;

      return image;
    });

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, [drawFrame, resizeCanvas]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const loop = () => {
      currentFrameRef.current +=
        (targetFrameRef.current - currentFrameRef.current) * 0.22;
      const nextFrame = Math.round(currentFrameRef.current);

      if (nextFrame !== renderedFrameRef.current) {
        drawFrame(nextFrame);
      }

      animationFrameRef.current = window.requestAnimationFrame(loop);
    };

    animationFrameRef.current = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [drawFrame, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isReady, resizeCanvas]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    targetFrameRef.current = latest * (TOTAL_FRAMES - 1);
  });

  const progressBar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative h-[400vh] bg-page">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,153,95,0.18),transparent_28%),linear-gradient(180deg,rgba(20,12,8,0.2),rgba(20,12,8,0.82))]" />
        <canvas ref={canvasRef} className="h-full w-full" />

        <div className="pointer-events-none absolute inset-0">
          <div className="page-shell flex h-full items-end justify-between pb-10">
            <div className="w-28">
              <motion.div
                style={{ width: progressBar }}
                className="h-px bg-copper shadow-[0_0_24px_rgba(212,153,95,0.7)]"
              />
            </div>
          </div>

          {scenes.map((scene) => (
            <StoryOverlay
              key={scene.title}
              progress={scrollYProgress}
              scene={scene}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
