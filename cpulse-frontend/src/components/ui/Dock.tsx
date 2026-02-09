import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";
import GlassSurface from "./GlassSurface";

export interface DockItemData {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
  iconColorClass?: string;
}

interface DockProps {
  items: DockItemData[];
  className?: string;
  spring?: SpringOptions;
  magnification?: number;
  distance?: number;
  baseItemSize?: number;
}

function DockItem({
  icon,
  label,
  onClick,
  isActive,
  iconColorClass,
  mouseX,
  spring,
  magnification,
  distance,
  baseItemSize,
}: DockItemData & {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
  baseItemSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distanceCalc = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return distance;
    return val - rect.x - rect.width / 2;
  });

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );

  const size = useSpring(sizeTransform, spring);

  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-8 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-[11px] font-medium text-gray-200 whitespace-nowrap pointer-events-none z-50"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass Icon Container */}
      <GlassSurface
        width="100%"
        height="100%"
        borderRadius={14}
        brightness={isActive ? 60 : 48}
        backgroundOpacity={isActive ? 0.1 : 0.04}
        blur={10}
        className={`cursor-pointer transition-all duration-200 ${
          isActive
            ? "shadow-[0_0_16px_rgba(99,102,241,0.3)]"
            : "hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]"
        }`}
      >
        <div
          className={`flex items-center justify-center w-full h-full ${
            iconColorClass || (isActive ? "text-indigo-300" : "text-gray-400")
          }`}
        >
          {icon}
        </div>
      </GlassSurface>

      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="dock-active-indicator"
          className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]"
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      )}
    </motion.div>
  );
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 64,
  distance = 140,
  baseItemSize = 46,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden lg:flex items-end gap-2 px-3 py-2 rounded-2xl border border-white/[0.08] bg-[#0a0a1a]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
    >
      {items.map((item, i) => (
        <DockItem
          key={i}
          {...item}
          mouseX={mouseX}
          spring={spring}
          magnification={magnification}
          distance={distance}
          baseItemSize={baseItemSize}
        />
      ))}
    </motion.div>
  );
}
