// Khung tuỳ chỉnh báo cáo (kế hoạch mục 10, T47, T70): ẩn hiện cột, đổi thứ tự cột, đổi tên cột, độ rộng cột, gom nhóm 3 cấp, người ký, cỡ chữ bảng.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Col } from '../../modules/types'
import { cauHinhBC, tenBC } from '../../modules/bao-cao/danh-sach'
import { layNguoiKy, luuNguoiKy } from './khoMauIn'
import { docTuyChinh, luuTuyChinh, xoaTuyChinh, type TuyChinhLuu } from './tuyChinhBC'
import { type MucDs } from '../thiet-ke/DsCot'
import { DsCotNhom } from './DsCotNhom'
import { DsKy } from '../thiet-ke/DsKy'
import { HopXacNhan } from '../LocNangCao'
import { Icon } from '../Icon'
import type { OKy } from '../generic/ReportScreen'

const CO_CHU = [10, 10.5, 11, 11.5, 12, 12.5, 13]

export function TuyChinhBC({
  open,
  onClose,
  slug,
  donVi,
  colsGoc = [],
  dsKyMacDinh = [],
}: {
  open: boolean
  onClose: () => void
  slug?: string
  donVi: string
  colsGoc?: Col[]
  dsKyMacDinh?: OKy[]
}) {
  const [tab, setTab] = useState<'cot' | 'nhom' | 'ky' | 'trang'>('cot')
  const [hoiChuan, setHoiChuan] = useState(false)
  const cfg = cauHinhBC(slug)
  const khoa = !!cfg?.khoa
  const tenBaoCao = slug ? tenBC(slug, 'TT152') : undefined

  // Đọc cấu hình lưu của báo cáo này
  const [tc, setTc] = useState<TuyChinhLuu>(() => (slug ? docTuyChinh(donVi, slug) ?? {} : {}))
  const [chiRieng, setChiRieng] = useState(() => Boolean(tc.ky && tc.ky.length > 0))

  const tcGocRef = useRef<TuyChinhLuu>({})
  const nguoiKyGocRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (open && slug) {
      const v = docTuyChinh(donVi, slug) ?? {}
      tcGocRef.current = v
      nguoiKyGocRef.current = layNguoiKy(donVi)
      setTc(v)
      setChiRieng(Boolean(v.ky && v.ky.length > 0))
    }
  }, [open, slug, donVi])

  const onHuy = () => {
    if (slug) {
      luuTuyChinh(donVi, slug, tcGocRef.current)
      luuNguoiKy(donVi, nguoiKyGocRef.current)
    }
    onClose()
  }

  const onApDung = () => {
    if (slug) {
      luuTuyChinh(donVi, slug, tc)
    }
    onClose()
  }

  // Lắng nghe phím Escape trên window (tránh bẫy BAY.md)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onHuy()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  // Màn không có slug hoặc không có cấu hình
  if (!slug) {
    return createPortal(
      <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
        <aside className="pn-hop" role="dialog" aria-modal="true" aria-label="Tuỳ chỉnh báo cáo">
          <div className="pn-dau">
            <div>
              <h3>Tuỳ chỉnh báo cáo</h3>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng"><Icon n="x" kieu="net" /></button>
          </div>
          <div className="pn-than">
            <p className="bc-tc-thong-bao">Màn này chưa hỗ trợ tuỳ chỉnh</p>
          </div>
          <div className="pn-chan">
            <button type="button" className="btn" onClick={onClose}>Đóng</button>
          </div>
        </aside>
      </div>,
      document.body,
    )
  }

  const capNhat = (p: Partial<TuyChinhLuu>) => {
    const moi = { ...tc, ...p }
    setTc(moi)
    luuTuyChinh(donVi, slug, moi)
  }

  // ── 1. Thẻ Cột ──
  const cotLuu = tc.cot
  const dsCotItem: MucDs[] = []
  if (!khoa) {
    const mapGoc = new Map(colsGoc.map(c => [c.k, c]))
    const daDung = new Set<string>()

    if (cotLuu && cotLuu.length > 0) {
      for (const cs of cotLuu) {
        const cg = mapGoc.get(cs.k)
        if (!cg) continue
        daDung.add(cs.k)
        dsCotItem.push({
          k: cs.k,
          ten: cs.ten ?? cg.t,
          an: !!cs.an,
          rong: typeof cs.rong === 'number' ? cs.rong : cg.w,
        })
      }
    }
    for (const cg of colsGoc) {
      if (!daDung.has(cg.k)) {
        dsCotItem.push({
          k: cg.k,
          ten: cg.t,
          an: false,
          rong: cg.w,
        })
      }
    }
  }

  const onDoiCot = (items: MucDs[]) => {
    capNhat({
      cot: items.map(x => ({
        k: x.k,
        ten: x.ten,
        an: x.an,
        rong: x.rong,
      })),
    })
  }

  // ── 2. Thẻ Gom nhóm ──
  const nhomDuoc = cfg?.nhomDuoc ?? []
  const nhomDangChon = tc.nhom ?? []
  const k1 = nhomDangChon[0] ?? ''
  const k2 = nhomDangChon[1] ?? ''
  const k3 = nhomDangChon[2] ?? ''
  const xemNhom = tc.xemNhom ?? 'chiTiet'

  const tenCotNhom = (k: string) => colsGoc.find(c => c.k === k)?.t ?? k

  const doiNhom = (c1: string, c2: string, c3: string) => {
    const ds = [c1, c2, c3].filter(Boolean)
    capNhat({ nhom: ds.length > 0 ? ds : undefined })
  }

  // ── 3. Thẻ Người ký ──
  const nguoiKyDonVi = layNguoiKy(donVi)
  const dsKyDangCo = tc.ky && tc.ky.length > 0
    ? tc.ky
    : dsKyMacDinh.map(o => ({
        chucDanh: o.chucDanh,
        goiY: o.goiY,
        hoTen: nguoiKyDonVi[o.chucDanh] || o.hoTen,
      }))

  const onDoiKy = (dsMoi: { chucDanh: string; goiY?: string; hoTen?: string }[]) => {
    const dsChuan: OKy[] = dsMoi.map(o => ({
      chucDanh: o.chucDanh,
      goiY: o.goiY ?? '(Ký, họ tên)',
      hoTen: o.hoTen ?? '',
    }))

    if (chiRieng) {
      capNhat({ ky: dsChuan })
    } else {
      // Lưu chung đơn vị: chức danh -> họ tên
      const moi = { ...nguoiKyDonVi }
      for (const o of dsChuan) {
        if (o.hoTen) moi[o.chucDanh] = o.hoTen
      }
      luuNguoiKy(donVi, moi)
      capNhat({ ky: undefined })
    }
  }

  const doiChiRieng = (bat: boolean) => {
    setChiRieng(bat)
    if (bat) {
      capNhat({ ky: dsKyDangCo })
    } else {
      capNhat({ ky: undefined })
    }
  }

  // ── 4. Thẻ Trang ──
  const coChu = tc.coChu ?? 12

  // ── 5. Về mẫu chuẩn ──
  const veMauChuan = () => {
    xoaTuyChinh(donVi, slug)
    setTc({})
    tcGocRef.current = {}
    setChiRieng(false)
    setHoiChuan(false)
  }

  return createPortal(
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onHuy() }}>
      <aside className="pn-hop" role="dialog" aria-modal="true" aria-label="Tuỳ chỉnh báo cáo">
        {/* Đầu khung */}
        <div className="pn-dau">
          <div>
            <h3>Tuỳ chỉnh báo cáo</h3>
            {tenBaoCao && <div className="tc-sub-tieu-de">{tenBaoCao}</div>}
          </div>
          <button type="button" className="icon-btn" onClick={onHuy} aria-label="Đóng">
            <Icon n="x" kieu="net" />
          </button>
        </div>

        {/* Hai cột: mục dọc bên trái, nội dung mục bên phải (T81) */}
        <div className="pn-hai-cot">
        <nav className="pn-muc-doc" aria-label="Mục tuỳ chỉnh">
          <button type="button" className={`pn-muc${tab === 'cot' ? ' on' : ''}`} onClick={() => setTab('cot')}><Icon n="layers" className="ic sm" kieu="net" />Cột hiển thị</button>
          <button type="button" className={`pn-muc${tab === 'nhom' ? ' on' : ''}`} onClick={() => setTab('nhom')}><Icon n="grid" className="ic sm" kieu="net" />Gom nhóm</button>
          <button type="button" className={`pn-muc${tab === 'ky' ? ' on' : ''}`} onClick={() => setTab('ky')}><Icon n="edit" className="ic sm" kieu="net" />Người ký</button>
          <button type="button" className={`pn-muc${tab === 'trang' ? ' on' : ''}`} onClick={() => setTab('trang')}><Icon n="doc" className="ic sm" kieu="net" />Trang và cỡ chữ</button>
        </nav>

        {/* Thân mục */}
        <div className="pn-than">
          {tab === 'cot' && (
            khoa ? (
              <div className="pn-khoa"><Icon n="lock" className="ic" kieu="net" /><div><b>Mẫu theo thông tư</b><span>Mẫu pháp định giữ nguyên bố cục, chỉ sửa được người ký và cỡ chữ.</span></div></div>
            ) : (
              <DsCotNhom
                items={dsCotItem}
                colsGoc={colsGoc}
                onChange={onDoiCot}
              />
            )
          )}

          {tab === 'nhom' && (
            khoa || nhomDuoc.length === 0 ? (
              <p className="bc-tc-thong-bao">Báo cáo này không hỗ trợ gom nhóm</p>
            ) : (
              <div className="bc-tc-nhom-khung">
                <div className="tc-nhom-mo-ta">Chọn tối đa 3 cấp. Mỗi nhóm có dòng cộng riêng.</div>

                <div className="tc-cap">
                  <span className="tc-cap-ten">Cấp 1</span>
                  <div className="tc-cap-ds">
                    <button
                      type="button"
                      className={`tc-lc${!k1 ? ' on' : ''}`}
                      onClick={() => doiNhom('', '', '')}
                      aria-pressed={!k1}
                    >
                      <span className="tc-dot" />
                      Không gom
                    </button>
                    {nhomDuoc.map(k => (
                      <button
                        key={k}
                        type="button"
                        className={`tc-lc${k1 === k ? ' on' : ''}`}
                        onClick={() => {
                          const moiK2 = k2 === k ? '' : k2
                          const moiK3 = k3 === k || !moiK2 ? '' : k3
                          doiNhom(k, moiK2, moiK3)
                        }}
                        aria-pressed={k1 === k}
                      >
                        <span className="tc-dot" />
                        {tenCotNhom(k)}
                      </button>
                    ))}
                  </div>
                </div>

                {k1 && (
                  <div className="tc-cap">
                    <span className="tc-cap-ten">Cấp 2</span>
                    <div className="tc-cap-ds">
                      <button
                        type="button"
                        className={`tc-lc${!k2 ? ' on' : ''}`}
                        onClick={() => doiNhom(k1, '', '')}
                        aria-pressed={!k2}
                      >
                        <span className="tc-dot" />
                        Không chọn
                      </button>
                      {nhomDuoc.filter(k => k !== k1).map(k => (
                        <button
                          key={k}
                          type="button"
                          className={`tc-lc${k2 === k ? ' on' : ''}`}
                          onClick={() => {
                            const moiK3 = k3 === k ? '' : k3
                            doiNhom(k1, k, moiK3)
                          }}
                          aria-pressed={k2 === k}
                        >
                          <span className="tc-dot" />
                          {tenCotNhom(k)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {k2 && (
                  <div className="tc-cap">
                    <span className="tc-cap-ten">Cấp 3</span>
                    <div className="tc-cap-ds">
                      <button
                        type="button"
                        className={`tc-lc${!k3 ? ' on' : ''}`}
                        onClick={() => doiNhom(k1, k2, '')}
                        aria-pressed={!k3}
                      >
                        <span className="tc-dot" />
                        Không chọn
                      </button>
                      {nhomDuoc.filter(k => k !== k1 && k !== k2).map(k => (
                        <button
                          key={k}
                          type="button"
                          className={`tc-lc${k3 === k ? ' on' : ''}`}
                          onClick={() => doiNhom(k1, k2, k)}
                          aria-pressed={k3 === k}
                        >
                          <span className="tc-dot" />
                          {tenCotNhom(k)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {nhomDangChon.length > 0 && (
                  <div className="tc-cap" style={{ alignItems: 'center' }}>
                    <span className="tc-cap-ten" style={{ paddingTop: 0 }}>Kiểu xem</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <div className="tc-seg" role="group" aria-label="Kiểu xem">
                        <button
                          type="button"
                          className={xemNhom === 'chiTiet' ? 'on' : ''}
                          onClick={() => capNhat({ xemNhom: 'chiTiet' })}
                        >
                          Chi tiết
                        </button>
                        <button
                          type="button"
                          className={xemNhom === 'tongHop' ? 'on' : ''}
                          onClick={() => capNhat({ xemNhom: 'tongHop' })}
                        >
                          Tổng hợp
                        </button>
                      </div>
                      <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                        {xemNhom === 'tongHop' ? 'Mỗi nhóm một dòng, ẩn từng mặt hàng.' : 'Hiện từng mặt hàng dưới dòng nhóm.'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {tab === 'ky' && (
            <div className="bc-tc-ky-khung">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div className="tc-seg" role="group" aria-label="Phạm vi áp dụng" style={{ alignSelf: 'flex-start' }}>
                  <button
                    type="button"
                    className={!chiRieng ? 'on' : ''}
                    onClick={() => doiChiRieng(false)}
                  >
                    Dùng chung mọi báo cáo
                  </button>
                  <button
                    type="button"
                    className={chiRieng ? 'on' : ''}
                    onClick={() => doiChiRieng(true)}
                  >
                    Riêng báo cáo này
                  </button>
                </div>
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  {chiRieng
                    ? 'Chỉ báo cáo này dùng danh sách này. Báo cáo khác giữ người ký chung.'
                    : 'Sửa họ tên ở đây thì mọi báo cáo của hộ kinh doanh đổi theo.'}
                </span>
              </div>
              <DsKy
                ds={dsKyDangCo}
                onChange={onDoiKy}
                hoTenDonVi={nguoiKyDonVi}
                kieu="dong"
              />
            </div>
          )}

          {tab === 'trang' && (
            <div className="bc-tc-trang-khung">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Cỡ chữ bảng</h3>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Mặc định 12 px</span>
                </div>
                <div className="tc-seg" role="group" aria-label="Cỡ chữ bảng" style={{ alignSelf: 'flex-start' }}>
                  {CO_CHU.map(c => {
                    const nhan = String(c).replace('.', ',')
                    const on = coChu === c
                    return (
                      <button
                        key={c}
                        type="button"
                        className={on ? 'on' : ''}
                        onClick={() => capNhat({ coChu: c })}
                        aria-pressed={on}
                      >
                        {nhan}
                      </button>
                    )
                  })}
                </div>
              </div>
              <p className="muted pn-chu-nho" style={{ marginTop: 16 }}>Đổi khổ giấy Dọc / Ngang tại thanh công cụ dưới trang.</p>
            </div>
          )}
        </div>

        </div>

        {/* Chân khung */}
        <div className="pn-chan">
          <button type="button" className="btn" onClick={() => setHoiChuan(true)}>
            Về mặc định
          </button>
          <span className="grow" />
          <button type="button" className="btn" onClick={onHuy}>
            Huỷ
          </button>
          <button type="button" className="btn pri" onClick={onApDung}>
            Áp dụng
          </button>
        </div>
      </aside>

      {hoiChuan && (
        <HopXacNhan
          tieuDe="Về mặc định?"
          nut="Khôi phục"
          onDong={() => setHoiChuan(false)}
          onDongY={veMauChuan}
        >
          Khôi phục lại toàn bộ cột, nhóm và người ký mặc định của báo cáo này.
        </HopXacNhan>
      )}
    </div>,
    document.body,
  )
}
