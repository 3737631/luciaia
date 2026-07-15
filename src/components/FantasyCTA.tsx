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
        <svg
          viewBox="0 0 52 52"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path
            d="M13 39 34 18l5 5-21 21h-5v-5Z"
            fill="currentColor"
          />
          <path
            d="m36 7 2.2 5.2L43 14l-4.8 2L36 22l-2.2-5.2L29 14l4.8-2 2.2-5Z"
            fill="currentColor"
          />
          <path
            d="m9 9 1.5 3.5 3.5 1.5-3.5 1.5L9 19l-1.5-3.5-3.5-1.5 3.5-1.5L9 9Z"
            fill="currentColor"
          />
          <path
            d="m43 19 1.5 3.5 3.5 1.5-3.5 1.5L43 29l-1.5-3.5-3.5-1.5 3.5-1.5L43 19Z"
            fill="currentColor"
          />
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
