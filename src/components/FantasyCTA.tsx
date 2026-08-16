type FantasyCTAProps = {
  mode: "girls" | "boys" | "anime";
  onCreate: () => void;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function FantasyCTA({ mode, onCreate }: FantasyCTAProps) {
  const isBoys = mode === "boys";
  const creationsLabel = isBoys ? "ver tus chicos" : mode === "anime" ? "ver tus creaciones" : "ver tus chicas";

  const description = isBoys
    ? "Diseña tu chico ideal y pásalo bien con él."
    : mode === "anime"
      ? "Diseña tu personaje anime ideal y pásalo bien con él."
      : "Diseña tu chica ideal y pásalo bien con ella.";

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
          {description}
          <button
            type="button"
            className="nuvia-fantasy-cta__inline"
            onClick={() =>
              document.getElementById("tus-chicas")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {creationsLabel}
          </button>
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