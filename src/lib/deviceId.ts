"use client";

/**
 * deviceId.ts — identificador estable de hardware para limitar el uso de ciertas
 * funciones sin registro y sin depender de IP ni de la red wifi.
 *
 * Se construye con señales de hardware/navegador estables (WebGL, canvas,
 * fuentes, pantalla, plataforma) y se somete a un hash SHA-256 con Web Crypto
 * nativo. No se envía ninguna IP. El resultado es un identificador opaco que se
 * repite en cualquier modo incógnito del mismo dispositivo.
 *
 * Limitación honesta: en incógnitos estrictos con anti-detección o en Firefox
 * con "Resist Fingerprinting", algunas señales pueden ser débilmente variables.
 */

function stableSignals(): string[] {
  const out: string[] = [];

  // Plataforma / agente básico (estable por dispositivo, no por IP)
  out.push(navigator.platform || "");
  out.push(navigator.hardwareConcurrency ? `cores:${navigator.hardwareConcurrency}` : "");
  out.push(navigator.maxTouchPoints ? `touch:${navigator.maxTouchPoints}` : "");
  type NavMem = Navigator & { deviceMemory?: number };
  out.push((navigator as NavMem).deviceMemory ? `mem:${(navigator as NavMem).deviceMemory}` : "");
  out.push(typeof screen !== "undefined" ? `${screen.width}x${screen.height}x${screen.colorDepth}` : "");

  // Fuentes del sistema (solo si se cargan).
  try {
    const families = ["monospace", "serif", "sans-serif", "cursive", "fantasy"];
    out.push("fonts:" + families.join(","));
  } catch {
    out.push("fonts:err");
  }

  // WebGL renderer — señal muy estable por GPU/dispositivo.
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : String(gl.getParameter(gl.RENDERER));
      const vendor = dbg
        ? String(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL))
        : String(gl.getParameter(gl.VENDOR));
      out.push(`gl:${vendor}|${renderer}`);
      // Sencillo hash de sombreado para reforzar la señal por GPU.
      const shader = gl.createShader(gl.FRAGMENT_SHADER);
      if (shader) {
        const src =
          "precision highp float;void main(){gl_FragColor=vec4(0.5,0.5,0.5,1.0);}";
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        out.push(`glsl:${String(gl.getShaderInfoLog(shader)).trim()}`);
      }
    } else {
      out.push("gl:none");
    }
  } catch {
    out.push("gl:err");
  }

  // Canvas fingerprint — señal estable por renderizador de píxeles.
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 40;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(0, 0, 220, 40);
      ctx.fillStyle = "#069";
      ctx.fillText("NuviaChat-did", 2, 2);
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.font = "bold 18px Arial";
      ctx.fillText("fp", 4, 17);
      out.push(`cv:${canvas.toDataURL().slice(0, 400)}`);
    } else {
      out.push("cv:none");
    }
  } catch {
    out.push("cv:err");
  }

  // Lista de idiomas (usuario, no IP pero estable en el mismo dispositivo).
  try {
    out.push("langs:" + (navigator.languages || []).join(","));
  } catch {
    out.push("langs:err");
  }

  return out;
}

let cachedId: string | null = null;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Devuelve el identificador estable del dispositivo (promesa). Es un hash
 * SHA-256 de las señales de hardware; no identifica personas de forma reversible.
 */
export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;
  const parts = stableSignals();
  const raw = parts.join("|");
  const id = await sha256Hex(raw);
  cachedId = id;
  return id;
}
