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
            d="M12 41 33 20l5 5-21 21h-5v-5Z"
            fill="currentColor"
          />
          <path
            d="M40,4 L48,12 L40,20 L32,12 Z"
            fill="currentColor"
          />
          <path
            d="M16,8 L21,13 L16,18 L11,13 Z"
            fill="currentColor"
          />
          <path
            d="M46,26 L49,29 L46,32 L43,29 Z"
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
