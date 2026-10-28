"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { loadGsap } from "@/lib/gsap";
import type { Anchor, ObjectId } from "@/lib/hero-layout";

// One shared WebGL context for all three objects. Everything is built from primitives:
// no model files, no remote assets, no environment map (lights only).
const ACCENT = "#00A19B";
const BODY = "#2b2b34"; // near-black, lifted a little so the shape reads on #09090B
const DARK = "#0c0c0f";

const FOV = 30;
const CAMERA_Z = 10;
const UNITS_H = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2)); // world height at z = 0

/** Width of each object in world units, so a pixel size can be mapped to a scale. */
const LOCAL_WIDTH: Record<ObjectId, number> = { glyph: 4.3, gamepad: 3.5, helmet: 2.1 };

/** Scroll depth per object. dy: share of the hero height it lags (+) or leads (-). */
const DEPTH: Record<ObjectId, { dy: number; rotY: number; rotZ: number; dscale: number; dz: number; mouse: number }> = {
  glyph: { dy: 0.1, rotY: 1.1, rotZ: 0.12, dscale: 0.12, dz: -1.5, mouse: 0.35 },
  gamepad: { dy: -0.08, rotY: -0.9, rotZ: -0.2, dscale: 0.18, dz: 1.2, mouse: 0.45 },
  helmet: { dy: 0.28, rotY: 1.5, rotZ: 0.1, dscale: 0.1, dz: -3, mouse: 0.5 },
};

type Pointer = { x: number; y: number };

/* ---------- geometry helpers ---------- */

function roundedRect(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function extrudeRounded(w: number, h: number, r: number, depth: number) {
  const geo = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

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

/* ---------- the three objects ---------- */

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

function Gamepad() {
  const body = useDisposable(() => extrudeRounded(3.0, 1.35, 0.55, 0.4));
  const grip = useDisposable(() => extrudeRounded(0.95, 1.5, 0.42, 0.38));
  const dpadH = useDisposable(() => new THREE.BoxGeometry(0.55, 0.18, 0.12));
  const dpadV = useDisposable(() => new THREE.BoxGeometry(0.18, 0.55, 0.12));
  const button = useDisposable(() => new THREE.CylinderGeometry(0.11, 0.11, 0.09, 20));
  const stickBase = useDisposable(() => new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24));
  const stickCap = useDisposable(() => new THREE.CylinderGeometry(0.15, 0.17, 0.14, 24));
  const z = 0.27; // just in front of the body face
  const mat = (color: string, rough = 0.5) => (
    <meshStandardMaterial color={color} roughness={rough} metalness={0.05} />
  );
  const faceButtons: [number, number, string][] = [
    [0, 0.28, DARK],
    [0, -0.28, DARK],
    [-0.28, 0, DARK],
    [0.28, 0, ACCENT], // the one accent button
  ];
  return (
    <group rotation={[-0.22, 0, 0]}>
      <mesh geometry={body}>
        {mat(BODY)}
        <Edges threshold={20} color="#ECEAF2" lineWidth={1} transparent opacity={0.25} />
      </mesh>
      <mesh geometry={grip} position={[-1.22, -0.72, -0.02]} rotation={[0, 0, 0.3]}>
        {mat(BODY)}
      </mesh>
      <mesh geometry={grip} position={[1.22, -0.72, -0.02]} rotation={[0, 0, -0.3]}>
        {mat(BODY)}
      </mesh>

      {/* d-pad: two crossed boxes */}
      <mesh geometry={dpadH} position={[-0.88, 0.17, z]}>{mat(DARK)}</mesh>
      <mesh geometry={dpadV} position={[-0.88, 0.17, z]}>{mat(DARK)}</mesh>

      {/* four face buttons */}
      {faceButtons.map(([x, y, color]) => (
        <mesh key={`${x}${y}`} geometry={button} position={[0.88 + x, 0.17 + y, z]} rotation={[Math.PI / 2, 0, 0]}>
          {mat(color, 0.4)}
        </mesh>
      ))}

      {/* two thumbsticks */}
      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, -0.28, z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={stickBase}>{mat(DARK)}</mesh>
          <mesh geometry={stickCap} position={[0, 0.1, 0]}>{mat("#2f2f38")}</mesh>
        </group>
      ))}
    </group>
  );
}

