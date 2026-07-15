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
            d="m36 5 2.8 5L44 10l-5.2 2.8L36 15l-2.8-5L28 10l5.2-2.8 2.8-5Z"
            fill="currentColor"
          />
          <path
            d="m9 10 2.4 4L15 14l-3.6 2.4L9 18l-2.4-4L3 14l3.6-2.4 2.4-4Z"
            fill="currentColor"
          />
          <path
            d="m45 15 2.4 4L51 19l-3.6 2.4L45 23l-2.4-4L39 19l3.6-2.4 2.4-4Z"
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
