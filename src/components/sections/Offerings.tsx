import { Fragment } from 'react';
import type { OfferingsContent } from '@/types';
import { Icon } from '@/components/icons';
import { link } from '@/lib/utils/markup';

export function Offerings({ data }: { data: OfferingsContent }) {
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
          <ul className="nav navbar-nav" id="servicesTab" role="tablist">
            {data.items.map((item, i) => (
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
            <>{data.items.length > 0 && <div className="tab-pane fade show active" id="app" role="tabpanel" aria-labelledby="app-tab">
              <div className="row align-items-center justify-content-center justify-content-lg-between">
                <div className="col-12 col-lg-5 order-lg-1 text-center">
                  <img
                    loading="lazy"
                    src={data.image.src}
                    alt={data.image.alt}
                    width={data.image.width}
                    height={data.image.height}
                  />
                </div>
                {' '}
                <div className="col-12 col-lg-7">
                  <div className="servicesTabContent_text">
                    <h3>
                      <a {...link(data.link.href)}>
                        {data.link.text}
                      </a>
                    </h3>
                    {' '}
                    <span>
                      {data.text3}
                    </span>
                    {' '}
                    {data.texts.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <p>
                          {item.text}
                        </p>
                      </Fragment>
                    ))}
                    {' '}
                    <ul>
                      {data.items2.map((item, i) => (
                        <Fragment key={i}>
                          {i > 0 && ' '}
                          <li>
                            <a
                              className="waves-effect waves-light"
                              aria-label={item.link.ariaLabel}
                              title={item.link.title}
                              {...link(item.link.href)}
                            >
                              {' '}
                              <Icon name={item.link.icon} />
                              {' '}
                            </a>
                          </li>
                        </Fragment>
                      ))}
                      {' '}
                      <li>
                        <a
                          className="btn-custome btn waves-effect waves-light"
                          title=""
                          {...link(data.link2.href)}
                        >
                          {data.link2.text}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>}</>
            {' '}
            <>{data.items.length > 1 && <div className="tab-pane fade" id="web" role="tabpanel" aria-labelledby="web-tab">
              <div className="row align-items-center justify-content-center justify-content-lg-between">
                <div className="col-12 col-lg-5 order-lg-1 text-center">
                  <img className="lazy" src={data.image2.src} data-src={data.image2.src} decoding="async" alt={data.image2.alt} />
                </div>
                {' '}
                <div className="col-12 col-lg-7">
                  <div className="servicesTabContent_text">
                    <h3>
                      <a {...link(data.link3.href)}>
                        {data.link3.text}
                      </a>
                    </h3>
                    {' '}
                    <span>
                      {data.text4}
                    </span>
                    {' '}
                    {data.texts2.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <p>
                          {item.text}
                        </p>
                      </Fragment>
                    ))}
                    {' '}
                    <ul>
                      {data.items3.map((item, i) => (
                        <Fragment key={i}>
                          {i > 0 && ' '}
                          <li>
                            <a className="waves-effect waves-light" {...link(item.link.href)}>
                              {' '}
                              <Icon name={item.link.icon} />
                              {' '}
                            </a>
                          </li>
                        </Fragment>
                      ))}
                      {' '}
                      <li>
                        <a
                          className="btn-custome btn waves-effect waves-light"
                          title=""
                          {...link(data.link5.href)}
                        >
                          {data.link5.text}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>}</>
            {' '}
            <>{data.items.length > 2 && <div className="tab-pane fade" id="ar-vr" role="tabpanel" aria-labelledby="ar-vr-tab">
              <div className="row align-items-center justify-content-center justify-content-lg-between">
                <div className="col-12 col-lg-5 order-lg-1 text-center">
                  <img className="lazy" src={data.image3.src} data-src={data.image3.src} decoding="async" alt={data.image3.alt} />
                </div>
                {' '}
                <div className="col-12 col-lg-7">
                  <div className="servicesTabContent_text">
                    <h3>
                      <a {...link(data.link6.href)}>
                        {data.link6.text}
                      </a>
                    </h3>
                    {' '}
                    <span>
                      {data.text5}
                    </span>
                    {' '}
                    {data.texts3.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <p>
                          {item.text}
                        </p>
                      </Fragment>
                    ))}
                    {' '}
                    <ul>
                      <li>
                        <a
                          className="btn-custome btn waves-effect waves-light"
                          title=""
                          {...link(data.link8.href)}
                        >
                          {data.link8.text}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>}</>
            {' '}
            <>{data.items.length > 3 && <div className="tab-pane fade" id="game" role="tabpanel" aria-labelledby="game-tab">
              <div className="row align-items-center justify-content-center justify-content-lg-between">
                <div className="col-12 col-lg-5 order-lg-1 text-center">
                  <img className="lazy" src={data.image4.src} data-src={data.image4.src} decoding="async" alt={data.image4.alt} />
                </div>
                {' '}
                <div className="col-12 col-lg-7">
                  <div className="servicesTabContent_text">
                    <h3>
                      <a {...link(data.link9.href)}>
                        {data.link9.text}
                      </a>
                    </h3>
                    {' '}
                    <span>
                      {data.text6}
                    </span>
                    {' '}
                    {data.texts4.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <p>
                          {item.text}
                        </p>
                      </Fragment>
                    ))}
                    {' '}
                    <ul>
                      {data.items4.map((item, i) => (
                        <Fragment key={i}>
                          {i > 0 && ' '}
                          <li>
                            <a
                              className="waves-effect waves-light"
                              title={item.link.title}
                              {...link(item.link.href)}
                            >
                              {' '}
                              <Icon name={item.link.icon} />
                              {' '}
                            </a>
                          </li>
                        </Fragment>
                      ))}
                      {' '}
                      <li>
                        <a
                          className="btn-custome btn waves-effect waves-light"
                          title=""
                          {...link(data.link10.href)}
                        >
                          {data.link10.text}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>}</>
            {' '}
            <>{data.items.length > 4 && <div className="tab-pane fade" id="ui-ux" role="tabpanel" aria-labelledby="ui-ux-tab">
              <div className="row align-items-center justify-content-center justify-content-lg-between">
                <div className="col-12 col-lg-5 order-lg-1 text-center">
                  <img className="lazy" src={data.image5.src} data-src={data.image5.src} decoding="async" alt={data.image5.alt} />
                </div>
                {' '}
                <div className="col-12 col-lg-7">
                  <div className="servicesTabContent_text">
                    <h3>
                      <a {...link(data.link11.href)}>
                        {data.link11.text}
                      </a>
                    </h3>
                    {' '}
                    <span>
                      {data.text7}
                    </span>
                    {' '}
                    {data.texts5.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <p>
                          {item.text}
                        </p>
                      </Fragment>
                    ))}
                    {' '}
                    <ul>
                      <li>
                        <a
                          className="btn-custome btn waves-effect waves-light"
                          title=""
                          {...link(data.link12.href)}
                        >
                          {data.link12.text}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>}</>
          </div>
        </div>
      </div>
    </section>
  );
}
