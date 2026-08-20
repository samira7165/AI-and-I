"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import LogoParticles from "./LogoParticles";
import { BRAND } from "@/lib/brand";

/* ---------------- backlight ---------------- */
/* A single edgeless plane behind the mark, faded to zero alpha at its own
   boundary so there is no disc edge for Bloom to pick up. */

function Backlight({ formation, scale }: { formation: number; scale: number }) {
  const mesh = useRef<THREE.Mesh>(null);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(BRAND.telenorBlue) },
          uOpacity: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            // smooth falloff, fully transparent before the plane edge
            float a = 1.0 - smoothstep(0.0, 1.0, d);
            a = pow(a, 2.6);
            gl_FragColor = vec4(uColor, a * uOpacity);
          }
        `,
      }),
    []
  );

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 0.7) * 0.06;
    mat.uniforms.uOpacity.value = 0.07 * formation * pulse;
    if (mesh.current) mesh.current.scale.setScalar(scale * 4 * pulse);
  });

  return (
    <mesh ref={mesh} position={[0, 0, -scale * 1.2]} material={mat}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/* ---------------- ambient dust ---------------- */

function Dust({ count, spread }: { count: number; spread: number }) {
  const ref = useRef<THREE.Points>(null);

  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const siz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.6 - spread * 0.15;
      siz[i] = Math.random() * 1.6 + 0.3;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(siz, 1));

    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uColor: { value: new THREE.Color(BRAND.lightBlue) },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vFade;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.25 + position.x * 0.7) * 0.12;
          p.x += cos(uTime * 0.2 + position.y * 0.6) * 0.1;
          vFade = 0.25 + 0.55 * (0.5 + 0.5 * sin(uTime * 0.9 + position.z * 3.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = aSize * uPixelRatio * (18.0 / -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vFade;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, a * a * vFade * 0.5);
        }
      `,
    });
    return { geo: g, mat: m };
  }, [count, spread]);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
    mat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.012;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ---------------- responsive rig ---------------- */
/* Frames the mark identically across aspect ratios by deriving camera
   distance from the viewport rather than hard-coding breakpoints. */

function Rig({
  formation,
  drift,
  pulse,
}: {
  formation: number;
  drift: { x: number; y: number };
  pulse: number;
}) {
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  const mobile = size.width < 640;

  const scale = mobile ? 3.0 : 3.6;
  const targetZ = useMemo(() => {
    const fit = mobile ? 2.75 : 2.35;
    return (scale * fit) / Math.min(aspect, 1.35);
  }, [aspect, mobile, scale]);

  useFrame(() => {
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.x += (drift.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (drift.y * 0.25 - camera.position.y) * 0.04;
    camera.lookAt(0, mobile ? 0.35 : 0, 0);
  });

  return (
    <>
      <Backlight formation={formation} scale={scale} />
      <LogoParticles formation={formation} scale={scale} mobile={mobile} pulse={pulse} />
      <Dust count={mobile ? 260 : 520} spread={scale * 5} />
    </>
  );
}

/* ---------------- canvas ---------------- */

export default function Scene({
  formation,
  drift,
  pulse,
}: {
  formation: number;
  drift: { x: number; y: number };
  pulse: number;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 42, position: [0, 0, 9], near: 0.1, far: 100 }}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Rig formation={formation} drift={drift} pulse={pulse} />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.75}
            luminanceThreshold={0.32}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.28} darkness={0.72} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
