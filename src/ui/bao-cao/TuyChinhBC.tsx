// Khung tuỳ chỉnh báo cáo (kế hoạch mục 10, T47, T70): ẩn hiện cột, đổi thứ tự cột, đổi tên cột, độ rộng cột, gom nhóm 2 cấp, người ký, cỡ chữ bảng.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Col } from '../../modules/types'
import { cauHinhBC } from '../../modules/bao-cao/danh-sach'
import { layNguoiKy, luuNguoiKy } from './khoMauIn'
import { docTuyChinh, luuTuyChinh, xoaTuyChinh, type TuyChinhLuu } from './tuyChinhBC'
import { DsCot, type MucDs } from '../thiet-ke/DsCot'
import { DsKy } from '../thiet-ke/DsKy'
import { HopXacNhan } from '../LocNangCao'
import { Select } from '../Dropdown'
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
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng"><Icon n="x" /></button>
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

  const tenCotNhom = (k: string) => colsGoc.find(c => c.k === k)?.t ?? k

  const doiNhom = (c1: string, c2: string) => {
    const ds = [c1, c2].filter(Boolean)
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
          </div>
          <button type="button" className="icon-btn" onClick={onHuy} aria-label="Đóng">
            <Icon n="x" />
          </button>
        </div>

        {/* 4 Thẻ đầu thân */}
        <div className="pn-tabs">
          <button type="button" className={`pn-tab${tab === 'cot' ? ' on' : ''}`} onClick={() => setTab('cot')}>Cột hiển thị</button>
          <button type="button" className={`pn-tab${tab === 'nhom' ? ' on' : ''}`} onClick={() => setTab('nhom')}>Gom nhóm</button>
          <button type="button" className={`pn-tab${tab === 'ky' ? ' on' : ''}`} onClick={() => setTab('ky')}>Người ký</button>
          <button type="button" className={`pn-tab${tab === 'trang' ? ' on' : ''}`} onClick={() => setTab('trang')}>Trang & cỡ chữ</button>
        </div>

        {/* Thân thẻ */}
        <div className="pn-than">
          {tab === 'cot' && (
            khoa ? (
              <p className="bc-tc-thong-bao">Mẫu pháp định giữ nguyên bố cục, chỉ sửa được người ký và cỡ chữ</p>
            ) : (
              <DsCot
                items={dsCotItem}
                onChange={onDoiCot}
                coRong
                nhanRong="Rộng (px)"
                rongTrong
                suaTen
              />
            )
          )}

          {tab === 'nhom' && (
            khoa || nhomDuoc.length === 0 ? (
              <p className="bc-tc-thong-bao">Báo cáo này không hỗ trợ gom nhóm</p>
            ) : (
              <div className="bc-tc-nhom-khung">
                <div className="pn-luoi">
                  <div className="f">
                    <label>Gom nhóm cấp 1</label>
                    <Select className="inp" value={k1} onChange={e => doiNhom(e.target.value, k2)}>
                      <option value="">(Không gom nhóm)</option>
                      {nhomDuoc.map(k => <option key={k} value={k}>{tenCotNhom(k)}</option>)}
                    </Select>
                  </div>

                  {k1 && (
                    <div className="f">
                      <label>Gom nhóm cấp 2</label>
                      <Select className="inp" value={k2} onChange={e => doiNhom(k1, e.target.value)}>
                        <option value="">(Không chọn cấp 2)</option>
                        {nhomDuoc.filter(k => k !== k1).map(k => <option key={k} value={k}>{tenCotNhom(k)}</option>)}
                      </Select>
                    </div>
                  )}
                </div>

                {(k1 || k2) && (
                  <div>
                    <button type="button" className="btn sm" onClick={() => doiNhom('', '')}>
                      Bỏ gom nhóm
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {tab === 'ky' && (
            <div className="bc-tc-ky-khung">
              <label className="row pn-tich">
                <input
                  type="checkbox"
                  checked={chiRieng}
                  onChange={e => doiChiRieng(e.target.checked)}
                />
                Chỉ báo cáo này
              </label>
              <DsKy
                ds={dsKyDangCo}
                onChange={onDoiKy}
                hoTenDonVi={nguoiKyDonVi}
              />
            </div>
          )}

          {tab === 'trang' && (
            <div className="bc-tc-trang-khung">
              <div className="pn-luoi">
                <div className="f">
                  <label>Cỡ chữ bảng</label>
                  <Select
                    className="inp"
                    value={String(coChu)}
                    onChange={e => capNhat({ coChu: Number(e.target.value) })}
                  >
                    {CO_CHU.map(c => <option key={c} value={String(c)}>{c} px</option>)}
                  </Select>
                </div>
              </div>
              <p className="muted pn-chu-nho">Đổi khổ giấy Dọc / Ngang tại thanh công cụ dưới trang.</p>
            </div>
          )}
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
