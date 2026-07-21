import type { ShopThemeId } from "@/lib/theme";

/**
 * A small abstract diagram of each theme's layout — not a screenshot, just
 * enough shape/spacing/color difference for someone to recognize "the tall
 * gradient one" vs "the dense grid one" before picking it.
 */
export default function ThemeThumbnail({ themeId }: { themeId: ShopThemeId }) {
  return (
    <div className="w-full aspect-[4/3] rounded-md overflow-hidden bg-bg-soft border border-line">
      {themeId === "minimal" && (
        <div className="h-full flex flex-col">
          <div className="h-2/5 bg-gradient-to-br from-blue to-navy relative">
            <div className="absolute left-2 -bottom-1.5 w-3 h-3 rounded-full bg-blue border border-white" />
          </div>
          <div className="flex-1 grid grid-cols-3 gap-1 p-1.5 pt-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-line rounded-sm" />
            ))}
          </div>
        </div>
      )}

      {themeId === "list" && (
        <div className="h-full flex flex-col">
          <div className="h-2/5 bg-gradient-to-br from-blue to-navy relative">
            <div className="absolute left-2 -bottom-1.5 w-3 h-3 rounded-full bg-blue border border-white" />
          </div>
          <div className="flex-1 flex flex-col gap-1 p-1.5 pt-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 flex items-center gap-1">
                <div className="w-2 h-2 bg-white border border-line rounded-sm shrink-0" />
                <div className="flex-1 h-[3px] bg-line rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {themeId === "boutique" && (
        <div className="h-full flex flex-col items-center">
          <div className="h-1/2 w-full bg-gradient-to-br from-blue to-navy relative">
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue border border-white" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-1.5 p-1.5 pt-3 w-full">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-sm shadow-sm" />
            ))}
          </div>
        </div>
      )}

      {themeId === "market" && (
        <div className="h-full flex flex-col">
          <div className="h-[16%] bg-white border-b border-line flex items-center px-1.5 gap-1">
            <div className="w-2 h-2 rounded-full bg-blue shrink-0" />
            <div className="w-6 h-[3px] bg-line rounded-full" />
          </div>
          <div className="flex-1 grid grid-cols-4 gap-[3px] p-1">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="bg-white border border-line rounded-[2px]" />
            ))}
          </div>
        </div>
      )}

      {themeId === "gallery" && (
        <div className="h-full flex flex-col">
          <div className="h-1/2 bg-gradient-to-br from-blue to-navy relative">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute left-2 bottom-1 w-8 h-[5px] bg-white/90 rounded-full" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 p-2">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white rounded-sm" />
            ))}
          </div>
        </div>
      )}

      {themeId === "studio" && (
        <div className="h-full flex flex-col">
          <div className="h-2/5 bg-ink relative">
            <div className="absolute left-2 -bottom-1.5 w-3 h-3 rounded-sm bg-ink border border-white" />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-1 p-1.5 pt-2.5">
            {[0, 1].map((i) => (
              <div key={i} className="relative bg-white border-2 border-ink rounded-none">
                {i === 0 && <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-sm bg-blue" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
