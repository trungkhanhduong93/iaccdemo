import { useEffect, useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG, HOM_NAY, KHACH, NCC } from '../../data/mock'
import { Icon } from '../Icon'
import { dmy, docSoQT, fold, money } from '../format'
import { MTrong } from './MTrong'
import { MChon } from './MChon'
import { LichDon, docNgay, type KhoangNgay } from '../ChonNgay'
import { quayLaiMobile } from './quayLai'
import { ThongBao } from '../ThongBao'
import { thayNhomCatalogRows, useAddedCatalogRows } from '../generic/danhMucStore'
import {
  type LoaiGia,
  type HangGia,
  type DongGia,
  HANG_BAN,
  HANG_MUA,
  dvtCua,
  ghiQuyDoi,
  dongMoi,
  docKhoang,
  DM,
  tenNcc,
  tenKh,
  bangGia,
  maKeTiep,
  giaoNgay,
  tachCh,
  giaoCh,
} from '../../modules/danh-muc/ThemBangGia'

interface NhomBg {
  soBg: string
  tenBg: string
  loai: LoaiGia
  thoiGian: string
  cuaHang: string
  dtMa: string
  ncc: string
  kh: string
  _tt: number
  dong: Row[]
}

function nhomCacBangGia(tatCa: Row[]): NhomBg[] {
  const map = new Map<string, NhomBg>()
  for (const r of tatCa) {
    const so = String(r.soBg ?? '')
    if (!so) continue
    let g = map.get(so)
    if (!g) {
      g = {
        soBg: so,
        tenBg: String(r.tenBg ?? ''),
        loai: (r.loai === 'Giá bán' ? 'Giá bán' : 'Giá mua') as LoaiGia,
        thoiGian: String(r.thoiGian ?? ''),
        cuaHang: String(r.cuaHang ?? ''),
        dtMa: String(r.dtMa ?? ''),
        ncc: String(r.ncc ?? ''),
        kh: String(r.kh ?? ''),
        _tt: Number(r._tt ?? 1),
        dong: [],
      }
      map.set(so, g)
    }
    g.dong.push(r)
  }
  return Array.from(map.values())
}

function nhanApDung(bg: NhomBg): string {
  if (bg.dtMa) {
    if (bg.loai === 'Giá mua') {
      return bg.ncc || tenNcc(bg.dtMa) || bg.dtMa
    }
    return bg.kh || tenKh(bg.dtMa) || bg.dtMa
  }
  return bg.loai === 'Giá mua' ? 'Mọi nhà cung cấp' : 'Mọi khách hàng'
}

type TabLoai = 'tat-ca' | 'mua' | 'ban'

