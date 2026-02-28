"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = ["All", "UI/UX", "Fundamental", "Design", "Engineering"];
const urgencies = ["All", "Not Urgent", "Urgent"];

export default function CourseFilters({
  q,
  onQChange,
  category,
  onCategoryChange,
  urgency,
  onUrgencyChange,
  sort,
  onSortChange,
  perPage,
  onPerPageChange,
  loading,
  onRefresh,
}) {
  return (
    <div className="space-y-3">
      {/* chips row */}
      <div className="flex flex-wrap items-center gap-2">
        <ChipGroup
          label="Category"
          value={category}
          options={categories}
          onChange={onCategoryChange}
        />
        <ChipGroup
          label="Urgency"
          value={urgency}
          options={urgencies}
          onChange={onUrgencyChange}
        />

        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onCategoryChange("All");
            onUrgencyChange("All");
          }}
        >
          Reset
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="date_desc">Date (Newest)</option>
            <option value="title_asc">Title (A–Z)</option>
            <option value="progress_desc">Progress (High)</option>
          </select>

          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={String(perPage)}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            {[8, 12, 16, 24].map((n) => (
              <option key={n} value={String(n)}>
                {n}/page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* search row */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search..."
            value={q}
            onChange={(e) => onQChange(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}

function ChipGroup({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[
                "h-8 rounded-full border px-3 text-sm",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
