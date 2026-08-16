type FantasyCTAProps = {
  mode: "girls" | "boys" | "anime";
  onCreate: () => void;
  creationsCount?: number;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function FantasyCTA({
  mode,
  onCreate,
  creationsCount = 0,
}: FantasyCTAProps) {
  const isBoys = mode === "boys";
  const creationsLabel = isBoys ? "Ver tus chicos" : mode === "anime" ? "Ver tus creaciones" : "Ver tus chicas";

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
        </p>
      </div>

      <div className="nuvia-fantasy-cta__actions">
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

        {creationsCount > 0 && (
          <button
            type="button"
            className="nuvia-fantasy-cta__view"
            onClick={() =>
              document.getElementById("tus-creaciones")?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3" /><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            </svg>
            {creationsLabel} {creationsCount > 0 ? `(${creationsCount})` : ""}
          </button>
        )}
      </div>
    </section>
  );
}
