import Image from "next/image";

type CanvasRow = {
  id: string;
  name: string;
  labels: string[];
  updated: string;
  created: string;
  ownerInitials: string;
};

const rows: CanvasRow[] = Array.from({ length: 10 }).map((_, index) => ({
  id: String(index + 1),
  name:
    index % 3 === 0
      ? "Pump health UT-654/111-FX"
      : index % 3 === 1
      ? "WHM: 74-PH-8163/0091 1…"
      : "Untitled canvas",
  labels:
    index % 3 === 2
      ? ["Troubleshooting"]
      : ["Troubleshooting", ...(index % 3 === 1 ? ["Label"] : [])],
  updated: "Dec 17, 2024",
  created: "Aug 29, 2018",
  ownerInitials: "GR",
}));

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center font-medium">
                C
              </div>
              <h1>Canvas</h1>
            </div>
            <p className="body-medium text-muted-foreground mt-1">
              Collaborate and visualize data
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-primary-foreground hover:opacity-90">
            <span className="inline-block h-4 w-4 rounded-sm bg-primary-foreground/20" />
            Create canvas
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[260px] max-w-[420px]">
            <input
              placeholder="Search canvases"
              className="w-full rounded-md border border-border bg-background px-9 py-2 body-medium focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 rounded-sm bg-muted" />
          </div>
          <button className="rounded-md border border-border bg-secondary px-3 py-2 body-medium hover:bg-muted">
            Filter
          </button>
          <button className="rounded-md border border-border bg-secondary px-3 py-2 body-medium hover:bg-muted">
            Sort
          </button>
          <button className="rounded-md border border-border bg-secondary px-3 py-2 body-medium hover:bg-muted">
            Date range
          </button>
          <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-0.5">
            <button className="rounded-[6px] px-3 py-1.5 body-medium bg-secondary">
              All
            </button>
            <button className="rounded-[6px] px-3 py-1.5 body-medium bg-primary text-primary-foreground">
              Private
            </button>
            <button className="rounded-[6px] px-3 py-1.5 body-medium bg-secondary">
              Public
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left">
            <thead className="bg-secondary">
              <tr className="body-small text-muted-foreground">
                <th className="w-10 px-3 py-2">
                  <input type="checkbox" className="size-4" />
                </th>
                <th className="px-3 py-2 font-medium text-foreground">Name</th>
                <th className="px-3 py-2">Labels</th>
                <th className="px-3 py-2">Last updated</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Owner</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border hover:bg-muted/50"
                >
                  <td className="px-3 py-3 align-top">
                    <input type="checkbox" className="size-4" />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="body-medium text-foreground">
                      {row.name}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      {row.labels.map((label, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 body-small text-muted-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top body-medium text-muted-foreground">
                    {row.updated}
                  </td>
                  <td className="px-3 py-3 align-top body-medium text-muted-foreground">
                    {row.created}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground body-small font-medium">
                        {row.ownerInitials}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <button
                      className="h-8 w-8 rounded-md hover:bg-muted"
                      aria-label="More"
                    >
                      <span className="mx-auto block h-1 w-1 rounded-full bg-foreground" />
                      <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-foreground" />
                      <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-border bg-secondary px-2 py-2 hover:bg-muted"
              aria-label="First"
            >
              <span className="block h-4 w-4 rotate-180 border-l-2 border-t-2 border-foreground" />
            </button>
            <button
              className="rounded-md border border-border bg-secondary px-2 py-2 hover:bg-muted"
              aria-label="Prev"
            >
              <span className="block h-4 w-4 rotate-45 border-l-2 border-t-2 border-foreground" />
            </button>
            <span className="body-medium">1 / 100</span>
            <button
              className="rounded-md border border-border bg-secondary px-2 py-2 hover:bg-muted"
              aria-label="Next"
            >
              <span className="block h-4 w-4 -rotate-45 border-r-2 border-b-2 border-foreground" />
            </button>
            <button
              className="rounded-md border border-border bg-secondary px-2 py-2 hover:bg-muted"
              aria-label="Last"
            >
              <span className="block h-4 w-4 border-r-2 border-b-2 border-foreground" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="body-medium text-muted-foreground">
              Rows per page
            </span>
            <select className="rounded-md border border-border bg-background px-2 py-1.5 body-medium">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