function Helmet() {
  const shell = useDisposable(() => new THREE.SphereGeometry(1, 40, 28));
  const visor = useDisposable(() => new THREE.SphereGeometry(1, 36, 22));
  const chin = useDisposable(() => new THREE.SphereGeometry(1, 28, 16));
  const stripe = useDisposable(() => new THREE.TorusGeometry(1, 0.06, 10, 56, Math.PI));
  const shellColor = "#363640";
  return (
    <group rotation={[0.08, -0.45, 0]}>
      <mesh geometry={shell} scale={[0.95, 1, 1.15]}>
        <meshStandardMaterial color={shellColor} roughness={0.4} metalness={0.05} />
      </mesh>
      {/* visor: a dark glossy ellipsoid set into the front of the shell */}
      <mesh geometry={visor} position={[0, 0.12, 0.82]} scale={[0.8, 0.34, 0.42]}>
        <meshStandardMaterial color="#050507" roughness={0.12} metalness={0.3} />
      </mesh>
      {/* chin bar */}
      <mesh geometry={chin} position={[0, -0.6, 0.93]} scale={[0.5, 0.2, 0.3]}>
        <meshStandardMaterial color="#2a2a33" roughness={0.4} metalness={0.05} />
      </mesh>
      {/* the one accent stripe, over the top from front to back */}
      <mesh geometry={stripe} rotation={[0, Math.PI / 2, 0]} scale={[1.17, 1.03, 1]}>
        <meshStandardMaterial color={ACCENT} roughness={0.5} toneMapped={false} />
      </mesh>
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
  const gamepadRef = useRef<THREE.Group>(null);
  const helmetRef = useRef<THREE.Group>(null);
  const smooth = useRef(0);
  const phase: Record<ObjectId, number> = { glyph: 0, gamepad: 2.1, helmet: 4.2 };

  useFrame((state, dt) => {
    // One scroll value, smoothed here so scrubbing never looks stepped.
    smooth.current = THREE.MathUtils.lerp(smooth.current, progress.current ?? 0, 1 - Math.exp(-dt * 6));
    const p = smooth.current;
    const t = state.clock.elapsedTime;
    const ppu = size.height / UNITS_H;
    const pt = pointer.current ?? { x: 0, y: 0 };

    const groups: Record<ObjectId, THREE.Group | null> = {
      glyph: glyphRef.current,
      gamepad: gamepadRef.current,
      helmet: helmetRef.current,
    };
    (Object.keys(groups) as ObjectId[]).forEach((id) => {
      const g = groups[id];
      const a = anchors[id];
      if (!g) return;
      if (!a) {
        g.visible = false;
        return;
      }
      g.visible = true;
      const d = DEPTH[id];
      const base = a.size / (ppu * LOCAL_WIDTH[id]);
      const bob = Math.sin(t * 0.8 + phase[id]) * 0.1;
      const swing = Math.sin(t * 0.35 + phase[id]) * 0.4;

      g.position.set(
        (a.cx - size.width / 2) / ppu,
        (size.height / 2 - a.cy) / ppu + bob - p * d.dy * UNITS_H,
        p * d.dz,
      );
      g.scale.setScalar(base * (1 - p * d.dscale));
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, swing + pt.x * d.mouse + p * d.rotY, 3, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pt.y * 0.22 + Math.sin(t * 0.27 + phase[id]) * 0.08, 3, dt);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, p * d.rotZ, 3, dt);
    });
  });

  return (
    <>
      <group ref={glyphRef}>
        <Glyph />
      </group>
      <group ref={gamepadRef}>
        <Gamepad />
      </group>
      <group ref={helmetRef}>
        <Helmet />
      </group>
    </>
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
