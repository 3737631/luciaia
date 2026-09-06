type FantasyCTAProps = {
  mode: "girls" | "boys" | "anime";
  onCreate: () => void;
  onView?: () => void;
  locked?: boolean;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function FantasyCTA({ mode, onCreate, onView, locked }: FantasyCTAProps) {
  const isBoys = mode === "boys";
  const creationsLabel = isBoys ? "ver tus chicos" : mode === "anime" ? "ver tus creaciones" : "ver tus chicas";

  const description = isBoys
    ? "Crea tu chico ideal a tu gusto y empieza a hablar con él."
    : mode === "anime"
      ? "Crea tu personaje anime ideal a tu gusto y empieza a hablar con él."
      : "Crea tu chica ideal a tu gusto y empieza a hablar con ella.";

  const handleView = () => {
    if (onView) onView();
    else document.getElementById("tus-chicas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          {description}{" "}
          <span
            role="button"
            tabIndex={0}
            className="nuvia-fantasy-cta__inline"
            onClick={handleView}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleView();
              }
            }}
          >
            {creationsLabel}
          </span>
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
        {locked && (
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="#FF5798"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ marginLeft: 8 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
      </button>
    </section>
  );
}