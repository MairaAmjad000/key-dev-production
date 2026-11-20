import { Fragment } from 'react';
import type { MenuItem, MobileMenuContent } from '@/types';
import { Icon } from '@/components/icons';
import { link } from '@/lib/utils/markup';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isSolution = (item: MenuItem) => /solution/i.test(`${item.url} ${item.title}`);
const targetOf = (item: MenuItem) => (item.target && item.target !== '_self' ? { target: item.target, rel: 'noopener' } : {});

/** "<i class=…></i>Text" entries of the bundled menu, keyed by their lower-case text, so the same icons are reused by title. */
function iconPrefixes(data: MobileMenuContent): Map<string, string> {
  const map = new Map<string, string>();
  for (const html of [data.link.html, data.link2.html, data.link3.html, data.link13.html, data.link14.html, data.link15.html]) {
    const match = html.match(/^(<i class="[^"]*"><\/i>\s*)(.*)$/);
    if (match) map.set(match[2].trim().toLowerCase(), match[1]);
  }
  map.set('services', map.get('our service') ?? '');
  return map;
}

/** The mobile menu built from the admin panel's header menu: same markup as the bundled one below. */
function MenuFromCms({ items, data }: { items: MenuItem[]; data: MobileMenuContent }) {
  const prefixes = iconPrefixes(data);
  const menuText = data.link4.text;
  const label = (item: MenuItem) => ({ __html: `${prefixes.get(item.title.trim().toLowerCase()) ?? ''}${escapeHtml(item.title)}` });
  return (
    <ul id="cd-primary-nav" className="cd-primary-nav is-fixed">
      {items.map((item) => {
        if (item.children.length === 0) {
          return (
            <li key={item.id}>
              <a className="" dangerouslySetInnerHTML={label(item)} {...link(item.url)} {...targetOf(item)} />
            </li>
          );
        }
        const solution = item.isFluid && isSolution(item);
        return (
          <li key={item.id} className="has-children">
            {solution ? (
              <a {...link(item.url)}>
                <div className="icon"><Icon name="svg-606d53" /></div>
                {item.title}
              </a>
            ) : (
              <a dangerouslySetInnerHTML={label(item)} {...link('javascript:')} />
            )}
            <ul className="cd-secondary-nav is-hidden">
              <li className="go-back"><a {...link('javascript:')}>{menuText}</a></li>
              {item.children.map((child) =>
                item.isFluid ? (
                  <li key={child.id} className="has-children">
                    <a {...link('javascript:')}>{child.title}</a>
                    <ul className="is-hidden">
                      <li className="go-back"><a {...link('javascript:')}>{child.title}</a></li>
                      {!solution && <li><a className="" {...link(child.url)}>{child.title}</a></li>}
                      {child.children.map((leaf) => (
                        <li key={leaf.id}><a className="" {...link(leaf.url)} {...targetOf(leaf)}>{leaf.title}</a></li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={child.id}><a className="" {...link(child.url)} {...targetOf(child)}>{child.title}</a></li>
                ),
              )}
            </ul>
          </li>
        );
      })}
      <li><a className="estimate_btn" {...link(data.estimateBtn.href)}>{data.estimateBtn.text}</a></li>
    </ul>
  );
}

export function MobileMenu({ data, menu }: { data: MobileMenuContent; menu?: MenuItem[] }) {
  return (
    <div className="mobile_menu">
      <a className="cd-nav-trigger" aria-label={data.cdNavTrigger.ariaLabel} {...link(data.cdNavTrigger.href)}>
        <span />
      </a>
      {' '}
      <nav className="cd-nav">
        {menu && menu.length > 0 ? <MenuFromCms items={menu} data={data} /> : (
        <ul id="cd-primary-nav" className="cd-primary-nav is-fixed">
          <li>
            <a dangerouslySetInnerHTML={{ __html: data.link.html }} {...link(data.link.href)} />
          </li>
          {' '}
          <li className="has-children">
            <a dangerouslySetInnerHTML={{ __html: data.link2.html }} {...link(data.link2.href)} />
            {' '}
            <ul className="cd-secondary-nav is-hidden">
              {data.goBacks.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  <li className={item.className}>
                    <a className={item.link.className} {...link(item.link.href)}>
                      {item.link.text}
                    </a>
                  </li>
                </Fragment>
              ))}
            </ul>
          </li>
          {' '}
          <li className="has-children">
            <a dangerouslySetInnerHTML={{ __html: data.link3.html }} {...link(data.link3.href)} />
            {' '}
            <ul className="cd-secondary-nav is-hidden">
              <li className="go-back">
                <a {...link(data.link4.href)}>
                  {data.link4.text}
                </a>
              </li>
              {' '}
              <li className="has-children">
                <a {...link(data.link5.href)}>
                  {data.link5.text}
                </a>
                {' '}
                <ul className="is-hidden">
                  {data.goBacks2.map((item, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      <li className={item.className}>
                        <a className={item.link.className} {...link(item.link.href)}>
                          {item.link.text}
                        </a>
                      </li>
                    </Fragment>
                  ))}
                </ul>
              </li>
              {' '}
              <li className="has-children">
                <a {...link(data.link6.href)}>
                  {data.link6.text}
                </a>
                {' '}
                <ul className="is-hidden">
                  {data.goBacks3.map((item, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      <li className={item.className}>
                        <a className={item.link.className} {...link(item.link.href)}>
                          {item.link.text}
                        </a>
                      </li>
                    </Fragment>
                  ))}
                  {' '}
                  <li>
                    <a className="" {...link(data.link7.href)}>
                      {data.link7.text}
                    </a>
                  </li>
                </ul>
              </li>
              {' '}
              <li className="has-children">
                <a {...link(data.link8.href)}>
                  {data.link8.text}
                </a>
                {' '}
                <ul className="is-hidden">
                  {data.goBacks4.map((item, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      <li className={item.className}>
                        <a className={item.link.className} {...link(item.link.href)}>
                          {item.link.text}
                        </a>
                      </li>
                    </Fragment>
                  ))}
                </ul>
              </li>
              {' '}
              <li className="has-children">
                <a {...link(data.link9.href)}>
                  {data.link9.text}
                </a>
                {' '}
                <ul className="is-hidden">
                  {data.goBacks5.map((item, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      <li className={item.className}>
                        <a className={item.link.className} {...link(item.link.href)}>
                          {item.link.text}
                        </a>
                      </li>
                    </Fragment>
                  ))}
                  {' '}
                  <li>
                    <a className="" {...link(data.link10.href)}>
                      {data.link10.text}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          {' '}
          <li className="has-children">
            <a {...link(data.link11.href)}>
              {' '}
              <div className="icon">
                <Icon name="svg-606d53" />
              </div>
              {data.link11.text}
              {' '}
            </a>
            {' '}
            <ul className="cd-secondary-nav is-hidden">
              <li className="go-back">
                <a {...link(data.link12.href)}>
                  {data.link12.text}
                </a>
              </li>
              {' '}
              {data.hasChildrens.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  <li className="has-children">
                    <a {...link(item.link.href)}>
                      {item.link.text}
                    </a>
                    {' '}
                    <ul className="is-hidden">
                      {item.goBacks.map((item2, i2) => (
                        <Fragment key={i2}>
                          {i2 > 0 && ' '}
                          <li className={item2.className}>
                            <a className={item2.link.className} {...link(item2.link.href)}>
                              {item2.link.text}
                            </a>
                          </li>
                        </Fragment>
                      ))}
                    </ul>
                  </li>
                </Fragment>
              ))}
            </ul>
          </li>
          {' '}
          <li>
            <a className="" dangerouslySetInnerHTML={{ __html: data.link13.html }} {...link(data.link13.href)} />
          </li>
          {' '}
          <li>
            <a className="" dangerouslySetInnerHTML={{ __html: data.link14.html }} {...link(data.link14.href)} />
          </li>
          {' '}
          <li>
            <a className="" dangerouslySetInnerHTML={{ __html: data.link15.html }} {...link(data.link15.href)} />
          </li>
          {' '}
          <li>
            <a className="estimate_btn" {...link(data.estimateBtn.href)}>
              {data.estimateBtn.text}
            </a>
          </li>
        </ul>
        )}
      </nav>
    </div>
  );
}
