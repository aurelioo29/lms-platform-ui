"use client";

export function SimpleTabs({ tabs, active, onChange }) {
  return (
    <div className="border-b">
      <div className="flex flex-wrap gap-6 px-6">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={[
              "py-4 text-sm",
              active === t.value
                ? "border-b-2 border-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
