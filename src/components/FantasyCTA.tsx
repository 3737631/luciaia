type FantasyCTAProps = {
  mode: "girls" | "boys";
  onCreate: () => void;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
