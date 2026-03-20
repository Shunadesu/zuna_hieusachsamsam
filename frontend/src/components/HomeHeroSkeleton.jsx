/**
 * Placeholder layout matching HomePage hero: category sidebar + policy cards + slider + sub-banners.
 */
export default function HomeHeroSkeleton() {
  return (
    <div
      className="lg:grid flex flex-col-reverse lg:grid-cols-10 gap-6 items-stretch"
      aria-busy="true"
      aria-live="polite"
      role="status"
      aria-label="Đang tải nội dung trang chủ"
    >
      <aside className="lg:col-span-3 order-1">
        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden h-full flex flex-col min-h-[260px] lg:min-h-[320px]">
          <div className="h-[3.25rem] bg-green-200/90 animate-pulse" />
          <div className="divide-y divide-green-50 flex-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-green-100 animate-pulse shrink-0" />
                  <div className="h-3.5 flex-1 max-w-[80%] rounded-md bg-green-100/90 animate-pulse" />
                </div>
                <div className="w-2 h-4 rounded-sm bg-green-100/70 animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="lg:col-span-7 order-2 space-y-4 h-full flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-green-100 p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-green-200/80 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2 min-w-0 pt-0.5">
                <div className="h-4 w-[85%] max-w-[220px] rounded-md bg-green-100 animate-pulse" />
                <div className="h-3 w-full rounded-md bg-green-50 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 w-full rounded-xl bg-green-100/90 border border-green-100 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-24 sm:h-28 rounded-xl bg-green-100/80 border border-green-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
