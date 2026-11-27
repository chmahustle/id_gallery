import { Pencil, Trash2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type AdminIconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> & {
  /** delete — корзина (красная), edit — карандаш */
  icon: 'delete' | 'edit'
  /** Что делает кнопка: для экранных дикторов и подсказки при наведении */
  label: string
  /**
   * sm — в строке маленьких кнопок (↑ ↓): размер берётся от соседних кнопок;
   * md — отдельная квадратная кнопка.
   */
  size?: 'sm' | 'md'
}

/** Кнопка-значок админки: вместо слов «Удалить», «Убрать», «Изменить» и «×» */
export function AdminIconButton({
  icon,
  label,
  size = 'md',
  title,
  className,
  ...rest
}: AdminIconButtonProps) {
  const Icon = icon === 'delete' ? Trash2 : Pencil
  return (
    <button
      type="button"
      aria-label={label}
      title={title ?? label}
      className={[
        'admin-icon-btn',
        `admin-icon-btn--${size}`,
        icon === 'delete' ? 'admin-icon-btn--delete' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <Icon size={size === 'sm' ? 14 : 16} strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}
