"use client";

import { useState } from "react";
import { unlockAudioGesture, playTTSLoud, ttsText, prefersPlainAudio } from "@/lib/voiceClient";

const SILENT =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

function makeToneDataUrl(freq = 440, ms = 700) {
  const sr = 8000;
  const n = Math.floor((sr * ms) / 1000);
  const buf = new ArrayBuffer(44 + n * 2);
  const dv = new DataView(buf);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); dv.setUint32(4, 36 + n * 2, true); ws(8, "WAVE"); ws(12, "fmt ");
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true); ws(36, "data"); dv.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const v = Math.sin((2 * Math.PI * freq * i) / sr) * 14000;
    dv.setInt16(44 + i * 2, v, true);
  }
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return "data:audio/wav;base64," + btoa(bin);
}

export default function AudioTestPage() {
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((l) => [...l, s]);

  const info = () => {
    add("UA: " + navigator.userAgent);
    add("prefersPlainAudio: " + prefersPlainAudio);
    add("touch: " + ("ontouchstart" in window) + " maxTouchPoints:" + navigator.maxTouchPoints);
    add("AudioContext: " + !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext));
    add("voices: " + (window.speechSynthesis ? window.speechSynthesis.getVoices().length : "n/a"));
  };

  const testUnlockSingleton = async () => {
    unlockAudioGesture();
    add("unlockAudioGesture() llamado dentro del gesto");
    const el = new Audio();
    el.src = SILENT; el.volume = 0.01;
    try {
      await el.play();
      el.pause();
      add("desbloqueo elemento nuevo: OK");
    } catch (e) {
      add("desbloqueo elemento nuevo: BLOQUEADO " + (e as Error).name);
    }
  };

  const testTone = async () => {
    unlockAudioGesture();
    const tone = makeToneDataUrl(440, 700);
    const h = await playTTSLoud(tone, { volume: 1, onStart: () => add("tono: onStart (empezo)") });
    if (!h) { add("tono: playTTSLoud devolvio null"); return; }
    await h.play();
    add("tono: play() termino");
  };

  const testSpeech = () => {
    add("speechSynthesis: " + ("speechSynthesis" in window));
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance("Hola, esto es una prueba de voz del navegador");
    u.lang = "es-ES";
    u.onstart = () => add("speech: onstart");
    u.onerror = (e) => add("speech: error " + e.error);
    window.speechSynthesis.speak(u);
  };

  const testRealTTS = async () => {
    unlockAudioGesture();
    add("pidiendo TTS real...");
    try {
      const r = await ttsText("Hola, soy Kira. Estoy probando si me escuchas bien.", "female-kira");
      add("TTS devuelto: contentType=" + r.contentType + " bytes=" + r.audio.length);
      const url = `data:${r.contentType};base64,${r.audio}`;
      const h = await playTTSLoud(url, { volume: 1, onStart: () => add("TTS: onStart (empezo)") });
      if (!h) { add("TTS: playTTSLoud null"); return; }
      await h.play();
      add("TTS: reproduccion terminada");
    } catch (e) {
      add("TTS ERROR: " + (e as Error).message);
    }
  };

  return (
    <main style={{ minHeight: "100dvh", background: "#0b0810", color: "#fff", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Diagnostico de audio</h1>
      <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>
        Pulsa los botones y dime cual suena y que texto aparece.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420 }}>
        <button onClick={info} style={btn}>1. Mostrar info del dispositivo</button>
        <button onClick={testUnlockSingleton} style={btn}>2. Probar desbloqueo (silencio)</button>
        <button onClick={testTone} style={{ ...btn, background: "#2e7d32" }}>3. Tono de prueba (deberia sonar)</button>
        <button onClick={testRealTTS} style={{ ...btn, background: "#6a1b9a" }}>4. Voz real TTS (Kira)</button>
        <button onClick={testSpeech} style={btn}>5. Voz del navegador (speechSynthesis)</button>
      </div>
      <div style={{ marginTop: 16, background: "#000", borderRadius: 8, padding: 12, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {log.length === 0 ? "(sin resultados)" : log.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 15,
  cursor: "pointer",
  textAlign: "left",
};
