type FantasyCTAProps = {
  mode: "girls" | "boys" | "anime";
  onCreate: () => void;
  onView?: () => void;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function FantasyCTA({ mode, onCreate, onView }: FantasyCTAProps) {
  const isBoys = mode === "boys";
  const creationsLabel = isBoys ? "ver tus chicos" : mode === "anime" ? "ver tus creaciones" : "ver tus chicas";

  const description = isBoys
    ? "Crea tu chico ideal a tu gusto y empieza a hablar con él."
    : mode === "anime"
      ? "Crea tu personaje anime ideal a tu gusto y empieza a hablar con él."
      : "Crea tu chica ideal a tu gusto y empieza a hablar con ella.";

  const handleView = () => {
    if (onView) onView();
    else document.getElementById("tus-chicas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="nuvia-fantasy-cta"
      aria-label="Crear personaje personalizado"
    >
      <div
        className="nuvia-fantasy-cta__icon"
        aria-hidden="true"
      >
        <img
          src={`${basePath}/fantasy-neon.jpg`}
          alt=""
          className="nuvia-fantasy-cta__image"
        />
      </div>

      <div className="nuvia-fantasy-cta__copy">
        <h2 className="nuvia-fantasy-cta__title">
          Crea tu <span>fantasía</span>
        </h2>

        <p className="nuvia-fantasy-cta__description">
          {description}{" "}
          <span
            role="button"
            tabIndex={0}
            className="nuvia-fantasy-cta__inline"
            onClick={handleView}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleView();
              }
            }}
          >
            {creationsLabel}
          </span>
        </p>
      </div>

      <button
        type="button"
        className="nuvia-fantasy-cta__button"
        onClick={onCreate}
      >
        <span>Crear</span>
        <span
          className="nuvia-fantasy-cta__arrow"
          aria-hidden="true"
        >
          →
        </span>
      </button>
    </section>
  );
}