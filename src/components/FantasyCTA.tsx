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
            d="m35 3 3 4L42 10l-4 3L35 17l-3-4L28 10l4-3 3-4Z"
            fill="currentColor"
          />
          <path
            d="m11 15 2 3L16 20l-3 2L11 25l-2-3L6 20l3-2 2-3Z"
            fill="currentColor"
          />
          <path
            d="m43 15 2 3L48 20l-3 2L43 25l-2-3L38 20l3-2 2-3Z"
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
