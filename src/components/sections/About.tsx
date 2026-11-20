import { Fragment } from 'react';
import type { AboutContent } from '@/types';

export function About({ data }: { data: AboutContent }) {
  // The photo keeps the proportions of the picture the layout was designed around (width / height of the content),
  // whatever shape the uploaded picture has: `object-fit: cover` crops it to that frame instead of resizing the frame.
  const frameWidth = Number(data.image2.width);
  const frameHeight = Number(data.image2.height);
  const frameRatio = frameWidth > 0 && frameHeight > 0 ? `${frameWidth} / ${frameHeight}` : undefined;
  return (
    <section className="about">
      <div className="about-bg-section">
        {data.image.src && <img
          style={{ position: "absolute", left: "0", top: "0", height: "100%", width: "100%", objectFit: "cover" }}
          alt=""
          width=""
          height=""
          src={data.image.src}
        />}
      </div>
      {' '}
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-lg-6 col-sm-12 mb-4 mb-lg-0">
            <div className="video-area-wrapper">
              {data.image2.src && <img
                src={data.image2.src}
                alt={data.image2.alt}
                width={data.image2.width}
                height={data.image2.height}
                style={frameRatio ? { aspectRatio: frameRatio } : undefined}
              />}
              {' '}
              <div className="hover" />
            </div>
          </div>
          {' '}
          <div className="col-12 col-lg-6 col-sm-12">
            <div className="title text-left">
              <span>
                {data.text}
              </span>
              {' '}
              <h2>
                {data.heading}
              </h2>
            </div>
            {' '}
            {data.heading2 && (
              <h3 className="mb-3" style={{ marginBottom: "1px !important" }}>
                {data.heading2}
              </h3>
            )}
            {' '}
            {data.texts.map((item, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <p>
                  {item.text}
                </p>
              </Fragment>
            ))}
          </div>
        </div>
        {' '}
        <ul className="counter-section">
          {data.items.map((item, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <li>
                {item.image.src && <img src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} />}
                {' '}
                <div className="counter_text">
                  <div className="counter" data-count={item.counter.dataCount}>
                    {item.counter.text}
                  </div>
                  {' '}
                  <i className={item.icon.className} />
                  {' '}
                  <p dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              </li>
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
