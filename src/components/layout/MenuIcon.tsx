import { Icon } from '@/components/icons';

/** Menu entry icon: a bundled inline SVG when the key is "svg-…", otherwise the image the admin panel sent. */
export function MenuIcon({ icon, size }: { icon: string | null; size: number }) {
  if (!icon) return null;
  if (icon.startsWith('svg-')) return <Icon name={icon} />;
  return <img src={icon} alt="" width={size} height={size} />;
}
