/**
 * GET /layout + GET /form-options → the site-wide content the components already render.
 *
 * Every field the admin panel has an equivalent for comes ONLY from the API (empty when the admin left it empty):
 * nothing is borrowed from the bundled content/ files. The bundled data only supplies what the API has no field
 * for (markup, CSS classes, form labels, fixed artwork) and the width / height attributes of images, so an
 * uploaded logo or picture takes exactly the box of the placeholder it replaces.
 */
import type { FooterContent, FormOption, FormsContent, HeaderContent, MenuItem, SiteData, SiteMenus, SiteSettings } from '@/types';
import type { ApiFormOptions, ApiLayout, ApiMenuItem, Maybe } from './api-types';
import { escapeHtml, pick, toSeoMeta } from './common';

const str = (...values: Array<Maybe<string>>) => pick(...values) ?? '';

type Settings = NonNullable<ApiLayout['settings']>;

export function adaptSettings(api: Maybe<Settings>, local: SiteSettings): SiteSettings {
  return {
    ...local,
    seo: {
      title: str(api?.seo?.meta_title),
      description: str(api?.seo?.meta_description),
      siteName: str(api?.general?.site_name),
      favicon: str(api?.general?.favicon),
      ...toSeoMeta(api?.seo),
    },
  };
}

/** Five star icons for a 0-5 rating (half stars supported); no rating means no stars. */
function toStars(rating: Maybe<number>, template: Array<{ className: string }>): Array<{ className: string }> {
  if (rating == null || Number.isNaN(Number(rating))) return [];
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) * 2) / 2));
  const full = Math.floor(value);
  const half = value - full === 0.5;
  return Array.from({ length: 5 }, (_, i) => ({
    ...template[0],
    className: i < full ? 'fas fa-star' : i === full && half ? 'fas fa-star-half-alt' : 'far fa-star',
  }));
}

export function adaptHeader(api: Maybe<Settings>, local: HeaderContent): HeaderContent {
  const top = api?.header_top_bar;
  const contact = api?.contact;
  const callback = str(top?.callback_text);
  const phone = pick(contact?.phone);
  const email = pick(contact?.email);
  const [ratingStrong, ...ratingRest] = str(top?.rating_text).split(' ');

  const header: HeaderContent = {
    ...local,
    estimateBtn: { ...local.estimateBtn, text: callback, ariaLabel: callback },
    link: {
      ...local.link,
      href: str(top?.link),
      // Badge picture and alt come from the API; width / height stay those of the bundled badge.
      image: { ...local.link.image, src: str(top?.clutch_image), alt: str(api?.general?.site_name) },
      icons: toStars(top?.rating, local.link.icons),
      strong: ratingStrong ?? '',
      text: ratingRest.join(' '),
    },
    text: email
      ? `${escapeHtml(str(top?.email_text))} <a href="mailto:${escapeHtml(email)}"><strong>${escapeHtml(email)}</strong></a> ${escapeHtml(str(top?.phone_text))}`.trim()
      : '',
    link2: phone ? { href: `tel:${phone.replace(/[^\d+]/g, '')}`, strong: phone } : { href: '', strong: '' },
    headRequetBtn: { ...local.headRequetBtn, text: callback, image: { ...local.headRequetBtn.image, src: str(top?.consultant_image), alt: str(callback, api?.general?.site_name) } },
    link3: { ...local.link3, image: { ...local.link3.image, src: str(api?.general?.logo), alt: str(api?.general?.site_name) } },
  };

  const services = api?.header_services_cta;
  header.big = str(services?.title);
  header.link13 = { ...header.link13, title: str(services?.phone), href: str(services?.phone_link) };
  header.link14 = { href: str(services?.button_url), text: str(services?.button_text) };
  const solutions = api?.header_solutions_cta;
  header.big2 = str(solutions?.title);
  header.link16 = { href: str(solutions?.phone_link), text: str(solutions?.phone) };
  header.link17 = { href: str(solutions?.button_url), text: str(solutions?.button_text) };
  // The admin's `header_button` can come back with null text/link (field left empty). An empty navbar button looks
  // broken, so this one button falls back to the bundled label and link when the API sends nothing.
  header.estimateBtn2 = {
    href: pick(api?.header_button?.link) ?? local.estimateBtn2.href,
    text: pick(api?.header_button?.text) ?? local.estimateBtn2.text,
  };
  return header;
}

const SOCIAL_ICONS: Record<string, { title: string; className: string }> = {
  facebook: { title: 'Facebook', className: 'fab fa-facebook-f' },
  instagram: { title: 'Instagram', className: 'fab fa-instagram' },
  twitter: { title: 'Twitter', className: 'fab fa-twitter' },
  linkedin: { title: 'Linkedin', className: 'fab fa-linkedin-in' },
  behance: { title: 'Behance', className: 'fab fa-behance' },
  youtube: { title: 'Youtube', className: 'fab fa-youtube' },
};

function toMenuItems(items: Maybe<ApiMenuItem[]>): MenuItem[] {
  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    url: pick(item.url) ?? 'javascript:;',
    icon: pick(item.icon) ?? null,
    isFluid: item.is_fluid === true,
    target: pick(item.target) ?? '_self',
    children: toMenuItems(item.children),
  }));
}

/** Menus from GET /layout. Always returned, so the bundled (dummy) menus are never rendered. */
export function adaptMenus(api: Maybe<ApiLayout['menus']>): SiteMenus {
  return { header: toMenuItems(api?.header), footer: toMenuItems(api?.footer) };
}

