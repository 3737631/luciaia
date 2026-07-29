type FantasyCTAProps = {
  mode: "girls" | "boys";
  onCreate: () => void;
};

export function FantasyCTA({
  mode,
  onCreate,
}: FantasyCTAProps) {
  const description =
    mode === "boys"
      ? "Diseña tu chico ideal con IA y pásalo bien con él."
      : "Describe cómo quieres que sea y Nuvia la convertirá en un personaje único con IA.";

  return (
    <section
      className="nuvia-fantasy-cta"
      aria-label="Crear personaje personalizado"
    >
      <div
        className="nuvia-fantasy-cta__icon"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img">
          <path d="m56 6 2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" />
          <path d="m17 12 2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" />
          <path d="m52 41 2-5 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="currentColor" />
          <path d="M18 46 42 22l6 6-24 24H18v-6Z" fill="currentColor" />
        </svg>
      </div>

      <div className="nuvia-fantasy-cta__copy">
        <h2 className="nuvia-fantasy-cta__title">
          Crea tu <span>fantasía</span>
        </h2>

        <p className="nuvia-fantasy-cta__description">
          {description}
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
