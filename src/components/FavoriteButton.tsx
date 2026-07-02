import { Star } from "lucide-react";
import { setFavoriteAction } from "@/app/actions/favorites";

type FavoriteButtonProps = {
  articleId: string;
  initialFavorite: boolean;
};

export function FavoriteButton({ articleId, initialFavorite }: FavoriteButtonProps) {
  const action = setFavoriteAction.bind(null, articleId, !initialFavorite);
  const label = initialFavorite ? "取消收藏" : "收藏";
  const buttonClassName = initialFavorite
    ? "inline-flex h-9 w-9 items-center justify-center rounded-md border border-yellow-300 bg-yellow-50 text-yellow-500 shadow-sm transition-colors hover:border-yellow-400 hover:bg-yellow-100"
    : "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-colors hover:border-amber-300 hover:text-amber-500";

  return (
    <form action={action}>
      <button
        type="submit"
        title={label}
        aria-label={label}
        aria-pressed={initialFavorite}
        data-favorite-state={initialFavorite ? "on" : "off"}
        className={buttonClassName}
      >
        <Star
          size={18}
          fill={initialFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={initialFavorite ? 2.5 : 2}
          aria-hidden="true"
        />
      </button>
    </form>
  );
}
