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
            d="m36 3 2.1 5.1L43 10l-4.9 1.9L36 17l-2.1-5.1L29 10l4.9-1.9 2.1-5.1Z"
            fill="currentColor"
          />
          <path
            d="m9 9 1.5 3.5 3.5 1.5-3.5 1.5L9 19l-1.5-3.5-3.5-1.5 3.5-1.5L9 9Z"
            fill="currentColor"
          />
          <path
            d="m45 14 1.5 3.5 3.5 1.5-3.5 1.5L45 24l-1.5-3.5-3.5-1.5 3.5-1.5L45 14Z"
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
