/**
 * GET /layout + GET /form-options → the site-wide content the components already render.
 *
 * Only fields the admin panel sends replace the bundled content/ values; the markup and everything the
 * API has no field for (images shipped with the site, form labels, mega-menu structure) stay as they are.
 */
import type { FooterContent, FormOption, FormsContent, HeaderContent, MenuItem, SiteData, SiteMenus, SiteSettings } from '@/types';
import type { ApiFormOptions, ApiLayout, ApiMenuItem, Maybe } from './api-types';
import { escapeHtml, pick, toSeoMeta } from './common';

type Settings = NonNullable<ApiLayout['settings']>;

export function adaptSettings(api: Maybe<Settings>, local: SiteSettings): SiteSettings {
  if (!api) return local;
  const meta = toSeoMeta(api.seo);
  return {
    ...local,
    seo: {
      ...local.seo,
      title: pick(api.seo?.meta_title) ?? local.seo.title,
      description: pick(api.seo?.meta_description) ?? local.seo.description,
      siteName: pick(api.general?.site_name) ?? local.seo.siteName,
      favicon: pick(api.general?.favicon) ?? local.seo.favicon,
      ...meta,
    },
  };
}

export function adaptHeader(api: Maybe<Settings>, local: HeaderContent): HeaderContent {
  if (!api) return local;
  const top = api.header_top_bar;
  const contact = api.contact;
  const callback = pick(top?.callback_text);
  const phone = pick(contact?.phone);
  const email = pick(contact?.email);
  const [ratingStrong, ...ratingRest] = (pick(top?.rating_text) ?? '').split(' ');

  const header: HeaderContent = {
    ...local,
    estimateBtn: { ...local.estimateBtn, text: callback ?? local.estimateBtn.text, ariaLabel: callback ?? local.estimateBtn.ariaLabel },
    link: {
      ...local.link,
      href: pick(top?.link) ?? local.link.href,
      strong: ratingStrong || local.link.strong,
      text: ratingRest.length > 0 ? ratingRest.join(' ') : local.link.text,
    },
    text: email
      ? `${escapeHtml(pick(top?.email_text) ?? 'Email us on')} <a href="mailto:${escapeHtml(email)}"><strong>${escapeHtml(email)}</strong></a> ${escapeHtml(pick(top?.phone_text) ?? '')}`.trim()
      : local.text,
    link2: phone ? { href: `tel:${phone.replace(/[^\d+]/g, '')}`, strong: phone } : local.link2,
    headRequetBtn: {
      ...local.headRequetBtn,
      text: callback ?? local.headRequetBtn.text,
      image: { ...local.headRequetBtn.image, src: pick(top?.consultant_image) ?? local.headRequetBtn.image.src },
    },
    link3: {
      ...local.link3,
      image: { ...local.link3.image, src: pick(api.general?.logo) ?? local.link3.image.src },
    },
  };

  const services = api.header_services_cta;
  if (services) {
    header.big = pick(services.title) ?? header.big;
    header.link13 = { ...header.link13, title: pick(services.phone) ?? header.link13.title, href: pick(services.phone_link) ?? header.link13.href };
    header.link14 = { href: pick(services.button_url) ?? header.link14.href, text: pick(services.button_text) ?? header.link14.text };
  }
  const solutions = api.header_solutions_cta;
  if (solutions) {
    header.big2 = pick(solutions.title) ?? header.big2;
    header.link16 = { href: pick(solutions.phone_link) ?? header.link16.href, text: pick(solutions.phone) ?? header.link16.text };
    header.link17 = { href: pick(solutions.button_url) ?? header.link17.href, text: pick(solutions.button_text) ?? header.link17.text };
  }
  const button = api.header_button;
  if (pick(button?.text)) {
    header.estimateBtn2 = { href: pick(button?.link) ?? header.estimateBtn2.href, text: pick(button?.text) ?? header.estimateBtn2.text };
  }
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

/** Menus from GET /layout; undefined when the API sent no header menu (the bundled menus are then used). */
export function adaptMenus(api: Maybe<ApiLayout['menus']>): SiteMenus | undefined {
  const header = toMenuItems(api?.header);
  if (header.length === 0) return undefined;
  return { header, footer: toMenuItems(api?.footer) };
}

export function adaptFooter(api: Maybe<Settings>, local: FooterContent, footerMenu: MenuItem[] = []): FooterContent {
  if (!api) return local;
  const footer: FooterContent = { ...local };

  const experience = api.footer_experience;
  if (experience) {
    const years = pick(experience.years);
    footer.exps = [
      { className: local.exps[0]?.className ?? 'exp', text: years ? `${years}+ Years` : local.exps[0]?.text ?? '' },
      { className: local.exps[1]?.className ?? 'indus', text: pick(experience.title) ?? local.exps[1]?.text ?? '' },
    ];
    footer.link = { href: pick(experience.button_link) ?? local.link.href, text: pick(experience.button_text) ?? local.link.text };
  }

  if (api.social) {
    const items = Object.entries(api.social).flatMap(([key, href]) => {
      const icon = SOCIAL_ICONS[key.toLowerCase()];
      return icon && pick(href) ? [{ link: { title: icon.title, href: pick(href) as string, className: icon.className } }] : [];
    });
    if (items.length > 0) footer.items = items;
  }

  // Footer menu entries that have children become the link columns; otherwise the expertise / solutions lists do.
  const menuColumns = footerMenu.filter((item) => item.children.length > 0);
  const columns =
    menuColumns.length > 0
      ? menuColumns.map((item) => ({ title: item.title, links: item.children.map((child) => ({ title: child.title, url: child.url })) }))
      : [
          { title: api.footer_expertise?.title, links: api.footer_expertise?.services },
          { title: api.footer_solutions?.title, links: api.footer_solutions?.solutions },
        ];
  footer.footCenterCols = local.footCenterCols.map((column, i) => {
    const source = columns[i];
    if (!source?.links) return column;
    return {
      ...column,
      subheading: pick(source.title) ?? column.subheading,
      items: source.links.map((item) => ({ link: { href: item.url, text: item.title } })),
    };
  });

  const awards = api.footer_awards;
  if (awards) {
    const stars = local.text.match(/<span class="rating_text_footer">[\s\S]*?<\/span>/)?.[0] ?? '';
    footer.text = pick(api.footer_clutch?.text, awards.text) ? `${stars} ${escapeHtml(pick(api.footer_clutch?.text, awards.text) as string)}`.trim() : local.text;
    footer.text2 = pick(awards.disclaimer) ? escapeHtml(pick(awards.disclaimer) as string) : local.text2;
    if (awards.items && awards.items.length > 0) {
      footer.items2 = awards.items.flatMap((item, i) =>
        pick(item.image)
          ? [{ image: { src: pick(item.image) as string, width: local.items2[i]?.image.width ?? local.items2[0]?.image.width ?? '', height: local.items2[i]?.image.height ?? local.items2[0]?.image.height ?? '', alt: '' } }]
          : [],
      );
    }
    footer.link2 = { href: pick(awards.button_link) ?? local.link2.href, text: pick(awards.button_text) ?? local.link2.text };
  }

  const bottom = api.footer_bottom;
  if (bottom) {
    footer.text3 = pick(bottom.copyright) ?? local.text3;
    footer.text4 = pick(bottom.registration_text) ?? local.text4;
    const links = [
      { text: pick(bottom.contact_text), href: pick(bottom.contact_link) },
      { text: pick(bottom.privacy_text), href: pick(bottom.privacy_link) },
    ].flatMap((item, i) => (item.text ? [{ link: { href: item.href ?? local.items3[i]?.link.href ?? '#', text: item.text } }] : []));
    if (links.length > 0) footer.items3 = links;
  }
  return footer;
}

function toOptions(placeholder: FormOption | undefined, labels: Maybe<string[]>, fallback: FormOption[]): FormOption[] {
  if (!labels || labels.length === 0) return fallback;
  return [...(placeholder && placeholder.value === '' ? [placeholder] : []), ...labels.map((label) => ({ value: label, label }))];
}

export function adaptForms(api: Maybe<ApiFormOptions>, local: FormsContent): FormsContent {
  if (!api) return local;
  return {
    service: toOptions(local.service[0], api.services?.map((service) => service.title), local.service),
    region: toOptions(local.region[0], api.regions, local.region),
    budget: toOptions(local.budget[0], api.budgets, local.budget),
    reference: toOptions(local.reference[0], api.hear_about, local.reference),
  };
}

/** Everything that comes from GET /layout and GET /form-options; the rest of `local` is kept. */
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
    footer: adaptFooter(settings, local.footer, menus?.footer),
    ...(menus ? { menus } : {}),
    cookieAlert: cookie
      ? {
          ...local.cookieAlert,
          b: pick(cookie.title) ?? local.cookieAlert.b,
          text3: pick(cookie.text)
            ? `${escapeHtml(pick(cookie.text) as string)} <a href="${escapeHtml(pick(cookie.button_link) ?? '/privacy-policy')}">Learn more</a>`
            : local.cookieAlert.text3,
          customeBtn: { ...local.cookieAlert.customeBtn, text: pick(cookie.button_text) ?? local.cookieAlert.customeBtn.text },
        }
      : local.cookieAlert,
    callBackSidebar: top
      ? {
          ...local.callBackSidebar,
          image: { ...local.callBackSidebar.image, src: pick(top.consultant_image) ?? local.callBackSidebar.image.src },
          headCallBackContentTitle: pick(top.callback_text) ?? local.callBackSidebar.headCallBackContentTitle,
        }
      : local.callBackSidebar,
  };
}
