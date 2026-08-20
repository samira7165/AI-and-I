"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BRAND } from "@/lib/brand";

/* ------------------------------------------------------------------ *
 * Samples the actual logo.png alpha channel and returns world-space
 * target positions. Nothing about the mark is hard-coded — swap the
 * file in /public and the formation follows it.
 * ------------------------------------------------------------------ */

type Sample = { x: number; y: number; edge: number };

async function sampleLogo(src: string, step: number): Promise<Sample[]> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();

  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);

  const alphaAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= c.width || y >= c.height) return 0;
    return data[(y * c.width + x) * 4 + 3];
  };

  const out: Sample[] = [];
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      if (alphaAt(x, y) < 128) continue;

      // Edge detection: how close is this pixel to the silhouette border?
      // Drives the rim-light gradient — border particles read brightest.
      const r = step * 2;
      let exposed = 0;
      const probes = [
        [r, 0], [-r, 0], [0, r], [0, -r],
        [r, r], [-r, -r], [r, -r], [-r, r],
      ];
      for (const [dx, dy] of probes) {
        if (alphaAt(x + dx, y + dy) < 128) exposed++;
      }
      const edge = Math.min(1, exposed / 4);

      // Normalise to -0.5..0.5, flip Y for world space
      out.push({
        x: x / c.width - 0.5,
        y: -(y / c.height - 0.5),
        edge,
      });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */

interface Props {
  /** 0 = fully scattered, 1 = fully formed */
  formation: number;
  scale: number;
  mobile: boolean;
  /** increments on every correct quiz answer, triggering a brief heat pulse */
  pulse: number;
}

export default function LogoParticles({ formation, scale, mobile, pulse }: Props) {
  const points = useRef<THREE.Points>(null);
  const [samples, setSamples] = useState<Sample[] | null>(null);
  const { clock } = useThree();
  const pulseAt = useRef(-999);

  useEffect(() => {
    if (pulse > 0) pulseAt.current = clock.elapsedTime;
  }, [pulse, clock]);

  const step = mobile ? 3 : 2;

  useEffect(() => {
    let alive = true;
    sampleLogo("/logo.png", step).then((s) => {
      if (alive) setSamples(s);
    });
    return () => {
      alive = false;
    };
  }, [step]);

  /* Build buffers once samples land ------------------------------- */
  const geo = useMemo(() => {
    if (!samples) return null;
    const n = samples.length;

    const target = new Float32Array(n * 3);
    const scatter = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const delays = new Float32Array(n);
    const drift = new Float32Array(n * 3);

    const cCore = new THREE.Color(BRAND.midBlue);
    const cMid = new THREE.Color(BRAND.logoBlue);
    const cEdge = new THREE.Color(BRAND.lightBlue);
    const tmp = new THREE.Color();

    for (let i = 0; i < n; i++) {
      const s = samples[i];
      const i3 = i * 3;

      // Spherical bulge: the mark sits on a curved shell, not a flat plane.
      const rad = Math.hypot(s.x, s.y);
      const z = Math.cos(Math.min(rad * 2.4, Math.PI / 2)) * 0.16;

      target[i3] = s.x * scale;
      target[i3 + 1] = s.y * scale;
      target[i3 + 2] = z * scale + (Math.random() - 0.5) * 0.04 * scale;

      // Scatter origin — a wide shell the particles converge inward from.
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const R = scale * (1.7 + Math.random() * 1.6);
      scatter[i3] = Math.sin(ph) * Math.cos(th) * R;
      scatter[i3 + 1] = Math.sin(ph) * Math.sin(th) * R * 0.7;
      scatter[i3 + 2] = Math.cos(ph) * R * 0.6;

      // Rim gradient — interior cool and deep, silhouette bright.
      const e = s.edge;
      if (e < 0.5) tmp.copy(cCore).lerp(cMid, e * 2);
      else tmp.copy(cMid).lerp(cEdge, (e - 0.5) * 2);
      colors[i3] = tmp.r;
      colors[i3 + 1] = tmp.g;
      colors[i3 + 2] = tmp.b;

      sizes[i] = (0.5 + e * 1.5) * (mobile ? 0.9 : 1) * (0.7 + Math.random() * 0.6);
      delays[i] = Math.random() * 0.45;

      drift[i3] = (Math.random() - 0.5) * 0.5;
      drift[i3 + 1] = (Math.random() - 0.5) * 0.5;
      drift[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
    g.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aDelay", new THREE.BufferAttribute(delays, 1));
    g.setAttribute("aDrift", new THREE.BufferAttribute(drift, 3));
    return g;
  }, [samples, scale, mobile]);

  /* Shader — formation lerp + idle drift happen on the GPU --------- */
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uForm: { value: 0 },
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uPulse: { value: 0 },
        },
        vertexShader: /* glsl */ `
          attribute vec3 aTarget;
          attribute vec3 aScatter;
          attribute float aSize;
          attribute float aDelay;
          attribute vec3 aDrift;

          uniform float uForm;
          uniform float uTime;
          uniform float uPixelRatio;

          varying vec3 vColor;
          varying float vForm;

          // easeOutCubic
          float ease(float t) { return 1.0 - pow(1.0 - t, 3.0); }

          void main() {
            vColor = color;

            // Staggered arrival so the mark assembles rather than snaps.
            float t = clamp((uForm - aDelay) / (1.0 - aDelay), 0.0, 1.0);
            t = ease(t);
            vForm = t;

            vec3 pos = mix(aScatter, aTarget, t);

            // Idle breathing once formed — the mark stays alive.
            float breathe = sin(uTime * 0.6 + aDelay * 12.0) * 0.012;
            pos += aDrift * breathe * t;

            // Residual turbulence while still travelling.
            pos += aDrift * (1.0 - t) * 0.25 * sin(uTime * 1.4 + aDelay * 20.0);

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = aSize * uPixelRatio * (34.0 / -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vForm;

          uniform float uPulse;

          void main() {
            vec2 uv = gl_PointCoord - 0.5;
            float d = length(uv);
            if (d > 0.5) discard;

            // Soft radial falloff + hot core
            float alpha = smoothstep(0.5, 0.0, d);
            alpha *= alpha;
            float core = smoothstep(0.16, 0.0, d) * 0.55;

            // Travelling particles glow hotter, settle as they arrive.
            float heat = mix(1.55, 1.0, vForm);
            // Correct-answer reward: a brief heat boost that decays away.
            heat *= 1.0 + uPulse * 0.5;

            gl_FragColor = vec4(vColor * heat + core, alpha * (0.35 + vForm * 0.65));
          }
        `,
        vertexColors: true,
      }),
    []
  );

  useFrame(() => {
    material.uniforms.uForm.value = formation;
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);

    // Decay the correct-answer heat pulse over ~500ms.
    const sincePulse = clock.elapsedTime - pulseAt.current;
    material.uniforms.uPulse.value = sincePulse < 0.5 ? 1 - sincePulse / 0.5 : 0;

    // Slow parallax rotation — reads as depth without spinning the mark.
    if (points.current) {
      points.current.rotation.y = Math.sin(clock.elapsedTime * 0.18) * 0.12 * formation;
      points.current.rotation.x = Math.cos(clock.elapsedTime * 0.14) * 0.05 * formation;
    }
  });

  if (!geo) return null;
  return <points ref={points} geometry={geo} material={material} />;
}
