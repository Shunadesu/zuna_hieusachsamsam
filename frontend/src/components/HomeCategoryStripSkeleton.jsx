/**
 * Skeleton cho dải danh mục ngang "Thư mục sách" (avatar tròn + nhãn).
 */
export default function HomeCategoryStripSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-green-100 shadow-sm px-4 py-5"
      aria-busy="true"
      aria-live="polite"
      role="status"
      aria-label="Đang tải danh mục sách"
    >
      <div className="flex gap-5 overflow-x-auto pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[90px] flex flex-col items-center text-center shrink-0"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 animate-pulse border border-green-100" />
            <div className="mt-2 w-full max-w-[84px] space-y-1.5">
              <div className="h-3 w-full rounded-md bg-green-100/90 animate-pulse mx-auto" />
              <div className="h-3 w-[80%] rounded-md bg-green-50 animate-pulse mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
