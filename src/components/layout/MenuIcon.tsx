import { Icon } from '@/components/icons';

/**
 * Menu entry icon: a bundled inline SVG when the key is "svg-…", otherwise the image the admin panel sent.
 * Both go through <Icon>, so an uploaded image gets exactly the width / height the SVG has in `.mainmenuicon` /
 * `.submenuicon` at every breakpoint (see styles/base/cms-icons.css). `size` is kept for the callers' signature.
 */
export function MenuIcon({ icon }: { icon: string | null; size?: number }) {
  if (!icon) return null;
  return <Icon name={icon} />;
}
