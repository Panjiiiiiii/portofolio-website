"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const ACCENT = "#00A19B";

// Chevron outline, built from primitives (no font files). Tip at x = OX.
const S = 0.34; // stroke width
const OX = -0.52;
const TX = 0.3;
const H = 1.0;
const DEPTH = 0.5;

function chevronGeometry(dir: 1 | -1) {
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
  const geo = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
  geo.center();
  return geo;
}

type Pointer = { x: number; y: number };

function Part({
  geometry,
  position,
  rotationZ = 0,
}: {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotationZ?: number;
}) {
  return (
    <mesh geometry={geometry} position={position} rotation={[0, 0, rotationZ]}>
      <meshStandardMaterial color={ACCENT} roughness={0.6} metalness={0} toneMapped={false} />
      <Edges threshold={15} color="#ECEAF2" lineWidth={1} transparent opacity={0.35} />
    </mesh>
  );
}

function Glyph({ pointer }: { pointer: React.RefObject<Pointer> }) {
  const group = useRef<THREE.Group>(null);
  const left = useMemo(() => chevronGeometry(1), []);
  const right = useMemo(() => chevronGeometry(-1), []);
  const slash = useMemo(() => new THREE.BoxGeometry(0.3, 2.3, DEPTH), []);

  useEffect(
    () => () => {
      left.dispose();
      right.dispose();
      slash.dispose();
    },
    [left, right, slash],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = pointer.current;
    // Slow swing plus mouse parallax. Damped so it never snaps.
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.sin(t * 0.35) * 0.45 + p.x * 0.35, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -p.y * 0.22 + Math.sin(t * 0.27) * 0.08, 3, dt);
    g.position.y = Math.sin(t * 0.8) * 0.08;
  });

  return (
    <group ref={group}>
      <Part geometry={left} position={[-1.55, 0, 0]} />
      <Part geometry={slash} position={[0, 0, 0]} rotationZ={-0.32} />
      <Part geometry={right} position={[1.55, 0, 0]} />
    </group>
  );
}

export default function GlyphCanvas({
  active,
  onReady,
}: {
  active: boolean;
  onReady: () => void;
}) {
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 10.5], fov: 32 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      onCreated={onReady}
    >
      {/* Soft light only: one ambient, one gentle directional. */}
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 4, 6]} intensity={1.4} />
      <Glyph pointer={pointer} />
    </Canvas>
  );
}
