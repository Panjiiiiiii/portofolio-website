"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { loadGsap } from "@/lib/gsap";
import type { Anchor, ObjectId } from "@/lib/hero-layout";

// One WebGL context for the hero's one glyph. Built from primitives:
// no model files, no remote assets, no environment map (lights only).
const ACCENT = "#00A19B";

const FOV = 30;
const CAMERA_Z = 10;
const UNITS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); // world height at z = 0

/** Width of the glyph in world units, so a pixel size can be mapped to a scale. */
const LOCAL_WIDTH = 4.3;

/** Scroll parallax as the hero scrolls out. dy: share of the hero height it lags behind. */
const DEPTH = { dy: 0.1, rotY: 1.1, rotZ: 0.12, dscale: 0.12, dz: -1.5, mouse: 0.35 };

type Pointer = { x: number; y: number };

/* ---------- geometry helpers ---------- */

function chevronGeometry(dir: 1 | -1) {
  const S = 0.34;
  const OX = -0.52;
  const TX = 0.3;
  const H = 1.0;
  const pts: [number, number][] = [
    [TX, H],
    [TX + S, H],
    [OX + S, 0],
    [TX + S, -H],
    [TX, -H],
    [OX, 0],
  ];
  const shape = new THREE.Shape();
  pts.forEach(([x, y], i) => {
    if (i === 0) shape.moveTo(x * dir, y);
    else shape.lineTo(x * dir, y);
  });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false });
  geo.center();
  return geo;
}

function useDisposable<T extends THREE.BufferGeometry>(make: () => T): T {
  const [geo] = useState(make);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

/* ---------- the glyph ---------- */

function Glyph() {
  const left = useDisposable(() => chevronGeometry(1));
  const right = useDisposable(() => chevronGeometry(-1));
  const slash = useDisposable(() => new THREE.BoxGeometry(0.3, 2.3, 0.5));
  const part = (geometry: THREE.BufferGeometry, x: number, rz = 0) => (
    <mesh geometry={geometry} position={[x, 0, 0]} rotation={[0, 0, rz]}>
      <meshStandardMaterial color={ACCENT} roughness={0.6} metalness={0} toneMapped={false} />
      <Edges threshold={15} color="#ECEAF2" lineWidth={1} transparent opacity={0.35} />
    </mesh>
  );
  return (
    <group>
      {part(left, -1.55)}
      {part(slash, 0, -0.32)}
      {part(right, 1.55)}
    </group>
  );
}

/* ---------- scene: layout, float, mouse and scroll parallax ---------- */

function Scene({
  pointer,
  progress,
  anchors,
}: {
  pointer: React.RefObject<Pointer>;
  progress: React.RefObject<number>;
  anchors: Record<ObjectId, Anchor | null>;
}) {
  const size = useThree((s) => s.size);
  const glyphRef = useRef<THREE.Group>(null);
  const smooth = useRef(0);

  useFrame((state, dt) => {
    // One scroll value, smoothed here so scrubbing never looks stepped.
    smooth.current = THREE.MathUtils.lerp(smooth.current, progress.current ?? 0, 1 - Math.exp(-dt * 6));
    const p = smooth.current;
    const t = state.clock.elapsedTime;
    const ppu = size.height / UNITS_H;
    const pt = pointer.current ?? { x: 0, y: 0 };
    const g = glyphRef.current;
    const a = anchors.glyph;
    if (!g) return;
    if (!a) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const base = a.size / (ppu * LOCAL_WIDTH);
    const bob = Math.sin(t * 0.8) * 0.1;
    const swing = Math.sin(t * 0.35) * 0.4;

    g.position.set(
      (a.cx - size.width / 2) / ppu,
      (size.height / 2 - a.cy) / ppu + bob - p * DEPTH.dy * UNITS_H,
      p * DEPTH.dz,
    );
    g.scale.setScalar(base * (1 - p * DEPTH.dscale));
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, swing + pt.x * DEPTH.mouse + p * DEPTH.rotY, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pt.y * 0.22 + Math.sin(t * 0.27) * 0.08, 3, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, p * DEPTH.rotZ, 3, dt);
  });

  return (
    <group ref={glyphRef}>
      <Glyph />
    </group>
  );
}
export default function HeroScene({
  active,
  onReady,
  getTrigger,
  anchors,
}: {
  active: boolean;
  onReady: () => void;
  anchors: Record<ObjectId, Anchor | null>;
  /** The hero section: its scroll-out drives the parallax. */
  getTrigger: () => HTMLElement | null;
}) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const progress = useRef(0);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // One ScrollTrigger scrub value for the whole scene. The hero is not pinned.
  useEffect(() => {
    const el = getTrigger();
    if (!el) return;
    let cancelled = false;
    let kill: (() => void) | undefined;
    loadGsap().then(({ ScrollTrigger }) => {
      if (cancelled) return;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      kill = () => st.kill();
    });
    return () => {
      cancelled = true;
      kill?.();
    };
  }, [getTrigger]);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      // R3F sets pointer-events: auto on its wrapper; this style is spread after it and wins,
      // so the canvas never sits between the user and the hero copy or blocks wheel/touch scroll.
      style={{ pointerEvents: "none" }}
      // Nothing in the scene is interactive: detach R3F's DOM listeners and stop raycasting.
      onCreated={(state) => {
        state.events.disconnect?.();
        state.set({ events: { ...state.events, enabled: false } });
        onReady();
      }}
    >
      {/* Lights only, no environment map (that would fetch an HDRI). */}
      <hemisphereLight args={["#ffffff", "#1a1a22", 1.0]} />
      <directionalLight position={[3, 5, 6]} intensity={1.9} />
      <directionalLight position={[-5, 1, 3]} intensity={0.6} />
      <directionalLight position={[0, 0.5, 8]} intensity={0.7} />
      <Scene pointer={pointer} progress={progress} anchors={anchors} />
    </Canvas>
  );
}
