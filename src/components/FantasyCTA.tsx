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
            d="m35 10 2.1 5.1L42 17l-4.9 1.9L35 24l-2.1-5.1L28 17l4.9-1.9L35 10Z"
            fill="currentColor"
          />
          <path
            d="m13 14 1.4 3.4 3.4 1.4-3.4 1.4L13 23.6l-1.4-3.4-3.4-1.4 3.4-1.4L13 14Z"
            fill="currentColor"
          />
          <path
            d="m42 33 1.4 3.4 3.4 1.4-3.4 1.4L42 42.6l-1.4-3.4-3.4-1.4 3.4-1.4L42 33Z"
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
