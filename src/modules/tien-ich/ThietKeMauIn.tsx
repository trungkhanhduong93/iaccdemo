// Tiện ích 11.11 Thiết kế mẫu in (kế hoạch mục 8.7): cây mẫu, tờ xem trước bấm chọn phần tử và kéo mép cột, khung thuộc tính.
// Mẫu chuẩn không sửa trực tiếp: thay đổi đầu tiên tự tạo bản sao "Mẫu riêng n", bấm Lưu mới ghi vào kho của đơn vị
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { ScreenProps, VoucherCfg } from '../types'
import { MODULES, tenMan } from '../../app/registry'
import { cheDoHienTai, donViHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import type { CheDo } from '../../app/che-do'
import { mauCuaChungTu, mauIn, type KhoiInK, type MauIn } from '../../app/mau-in'
import { chungTu } from '../../ui/generic/gen'
import { theoLoai } from '../../ui/generic/nhom'
import { duLieuIn, type DonViIn, type DuLieuIn } from '../../ui/bao-cao/duLieuIn'
import { boLien, giayIn, kyTheoDonVi, tenMauMoi, veMauIn } from '../../ui/bao-cao/InChungTu'
import { ToGiay } from '../../ui/bao-cao/ToGiay'
import {
  datMacDinh, dsMauRieng, khoaMoi, layNguoiKy, luuMauRieng, luuNguoiKy, nhapJson, xoaMauRieng, xuatJson, type MauRieng,
} from '../../ui/bao-cao/khoMauIn'
import { CaiTrang, coChuVi } from '../../ui/thiet-ke/CaiTrang'
import { DsCot } from '../../ui/thiet-ke/DsCot'
import { DsKy } from '../../ui/thiet-ke/DsKy'
import { OSo } from '../../ui/thiet-ke/OSo'
import { Dropdown, MenuItem, Select } from '../../ui/Dropdown'
import { HopXacNhan } from '../../ui/LocNangCao'
import { Icon } from '../../ui/Icon'
import { PageHead } from '../../ui/Page'
import { heSoZoom } from '../../ui/zoom'
import { fold } from '../../ui/format'

/** Cây mẫu theo phân hệ, giống bảng ghép chứng từ với mẫu in (mục 8.6) */
const CAY: [string, string[]][] = [
  ['Tiền', ['phieu-thu', 'phieu-chi', 'phieu-thu-nh', 'uy-nhiem-chi', 'bien-ban-doi-chieu']],
  ['Bán hàng', ['bang-ke-ban-hang', 'hoa-don']],
  ['Kho', ['phieu-nhap-kho', 'phieu-xuat-kho', 'phieu-xk-vcnb', 'bien-ban-kiem-ke', 'bien-ban-huy', 'bang-ke-mua-hang']],
  ['Tài sản', ['bb-giao-nhan-tscd', 'bb-thanh-ly-tscd', 'bien-ban-ccdc']],
  ['Tổng hợp', ['phieu-ke-toan']],
]

const TEN_KHOI: Record<KhoiInK, string> = {
  dauTrang: 'Đầu trang (đơn vị)', mauSo: 'Mẫu số, quyển số, Nợ Có', tieuDe: 'Tiêu đề, ngày, số', thongTin: 'Thông tin chung',
  bang: 'Bảng chi tiết', tongCong: 'Dòng tổng cộng', bangChu: 'Số tiền bằng chữ', ghiChu: 'Dòng ghi chú', ky: 'Ngày ký, ô ký', chanTrang: 'Chân trang',
}

type The = 'trang' | 'tieuDe' | 'thongTin' | 'bang' | 'ky' | 'khoi'
const THE_CUA_KHOI: Partial<Record<string, The>> = { tieuDe: 'tieuDe', thongTin: 'thongTin', bang: 'bang', ky: 'ky' }
type Chon = { loai: 'cot' | 'truong' | 'khoi'; k: string }

const PX = 96 / 25.4
const CO_CHU = Array.from({ length: 13 }, (_, i) => 8 + i / 2)
const CO_TIEU_DE = [12, 13, 14, 15, 16, 18, 20, 22, 24]
const so = (v: number) => v.toLocaleString('vi-VN', { maximumFractionDigits: 1 })

// Khối chứa nội dung bắt buộc của chứng từ kế toán: tên đơn vị, tên và số chứng từ, ngày, nội dung, số tiền, chữ ký
function khoiBatBuoc(m: MauIn, k: KhoiInK) {
  if (k === 'dauTrang' || k === 'tieuDe' || k === 'ky') return true
  if (k === 'thongTin') return m.thongTin.some(t => t.batBuoc)
  if (k === 'bang') return !!m.bang?.cot.some(c => c.batBuoc)
  return false
}

/** Bề rộng vùng in của khổ: bề rộng khổ trừ lề trái, lề phải (mm) */
function vungIn(m: MauIn) {
  const [r, c] = m.trang.kho === 'A5' ? [148, 210] : [210, 297]
  return (m.trang.huong === 'ngang' ? c : r) - m.trang.le[1] - m.trang.le[3]
}

const CFG_MAU: VoucherCfg = { prefix: 'CT', doiTuong: 'kh', dienGiai: ['Chứng từ mẫu'], tien: [2_000_000, 20_000_000], dong: 'hang' }

/** Dữ liệu xem trước: phiếu đầu tiên của màn chứng từ đầu tiên dùng mẫu này; không có màn nào thì dựng phiếu giả */
function duLieuMau(goc: MauIn, dv: DonViIn): DuLieuIn {
  for (const m of MODULES) {
    for (const sc of m.screens) {
      const cfg = sc.voucher
      if (sc.kind !== 'voucher' || !sc.code || !cfg) continue
      const code = sc.code
      const loai = cfg.loai?.find(l => mauCuaChungTu(code, l.k).some(x => x.id === goc.id))
      if (cfg.loai ? !loai : !mauCuaChungTu(code).some(x => x.id === goc.id)) continue
      const c = loai ? theoLoai(cfg, loai.k) : cfg
      const row = chungTu(c, loai ? `${code}-${loai.k}` : code)[0]
      if (row) return duLieuIn(goc, c, row, loai, dv, code)
    }
  }
  return duLieuIn(goc, CFG_MAU, chungTu(CFG_MAU, goc.id)[0], undefined, dv, goc.id)
}

interface Sua { goc: string; rieng: MauRieng | null; mau: MauIn; doi: boolean }

/** Mở mẫu theo id trên URL: id mẫu riêng, hoặc id mẫu chuẩn (lấy mẫu riêng mặc định nếu có, trừ khi chuan) */
function moSua(donVi: string, cd: CheDo, id: string | null, chuan: boolean): Sua {
  const r = id ? dsMauRieng(donVi, cd).find(m => m.id === id) : undefined
  if (r) return { goc: r.goc, rieng: r, mau: r.mau, doi: false }
  const goc = id && mauIn(id) ? id : CAY[0][1][0]
  const md = chuan ? undefined : dsMauRieng(donVi, cd, goc).find(m => m.macDinh)
  return md ? { goc, rieng: md, mau: md.mau, doi: false } : { goc, rieng: null, mau: mauIn(goc)!, doi: false }
}

export function ThietKeMauIn({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const cd = cheDoHienTai(s)
  const donVi = donViHienTai(s)
  const dv = useMemo<DonViIn>(() => ({ ten: donVi.ten, diaChi: donVi.diaChi, mst: donVi.mst }), [donVi])
  const [sp, setSp] = useSearchParams()
  const thamSo = sp.get('mau')
  const chuan = sp.get('chuan') === '1'
  const [sua, setSua] = useState<Sua>(() => moSua(donVi.id, cd.ma, thamSo, chuan))
  const [rev, setRev] = useState(0)          // tăng sau mỗi lần ghi kho để đọc lại danh sách
  const [the, setThe] = useState<The>('trang')
  const [chon, setChon] = useState<Chon | null>(null)
  const [doiTen, setDoiTen] = useState<string | null>(null)
  const [hoiXoa, setHoiXoa] = useState<MauRieng | null>(null)
  const [hoiVeChuan, setHoiVeChuan] = useState(false)
  const [timMau, setTimMau] = useState('')
  const tep = useRef<HTMLInputElement>(null)

  // Mở màn lần đầu: mặc định "Vừa khung" nếu người dùng chưa chọn zoom trước đó (T59)
  useState(() => {
    const daChon = localStorage.getItem('tkmi-zoom')
    try {
      const x = JSON.parse(localStorage.getItem('bc-xem') ?? '{}')
      if (!daChon && x.zoom !== 'vua') {
        localStorage.setItem('bc-xem', JSON.stringify({ ...x, zoom: 'vua' }))
      }
    } catch {
      if (!daChon) localStorage.setItem('bc-xem', JSON.stringify({ zoom: 'vua', che: 'lien' }))
    }
  })

  useEffect(() => {
    const ghiZoom = (e: Event) => {
      const el = e.target as Element | null
      if (el?.closest('.bc-thanh, .bc-zoom, .bc-thanh-nhom, .pop')) {
        localStorage.setItem('tkmi-zoom', '1')
      }
    }
    window.addEventListener('click', ghiZoom, true)
    return () => window.removeEventListener('click', ghiZoom, true)
  }, [])

  useEffect(() => { setSua(moSua(donVi.id, cd.ma, thamSo, chuan)) }, [donVi.id, cd.ma, thamSo, chuan])

  const dsKho = useMemo(() => dsMauRieng(donVi.id, cd.ma), [donVi.id, cd.ma, rev])
  const nguoiKy = useMemo(() => layNguoiKy(donVi.id), [donVi.id, rev])
  const goc = mauIn(sua.goc)!
  const cuaGoc = dsKho.filter(r => r.goc === sua.goc)
  const daLuu = !!sua.rieng && cuaGoc.some(r => r.id === sua.rieng?.id)
  const mau = sua.mau
  const du = useMemo(() => duLieuMau(goc, dv), [goc, dv])

  // Mọi thay đổi đi qua đây: đang ở mẫu chuẩn thì tạo bản sao mẫu riêng (chưa ghi kho tới khi bấm Lưu)
  const doiMau = useCallback((f: (m: MauIn) => MauIn) => setSua(d => ({
    ...d,
    mau: f(d.mau),
    doi: true,
    rieng: d.rieng ?? { id: khoaMoi(), goc: d.goc, cheDo: cd.ma, ten: tenMauMoi(dsMauRieng(donVi.id, cd.ma, d.goc)), macDinh: false, mau: d.mau, capNhat: '' },
  })), [cd.ma, donVi.id])
  const doiBang = (f: (b: NonNullable<MauIn['bang']>) => NonNullable<MauIn['bang']>) => doiMau(m => m.bang ? { ...m, bang: f(m.bang) } : m)

  const mo = (id: string, laChuan = false) => {
    setSua(moSua(donVi.id, cd.ma, id, laChuan))
    setChon(null)
    setDoiTen(null)
    setSp(laChuan ? { mau: id, chuan: '1' } : { mau: id }, { replace: true })
  }

  // Kiểm hợp lệ: cột đang hiện không rộng hơn vùng in, tiêu đề không trống
  const noCo = kieuGhiSo(cd.ma) === 'noco'
  const tongRong = mau.bang?.cot.filter(c => !c.an && (!c.chiNoCo || noCo)).reduce((a, c) => a + c.rong, 0) ?? 0
  const vung = vungIn(mau)
  const loiRong = tongRong > vung
  const loiTieuDe = !mau.tieuDe.trim()
  const loi = loiRong ? 'Tổng độ rộng cột vượt vùng in' : loiTieuDe ? 'Tiêu đề không được để trống' : null

  const luu = () => {
    if (!sua.rieng || !sua.doi || loi) return
    const khac = cuaGoc.filter(r => r.id !== sua.rieng?.id)
    const r: MauRieng = { ...sua.rieng, cheDo: cd.ma, mau, macDinh: sua.rieng.macDinh || !khac.length }
    luuMauRieng(donVi.id, r)
    setSua({ ...sua, rieng: r, doi: false })
    setRev(x => x + 1)
    setSp({ mau: r.id }, { replace: true })
    toast(`Đã lưu ${r.ten}${r.macDinh ? ', dùng làm mẫu mặc định khi in' : ''}`)
  }

  const veChuan = () => {
    if (daLuu) setHoiVeChuan(true)
    else setSua({ goc: sua.goc, rieng: null, mau: goc, doi: false })
  }

  const datMd = (id: string | null) => { datMacDinh(donVi.id, cd.ma, sua.goc, id); setRev(x => x + 1) }
  const xongDoiTen = (r: MauRieng, ten: string) => {
    setDoiTen(null)
    const t = ten.trim()
    if (!t || t === r.ten) return
    luuMauRieng(donVi.id, { ...r, ten: t })
    setSua(d => d.rieng?.id === r.id ? { ...d, rieng: { ...d.rieng, ten: t } } : d)
    setRev(x => x + 1)
  }
  const nhanBan = (r: MauRieng) => {
    const b: MauRieng = { ...r, id: khoaMoi(), ten: `${r.ten} (bản sao)`, macDinh: false }
    luuMauRieng(donVi.id, b)
    setRev(x => x + 1)
    mo(b.id)
  }

  const xuat = () => {
    if (!dsKho.length) { toast('Chưa có mẫu riêng để xuất'); return }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([xuatJson(donVi.id, cd.ma)], { type: 'application/json' }))
    a.download = `mau-in-${donVi.id}-${cd.ma}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const nhap = async (f: File | undefined) => {
    if (!f) return
    try {
      const n = nhapJson(donVi.id, cd.ma, await f.text())
      setRev(x => x + 1)
      setSua(moSua(donVi.id, cd.ma, thamSo, chuan))
      toast(`Đã nhập ${n} mẫu riêng`)
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Không đọc được file')
    }
    if (tep.current) tep.current.value = ''
  }

  const luuKyDonVi = () => {
    const moi = { ...nguoiKy }
    mau.ky.forEach(x => { if (x.hoTen) moi[x.chucDanh] = x.hoTen })
    luuNguoiKy(donVi.id, moi)
    setRev(x => x + 1)
    toast('Đã lưu họ tên người ký cho mọi mẫu của đơn vị')
  }

  // Bấm vào phần tử trên tờ: chuyển tới thẻ và mục tương ứng
  const bamTo = (e: MouseEvent<HTMLDivElement>) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-cot],[data-truong],[data-khoi]')
    if (!el) return
    const { cot, truong, khoi } = el.dataset
    if (cot) { setThe('bang'); setChon({ loai: 'cot', k: cot }) }
    else if (truong) { setThe('thongTin'); setChon({ loai: 'truong', k: truong }) }
    else if (khoi) { setThe(THE_CUA_KHOI[khoi] ?? 'khoi'); setChon({ loai: 'khoi', k: khoi }) }
  }

  // Kéo mép phải tiêu đề cột: px con trỏ đổi ra mm, chia hệ số zoom của html (T42) và tỉ lệ transform của tờ (docs/BAY.md)
  const keoMep = (e: PointerEvent<HTMLDivElement>) => {
    const mep = (e.target as Element).closest<HTMLElement>('[data-mep]')
    const k = mep?.dataset.mep
    const cot = k ? mau.bang?.cot.find(c => c.k === k) : undefined
    if (!mep || !k || !cot) return
    e.preventDefault()
    const to = mep.closest<HTMLElement>('.bc-ds-trang')
    const tiLe = Number(/scale\(([\d.]+)\)/.exec(to?.style.transform ?? '')?.[1] ?? 1) || 1
    const pxMm = heSoZoom() * tiLe * PX
    const x0 = e.clientX
    let cu = cot.rong
    setThe('bang')
    setChon({ loai: 'cot', k })
    document.body.classList.add('tkmi-dang-keo')
    const di = (ev: globalThis.PointerEvent) => {
      const rong = Math.max(5, Math.round((cot.rong + (ev.clientX - x0) / pxMm) * 2) / 2)
      if (rong === cu) return
      cu = rong
      doiBang(b => ({ ...b, cot: b.cot.map(c => c.k === k ? { ...c, rong } : c) }))
    }
    const tha = () => {
      window.removeEventListener('pointermove', di)
      window.removeEventListener('pointerup', tha)
      window.removeEventListener('pointercancel', tha)
      document.body.classList.remove('tkmi-dang-keo')
    }
    window.addEventListener('pointermove', di)
    window.addEventListener('pointerup', tha)
    window.addEventListener('pointercancel', tha)
  }

  const than = useMemo(() => {
    const m = kyTheoDonVi(mau, nguoiKy)
    return boLien(m, veMauIn(m, du, cd, dv, true))
  }, [mau, nguoiKy, du, cd, dv])

  const cayLoc = useMemo(() => {
    const q = fold(timMau.trim())
    if (!q) return CAY
    return CAY.map(([nhom, ids]) => [
      nhom,
      ids.filter(id => fold(mauIn(id)?.ten ?? '').includes(q)),
    ] as [string, string[]]).filter(([, ids]) => ids.length > 0)
  }, [timMau])

  const dsThe: { k: The; ten: string; nhan: string }[] = [
    { k: 'trang', ten: 'Trang', nhan: 'Trang' },
    { k: 'tieuDe', ten: 'Tiêu đề', nhan: 'Tiêu đề' },
    ...(mau.thongTin.length ? [{ k: 'thongTin' as The, ten: 'Thông tin chung', nhan: 'Thông tin' }] : []),
    ...(mau.bang ? [{ k: 'bang' as The, ten: 'Bảng chi tiết', nhan: 'Bảng chi tiết' }] : []),
    { k: 'ky', ten: 'Người ký', nhan: 'Người ký' },
    { k: 'khoi', ten: 'Khối', nhan: 'Khối' },
  ]
  const theHien = dsThe.some(({ k }) => k === the) ? the : 'trang'
  const kyHieu = goc.kyHieu[cd.ma]
  const chonK = (loai: Chon['loai']) => chon?.loai === loai ? chon.k : undefined
  const toSang = chon ? `.tkmi-to .bc-trang [data-${chon.loai}="${CSS.escape(chon.k)}"]{outline:2px solid var(--blue);outline-offset:1px}` : ''

  return (
    <div className="page tkmi-trang-man">
      <PageHead title={tenMan(sc)}>
        <button type="button" className="btn" disabled={!sua.rieng && !sua.doi} onClick={veChuan}><Icon n="refresh" className="ic sm" />Về mẫu chuẩn</button>
        <button type="button" className="btn pri tkmi-luu" disabled={!sua.doi || !!loi} title={loi ?? (sua.doi ? 'Có thay đổi chưa lưu' : undefined)} onClick={luu}>
          {sua.doi && <span className="tkmi-cham" aria-label="Có thay đổi chưa lưu" />}Lưu
        </button>
      </PageHead>

      <div className="tkmi">
        <aside className="tkmi-cot tkmi-trai">
          <div className="tkmi-trai-dau">
            <div className="tkmi-cot-tieu">Mẫu in</div>
            <input
              type="text"
              className="inp"
              placeholder="Tìm mẫu in"
              value={timMau}
              onChange={e => setTimMau(e.target.value)}
            />
          </div>
          <div className="tkmi-cuon">
            {cayLoc.length === 0 ? (
              <div className="tkmi-trong">Không có mẫu khớp</div>
            ) : (
              cayLoc.map(([nhom, ids]) => (
                <div key={nhom} className="tkmi-nhom">
                  <div className="tkmi-nhom-ten">{nhom}</div>
                  {ids.map(id => {
                    const n = dsKho.filter(r => r.goc === id).length
                    return (
                      <button key={id} type="button" className={`tkmi-cay-muc${sua.goc === id ? ' on' : ''}`} onClick={() => mo(id)}>
                        <span className="grow">{mauIn(id)?.ten}</span>
                        {n > 0 && <span className="tkmi-dem" title={`${n} mẫu riêng`}>{n}</span>}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
          <div className="tkmi-mau-phieu">
            <div className="tkmi-cot-tieu">Mẫu của phiếu</div>
            <div className="tkmi-ds-mau" role="radiogroup" aria-label="Mẫu mặc định khi in">
              <div className={`tkmi-mau${!sua.rieng ? ' on' : ''}`}>
                <input type="radio" name="tkmi-md" checked={!cuaGoc.some(r => r.macDinh)} title="Dùng làm mẫu mặc định khi in"
                  aria-label="Mẫu chuẩn là mặc định" onChange={() => datMd(null)} />
                <button type="button" className="tkmi-mau-ten" onClick={() => mo(sua.goc, true)}>Mẫu chuẩn</button>
              </div>
              {cuaGoc.map(r => (
                <div key={r.id} className={`tkmi-mau${sua.rieng?.id === r.id ? ' on' : ''}`}>
                  <input type="radio" name="tkmi-md" checked={r.macDinh} title="Dùng làm mẫu mặc định khi in"
                    aria-label={`${r.ten} là mặc định`} onChange={() => datMd(r.id)} />
                  {doiTen === r.id
                    ? (
                      <input className="inp tkmi-o-doi-ten" autoFocus defaultValue={r.ten} aria-label="Tên mẫu"
                        onBlur={e => xongDoiTen(r, e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setDoiTen(null) }} />
                    )
                    : <button type="button" className="tkmi-mau-ten" onClick={() => mo(r.id)}>{r.ten}</button>}
                  <Dropdown label={<Icon n="more" className="ic sm" />} btnClass="icon-btn sm" title={`Thao tác với ${r.ten}`} align="end" width={170}>
                    {dong => (
                      <>
                        <MenuItem icon="edit" onClick={() => { dong(); setDoiTen(r.id) }}>Đổi tên</MenuItem>
                        <MenuItem icon="copy" onClick={() => { dong(); nhanBan(r) }}>Nhân bản</MenuItem>
                        <MenuItem icon="trash" danger onClick={() => { dong(); setHoiXoa(r) }}>Xoá</MenuItem>
                      </>
                    )}
                  </Dropdown>
                </div>
              ))}
              {sua.rieng && !daLuu && (
                <div className="tkmi-mau on">
                  <input type="radio" disabled aria-label="Mẫu chưa lưu" />
                  <span className="tkmi-mau-ten">{sua.rieng.ten} <i>(chưa lưu)</i></span>
                </div>
              )}
            </div>
          </div>
          <div className="tkmi-chan">
            <button type="button" className="btn sm" onClick={xuat}><Icon n="download" className="ic sm" />Xuất mẫu (.json)</button>
            <button type="button" className="btn sm" onClick={() => tep.current?.click()}><Icon n="upload" className="ic sm" />Nhập mẫu (.json)</button>
            <input ref={tep} type="file" accept=".json,application/json" hidden aria-label="Chọn file mẫu in" onChange={e => nhap(e.target.files?.[0])} />
          </div>
        </aside>

        <section className="tkmi-cot tkmi-giua">
          <div className="tkmi-thanh">
            <b className="tkmi-ten-mau">{goc.ten}{sua.rieng ? ` · ${sua.rieng.ten}` : ''}</b>
            <span className={`chip${sua.rieng ? ' info' : ''}`}>{sua.rieng ? 'Mẫu riêng' : 'Mẫu chuẩn'}</span>
            <span className="chip">{kyHieu ? `Mẫu số ${kyHieu}` : 'Tự thiết kế'}</span>
            <span className="grow" />
            <span className="tkmi-goi-y" title="Bấm vào phần tử trên tờ để sửa. Kéo mép phải tiêu đề cột để đổi độ rộng.">
              <Icon n="info" className="ic sm" />
              <span>Bấm vào phần tử trên tờ để sửa. Kéo mép phải tiêu đề cột để đổi độ rộng.</span>
            </span>
          </div>
          <div className="tkmi-to" onClick={bamTo} onPointerDown={keoMep}>
            {toSang && <style>{toSang}</style>}
            <ToGiay giay={giayIn(mau)} anSoTrang dau={null} than={than} khoMacDinh="doc" />
          </div>
        </section>

        <aside className="tkmi-cot tkmi-phai">
          <div className="tkmi-the-khung">
            <div className="seg tkmi-the" role="tablist">
              {dsThe.map(({ k, ten, nhan }) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={theHien === k}
                  className={theHien === k ? 'on' : ''}
                  title={ten}
                  onClick={() => setThe(k)}
                >
                  {nhan}
                </button>
              ))}
            </div>
          </div>
          <div className="tkmi-cuon tkmi-than-the">
            {theHien === 'trang' && <CaiTrang trang={mau.trang} onChange={trang => doiMau(m => ({ ...m, trang }))} />}

            {theHien === 'tieuDe' && (
              <div className="tkmi-nhom-o">
                <label className="tkmi-nhan">Chữ tiêu đề
                  <input className="inp" value={mau.tieuDe} onChange={e => { const t = e.target.value; doiMau(m => ({ ...m, tieuDe: t })) }} />
                </label>
                {loiTieuDe && <div className="tkmi-loi" role="alert">Tiêu đề là tên chứng từ, không được để trống.</div>}
                <div className="tkmi-hang">
                  <span className="tkmi-nhan-hang">Cỡ chữ</span>
                  <Select className="inp tkmi-o-chon" value={String(mau.tieuDeCo ?? 0)} aria-label="Cỡ chữ tiêu đề"
                    onChange={e => { const v = Number(e.target.value); doiMau(m => ({ ...m, tieuDeCo: v || undefined })) }}>
                    <option value="0">Tự động</option>
                    {CO_TIEU_DE.map(c => <option key={c} value={String(c)}>{coChuVi(c)}</option>)}
                  </Select>
                </div>
                <label className="tkmi-check">
                  <input type="checkbox" checked={mau.tieuDeDam !== false} onChange={e => { const v = e.target.checked; doiMau(m => ({ ...m, tieuDeDam: v })) }} />In đậm
                </label>
              </div>
            )}

            {theHien === 'thongTin' && (
              <div className="tkmi-nhom-o">
                <div className="tkmi-hang">
                  <span className="tkmi-nhan-hang">Chia cột</span>
                  <span className="seg">
                    {([1, 2] as const).map(n => (
                      <button key={n} type="button" className={mau.soCotThongTin === n ? 'on' : ''} onClick={() => doiMau(m => ({ ...m, soCotThongTin: n }))}>{n} cột</button>
                    ))}
                  </span>
                </div>
                <DsCot items={mau.thongTin.map(t => ({ k: t.k, ten: t.nhan, an: t.an, batBuoc: t.batBuoc, rong: t.rongNhan }))}
                  coRong rongTrong nhanRong="Rộng nhãn (mm)" chon={chonK('truong')} onChon={k => setChon({ loai: 'truong', k })}
                  onChange={ds => doiMau(m => ({
                    ...m,
                    thongTin: ds.flatMap(x => {
                      const t = m.thongTin.find(y => y.k === x.k)
                      return t ? [{ ...t, nhan: x.ten, an: t.batBuoc ? undefined : x.an, rongNhan: x.rong }] : []
                    }),
                  }))} />
              </div>
            )}

            {theHien === 'bang' && mau.bang && (
              <div className="tkmi-nhom-o">
                <DsCot items={mau.bang.cot.map(c => ({ k: c.k, ten: c.t, an: c.an, batBuoc: c.batBuoc, rong: c.rong, can: c.can }))}
                  coRong coCan chon={chonK('cot')} onChon={k => setChon({ loai: 'cot', k })}
                  onChange={ds => doiBang(b => ({
                    ...b,
                    cot: ds.flatMap(x => {
                      const c = b.cot.find(y => y.k === x.k)
                      return c ? [{ ...c, t: x.ten, an: c.batBuoc ? undefined : x.an, rong: x.rong ?? c.rong, can: x.can }] : []
                    }),
                  }))} />
                <div className={`tkmi-tong-rong${loiRong ? ' loi' : ''}`}>Tổng độ rộng cột đang hiện: <b>{so(tongRong)}</b> / {so(vung)} mm vùng in</div>
                {loiRong && (
                  <div className="tkmi-loi" role="alert">
                    Các cột rộng hơn vùng in {so(tongRong - vung)} mm. Thu hẹp hoặc ẩn bớt cột, hoặc đổi khổ, lề thì mới lưu được.
                  </div>
                )}
                <div className="tkmi-hang">
                  <span className="tkmi-nhan-hang">Chiều cao dòng (mm)</span>
                  <OSo className="inp tkmi-o-so" value={mau.bang.caoDong} min={4} max={30} aria-label="Chiều cao dòng (mm)"
                    onChange={v => { if (v !== undefined) doiBang(b => ({ ...b, caoDong: v })) }} />
                </div>
                <div className="tkmi-hang">
                  <span className="tkmi-nhan-hang">Số dòng trống tối thiểu</span>
                  <OSo className="inp tkmi-o-so" value={mau.bang.dongTrongToiThieu} min={0} max={30} aria-label="Số dòng trống tối thiểu"
                    onChange={v => { if (v !== undefined) doiBang(b => ({ ...b, dongTrongToiThieu: Math.round(v) })) }} />
                </div>
                <div className="tkmi-hang">
                  <span className="tkmi-nhan-hang">Cỡ chữ bảng</span>
                  <Select className="inp tkmi-o-chon" value={String(mau.bang.coChu ?? 0)} aria-label="Cỡ chữ bảng"
                    onChange={e => { const v = Number(e.target.value); doiBang(b => ({ ...b, coChu: v || undefined })) }}>
                    <option value="0">Theo cỡ chữ chung</option>
                    {CO_CHU.map(c => <option key={c} value={String(c)}>{coChuVi(c)}</option>)}
                  </Select>
                </div>
                <label className="tkmi-check">
                  <input type="checkbox" checked={mau.bang.dongTong} onChange={e => { const v = e.target.checked; doiBang(b => ({ ...b, dongTong: v })) }} />Hiện dòng cộng
                </label>
              </div>
            )}

            {theHien === 'ky' && (
              <div className="tkmi-nhom-o">
                <DsKy ds={mau.ky} hoTenDonVi={nguoiKy} onChange={ky => doiMau(m => ({ ...m, ky }))} />
                <button type="button" className="btn sm" disabled={!mau.ky.some(x => x.hoTen)} onClick={luuKyDonVi}>Dùng họ tên này cho mọi mẫu của đơn vị</button>
              </div>
            )}

            {theHien === 'khoi' && (
              <DsCot items={mau.khoi.map(x => ({ k: x.k, ten: TEN_KHOI[x.k], an: x.an, batBuoc: khoiBatBuoc(mau, x.k) }))}
                suaTen={false} chon={chonK('khoi')} onChon={k => setChon({ loai: 'khoi', k })}
                onChange={ds => doiMau(m => ({
                  ...m,
                  khoi: ds.flatMap(x => {
                    const kh = m.khoi.find(y => y.k === x.k)
                    return kh ? [{ ...kh, an: khoiBatBuoc(m, kh.k) ? undefined : x.an }] : []
                  }),
                }))} />
            )}
          </div>
        </aside>
      </div>

      {hoiXoa && (
        <HopXacNhan tieuDe="Xoá mẫu riêng" nut="Xoá" onDong={() => setHoiXoa(null)}
          onDongY={() => {
            xoaMauRieng(donVi.id, hoiXoa.id)
            setRev(x => x + 1)
            if (sua.rieng?.id === hoiXoa.id) mo(sua.goc)
            toast(`Đã xoá ${hoiXoa.ten}`)
            setHoiXoa(null)
          }}>
          Xoá {hoiXoa.ten} của {goc.ten}? Mẫu đã xoá không lấy lại được.{hoiXoa.macDinh ? ' Phiếu in sẽ dùng mẫu chuẩn.' : ''}
        </HopXacNhan>
      )}
      {hoiVeChuan && (
        <HopXacNhan tieuDe="Về mẫu chuẩn" nut="Đặt lại" onDong={() => setHoiVeChuan(false)}
          onDongY={() => { setSua(d => ({ ...d, mau: goc, doi: true })); setHoiVeChuan(false) }}>
          Đặt lại {sua.rieng?.ten} giống mẫu chuẩn {goc.ten}? Bấm Lưu thì mới ghi đè mẫu riêng.
        </HopXacNhan>
      )}
    </div>
  )
}