export function adaptFooter(api: Maybe<Settings>, local: FooterContent, footerMenu: MenuItem[] = []): FooterContent {
  const footer: FooterContent = { ...local };

  const experience = api?.footer_experience;
  // The big "10 YEARS" badge is drawn from the API number (no static picture); the text box keeps the bundled design:
  // first word of the title in the big teal line ("Experience"), the rest below it ("in the Industry").
  const yearsNumber = (pick(experience?.years) ?? '').replace(/\D/g, '');
  const [titleFirst = '', ...titleRest] = str(experience?.title).split(/\s+/);
  footer.years = yearsNumber;
  footer.image = { ...local.image, src: '' };
  footer.exps = [
    { className: local.exps[0]?.className ?? 'exp', text: titleFirst },
    { className: local.exps[1]?.className ?? 'indus', text: titleRest.join(' ') },
  ];
  footer.link = { href: str(experience?.button_link), text: str(experience?.button_text) };

  footer.items = Object.entries(api?.social ?? {}).flatMap(([key, href]) => {
    const icon = SOCIAL_ICONS[key.toLowerCase()];
    return icon && pick(href) ? [{ link: { title: icon.title, href: pick(href) as string, className: icon.className } }] : [];
  });

  // Footer menu entries that have children become the link columns; otherwise the expertise / solutions lists do.
  const menuColumns = footerMenu.filter((item) => item.children.length > 0);
  const columns =
    menuColumns.length > 0
      ? menuColumns.map((item) => ({ title: item.title, links: item.children.map((child) => ({ title: child.title, url: child.url })) }))
      : [
          { title: api?.footer_expertise?.title, links: api?.footer_expertise?.services },
          { title: api?.footer_solutions?.title, links: api?.footer_solutions?.solutions },
        ];
  footer.footCenterCols = local.footCenterCols.map((column, i) => ({
    ...column,
    subheading: str(columns[i]?.title),
    items: (columns[i]?.links ?? []).map((item) => ({ link: { href: item.url, text: item.title } })),
  }));

  const awards = api?.footer_awards;
  const stars = local.text.match(/<span class="rating_text_footer">[\s\S]*?<\/span>/)?.[0] ?? '';
  const clutch = pick(api?.footer_clutch?.text, awards?.text);
  footer.text = clutch ? `${stars} ${escapeHtml(clutch)}`.trim() : '';
  footer.text2 = pick(awards?.disclaimer) ? escapeHtml(pick(awards?.disclaimer) as string) : '';
  // Award badges keep the width / height of the bundled badge in the same position.
  footer.items2 = (awards?.items ?? []).flatMap((item, i) =>
    pick(item.image)
      ? [{ image: { src: pick(item.image) as string, width: local.items2[i]?.image.width ?? local.items2[0]?.image.width ?? '', height: local.items2[i]?.image.height ?? local.items2[0]?.image.height ?? '', alt: `${str(api?.general?.site_name)} award ${i + 1}`.trim() } }]
      : [],
  );
  footer.link2 = { href: str(awards?.button_link), text: str(awards?.button_text) };

  const bottom = api?.footer_bottom;
  footer.text3 = str(bottom?.copyright);
  footer.text4 = str(bottom?.registration_text);
  footer.items3 = [
    { text: pick(bottom?.contact_text), href: pick(bottom?.contact_link) },
    { text: pick(bottom?.privacy_text), href: pick(bottom?.privacy_link) },
  ].flatMap((item) => (item.text ? [{ link: { href: item.href ?? '#', text: item.text } }] : []));
  return footer;
}

function toOptions(placeholder: FormOption | undefined, labels: Maybe<string[]>): FormOption[] {
  return [...(placeholder && placeholder.value === '' ? [placeholder] : []), ...(labels ?? []).map((label) => ({ value: label, label }))];
}

export function adaptForms(api: Maybe<ApiFormOptions>, local: FormsContent): FormsContent {
  return {
    service: toOptions(local.service[0], api?.services?.map((service) => service.title)),
    region: toOptions(local.region[0], api?.regions),
    budget: toOptions(local.budget[0], api?.budgets),
    reference: toOptions(local.reference[0], api?.hear_about),
  };
}

/** Everything that comes from GET /layout and GET /form-options; the rest of `local` (markup-only blocks) is kept. */
export function adaptLayout(layout: Maybe<ApiLayout>, formOptions: Maybe<ApiFormOptions>, local: SiteData): SiteData {
  const settings = layout?.settings;
  const menus = adaptMenus(layout?.menus);
  const cookie = settings?.cookie;
  const top = settings?.header_top_bar;
  return {
    ...local,
    settings: adaptSettings(settings, local.settings),
    forms: adaptForms(formOptions, local.forms),
    header: adaptHeader(settings, local.header),
    footer: adaptFooter(settings, local.footer, menus.footer),
    menus,
    cookieAlert: {
      ...local.cookieAlert,
      b: str(cookie?.title),
      text3: pick(cookie?.text)
        ? `${escapeHtml(pick(cookie?.text) as string)}${pick(cookie?.button_link) ? ` <a href="${escapeHtml(pick(cookie?.button_link) as string)}">Learn more</a>` : ''}`
        : '',
      customeBtn: { ...local.cookieAlert.customeBtn, text: str(cookie?.button_text) },
    },
    callBackSidebar: {
      ...local.callBackSidebar,
      image: { ...local.callBackSidebar.image, src: str(top?.consultant_image) },
      headCallBackContentTitle: str(top?.callback_text),
    },
  };
}