export const MBangGia: FC<ScreenProps> = ({ sc, mod }) => {
  const { toast } = useSession()
  const nav = useNavigate()
  const viTri = useLocation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const laSua = searchParams.get('sua') === '1'
  const laThemMoi = id === 'moi'
  const path = duongDan(mod, sc)

  const tatCa = useAddedCatalogRows(DM)
  const dsBg = useMemo(() => nhomCacBangGia(tatCa), [tatCa])
  const dangXem = id && id !== 'moi' ? dsBg.find(b => b.soBg === id) : null

  // ── State Danh sách ──
  const [tab, setTab] = useState<TabLoai>('tat-ca')
  const [q, setQ] = useState('')

  const demTabs = useMemo(() => {
    let mua = 0
    let ban = 0
    for (const bg of dsBg) {
      if (bg.loai === 'Giá mua') mua++
      else if (bg.loai === 'Giá bán') ban++
    }
    return { 'tat-ca': dsBg.length, mua, ban }
  }, [dsBg])

  const theoTab = useMemo(() => {
    if (tab === 'mua') return dsBg.filter(b => b.loai === 'Giá mua')
    if (tab === 'ban') return dsBg.filter(b => b.loai === 'Giá bán')
    return dsBg
  }, [dsBg, tab])

  const hienThi = useMemo(() => {
    if (!q.trim()) return theoTab
    const f = fold(q.trim())
    return theoTab.filter(b => {
      const chu = `${b.soBg} ${b.tenBg} ${b.loai} ${nhanApDung(b)}`
      return fold(chu).includes(f)
    })
  }, [theoTab, q])

  // ── State Màn Chi tiết ──
  const [hoiXoa, setHoiXoa] = useState(false)

  // ── State Màn Thêm / Sửa ──
  const [formLoai, setFormLoai] = useState<LoaiGia>('Giá mua')
  const [formTen, setFormTen] = useState('')
  const [formCuaHang, setFormCuaHang] = useState<string[]>([])
  const [formRieng, setFormRieng] = useState(false)
  const [formDt, setFormDt] = useState('')
  const [formTuNgay, setFormTuNgay] = useState('')
  const [formDenNgay, setFormDenNgay] = useState('')
  const [formDong, setFormDong] = useState<DongGia[]>([])
  const [hangThem, setHangThem] = useState<HangGia[]>([])

  // Modal ô chọn trong form
  const [moChonCuaHang, setMoChonCuaHang] = useState(false)
  const [moChonDt, setMoChonDt] = useState(false)
  const [moLichTu, setMoLichTu] = useState(false)
  const [moLichDen, setMoLichDen] = useState(false)
  const [hoiTrung, setHoiTrung] = useState<{ ds: { bg: string; hang: string }[] } | null>(null)

  // Modal thêm/sửa dòng mặt hàng
  const [moTamItem, setMoTamItem] = useState(false)
  const [dangSuaIdx, setDangSuaIdx] = useState<number | null>(null)
  const [itemMa, setItemMa] = useState('')
  const [itemDvt, setItemDvt] = useState('')
  const [itemGia, setItemGia] = useState('')
  const [itemVat, setItemVat] = useState('8')
  const [itemGhiChu, setItemGhiChu] = useState('')
  const [itemGhiTu, setItemGhiTu] = useState(false)
  const [moChonHang, setMoChonHang] = useState(false)
  const [moChonDvt, setMoChonDvt] = useState(false)

  // Khởi tạo giá trị khi vào form thêm hoặc sửa
  useEffect(() => {
    if (laThemMoi) {
      setFormLoai(tab === 'ban' ? 'Giá bán' : 'Giá mua')
      setFormTen('')
      setFormCuaHang([])
      setFormRieng(false)
      setFormDt('')
      const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
      setFormTuNgay(dmy(homNay))
      setFormDenNgay(dmy(new Date(homNay.getFullYear() + 1, homNay.getMonth(), homNay.getDate() - 1)))
      setFormDong([])
      setHangThem([])
    } else if (laSua && dangXem) {
      setFormLoai(dangXem.loai)
      setFormTen(dangXem.tenBg)
      setFormCuaHang(tachCh(dangXem.cuaHang))
      setFormRieng(Boolean(dangXem.dtMa))
      setFormDt(dangXem.dtMa)
      const kn = docKhoang(dangXem.thoiGian)
      if (kn) {
        setFormTuNgay(dmy(kn.tu))
        setFormDenNgay(dmy(kn.den))
      } else {
        const homNay = new Date(HOM_NAY.getFullYear(), HOM_NAY.getMonth(), HOM_NAY.getDate())
        setFormTuNgay(dmy(homNay))
        setFormDenNgay(dmy(new Date(homNay.getFullYear() + 1, homNay.getMonth(), homNay.getDate() - 1)))
      }
      setFormDong(
        dangXem.dong.map((r, i) => ({
          key: i + 1,
          ma: String(r.maHang ?? ''),
          dvt: String(r.dvt ?? ''),
          gia: String(r.gia ?? ''),
          vat: String(r.vat ?? ''),
          ghiChu: String(r.ghiChu ?? ''),
        })),
      )
      setHangThem(
        dangXem.dong.map(r => ({
          ma: String(r.maHang ?? ''),
          ten: String(r.tenHang ?? ''),
          dvt: String(r.dvt ?? ''),
          gia: 0,
          vat: 8,
        })),
      )
    }
  }, [laThemMoi, laSua, id, viTri.key])

  const laMua = formLoai === 'Giá mua'
  const dsHang = laMua ? HANG_MUA : HANG_BAN
  const hangCua = (ma: string): HangGia | undefined => dsHang.find((h: HangGia) => h.ma === ma) ?? hangThem.find((h: HangGia) => h.ma === ma)
  const dsDt = laMua ? NCC : KHACH
  const nhanDt = laMua ? 'nhà cung cấp' : 'khách hàng'
  const tenDtCua = (ma: string) => dsDt.find(n => n.ma === ma)?.ten ?? ''

  const hItem = hangCua(itemMa)
  const itemDsDvt = useMemo(() => {
    if (!hItem) return []
    return dvtCua(hItem)
  }, [hItem])

  const doiLoaiForm = (l: LoaiGia) => {
    if (laSua || l === formLoai) return
    setFormLoai(l)
    setFormDt('')
    setFormRieng(false)
    setFormDong([])
  }

  const batDauThemDong = () => {
    setDangSuaIdx(null)
    setItemMa('')
    setItemDvt('')
    setItemGia('')
    setItemVat('8')
    setItemGhiChu('')
    setItemGhiTu(false)
    setMoTamItem(true)
  }

  const batDauSuaDong = (idx: number) => {
    const d = formDong[idx]
    if (!d) return
    setDangSuaIdx(idx)
    setItemMa(d.ma)
    setItemDvt(d.dvt)
    setItemGia(d.gia)
    setItemVat(d.vat)
    setItemGhiChu(d.ghiChu ?? '')
    setItemGhiTu(Boolean(d.ghiTu))
    setMoTamItem(true)
  }

  const chonHangItem = (ma: string) => {
    setItemMa(ma)
    const h = hangCua(ma)
    if (!h) return
    const ds = dvtCua(h)
    const daKhai = formDong
      .filter((_, idx) => idx !== dangSuaIdx && _.ma === ma)
      .map((x: DongGia) => x.dvt)
    const dv = ds.find((x: { dv: string; heSo: number }) => !daKhai.includes(x.dv)) ?? ds[0]
    const heSo = dv?.heSo ?? 1
    const giaMoi = h.gia ? String(Math.round(h.gia * heSo * 100) / 100) : ''
    const ghi = ghiQuyDoi(h, dv?.dv ?? h.dvt, heSo)
    setItemDvt(dv?.dv ?? h.dvt)
    setItemGia(giaMoi)
    setItemVat(String(h.vat ?? 8))
    setItemGhiChu(ghi)
    setItemGhiTu(Boolean(ghi))
  }

  const doiDvtItem = (dv: string) => {
    const h = hangCua(itemMa)
    if (!h) {
      setItemDvt(dv)
      return
    }
    const ds = dvtCua(h)
    const cuHs = ds.find((x: { dv: string; heSo: number }) => x.dv === itemDvt)?.heSo ?? 1
    const moiHs = ds.find((x: { dv: string; heSo: number }) => x.dv === dv)?.heSo ?? 1
    const giaCu = docSoQT(itemGia)
    const ghi = ghiQuyDoi(h, dv, moiHs)
    setItemDvt(dv)
    if (giaCu > 0) {
      setItemGia(String(Math.round((giaCu / cuHs) * moiHs * 100) / 100))
    }
    if (!itemGhiChu.trim() || itemGhiTu) {
      setItemGhiChu(ghi)
      setItemGhiTu(Boolean(ghi))
    }
  }

  const luuDongItem = () => {
    if (!itemMa) {
      toast('Vui lòng chọn mặt hàng', { loai: 'loi' })
      return
    }
    const giaSo = docSoQT(itemGia)
    if (giaSo <= 0) {
      toast('Đơn giá phải lớn hơn 0', { loai: 'loi' })
      return
    }
    const trung = formDong.some(
      (d, idx) => idx !== dangSuaIdx && d.ma === itemMa && d.dvt === itemDvt,
    )
    if (trung) {
      toast('Mặt hàng và ĐVT này đã có trong danh sách', { loai: 'loi' })
      return
    }

    if (dangSuaIdx !== null) {
      setFormDong(cur =>
        cur.map((d, idx) =>
          idx === dangSuaIdx
            ? {
                ...d,
                ma: itemMa,
                dvt: itemDvt,
                gia: itemGia,
                vat: itemVat,
                ghiChu: itemGhiChu,
                ghiTu: itemGhiTu,
              }
            : d,
        ),
      )
    } else {
      setFormDong(cur => [
        ...cur,
        {
          key: Date.now() + Math.random(),
          ma: itemMa,
          dvt: itemDvt,
          gia: itemGia,
          vat: itemVat,
          ghiChu: itemGhiChu,
          ghiTu: itemGhiTu,
        },
      ])
    }
    setMoTamItem(false)
  }

  const luuForm = (boQuaTrung = false) => {
    if (!formTen.trim()) {
      toast('Nhập tên bảng giá', { loai: 'loi' })
      return
    }
    if (formRieng && !formDt) {
      toast(`Chọn ${nhanDt}, hoặc chọn áp dụng cho mọi ${nhanDt}`, { loai: 'loi' })
      return
    }
    const knTu = docNgay(formTuNgay)
    const knDen = docNgay(formDenNgay)
    const ngayHong = isNaN(knTu.getTime()) || isNaN(knDen.getTime()) || knDen < knTu
    if (ngayHong) {
      toast(
        'Thời gian áp dụng: nhập đủ Từ ngày, Đến ngày dạng dd/mm/yyyy, Đến ngày không trước Từ ngày',
        { loai: 'loi' },
      )
      return
    }
    const dongDien = formDong.filter(d => d.ma && docSoQT(d.gia) > 0)
    if (!dongDien.length) {
      toast('Chọn ít nhất một mặt hàng và nhập đơn giá', { loai: 'loi' })
      return
    }

    const khoaTrung = (d: DongGia) => `${d.ma}|${d.dvt}`
    const dem = new Map<string, number>()
    dongDien.forEach(d => dem.set(khoaTrung(d), (dem.get(khoaTrung(d)) ?? 0) + 1))
    const coTrung = dongDien.some(d => (dem.get(khoaTrung(d)) ?? 0) > 1)
    if (coTrung) {
      toast('Trùng mặt hàng và ĐVT với dòng khác trong bảng giá', { loai: 'loi' })
      return
    }

    const maSua = laSua && dangXem ? dangXem.soBg : ''
    const maDt = formRieng ? formDt : ''
    const khoang: KhoangNgay = { tu: knTu, den: knDen }

    if (!boQuaTrung) {
      const nhom = new Map<string, string[]>()
      tatCa
        .filter(
          r =>
            r.soBg !== maSua &&
            r.loai === formLoai &&
            r._tt !== 0 &&
            String(r.dtMa ?? '') === maDt,
        )
        .filter(r => {
          const k = docKhoang(r.thoiGian)
          return k && giaoNgay(k, khoang) && giaoCh(tachCh(r.cuaHang), formCuaHang)
        })
        .filter(r => dongDien.some(d => r.maHang === d.ma && r.dvt === d.dvt))
        .forEach(r => {
          const k = `${r.soBg} ${r.tenBg}`
          nhom.set(k, [...(nhom.get(k) ?? []), `${r.tenHang} (${r.dvt})`])
        })
      const trung = [...nhom].map(([k, ds]) => ({
        bg: k,
        hang: `${ds.slice(0, 3).join(', ')}${ds.length > 3 ? ` và ${ds.length - 3} dòng khác` : ''}`,
      }))
      if (trung.length) {
        setHoiTrung({ ds: trung })
        return
      }
    }

    const soBg = maSua || maKeTiep(tatCa)
    const thoiGian = `${dmy(khoang.tu)} - ${dmy(khoang.den)}`
    const rows = bangGia(
      soBg,
      formTen.trim(),
      formLoai,
      thoiGian,
      formCuaHang.join(', '),
      maDt,
      dongDien.map(d => ({
        ma: d.ma,
        ten: hangCua(d.ma)?.ten,
        dvt: d.dvt || hangCua(d.ma)?.dvt || '',
        gia: docSoQT(d.gia),
        vat: docSoQT(d.vat),
        ghiChu: d.ghiChu?.trim(),
      })),
      laSua && dangXem ? dangXem._tt : 1,
    )

    thayNhomCatalogRows(DM, r => r.soBg === soBg, rows)
    toast(
      `Đã lưu bảng giá ${soBg} (${dongDien.length} dòng), áp dụng cho ${maDt ? tenDtCua(maDt) : `mọi ${nhanDt}`}`,
    )

    if (laThemMoi) {
      quayLaiMobile(nav, path)
    } else {
      quayLaiMobile(nav, `${path}/${soBg}`)
    }
  }

  // ── 1. MÀN THÊM HOẶC SỬA ──
  if (laThemMoi || (id !== undefined && laSua)) {
    if (!laThemMoi && !dangXem) {
      return (
        <div className="m-ct-form m-tc-lap-man">
          <header className="m-ct-dau-giua">
            <button
              type="button"
              className="m-ct-nut-ic"
              onClick={() => quayLaiMobile(nav, path)}
              aria-label="Quay lại"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1>Không tìm thấy bảng giá</h1>
            <span style={{ width: 40 }} />
          </header>
          <div className="m-ct-cuon">
            <MTrong tieuDe="Không tìm thấy bảng giá" moTa="Bảng giá không tồn tại hoặc đã bị xoá" />
          </div>
        </div>
      )
    }

    const tieuDeForm = laThemMoi ? 'Thêm bảng giá' : `Sửa bảng giá ${dangXem?.soBg ?? ''}`

    return (
      <div className="m-ct-form m-tc-lap-man">
        <header className="m-ct-dau-giua">
          <button
            type="button"
            className="m-ct-nut-ic"
            onClick={() => {
              if (dangXem) quayLaiMobile(nav, `${path}/${dangXem.soBg}`)
              else quayLaiMobile(nav, path)
            }}
            aria-label="Quay lại"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>{tieuDeForm}</h1>
          <span style={{ width: 40 }} />
        </header>

        <div className="m-ct-cuon">
          {/* Thông tin chung */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">Thông tin chung</p>

            <div className="m-ct-o">
              <label>
                Loại bảng giá <em>*</em>
              </label>
              <div className="m-bg-loai-radio" role="radiogroup" aria-label="Loại bảng giá">
                {(['Giá mua', 'Giá bán'] as LoaiGia[]).map(l => (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={formLoai === l}
                    className={`m-bg-rad-btn${formLoai === l ? ' on' : ''}`}
                    disabled={laSua && formLoai !== l}
                    onClick={() => doiLoaiForm(l)}
                  >
                    <span className={`bgf-cham ${l === 'Giá mua' ? 'mua' : 'ban'}`} />
                    {l}
                  </button>
                ))}
              </div>
              {laSua && <div className="m-bg-chu-thich">Không đổi loại bảng giá khi sửa</div>}
            </div>

            <div className="m-ct-o">
              <label>
                Tên bảng giá <em>*</em>
              </label>
              <input
                type="text"
                value={formTen}
                onChange={e => setFormTen(e.target.value)}
                placeholder={
                  formLoai === 'Giá mua' ? 'Vd: Giá mua rau củ quý 4' : 'Vd: Giá bán khách đoàn'
                }
                aria-label="Tên bảng giá"
              />
            </div>

            <button
              type="button"
              className="m-ct-o m-ct-o-bam"
              onClick={() => setMoChonCuaHang(true)}
            >
              <label>Cửa hàng áp dụng</label>
              <div className={`gt m-ct-gt${!formCuaHang.length ? ' trong' : ''}`}>
                {formCuaHang.join(', ') || 'Tất cả cửa hàng'}
              </div>
              <Icon n="chevd" className="xuong" />
            </button>

            <div className="m-ct-o">
              <label>Áp dụng cho {nhanDt}</label>
              <div className="m-bg-loai-radio" role="radiogroup">
                <button
                  type="button"
                  role="radio"
                  aria-checked={!formRieng}
                  className={`m-bg-rad-btn${!formRieng ? ' on' : ''}`}
                  onClick={() => setFormRieng(false)}
                >
                  Mọi {nhanDt}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={formRieng}
                  className={`m-bg-rad-btn${formRieng ? ' on' : ''}`}
                  onClick={() => setFormRieng(true)}
                >
                  Một {nhanDt}
                </button>
              </div>
            </div>

            {formRieng && (
              <button
                type="button"
                className="m-ct-o m-ct-o-bam"
                onClick={() => setMoChonDt(true)}
              >
                <label>
                  {formLoai === 'Giá mua' ? 'Nhà cung cấp' : 'Khách hàng'} <em>*</em>
                </label>
                <div className={`gt m-ct-gt${!formDt ? ' trong' : ''}`}>
                  {formDt ? `${formDt} - ${tenDtCua(formDt)}` : `Chọn ${nhanDt}`}
                </div>
                <Icon n="chevd" className="xuong" />
              </button>
            )}

            <div className="m-ct-hai">
              <button
                type="button"
                className="m-ct-o m-ct-o-bam"
                onClick={() => setMoLichTu(true)}
              >
                <label>
                  Từ ngày <em>*</em>
                </label>
                <div className="gt m-ct-gt">{formTuNgay}</div>
                <Icon n="calendar" className="xuong" />
              </button>
              <button
                type="button"
                className="m-ct-o m-ct-o-bam"
                onClick={() => setMoLichDen(true)}
              >
                <label>
                  Đến ngày <em>*</em>
                </label>
                <div className="gt m-ct-gt">{formDenNgay}</div>
                <Icon n="calendar" className="xuong" />
              </button>
            </div>
          </div>

          {/* Chi tiết giá */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">
              Chi tiết giá ({formDong.length} dòng)
              <button
                type="button"
                className="m-ct-them"
                aria-label="Thêm mặt hàng"
                onClick={batDauThemDong}
              >
                <Icon n="plus" />
              </button>
            </p>

            {formDong.length === 0 ? (
              <div className="m-bg-trong-dong">Chưa có mặt hàng. Bấm + để thêm.</div>
            ) : (
              formDong.map((d, i) => {
                const h = hangCua(d.ma)
                const ten = h?.ten ?? d.ma
                const giaSo = docSoQT(d.gia)
                const vatSo = docSoQT(d.vat)
                const sauThue = giaSo * (1 + vatSo / 100)
                return (
                  <div key={d.key} className="m-ct-nvl-the m-bg-form-the">
                    <div className="ten">
                      <b>
                        {i + 1}. {ten}
                      </b>
                      <span className="mo"> - {d.ma}</span>
                    </div>
                    <div className="tg">
                      <button
                        type="button"
                        className="sua"
                        aria-label="Sửa dòng"
                        onClick={() => batDauSuaDong(i)}
                      >
                        <Icon n="edit" />
                      </button>
                      <button
                        type="button"
                        className="xoa"
                        aria-label="Xoá dòng"
                        onClick={() => setFormDong(cur => cur.filter((_, idx) => idx !== i))}
                      >
                        <Icon n="trash" />
                      </button>
                    </div>
                    <div className="nvl-so">
                      <span>Đơn giá:</span>
                      <span>
                        <b>{money(giaSo)} đ</b> / {d.dvt} (VAT {d.vat || 0}%) · Sau thuế:{' '}
                        <b>{money(sauThue)} đ</b>
                      </span>
                    </div>
                    {Boolean(d.ghiChu) && (
                      <div className="m-bg-the-ghi-chu">
                        <span className="nhan">Ghi chú:</span> {d.ghiChu}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Nút lưu cố định dưới đáy */}
        <div className="m-ct-day">
          <button type="button" className="m-ct-btn pri" onClick={() => luuForm(false)}>
            Lưu lại
          </button>
        </div>

        {/* DatePicker Từ ngày */}
        {moLichTu && (
          <LichDon
            value={formTuNgay}
            onChange={v => {
              setFormTuNgay(v)
              setMoLichTu(false)
            }}
            onDong={() => setMoLichTu(false)}
          />
        )}

        {/* DatePicker Đến ngày */}
        {moLichDen && (
          <LichDon
            value={formDenNgay}
            onChange={v => {
              setFormDenNgay(v)
              setMoLichDen(false)
            }}
            onDong={() => setMoLichDen(false)}
          />
        )}

        {/* Tấm chọn nhiều Cửa hàng */}
        {moChonCuaHang && (
          <div className="m-ct-phu-mo" onClick={() => setMoChonCuaHang(false)}>
            <div className="m-ct-tam m-ct-chon-nhieu" onClick={e => e.stopPropagation()}>
              <div className="m-ct-keo" />
              <div className="m-ct-tam-dau">
                <h2>Cửa hàng áp dụng</h2>
                <button
                  type="button"
                  className="m-ct-nut-ic"
                  style={{ width: 28, height: 28 }}
                  onClick={() => setMoChonCuaHang(false)}
                  aria-label="Đóng"
                >
                  <Icon n="x" />
                </button>
              </div>
              <div className="m-ct-tam-than">
                {CUA_HANG.map(c => c.ten).map(m => {
                  const daChon = formCuaHang.includes(m)
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`m-ct-muc${daChon ? ' on' : ''}`}
                      onClick={() => {
                        setFormCuaHang(cur =>
                          cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m],
                        )
                      }}
                    >
                      <span>{m}</span>
                      <span className="tich">✓</span>
                    </button>
                  )
                })}
              </div>
              <div className="m-ct-tam-day">
                <button
                  type="button"
                  className="m-ct-btn phu"
                  onClick={() => {
                    setFormCuaHang([])
                    setMoChonCuaHang(false)
                  }}
                >
                  Áp dụng toàn bộ
                </button>
                <button
                  type="button"
                  className="m-ct-btn pri"
                  onClick={() => setMoChonCuaHang(false)}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal chọn Đối tượng */}
        <MChon
          mo={moChonDt}
          onDong={() => setMoChonDt(false)}
          tieuDe={formLoai === 'Giá mua' ? 'Chọn nhà cung cấp' : 'Chọn khách hàng'}
          ds={dsDt.map(d => ({ k: d.ma, ten: d.ten, moTa: `Mã: ${d.ma}` }))}
          chon={formDt}
          tim={true}
          onChon={k => {
            setFormDt(k)
            setMoChonDt(false)
          }}
        />

        {/* TẤM THÊM / SỬA DÒNG MẶT HÀNG */}
        {moTamItem && (
          <div className="m-ct-phu-mo" onClick={() => setMoTamItem(false)}>
            <div className="m-ct-tam m-ct-tam-nvl" onClick={e => e.stopPropagation()}>
              <div className="m-ct-keo" />
              <div className="m-ct-tam-dau">
                <h2>{dangSuaIdx !== null ? 'Sửa mặt hàng' : 'Thêm mặt hàng'}</h2>
                <button
                  type="button"
                  className="m-ct-nut-ic"
                  style={{ width: 28, height: 28 }}
                  onClick={() => setMoTamItem(false)}
                  aria-label="Đóng"
                >
                  <Icon n="x" />
                </button>
              </div>
              <div className="m-ct-tam-than">
                <button
                  type="button"
                  className="m-ct-o m-ct-o-bam"
                  onClick={() => setMoChonHang(true)}
                >
                  <label>
                    Mặt hàng <em>*</em>
                  </label>
                  <div className={`gt m-ct-gt${!itemMa ? ' trong' : ''}`}>
                    {itemMa ? `${hangCua(itemMa)?.ten ?? itemMa} - ${itemMa}` : 'Chọn mặt hàng'}
                  </div>
                  <Icon n="chevd" className="xuong" />
                </button>

                <div className="m-ct-hai">
                  {itemDsDvt.length > 1 ? (
                    <button
                      type="button"
                      className="m-ct-o m-ct-o-bam"
                      onClick={() => setMoChonDvt(true)}
                    >
                      <label>
                        Đơn vị tính <em>*</em>
                      </label>
                      <div className="gt m-ct-gt">{itemDvt}</div>
                      <Icon n="chevd" className="xuong" />
                    </button>
                  ) : (
                    <div className="m-ct-o">
                      <label>Đơn vị tính</label>
                      <div className="gt m-ct-gt" style={{ color: 'var(--ink)' }}>
                        {itemDvt}
                      </div>
                    </div>
                  )}

                  <div className="m-ct-o">
                    <label>
                      Đơn giá <em>*</em>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={itemGia}
                      onChange={e => setItemGia(e.target.value)}
                      placeholder="0"
                      aria-label="Đơn giá"
                    />
                  </div>
                </div>

                <div className="m-ct-hai">
                  <div className="m-ct-o">
                    <label>VAT (%)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={itemVat}
                      onChange={e => setItemVat(e.target.value)}
                      placeholder="0"
                      aria-label="VAT"
                    />
                  </div>
                  <div className="m-ct-o">
                    <label>Giá sau thuế</label>
                    <div className="gt m-ct-gt" style={{ color: 'var(--green)', fontWeight: 600 }}>
                      {money(docSoQT(itemGia) * (1 + docSoQT(itemVat) / 100))} đ
                    </div>
                  </div>
                </div>

                <div className="m-ct-o">
                  <label>Ghi chú</label>
                  <input
                    type="text"
                    value={itemGhiChu}
                    onChange={e => {
                      setItemGhiChu(e.target.value)
                      setItemGhiTu(false)
                    }}
                    placeholder="Ghi chú quy đổi hoặc mô tả"
                    aria-label="Ghi chú"
                  />
                </div>
              </div>
              <div className="m-ct-tam-day">
                <button
                  type="button"
                  className="m-ct-btn phu"
                  onClick={() => setMoTamItem(false)}
                >
                  Huỷ
                </button>
                <button type="button" className="m-ct-btn pri" onClick={luuDongItem}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal chọn Mặt hàng */}
        <MChon
          mo={moChonHang}
          onDong={() => setMoChonHang(false)}
          tieuDe={formLoai === 'Giá mua' ? 'Chọn nguyên vật liệu / hàng hoá' : 'Chọn món / hàng bán'}
          ds={dsHang.map((h: HangGia) => ({ k: h.ma, ten: h.ten, moTa: `${h.ma} · ${h.dvt}` }))}
          chon={itemMa}
          tim={true}
          onChon={k => {
            chonHangItem(k)
            setMoChonHang(false)
          }}
        />

        {/* Modal chọn ĐVT */}
        {itemDsDvt.length > 1 && (
          <MChon
            mo={moChonDvt}
            onDong={() => setMoChonDvt(false)}
            tieuDe="Chọn đơn vị tính"
            ds={itemDsDvt.map((d: { dv: string; heSo: number }) => ({
              k: d.dv,
              ten: d.dv,
              moTa: d.dv === hItem?.dvt ? 'ĐVT chính' : '',
            }))}
            chon={itemDvt}
            onChon={dv => {
              doiDvtItem(dv)
              setMoChonDvt(false)
            }}
          />
        )}

        {/* Hộp xác nhận khi trùng giá với bảng giá khác (QD101) */}
        {hoiTrung && (
          <ThongBao
            loai="canhBao"
            nhan="Trùng giá"
            tieuDe="Mặt hàng đã có giá ở bảng giá khác"
            duKien={hoiTrung.ds.map(t => ({ nhan: t.bg, gt: t.hang }))}
            moTa={`Cùng ${formRieng ? nhanDt : `giá chung cho mọi ${nhanDt}`}, thời gian và cửa hàng. Vẫn lưu được. Ngày nào hai bảng cùng áp thì bảng bắt đầu muộn hơn được dùng.`}
            onDong={() => setHoiTrung(null)}
            nut={{
              ten: 'Vẫn lưu',
              onClick: () => {
                setHoiTrung(null)
                luuForm(true)
              },
            }}
          />
        )}
      </div>
    )
  }

  // ── 2. MÀN CHI TIẾT BẢNG GIÁ ──
  if (id !== undefined) {
    if (!dangXem) {
      return (
        <div className="m-ct-chi-tiet m-tc-lap-man">
          <header className="m-ct-dau-trai">
            <button
              type="button"
              className="m-ct-nut-ic"
              onClick={() => quayLaiMobile(nav, path)}
              aria-label="Quay lại"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1>Không tìm thấy bảng giá</h1>
          </header>
          <div className="m-ct-cuon">
            <MTrong tieuDe="Không tìm thấy bảng giá" moTa="Bảng giá không tồn tại hoặc đã bị xoá" />
          </div>
        </div>
      )
    }

    return (
      <div className="m-ct-chi-tiet m-tc-lap-man">
        <header className="m-ct-dau-trai">
          <button
            type="button"
            className="m-ct-nut-ic"
            onClick={() => quayLaiMobile(nav, path)}
            aria-label="Quay lại"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1>
            {dangXem.tenBg}
            <small>{dangXem.soBg}</small>
          </h1>
        </header>

        <div className="m-ct-cuon">
          {/* Thông tin chung */}
          <div className="m-ct-the-khoi">
            <div className="m-ct-tt-dong">
              <span>Mã bảng giá</span>
              <b>{dangXem.soBg}</b>
            </div>
            <div className="m-ct-tt-dong">
              <span>Loại bảng giá</span>
              <span className={`m-bg-chip ${dangXem.loai === 'Giá mua' ? 'mua' : 'ban'}`}>
                {dangXem.loai}
              </span>
            </div>
            <div className="m-ct-tt-dong">
              <span>Tên bảng giá</span>
              <b>{dangXem.tenBg}</b>
            </div>
            <div className="m-ct-tt-dong">
              <span>Cửa hàng áp dụng</span>
              <b>{dangXem.cuaHang || 'Tất cả cửa hàng'}</b>
            </div>
            <div className="m-ct-tt-dong">
              <span>Áp dụng cho</span>
              <b>{nhanApDung(dangXem)}</b>
            </div>
            <div className="m-ct-tt-dong">
              <span>Thời gian áp dụng</span>
              <b>{dangXem.thoiGian}</b>
            </div>
          </div>

          {/* Chi tiết giá */}
          <div className="m-ct-the-khoi">
            <p className="m-ct-tieu-khoi">Chi tiết giá ({dangXem.dong.length} mặt hàng)</p>
            {dangXem.dong.map((d, i) => (
              <div
                key={d._k || `${d.maHang}-${d.dvt}-${i}`}
                className="m-ct-nvl-dong m-bg-dong-gia"
              >
                <div className="ten">
                  <b>
                    {i + 1}. {d.tenHang || d.maHang}
                  </b>
                  <span className="mo"> - {d.maHang}</span>
                </div>
                <div className="m-bg-gia-luoi">
                  <div className="m-bg-o">
                    <span className="nhan">ĐVT:</span>
                    <span className="tri">
                      <b>{String(d.dvt ?? '')}</b>
                    </span>
                  </div>
                  <div className="m-bg-o">
                    <span className="nhan">Đơn giá:</span>
                    <span className="tri">
                      <b>{money(d.gia)} đ</b>
                    </span>
                  </div>
                  <div className="m-bg-o">
                    <span className="nhan">VAT:</span>
                    <span className="tri">{String(d.vat ?? 0)}%</span>
                  </div>
                  <div className="m-bg-o">
                    <span className="nhan">Giá sau thuế:</span>
                    <span className="tri gia-sau">
                      <b>{money(docSoQT(d.gia) * (1 + docSoQT(d.vat) / 100))} đ</b>
                    </span>
                  </div>
                </div>
                {Boolean(d.ghiChu) && (
                  <div className="m-bg-ghi-chu">
                    <span className="nhan">Ghi chú:</span> {String(d.ghiChu)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Đáy cố định: Xoá & Sửa */}
        <div className="m-ct-day">
          <button
            type="button"
            className="m-ct-btn phu m-btn-xoa"
            onClick={() => setHoiXoa(true)}
          >
            Xoá bảng giá
          </button>
          <button
            type="button"
            className="m-ct-btn pri"
            onClick={() => nav(`${path}/${dangXem.soBg}?sua=1`)}
          >
            Sửa
          </button>
        </div>

        {/* Hộp xác nhận xoá */}
        {hoiXoa && (
          <ThongBao
            loai="xoa"
            nhan="Xoá bảng giá"
            tieuDe={`Xoá bảng giá ${dangXem.soBg}?`}
            duKien={[
              { nhan: 'Tên bảng giá', gt: dangXem.tenBg },
              { nhan: 'Số mặt hàng', gt: `${dangXem.dong.length} dòng` },
              { nhan: 'Áp dụng', gt: dangXem.thoiGian },
            ]}
            moTa="Xoá xong không lấy lại được. Phiếu lập trong khoảng ngày này không còn lấy giá từ bảng này."
            onDong={() => setHoiXoa(false)}
            nut={{
              ten: 'Xoá bảng giá',
              onClick: () => {
                thayNhomCatalogRows(DM, r => r.soBg === dangXem.soBg, [])
                toast(`Đã xoá bảng giá ${dangXem.soBg}`)
                setHoiXoa(false)
                quayLaiMobile(nav, path)
              },
            }}
          />
        )}
      </div>
    )
  }

  // ── 3. MÀN DANH SÁCH BẢNG GIÁ ──
  return (
    <div className="m-ct-khung">
      {/* Tabs loại bảng giá */}
      <div className="m-ct-tabs m-tc-tabs" role="tablist">
        {(
          [
            ['tat-ca', 'Tất cả'],
            ['mua', 'Giá mua'],
            ['ban', 'Giá bán'],
          ] as [TabLoai, string][]
        ).map(([k, ten]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            className={`m-tc-tab-btn m-ct-tab-btn${tab === k ? ' on' : ''}`}
            onClick={() => setTab(k)}
          >
            {ten}
            <span className="m-ct-so">{demTabs[k]}</span>
          </button>
        ))}
      </div>

      {/* Ô tìm kiếm */}
      <div className="m-ct-dau">
        <div className="m-ct-tim">
          <Icon n="search" className="m-ct-tim-ic ic sm" />
          <input
            type="text"
            className="m-ct-tim-inp"
            placeholder="Tìm theo mã, tên bảng giá"
            value={q}
            onChange={e => setQ(e.target.value)}
            aria-label="Tìm kiếm bảng giá"
          />
          {q ? (
            <button
              type="button"
              className="m-ct-tim-x"
              onClick={() => setQ('')}
              aria-label="Xoá tìm kiếm"
            >
              <Icon n="x" className="ic sm" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Danh sách thẻ */}
      {hienThi.length === 0 ? (
        <MTrong tieuDe="Không tìm thấy bảng giá" moTa="Thử tìm theo từ khoá hoặc đổi tab khác" />
      ) : (
        <div className="m-ct-ds">
          {hienThi.map(bg => (
            <button
              key={bg.soBg}
              type="button"
              className="m-ct-the m-bg-the"
              onClick={() => nav(`${path}/${bg.soBg}`)}
            >
              <div className="m-bg-the-dau">
                <span className="m-bg-ma">{bg.soBg}</span>
                <span className={`m-bg-chip ${bg.loai === 'Giá mua' ? 'mua' : 'ban'}`}>
                  {bg.loai}
                </span>
              </div>
              <div className="m-bg-ten">
                <b>{bg.tenBg}</b>
              </div>
              <div className="m-bg-dong">
                <Icon n="users" className="ic sm" />
                <span>
                  Áp dụng: <b>{nhanApDung(bg)}</b>
                </span>
              </div>
              <div className="m-bg-dong">
                <Icon n="calendar" className="ic sm" />
                <span>{bg.thoiGian}</span>
              </div>
              <div className="m-bg-dong m-bg-dong-cuoi">
                <Icon n="hanghoa" className="ic sm" />
                <span>{bg.dong.length} mặt hàng</span>
                {bg.cuaHang && <span className="m-bg-ch"> · {bg.cuaHang}</span>}
              </div>
              <Icon n="chevr" className="chev" />
            </button>
          ))}
        </div>
      )}

      {/* Nút + tròn nổi góc dưới phải */}
      <button
        type="button"
        className="m-ct-fab m-nut-them-fab m-nut-fab-tron"
        aria-label="Thêm bảng giá"
        onClick={() => nav(`${path}/moi`)}
      >
        <Icon n="plus" />
      </button>
    </div>
  )
}
