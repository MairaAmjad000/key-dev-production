import { Fragment } from 'react';
import type { OfferingPanel, OfferingsContent } from '@/types';
import { Icon } from '@/components/icons';
import { link } from '@/lib/utils/markup';

/** The bundled content keeps its five panels in flat fields (image..image5, link..link12); this lists them as panels. */
function bundledPanels(d: OfferingsContent): OfferingPanel[] {
  const subLinks = (list: Array<{ link: { href: string; icon: string; ariaLabel?: string; title?: string } }>) =>
    list.map(({ link: l }) => ({ href: l.href, icon: l.icon, ariaLabel: l.ariaLabel, title: l.title }));
  return [
    { image: d.image, link: d.link, subtitle: d.text3, texts: d.texts, subLinks: subLinks(d.items2), button: d.link2 },
    { image: d.image2, link: d.link3, subtitle: d.text4, texts: d.texts2, subLinks: subLinks(d.items3), button: d.link5 },
    { image: d.image3, link: d.link6, subtitle: d.text5, texts: d.texts3, subLinks: [], button: d.link8 },
    { image: d.image4, link: d.link9, subtitle: d.text6, texts: d.texts4, subLinks: subLinks(d.items4), button: d.link10 },
    { image: d.image5, link: d.link11, subtitle: d.text7, texts: d.texts5, subLinks: [], button: d.link12 },
  ];
}

/** More tabs than the bundled design's five wrap onto a second line instead of running out of the pill (see offerings.css). */
const BUNDLED_TABS = 5;

export function Offerings({ data }: { data: OfferingsContent }) {
  const panels = data.panels ?? bundledPanels(data);
  // A panel needs its tab (which carries the ids the tab script links by) and a tab needs its panel.
  const count = Math.min(panels.length, data.items.length);

  return (
    <section className="padding-60 bg-light">
      <div className="container">
        <div className="title">
          <span>
            {data.text}
          </span>
          {' '}
          <h2>
            {data.heading}
          </h2>
          {' '}
          <p>
            {data.text2}
          </p>
        </div>
        {' '}
        <div className="services-tabs">
          <ul className={`nav navbar-nav${count > BUNDLED_TABS ? ' offerings-many' : ''}`} id="servicesTab" role="tablist">
            {data.items.slice(0, count).map((item, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <li>
                  <a
                    data-toggle="tab"
                    role="tab"
                    aria-selected="true"
                    className={item.link.className}
                    id={item.link.id}
                    aria-controls={item.link.ariaControls}
                    {...link(item.link.href)}
                  >
                    {' '}
                    <Icon name={item.link.icon} />
                    {' '}
                    <span className="w-100" dangerouslySetInnerHTML={{ __html: item.link.text }} />
                    {' '}
                  </a>
                </li>
              </Fragment>
            ))}
          </ul>
          {' '}
          <div className="tab-content" id="servicesTabContent">
            {panels.slice(0, count).map((panel, i) => {
              const tab = data.items[i].link;
              return (
                <Fragment key={tab.id}>
                  {i > 0 && ' '}
                  <div className={`tab-pane fade${i === 0 ? ' show active' : ''}`} id={tab.ariaControls} role="tabpanel" aria-labelledby={tab.id}>
                    <div className="row align-items-center justify-content-center justify-content-lg-between">
                      <div className="col-12 col-lg-5 order-lg-1 text-center">
                        {panel.image.src && (i === 0 ? (
                          <img
                            loading="lazy"
                            src={panel.image.src}
                            alt={panel.image.alt}
                            width={panel.image.width}
                            height={panel.image.height}
                          />
                        ) : (
                          <img className="lazy" src={panel.image.src} data-src={panel.image.src} decoding="async" alt={panel.image.alt} />
                        ))}
                      </div>
                      {' '}
                      <div className="col-12 col-lg-7">
                        <div className="servicesTabContent_text">
                          <h3>
                            <a {...link(panel.link.href)}>
                              {panel.link.text}
                            </a>
                          </h3>
                          {' '}
                          <span>
                            {panel.subtitle}
                          </span>
                          {' '}
                          {panel.texts.map((item, j) => (
                            <Fragment key={j}>
                              {j > 0 && ' '}
                              <p>
                                {item.text}
                              </p>
                            </Fragment>
                          ))}
                          {' '}
                          <ul>
                            {panel.subLinks.map((item, j) => (
                              <Fragment key={j}>
                                {j > 0 && ' '}
                                <li>
                                  <a
                                    className="waves-effect waves-light"
                                    aria-label={item.ariaLabel}
                                    title={item.title}
                                    {...link(item.href)}
                                  >
                                    {' '}
                                    <Icon name={item.icon} />
                                    {' '}
                                  </a>
                                </li>
                              </Fragment>
                            ))}
                            {panel.subLinks.length > 0 && ' '}
                            {panel.button.text && (
                              <li>
                                <a
                                  className="btn-custome btn waves-effect waves-light"
                                  title=""
                                  {...link(panel.button.href)}
                                >
                                  {panel.button.text}
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
