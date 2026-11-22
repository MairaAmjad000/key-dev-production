import { Fragment } from 'react';
import type { FooterContent } from '@/types';
import { link } from '@/lib/utils/markup';

/**
 * The big "10 YEARS" badge, drawn from the number the admin panel sends (it used to be a fixed picture).
 * Same box as the bundled picture (137 x 205): a tall teal number, with the word YEARS in light cyan under it.
 * The digits are stretched to the badge width with `textLength`, which gives the narrow, tall look of the original.
 */
function ExperienceBadge({ years }: { years: string }) {
  const length = Math.min(137, 68 * years.length);
  return (
    <svg viewBox="0 0 137 205" width="100%" role="img" aria-label={`${years} years`} style={{ display: 'block' }}>
      <text
        x={(137 - length) / 2}
        y="150"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="700"
        fontSize="205"
        fill="#3d9a7e"
        textLength={length}
        lengthAdjust="spacingAndGlyphs"
      >
        {years}
      </text>
      <text
        x="6"
        y="198"
        fontFamily="Montserrat, Arial, sans-serif"
        fontWeight="300"
        fontSize="24"
        fill="#8ef3fa"
        textLength="125"
        lengthAdjust="spacing"
      >
        YEARS
      </text>
    </svg>
  );
}

export function Footer({ data }: { data: FooterContent }) {
  return (
    <div>
      <section className="footer-main">
        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 col-md-12 col-12 order-2 foot-center-col">
                <div className="foot-exp-wrap text-right">
                  <div className="foot-exp-box d-flex">
                    <div className="foot-exp-char">
                      {data.years ? (
                        <ExperienceBadge years={data.years} />
                      ) : (
                        data.image.src && (
                          <img
                            className="lazy"
                            src={data.image.src} data-src={data.image.src} decoding="async"
                            width={data.image.width}
                            height={data.image.height}
                            alt={data.image.alt}
                          />
                        )
                      )}
                    </div>
                    {' '}
                    <div className="foot-exp-text-wrap text-center">
                      <div className="foot-exp-text-button rounded10 mb-30">
                        {data.exps.map((item, i) => (
                          <Fragment key={i}>
                            {i > 0 && ' '}
                            <span className={item.className}>
                              {item.text}
                            </span>
                          </Fragment>
                        ))}
                      </div>
                      {' '}
                      <a className="btn-custome btn btn-lg waves-effect waves-light" {...link(data.link.href)}>
                        {data.link.text}
                      </a>
                    </div>
                  </div>
                  {' '}
                  <div className="foot-social text-center">
                    <ul className="header_social">
                      {data.items.map((item, i) => (
                        <Fragment key={i}>
                          {i > 0 && ' '}
                          <li>
                            <a
                              rel="noopener"
                              target="_blank"
                              title={item.link.title}
                              className={item.link.className}
                              {...link(item.link.href)}
                            />
                          </li>
                        </Fragment>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {' '}
              {data.footCenterCols.map((item, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  <div className={item.className}>
                    <div className="foot-menu">
                      <h4>
                        {item.subheading}
                      </h4>
                      {' '}
                      <ul>
                        {item.items.map((item2, i2) => (
                          <Fragment key={i2}>
                            {i2 > 0 && ' '}
                            <li>
                              <a {...link(item2.link.href)}>
                                {item2.link.text}
                              </a>
                            </li>
                          </Fragment>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
            {' '}
            <hr />
          </div>
        </div>
        {' '}
        <div className="footer-center">
          <div className="container">
            <div className="footer-center-top-content text-center">
              <p dangerouslySetInnerHTML={{ __html: data.text }} />
              {' '}
              <span dangerouslySetInnerHTML={{ __html: data.text2 }} />
            </div>
            {' '}
            <div className="footer-center-top-market">
              <div className="row align-items-center">
                <div className="col-lg-8 col-md-12 col-sm-12 col-12">
                  <div className="footer-center-market-list d-flex">
                    {data.items2.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <div className="item">
                          <img
                            className="lazy"
                            src={item.image.src} data-src={item.image.src} decoding="async"
                            width={item.image.width}
                            height={item.image.height}
                            alt={item.image.alt}
                            // Keep the proportions of the bundled badge (e.g. 127 x 135) whatever shape the upload has;
                            // the CSS fixes the height and `object-fit: cover` crops the picture to that frame.
                            style={Number(item.image.width) > 0 && Number(item.image.height) > 0 ? { aspectRatio: `${item.image.width} / ${item.image.height}` } : undefined}
                          />
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
                {' '}
                <div className="col-lg-4 col-md-12 col-sm-12 col-12 text-center text-lg-right">
                  <a className="btn-custome btn waves-effect waves-light" {...link(data.link2.href)}>
                    {data.link2.text}
                  </a>
                </div>
              </div>
            </div>
            {' '}
            <hr />
          </div>
        </div>
        {' '}
        <div className="footer-bottom">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-5 col-md-12 col-sm-12 col-12 text-center text-lg-left order-1 order-lg-0">
                <div className="foot-copy">
                  <p>
                    {data.text3}
                  </p>
                </div>
              </div>
              {' '}
              <div className="col-lg-7 col-md-12 col-sm-12 col-12 text-center text-lg-right order-0 order-lg-1">
                <ul className="foot-link">
                  {data.items3.map((item, i) => (
                    <Fragment key={i}>
                      {i > 0 && ' '}
                      <li>
                        <a {...link(item.link.href)}>
                          {item.link.text}
                        </a>
                      </li>
                    </Fragment>
                  ))}
                </ul>
                {' '}
                <div className="foot-vat-no">
                  <p>
                    {data.text4}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
