import { Fragment } from 'react';
import type { HeaderContent, MenuItem } from '@/types';
import { Icon } from '@/components/icons';
import { link } from '@/lib/utils/markup';
import { MenuIcon } from './MenuIcon';

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const targetOf = (item: MenuItem) => (item.target && item.target !== '_self' ? { target: item.target, rel: 'noopener' } : {});
const isSolution = (item: MenuItem) => /solution/i.test(`${item.url} ${item.title}`);

/** The main menu built from the admin panel's header menu: same markup as the bundled one below. */
function MenuFromCms({ items, data }: { items: MenuItem[]; data: HeaderContent }) {
  return (
    <ul className="navbar-nav ml-auto" id="mainmenu">
      {items.map((item, i) => {
        if (item.children.length === 0) {
          return (
            <li key={item.id} className={i === 0 && item.url === '/' ? 'active' : ''}>
              <a {...link(item.url)} {...targetOf(item)}>{item.title}</a>
            </li>
          );
        }
        const parent = { __html: `${escapeHtml(item.title)} <span class="fas fa-caret-down"></span>` };
        if (!item.isFluid) {
          return (
            <li key={item.id}>
              <a dangerouslySetInnerHTML={parent} {...link(item.url)} />
              <ul className="sub-menu-normal">
                {item.children.map((child) => (
                  <li key={child.id}>
                    <a className="" {...link(child.url)} {...targetOf(child)}>{child.title}</a>
                  </li>
                ))}
              </ul>
            </li>
          );
        }
        const solution = isSolution(item);
        return (
          <li key={item.id} className={solution ? 'megamenumain megamenuser solution-menu' : 'megamenumain megamenuser'}>
            <a dangerouslySetInnerHTML={parent} {...link(item.url)} />
            <div className="sub-menu-wrap">
              <ul className="sub-menu clearfix">
                {item.children.map((group) => (
                  <li key={group.id}>
                    <a {...link(group.url)} {...targetOf(group)}>
                      <span className="mainmenuicon"><MenuIcon icon={group.icon} size={60} /></span>
                      {group.title}
                    </a>
                    {group.children.length > 0 && <ul className="sub-level2">
                      {group.children.map((child) => (
                        <li key={child.id}>
                          <a className="" {...link(child.url)} {...targetOf(child)}>
                            <span className="submenuicon"><MenuIcon icon={child.icon} size={30} /></span>
                            {child.title}
                          </a>
                        </li>
                      ))}
                    </ul>}
                  </li>
                ))}
              </ul>
              <div className="megactasection w-100">
                <div className="megactapwrap d-flex text-center align-items-center justify-content-between">
                  {solution ? (
                    <>
                      <div className="megatext">
                        <div className="big">{data.big2}</div>
                        <span>{data.text3}</span>
                        <a {...link(data.link16.href)}>{data.link16.text}</a>
                      </div>
                      <span className="or">{data.or2}</span>
                      <a className="btn btn-custome waves-effect waves-light" {...link(data.link17.href)}>{data.link17.text}</a>
                    </>
                  ) : (
                    <>
                      <div className="megatext">
                        <div className="big">{data.big}</div>
                        <span>{data.text2}</span>
                        <a title={data.link12.title} {...link(data.link12.href)}></a>
                      </div>
                      <a title={data.link13.title} {...link(data.link13.href)}>
                        <span className="or">{data.link13.or}</span>
                      </a>
                      <a className="btn btn-custome waves-effect waves-light" {...link(data.link14.href)}>{data.link14.text}</a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
      <li>
        <a className="estimate_btn btn waves-effect waves-light" {...link(data.estimateBtn2.href)}>{data.estimateBtn2.text}</a>
      </li>
    </ul>
  );
}

export function Header({ data, menu }: { data: HeaderContent; menu?: MenuItem[] }) {
  return (
    <header>
      <a
        id="estimate-mobile-btn"
        className="estimate_btn head-requet-btn"
        aria-label={data.estimateBtn.ariaLabel}
        {...link(data.estimateBtn.href)}
      >
        <i className="fas fa-phone-volume" />
        {' '}
        <span>
          {data.estimateBtn.text}
        </span>
      </a>
      {' '}
      <div id="top" className="top-review-bar">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="top-left-part">
              <a {...link(data.link.href)}>
                {' '}
                <img
                  src={data.link.image.src}
                  alt={data.link.image.alt}
                  width={data.link.image.width}
                  height={data.link.image.height}
                />
                {' '}
                <div className="star">
                  <span className="rating_text_footer" style={{ fontSize: "16px" }}>
                    {' '}
                    {data.link.icons.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <i className={item.className} />
                      </Fragment>
                    ))}
                    {' '}
                  </span>
                </div>
                {' '}
                <strong>
                  {data.link.strong}
                </strong>
                {' '}
                <span>
                  {' '}
                  {data.link.text}
                </span>
                {' '}
              </a>
            </div>
            {' '}
            <div className="top-right-part d-flex align-items-center justify-content-between">
              <span dangerouslySetInnerHTML={{ __html: data.text }} />
              {' '}
              <a {...link(data.link2.href)}>
                <strong>
                  {data.link2.strong}
                </strong>
              </a>
              {' '}
              <span className="or">
                {data.or}
              </span>
              {' '}
              <a className="head-requet-btn" {...link(data.headRequetBtn.href)}>
                {data.headRequetBtn.image.src && <img
                  src={data.headRequetBtn.image.src}
                  width={data.headRequetBtn.image.width}
                  height={data.headRequetBtn.image.height}
                  alt={data.headRequetBtn.image.alt}
                />}
                {data.headRequetBtn.text}
              </a>
            </div>
          </div>
        </div>
      </div>
      {' '}
      <div className="main-navbar-wrap">
        <div className="main-navbar">
          <nav className="navbar">
            <div className="navbar-header">
              <a {...link(data.link3.href)}>
                {data.link3.image.src && <img
                  src={data.link3.image.src}
                  alt={data.link3.image.alt}
                  width={data.link3.image.width}
                  height={data.link3.image.height}
                />}
              </a>
            </div>
            {' '}
            <div className="megamenu">
              {menu && menu.length > 0 ? <MenuFromCms items={menu} data={data} /> : (
              <ul className="navbar-nav ml-auto" id="mainmenu">
                <li className="active">
                  <a {...link(data.link4.href)}>
                    {data.link4.text}
                  </a>
                </li>
                {' '}
                <li>
                  <a dangerouslySetInnerHTML={{ __html: data.link5.html }} {...link(data.link5.href)} />
                  {' '}
                  <ul className="sub-menu-normal">
                    {data.items.map((item, i) => (
                      <Fragment key={i}>
                        {i > 0 && ' '}
                        <li>
                          <a className="" {...link(item.link.href)}>
                            {item.link.text}
                          </a>
                        </li>
                      </Fragment>
                    ))}
                  </ul>
                </li>
                {' '}
                <li className="megamenumain megamenuser">
                  <a dangerouslySetInnerHTML={{ __html: data.link6.html }} {...link(data.link6.href)} />
                  {' '}
                  <div className="sub-menu-wrap">
                    <ul className="sub-menu clearfix">
                      <li>
                        <a {...link(data.link7.href)}>
                          <span className="mainmenuicon">
                            <Icon name="svg-f18979" />
                          </span>
                          {data.link7.text}
                        </a>
                        {' '}
                        <ul className="sub-level2">
                          {data.items2.map((item, i) => (
                            <Fragment key={i}>
                              {i > 0 && ' '}
                              <li>
                                <a className="" {...link(item.link.href)}>
                                  <span className="submenuicon">
                                    <Icon name={item.link.icon} />
                                  </span>
                                  {item.link.text}
                                </a>
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                      </li>
                      {' '}
                      <li>
                        <a className="" {...link(data.link8.href)}>
                          {' '}
                          <span className="mainmenuicon">
                            <Icon name="svg-f6e364" />
                          </span>
                          {data.link8.text}
                        </a>
                        {' '}
                        <ul className="sub-level2">
                          {data.items3.map((item, i) => (
                            <Fragment key={i}>
                              {i > 0 && ' '}
                              <li>
                                <a className="" {...link(item.link.href)}>
                                  <span className="submenuicon">
                                    <Icon name={item.link.icon} />
                                  </span>
                                  {item.link.text}
                                </a>
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                      </li>
                      {' '}
                      <li>
                        <a className="" {...link(data.link9.href)}>
                          {' '}
                          <span className="mainmenuicon">
                            {' '}
                            <Icon name="svg-38bcc5" />
                            {' '}
                          </span>
                          {data.link9.text}
                          {' '}
                        </a>
                        {' '}
                        <ul className="sub-level2">
                          {data.items4.map((item, i) => (
                            <Fragment key={i}>
                              {i > 0 && ' '}
                              <li>
                                <a className="" {...link(item.link.href)}>
                                  <span className="submenuicon">
                                    <Icon name={item.link.icon} />
                                  </span>
                                  {item.link.text}
                                </a>
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                      </li>
                      {' '}
                      <li>
                        <a {...link(data.link10.href)}>
                          {' '}
                          <span className="mainmenuicon">
                            {' '}
                            <Icon name="svg-e96fca" />
                            {' '}
                          </span>
                          {data.link10.text}
                          {' '}
                        </a>
                        {' '}
                        <ul className="sub-level2">
                          <li>
                            <a className="" {...link(data.link11.href)}>
                              <span className="submenuicon">
                                {' '}
                                <Icon name="svg-65824e" />
                                {' '}
                              </span>
                              {data.link11.text}
                              {' '}
                            </a>
                          </li>
                          {' '}
                          {data.items5.map((item, i) => (
                            <Fragment key={i}>
                              {i > 0 && ' '}
                              <li>
                                <a className="" {...link(item.link.href)}>
                                  <span className="submenuicon">
                                    <Icon name={item.link.icon} />
                                  </span>
                                  {item.link.text}
                                </a>
                              </li>
                            </Fragment>
                          ))}
                        </ul>
                      </li>
                    </ul>
                    {' '}
                    <div className="megactasection w-100">
                      <div className="megactapwrap d-flex text-center align-items-center justify-content-between">
                        <div className="megatext">
                          <div className="big">
                            {data.big}
                          </div>
                          <span>
                            {data.text2}
                          </span>
                          {' '}
                          <a title={data.link12.title} {...link(data.link12.href)}>
                            {' '}
                          </a>
                        </div>
                        <a title={data.link13.title} {...link(data.link13.href)}>
                          {' '}
                          <span className="or">
                            {data.link13.or}
                          </span>
                          {' '}
                        </a>
                        <a className="btn btn-custome waves-effect waves-light" {...link(data.link14.href)}>
                          {data.link14.text}
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
                {' '}
                <li className="megamenumain megamenuser solution-menu">
                  <a dangerouslySetInnerHTML={{ __html: data.link15.html }} {...link(data.link15.href)} />
                  {' '}
                  <div className="sub-menu-wrap">
                    <ul className="sub-menu clearfix">
                      {data.items6.map((item, i) => (
                        <Fragment key={i}>
                          {i > 0 && ' '}
                          <li>
                            <a {...link(item.link.href)}>
                              <span className="mainmenuicon">
                                {' '}
                                <Icon name={item.link.icon} />
                                {' '}
                              </span>
                              {item.link.text}
                            </a>
                            {' '}
                            <ul className="sub-level2">
                              {item.items.map((item2, i2) => (
                                <Fragment key={i2}>
                                  {i2 > 0 && ' '}
                                  <li>
                                    <a className="" {...link(item2.link.href)}>
                                      {' '}
                                      <span className="submenuicon">
                                        {' '}
                                        <Icon name={item2.link.icon} />
                                        {' '}
                                      </span>
                                      {' '}
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
                    {' '}
                    <div className="megactasection w-100">
                      <div className="megactapwrap d-flex text-center align-items-center justify-content-between">
                        <div className="megatext">
                          <div className="big">
                            {data.big2}
                          </div>
                          <span>
                            {data.text3}
                          </span>
                          {' '}
                          <a {...link(data.link16.href)}>
                            {data.link16.text}
                          </a>
                        </div>
                        {' '}
                        <span className="or">
                          {data.or2}
                        </span>
                        {' '}
                        <a className="btn btn-custome waves-effect waves-light" {...link(data.link17.href)}>
                          {data.link17.text}
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
                {' '}
                <li className="">
                  <a {...link(data.link18.href)}>
                    {data.link18.text}
                    {' '}
                  </a>
                </li>
                {' '}
                {data.items7.map((item, i) => (
                  <Fragment key={i}>
                    {i > 0 && ' '}
                    <li className="">
                      <a {...link(item.link.href)}>
                        {item.link.text}
                      </a>
                    </li>
                  </Fragment>
                ))}
                {' '}
                <li>
                  <a className="estimate_btn btn waves-effect waves-light" {...link(data.estimateBtn2.href)}>
                    {data.estimateBtn2.text}
                  </a>
                </li>
              </ul>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
