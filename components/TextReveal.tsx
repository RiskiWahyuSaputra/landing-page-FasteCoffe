"use client";

import type { MotionValue } from "framer-motion";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type TextRevealProps = {
  text: string;
  className?: string;
};

function RevealCharacter({
  character,
  index,
  total,
  progress
}: {
  character: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = (index / total) * 0.55;
  const end = start + 0.24;
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  const y = useTransform(progress, [start, end], [22, 0]);

  return (
    <span className="relative inline-block">
      <span className="absolute inset-0 text-sand/10">
        {character === " " ? "\u00A0" : character}
      </span>
      <motion.span style={{ opacity, y }} className="relative inline-block">
        {character === " " ? "\u00A0" : character}
      </motion.span>
    </span>
  );
}

export default function TextReveal({ text, className = "" }: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.35"]
  });

  const characters = text.split("");

  return (
    <p ref={ref} className={className}>
      {characters.map((character, index) => (
        <RevealCharacter
          key={`${character}-${index}`}
          character={character}
          index={index}
          total={characters.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  );
}
