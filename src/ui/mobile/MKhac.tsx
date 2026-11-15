import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dsDonVi, useSession } from '../../app/session'
import { ROLE } from '../../data/mock'
import { GOI, GOIS, anNgoaiGoi, minGoi } from '../../app/plan'
import { MODULES, duongDan, hienMan, maKhoa, moDuoc, tabCua, tenMan, timMan } from '../../app/registry'
import { FLYOUT_CONFIG, type FlyoutItem } from '../../app/SidebarFlyout'
import { Icon } from '../Icon'
import { Pk } from '../Page'
import { fold } from '../format'
import type { ScreenDef } from '../../modules/types'
import { D, Sv } from '../../app/thong-bao/chung'
import { LINK_TAI_LIEU } from '../../app/thong-bao/data'
import { MNutNgonNgu, MTamGopY, MTamMaHoTro } from './MThongBao'

export function MKhac() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [tam, setTam] = useState<'' | 'gy' | 'ma'>('')   // tấm trượt Góp ý, Mã hỗ trợ (T803)

  const ten = s.ten.split(' ').slice(-2).map(x => x[0]).join('')

  const cfgDm = FLYOUT_CONFIG['danh-muc']
  const locItemDm = (it: FlyoutItem) => {
    const parts = it.di.replace(/^\/app\//, '').split('?')[0].split('/')
    const modK = parts[0]
    const slug = parts[1]
    const { mod, sc } = timMan(modK, slug)
    if (sc) {
      if (sc.anTab?.includes(s.goi) || !hienMan(sc, s.goi, s.cheDo, s)) return null
      if (anNgoaiGoi(s.goi) && !moDuoc(sc, s.goi)) return null
      const khoa = !moDuoc(sc, s.goi)
      const ma = maKhoa(sc)
      const icon = sc.icon ?? mod?.icon ?? 'folder'
      return { ...it, icon, khoa, ma }
    }
    return null
  }

  const dsDmTrai = (cfgDm?.trai.items ?? []).map(locItemDm).filter((it): it is NonNullable<typeof it> => it !== null)
  const dsDmPhai = (cfgDm?.phai.items ?? []).map(locItemDm).filter((it): it is NonNullable<typeof it> => it !== null)
  const tongSoDm = dsDmTrai.length + dsDmPhai.length

  const modHt = MODULES.find(m => m.key === 'he-thong')
  const dsHt = modHt ? tabCua(modHt).filter(sc => !sc.anTab?.includes(s.goi) && hienMan(sc, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi))) : []

  const coKhoaSoDuPhong = !dsHt.some(sc => sc.slug === 'khoa-so')
  const tongSoHt = dsHt.length + (coKhoaSoDuPhong ? 1 : 0)

  const tuKhoa = fold(q.trim())
  const dsDmTraiLoc = tuKhoa ? dsDmTrai.filter(it => fold(it.ten).includes(tuKhoa)) : dsDmTrai
  const dsDmPhaiLoc = tuKhoa ? dsDmPhai.filter(it => fold(it.ten).includes(tuKhoa)) : dsDmPhai
  const dsHtLoc = tuKhoa ? dsHt.filter(sc => fold(tenMan(sc)).includes(tuKhoa)) : dsHt
  const hienKhoaSo = coKhoaSoDuPhong && (!tuKhoa || fold('Khoá sổ').includes(tuKhoa))
  const hienCaiDatTb = !tuKhoa || fold('Cài đặt thông báo').includes(tuKhoa)
  // Mục Hỗ trợ (T803): tài liệu mở trang ngoài, góp ý và mã hỗ trợ mở tấm trượt
  const dsHoTro = [
    { ten: 'Tài liệu', d: D.sach }, { ten: 'Góp ý', d: D.gopY, tam: 'gy' as const }, { ten: 'Lấy mã hỗ trợ', d: D.khoa, tam: 'ma' as const },
  ].filter(h => !tuKhoa || fold(h.ten).includes(tuKhoa))

  return (
    <div className="m-khac">
      {/* ── Header gradient xanh theo MBaoCao (T505) ── */}
      <header className="m-bc-hdr-gradient">
        <div className="m-bc-hdr-top">
          <div className="m-bc-hdr-tieu-de-hang">
            <h1 className="m-bc-hdr-tieu-de">Khác</h1>
            <span className="m-bc-hdr-chip-goi">
              {s.goi === 'S' ? 'STANDARD' : GOI[s.goi]?.ten?.toUpperCase() ?? 'STANDARD'}
            </span>
          </div>
          <div className="m-bc-hdr-phu">
            {`${tongSoDm} danh mục · ${tongSoHt} thiết lập`}
          </div>
        </div>

        <div className="m-bc-hdr-tim-wrap">
          <div className="m-bc-hdr-tim">
            <Icon n="search" className="m-bc-hdr-tim-ic ic sm" />
            <input
              type="text"
              className="m-bc-hdr-tim-inp"
              placeholder="Tìm danh mục, thiết lập…"
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm danh mục, thiết lập"
            />
            {q && (
              <button
                type="button"
                className="m-bc-hdr-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 1. Thẻ người dùng */}
      <section className="m-khac-nhom-wrap">
        <div className="m-khac-the m-khac-the-user">
          <div className="m-khac-user-av">{ten}</div>
          <div className="m-khac-user-info">
            <h2 className="m-khac-user-ten">{s.ten}</h2>
            <div className="m-khac-user-email">{s.email}</div>
            <div className="m-khac-user-tags">
              <span className="m-khac-vai-tro">{ROLE[s.role]}</span>
              <Pk g={s.goi} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Nhóm Danh mục (T863: chia 2 nhóm Đối tượng & Hàng hoá, Tài chính & Khác như menu web) */}
      {dsDmTraiLoc.length > 0 && (
        <section className="m-khac-nhom-wrap">
          <h3 className="m-khac-nhom-tieu">{cfgDm?.trai.tieuDe ?? 'Đối tượng & Hàng hoá'}</h3>
          <div className="m-khac-the">
            <div className="m-khac-ds">
              {dsDmTraiLoc.map(it => (
                <Link
                  key={`dm-${it.di}`}
                  to={it.di}
                  className={`m-khac-dong${it.khoa ? ' khoa' : ''}`}
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dong-ic">
                      <Icon n={it.icon ?? 'folder'} className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">{it.ten}</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    {it.khoa && it.ma && <Pk g={minGoi(it.ma)} o />}
                    <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {dsDmPhaiLoc.length > 0 && (
        <section className="m-khac-nhom-wrap">
          <h3 className="m-khac-nhom-tieu">{cfgDm?.phai.tieuDe ?? 'Tài chính & Khác'}</h3>
          <div className="m-khac-the">
            <div className="m-khac-ds">
              {dsDmPhaiLoc.map(it => (
                <Link
                  key={`dm-${it.di}`}
                  to={it.di}
                  className={`m-khac-dong${it.khoa ? ' khoa' : ''}`}
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dong-ic">
                      <Icon n={it.icon ?? 'folder'} className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">{it.ten}</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    {it.khoa && it.ma && <Pk g={minGoi(it.ma)} o />}
                    <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Nhóm Thiết lập */}
      {modHt && (dsHtLoc.length > 0 || hienKhoaSo || hienCaiDatTb) && (
        <section className="m-khac-nhom-wrap">
          <h3 className="m-khac-nhom-tieu">THIẾT LẬP</h3>
          <div className="m-khac-the">
            <div className="m-khac-ds">
              {hienCaiDatTb && (
                <Link to="/app/thong-bao/cai-dat" className="m-khac-dong">
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dong-ic ht">
                      <Icon n="bell" kieu="khoi" className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">Cài đặt thông báo</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                  </div>
                </Link>
              )}
              {dsHtLoc.map(sc => {
                const khoa = !moDuoc(sc, s.goi)
                const ma = maKhoa(sc)
                return (
                  <Link
                    key={`ht-${sc.slug}`}
                    to={duongDan(modHt, sc)}
                    className={`m-khac-dong${khoa ? ' khoa' : ''}`}
                  >
                    <div className="m-khac-dong-trai">
                      <span className="m-khac-dong-ic ht">
                        <Icon n={sc.slug === 'khoa-so' ? 'lock' : (sc.icon ?? modHt.icon)} kieu="khoi" className="ic sm" />
                      </span>
                      <div className="m-khac-dong-nd">
                        <span className="m-khac-dong-ten">{tenMan(sc)}</span>
                      </div>
                    </div>
                    <div className="m-khac-dong-phai">
                      {khoa && ma && <Pk g={minGoi(ma)} o />}
                      <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                    </div>
                  </Link>
                )
              })}
              {hienKhoaSo && (
                <Link
                  to="/app/tong-hop/10-1-6"
                  className="m-khac-dong"
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dong-ic ht">
                      <Icon n="lock" kieu="khoi" className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">Khoá sổ</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Nhóm Hỗ trợ (T803) */}
      {dsHoTro.length > 0 && (
        <section className="m-khac-nhom-wrap">
          <h3 className="m-khac-nhom-tieu">HỖ TRỢ</h3>
          <div className="m-khac-the">
            <div className="m-khac-ds">
              {dsHoTro.map(h => {
                const than = (
                  <>
                    <div className="m-khac-dong-trai">
                      <span className="m-khac-dong-ic ho-tro"><Sv d={h.d} /></span>
                      <div className="m-khac-dong-nd">
                        <span className="m-khac-dong-ten">{h.ten}</span>
                      </div>
                    </div>
                    <div className="m-khac-dong-phai">
                      {h.tam ? <Icon n="chevr" className="ic sm m-khac-mui-ten" /> : <Sv d={D.moNgoai} c={16} net={2} className="m-khac-mui-ten" />}
                    </div>
                  </>
                )
                const loaiTam = h.tam
                return loaiTam
                  ? <button key={h.ten} type="button" className="m-khac-dong-btn" onClick={() => setTam(loaiTam)}>{than}</button>
                  : <a key={h.ten} className="m-khac-dong" href={LINK_TAI_LIEU} target="_blank" rel="noopener noreferrer">{than}</a>
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Nhóm Đơn vị kế toán */}
      <section className="m-khac-nhom-wrap">
        <h3 className="m-khac-nhom-tieu">ĐƠN VỊ KẾ TOÁN</h3>
        <div className="m-khac-the">
          <div className="m-khac-ds">
            {dsDonVi(s).map(d => {
              const on = d.id === s.donVi
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`m-khac-dong-btn${on ? ' on' : ''}`}
                  onClick={() => set({ donVi: d.id, goi: d.goi, cuaHang: 'all' })}
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dv-av">{d.viettat}</span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">{d.ten}</span>
                      <span className="m-khac-dong-phu">
                        {d.mst ? `MST ${d.mst}` : 'Chưa khai MST'} · {d.diem} điểm
                      </span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    <Pk g={d.goi} />
                    {on && <Icon n="check" className="ic sm m-khac-tich" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Nhóm Trải nghiệm gói */}
      <section className="m-khac-nhom-wrap">
        <h3 className="m-khac-nhom-tieu">TRẢI NGHIỆM GÓI</h3>
        <div className="m-khac-the">
          <div className="m-khac-ds">
            {GOIS.map(g => {
              const on = s.goi === g
              return (
                <button
                  key={g}
                  type="button"
                  className={`m-khac-dong-btn${on ? ' on' : ''}`}
                  onClick={() => set({ goi: g })}
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dong-ic goi">
                      <Icon n="layers" className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">{GOI[g].ten}</span>
                      <span className="m-khac-dong-phu">{GOI[g].mota}</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    <Pk g={g} />
                    {on && <Icon n="check" className="ic sm m-khac-tich" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. Nút Đăng xuất riêng */}
      <section className="m-khac-nhom-logout">
        <button
          type="button"
          className="m-khac-logout-btn"
          onClick={() => {
            set({ loggedIn: false })
            nav('/dang-nhap')
          }}
        >
          <Icon n="logout" className="ic sm" />
          <span>Đăng xuất</span>
        </button>
      </section>

      {/* Chân màn: đổi ngôn ngữ (T803) */}
      <section className="m-khac-chan">
        <MNutNgonNgu />
      </section>

      {tam === 'gy' && <MTamGopY onDong={() => setTam('')} />}
      {tam === 'ma' && <MTamMaHoTro onDong={() => setTam('')} />}
    </div>
  )
}
