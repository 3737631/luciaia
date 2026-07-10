export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" style={{ background: "#0B0B0F" }}>
      <div style={{ position: "absolute", top: -96, left: -96, width: 288, height: 288, borderRadius: "50%", opacity: 0.03, background: "#FF3B7F" }} />
      <div style={{ position: "absolute", top: "25%", right: -80, width: 320, height: 320, borderRadius: "50%", opacity: 0.02, background: "#FF5A4F" }} />
    </div>
  );
}