import React, { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { quayLaiMobile } from './quayLai'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { renderReport, gopSo, RptTable } from '../generic/ReportScreen'
import { bienDoiBang, useTrangThaiLoc } from '../bao-cao/tuyChinhBC'
import { docNgay, trongKhoang } from '../ChonNgay'
import { cuaHangHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CUA_HANG } from '../../data/mock'
import { soQuyCn } from '../../modules/tien/SoQuy'
import { dsTkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { CAU_HINH_BC, kyHieuBC, tenBC, tenQuyTm } from '../../modules/bao-cao/danh-sach'
import { layNguonXuat, xuatFile, type NguonXuat } from '../bao-cao/xuat'
import { fold, money, moneyD, rutGonSo } from '../format'
import { Icon } from '../Icon'
import { duongPhieu } from '../generic/SoChungTu'
import { layKhuonDong, MBaoCaoDong } from './MBaoCaoDong'
import { laSoTT152 } from './MSoTT152'
import { cotMobile, useBangMauA } from './bangMauA'
import { tinhPhanTrang, ThanhPhanTrangM } from './phanTrangM'
import { dinhDangKyMobile, ngayCuoiThang, useKhoangNgayMobile } from './kyBaoCaoMobile'
import { MBaoCaoDau } from './MBaoCaoDau'
import { MBaoCaoLoc, MChuaTaiBaoCao } from './MBaoCaoLoc'

/** Định dạng ngày có thứ tiếng Việt: bỏ thứ, chỉ để ngày tháng (T611) */
function dinhDangThuNgay(dStr: string): string {
  if (!dStr) return 'Chưa rõ ngày'
  const parts = dStr.includes('/') ? dStr.split('/') : (dStr.includes('-') ? dStr.split('-').reverse() : [])
  if (parts.length === 3) {
    const d = Number(parts[0])
    const m = Number(parts[1]) - 1
    const y = Number(parts[2])
    const dt = new Date(y, m, d)
    if (!isNaN(dt.getTime())) {
      return dStr
    }
  }
  return dStr
}

/** Dò đường dẫn mở chứng từ gốc nếu có (T201, T223) */
function layDuongDan(so: unknown): string | undefined {
  if (!so || typeof so !== 'string') return undefined
  let to = duongPhieu(so)
  if (!to) {
    const m = /^([A-Z]+)(\d{2})-(\d+)$/.exec(so)
    if (m) {
      to = duongPhieu(`${m[1]}26${m[2]}-${m[3].padStart(4, '0')}`)
    }
  }
  return to
}

export const MSoBaoCao: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, set } = useSession()
  const path = useLocation().pathname
  const nav = useNavigate()
  const [hienTim, setHienTim] = useState(false)
  // Mở báo cáo thì bật bộ lọc trước, bấm Áp dụng mới tải số liệu (T626)
  const [moLoc, setMoLoc] = useState(true)
  const [daTai, setDaTai] = useState(false)
  useEffect(() => {
    setMoLoc(true)
    setDaTai(false)
  }, [path])
  const [daGhim, setDaGhim] = useState(() => {
    try {
      const g = JSON.parse(localStorage.getItem('bc-ghim') || '[]')
      return Array.isArray(g) && g.includes(sc.slug)
    } catch {
      return false
    }
  })

  const toggleGhim = () => {
    try {
      const raw = localStorage.getItem('bc-ghim')
      const g: string[] = raw ? JSON.parse(raw) : []
      const exists = g.includes(sc.slug)
      const moi = exists ? g.filter(x => x !== sc.slug) : [...g, sc.slug]
      localStorage.setItem('bc-ghim', JSON.stringify(moi))
      setDaGhim(!exists)
    } catch {}
  }

  const quayLai = () => quayLaiMobile(nav, '/app/bao-cao/tat-ca')

  // Sổ xem dạng dòng: Sổ quỹ 2.2.1, Sổ ngân hàng 2.2.3, Sổ công nợ 2.2.5 (T223)
  // Các màn khác áp dụng 3 khuôn mới chung theo BANG_KHUON_DONG (T241)
  const isSoQuy = sc.code === '2.2.1' || sc.slug === '2-2-1'
  const isSoTienGui = sc.code === '2.2.3' || sc.slug === '2-2-3'
  const isSoCongNo = sc.code === '2.2.5' || sc.slug === '2-2-5'
  const isSoCu = isSoQuy || isSoTienGui || isSoCongNo
  const isSoTien = isSoQuy || isSoTienGui
  const maBcStr = String(sc.code ?? sc.slug ?? '').replace(/-/g, '.')
  const la427 = maBcStr === '4.2.7'
  const la327 = maBcStr === '3.2.7'
  const la5215 = maBcStr === '5.2.15'
  const laMauDMoi = maBcStr === '3.2.8' || maBcStr === '5.2.10' || maBcStr === '4.2.3' || maBcStr === '5.2.9' || maBcStr === '5.2.3'
  const laMauD = la427 || la327 || la5215 || laMauDMoi
  const is523 = maBcStr === '5.2.3'
  const isStandard = s.goi === 'S'
  const laTT152Hook = s.cheDo === 'TT152' && laSoTT152(maBcStr)
  const isS1a = (s.cheDo === 'TT152' && kyHieuBC(sc.code, s.cheDo, s) === 'S1a-HKD') || maBcStr.includes('s1a')

  const khuon = layKhuonDong(sc)
  const isSoApDung = isSoCu || Boolean(khuon) || laMauD || laTT152Hook

  // Điểm 18: Các báo cáo ưu tiên dạng BẢNG trên điện thoại:
  // (a) Báo cáo thuộc nhóm kinh doanh: 3.2.1, 3.2.2, 3.2.3, 3.2.4, 3.2.5
  // (b) Mọi sổ, báo cáo TT152 (-HKD): 3.2.5, 10.4.1, 5.2.8, 2.2.7 (nếu không có hook TT152)
  // (c) Báo cáo nhiều cột số: 3.2.7, 4.2.2 (bỏ 4.2.7 để vào MBangKeMua T403)
  const kyHieuStr = kyHieuBC(sc.code, s.cheDo, s) ?? ''
  const isHkdMau = !laTT152Hook && s.cheDo === 'TT152' && kyHieuStr.endsWith('-HKD')
  const isBcKd = !laTT152Hook && (maBcStr.startsWith('3.2.1') || maBcStr.startsWith('3.2.2') || maBcStr.startsWith('3.2.3') || maBcStr.startsWith('3.2.4') || maBcStr.startsWith('3.2.5'))
  const isNhieuCotSo = maBcStr === '4.2.2'
  const isUuTienBang = !laMauD && !laTT152Hook && (isHkdMau || isBcKd || isNhieuCotSo)

  const [kieuXemState, setKieuXemState] = useState<'dong' | 'bang' | null>(null)
  const kieuXem = kieuXemState ?? (isUuTienBang ? 'bang' : (isSoApDung ? 'dong' : 'bang'))
  const [xoayNgang, setXoayNgang] = useState(false)

  const cfg: ReportCfg = sc.report ?? (isSoQuy ? { kieu: 'so', theoCn: true } : { kieu: 'tonghop', doiTuong: 'tk' })

  // Trạng thái lọc dùng chung với bản máy tính
  const { loc, daXem } = useTrangThaiLoc(path)
  const kyDaXem = daXem?.ky || '9'
  const thang = Number(kyDaXem)
  const cn = cfg.theoCn ? cuaHangHienTai(s) : undefined
  const chonQuy = loc.locQuy?.[0]
  const chonTk = (loc as any).locTk?.[0] || (loc as any).tk?.[0]
  const knMobile = useKhoangNgayMobile(path, kyDaXem)
  const soLuongLoc = useMemo(() => {
    let c = 0
    if (s.cuaHang && s.cuaHang !== 'all') c++
    const thangNum = Number(kyDaXem) || 9
    const tuMacDinh = `2026-${String(thangNum).padStart(2, '0')}-01`
    const denMacDinh = `2026-${String(thangNum).padStart(2, '0')}-${String(ngayCuoiThang(2026, thangNum)).padStart(2, '0')}`
    if (knMobile.tu !== tuMacDinh || knMobile.den !== denMacDinh) {
      c++
    } else if (kyDaXem && kyDaXem !== '9') {
      c++
    }
    for (const [k, v] of Object.entries(loc)) {
      if (k === 'ky' || k === 'cuaHang') continue
      if (Array.isArray(v) && v.length > 0) c++
    }
    return c
  }, [loc, s.cuaHang, knMobile, kyDaXem])

  const [q, setQ] = useState('')
  const [trangBang, setTrangBang] = useState(1)

  const bangWrapRef = useRef<HTMLDivElement>(null)

  // Về trang 1 khi đổi bộ lọc hoặc tìm kiếm (T273)
  useEffect(() => {
    setTrangBang(1)
  }, [q, kyDaXem, s.cuaHang, path])

  // Nhãn hiển thị kỳ
  const tenKy = useMemo(() => {
    return dinhDangKyMobile(knMobile.tu, knMobile.den, kyDaXem)
  }, [knMobile, kyDaXem])

  // Nhãn hiển thị cửa hàng
  const tenCn = cn ? (cn.ngan ?? cn.ten) : 'Tất cả'

  // Tính số liệu sổ quỹ nếu là màn 2.2.1
  const dsCnSoQuy = useMemo(() => {
    return CUA_HANG.filter(c => (!cn || c.id === cn.id) && (!chonQuy || tenQuyTm(c.ngan) === chonQuy))
  }, [cn, chonQuy])

  const soQuyData = useMemo(() => {
    if (!isSoQuy) return null
    const g = dsCnSoQuy.length === 1
      ? soQuyCn(dsCnSoQuy[0].id, thang)
      : gopSo(dsCnSoQuy.map(c => ({ cn: c.ngan, ...soQuyCn(c.id, thang) })))

    const tuDate = docNgay(knMobile.tu)
    const denDate = docNgay(knMobile.den)
    const tuTime = tuDate.getTime()
    const denTime = denDate.getTime()

    let tonDau = g.mo
    for (const r of g.rows) {
      const rDate = docNgay(String(r.ngay).split(' ')[0])
      if (rDate.getTime() < tuTime) {
        tonDau += (Number(r.no) || 0) - (Number(r.co) || 0)
      }
    }

    let runningDu = tonDau
    let tongThu = 0
    let tongChi = 0
    const rowsTrongKy: Row[] = []

    for (const r of g.rows) {
      const rDate = docNgay(String(r.ngay).split(' ')[0])
      const t = rDate.getTime()
      if (t >= tuTime && t <= denTime) {
        const thu = Number(r.no) || 0
        const chi = Number(r.co) || 0
        tongThu += thu
        tongChi += chi
        runningDu += thu - chi
        rowsTrongKy.push({
          ...r,
          locQuy: chonQuy,
          du: runningDu,
          ...(r.tk ? { tk: dsTkTheoCheDo(String(r.tk), s.cheDo) } : {}),
        })
      }
    }

    return {
      mo: tonDau,
      rows: rowsTrongKy,
      tn: tongThu,
      tc: tongChi,
      cuoi: runningDu,
    }
  }, [isSoQuy, dsCnSoQuy, chonQuy, thang, s.cheDo, knMobile])

  const noco = kieuGhiSo(s.cheDo) === 'noco'

  // Tạo phần thân báo cáo: sổ quỹ dựng trực tiếp từ dữ liệu, các màn khác từ renderReport
  const body = useMemo(() => {
    if (isSoQuy && soQuyData) {
      const cols: Col[] = [
        { k: 'ngay', t: 'Ngày chứng từ', w: 100 },
        { k: 'thu', t: 'Số phiếu thu', cls: 'code' },
        { k: 'chi', t: 'Số phiếu chi', cls: 'code' },
        ...(dsCnSoQuy.length > 1 ? [{ k: 'cn', t: 'Cửa hàng' } as Col] : []),
        { k: 'dg', t: 'Diễn giải' },
        ...(noco ? [{ k: 'tk', t: 'TK đối ứng', c: true } as Col] : []),
        { k: 'no', t: 'Thu', num: true },
        { k: 'co', t: 'Chi', num: true },
        { k: 'du', t: 'Tồn', num: true },
      ]
      const rows: Row[] = [
        { dg: 'Số tồn đầu kỳ', du: soQuyData.mo, _b: 1 },
        ...soQuyData.rows,
        { dg: 'Cộng phát sinh trong kỳ', no: soQuyData.tn, co: soQuyData.tc, _t: 1 },
        { dg: 'Số tồn cuối kỳ', du: soQuyData.cuoi, _t: 1 },
      ]
      return <RptTable cols={cols} rows={rows} />
    }
    return renderReport(cfg, sc.code ?? sc.slug, thang, s.cheDo, cn?.id, loc, s)
  }, [isSoQuy, soQuyData, dsCnSoQuy.length, noco, cfg, sc.code, sc.slug, thang, s, cn?.id, loc])

  // Lấy danh sách hàng và cột gốc từ body
  const { initialRows, rawCols } = useMemo(() => {
    if (!React.isValidElement(body)) return { initialRows: [] as Row[], rawCols: [] as Col[] }
    const p = body.props as { rows?: Row[]; cols?: Col[] }
    return {
      initialRows: Array.isArray(p?.rows) ? p.rows : [],
      rawCols: Array.isArray(p?.cols) ? p.cols : [],
    }
  }, [body])

  const rawRows = useMemo(() => {
    if (isSoQuy) return initialRows
    if (isSoTienGui) {
      const tuDate = docNgay(knMobile.tu)
      const denDate = docNgay(knMobile.den)
      const tuTime = tuDate.getTime()
      const denTime = denDate.getTime()
      const rDau = initialRows.find(r => r._b === 1)
      const rCong = initialRows.find(r => r._t === 1 && String(r.dienGiai || r.dg || '').includes('Cộng'))
      const rCuoi = initialRows.find(r => r._t === 1 && String(r.dienGiai || r.dg || '').includes('cuối'))
      let tonDau = Number(rDau?.du ?? 0)
      const chiTiet = initialRows.filter(r => !r._b && !r._t)
      for (const r of chiTiet) {
        const d = docNgay(String(r.ngay).split(' ')[0])
        if (!isNaN(d.getTime()) && d.getTime() < tuTime) {
          tonDau += (Number(r.no) || 0) - (Number(r.co) || 0)
        }
      }
      let runningDu = tonDau
      let tongThu = 0
      let tongChi = 0
      const rowsTrongKy: Row[] = []
      for (const r of chiTiet) {
        const d = docNgay(String(r.ngay).split(' ')[0])
        const t = d.getTime()
        if (isNaN(t) || (t >= tuTime && t <= denTime)) {
          const thu = Number(r.no) || 0
          const chi = Number(r.co) || 0
          tongThu += thu
          tongChi += chi
          runningDu += thu - chi
          rowsTrongKy.push({ ...r, du: runningDu })
        }
      }
      return [
        { ...(rDau ?? { dienGiai: 'Số dư đầu kỳ', _b: 1 }), du: tonDau },
        ...rowsTrongKy,
        { ...(rCong ?? { dienGiai: 'Cộng phát sinh', _t: 1 }), no: tongThu, co: tongChi },
        { ...(rCuoi ?? { dienGiai: 'Số dư cuối kỳ', _t: 1 }), du: runningDu },
      ]
    }
    const tuDate = docNgay(knMobile.tu)
    const denDate = docNgay(knMobile.den)
    const tuTime = tuDate.getTime()
    const denTime = denDate.getTime()
    const rowsTheoNgay = initialRows.filter(r => {
      if (r._b || r._t) return true
      if (!r.ngay) return true
      const d = docNgay(String(r.ngay).split(' ')[0])
      if (isNaN(d.getTime())) return true
      return d.getTime() >= tuTime && d.getTime() <= denTime
    })
    const maCode = sc.code ?? (sc.slug?.includes('-') ? sc.slug.replace(/-/g, '.') : undefined)
    const res = bienDoiBang(rawCols, rowsTheoNgay, { loc, anKhongPS: Boolean(maCode && CAU_HINH_BC[maCode]?.anKhongPS) }, { tinhLaiTong: true })
    return res.rows
  }, [isSoQuy, isSoTienGui, initialRows, rawCols, knMobile, loc])

  // Lọc dòng nếu có từ khóa tìm kiếm (chỉ làm trên tầng view, không đổi logic bản máy tính)
  const rowsLoc = useMemo(() => {
    const tuKhoa = q.trim()
    if (!tuKhoa) return rawRows
    const qFold = fold(tuKhoa)
    return rawRows.filter(r => {
      if (r._t) return true // Giữ dòng tổng cộng
      const text = Object.values(r)
        .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
        .join(' ')
      return fold(text).includes(qFold)
    })
  }, [rawRows, q])

  // Phân trang 100 dòng dữ liệu một trang (T273)
  const pt = useMemo(() => {
    return tinhPhanTrang(rowsLoc, trangBang, 100)
  }, [rowsLoc, trangBang])

  const doiTrangBang = (trangMoi: number) => {
    setTrangBang(trangMoi)
    if (bangWrapRef.current) {
      bangWrapRef.current.scrollTop = 0
    }
  }

  const noiDungBang = useMemo(() => {
    if (!React.isValidElement(body)) return body
    const p = body.props as { rows?: Row[]; cols?: Col[] }
    let colsGoc = p?.cols || rawCols
    let rowsHienThi = pt.rowsHienThi
    if (is523 && isStandard) {
      colsGoc = colsGoc.filter(c => !['gt0', 'gtn', 'gtx', 'gt1'].includes(c.k))
      rowsHienThi = rowsHienThi.map(r => {
        if (!r._t) return r
        const { gt0, gtn, gtx, gt1, ...rest } = r as Record<string, any>
        return rest as Row
      })
    }
    return React.cloneElement(body as React.ReactElement<{ rows?: Row[]; cols?: Col[] }>, {
      rows: rowsHienThi,
      cols: cotMobile(colsGoc),
    })
  }, [body, pt.rowsHienThi, rawCols, is523, isStandard])

  const coCuonNgang = useBangMauA(bangWrapRef, [noiDungBang, kieuXem, daTai])

  // Số liệu thẻ tổng 3 ô: lấy đúng từ dòng đầu kỳ, cộng phát sinh, cuối kỳ của bảng
  const { soDau, tongThu, tongChi, soCuoi } = useMemo(() => {
    const rDau = rawRows.find(r => r._b === 1 || String(r.dg || r.dienGiai || '').toLowerCase().includes('đầu kỳ'))
    const rCong = rawRows.find(
      r =>
        r._t === 1 &&
        (String(r.dg || r.dienGiai || '').toLowerCase().includes('cộng') ||
          String(r.dg || r.dienGiai || '').toLowerCase().includes('phát sinh'))
    )
    const rCuoi = rawRows.find(r => r._t === 1 && String(r.dg || r.dienGiai || '').toLowerCase().includes('cuối kỳ'))
    const rTong = rawRows.find(r => r._t === 1)

    const sd = Number(rDau?.du ?? rDau?.dau ?? rDau?.ptCon ?? rTong?.dau ?? 0)
    const st = Number(rCong?.no ?? rCong?.ps ?? rCong?.ptPhai ?? rTong?.ps ?? 0)
    const sc = Number(rCong?.co ?? rCong?.chi ?? rCong?.tt ?? rCong?.tra ?? rTong?.tra ?? rTong?.tt ?? 0)
    const scuoi = Number(rCuoi?.du ?? rCuoi?.cuoi ?? rTong?.cuoi ?? 0)

    return { soDau: sd, tongThu: st, tongChi: sc, soCuoi: scuoi }
  }, [rawRows])

  // Nhóm theo ngày cho dạng dòng: gom các dòng phát sinh trong kỳ
  const dsNhomNgay = useMemo(() => {
    const tuKhoa = q.trim()
    const qFold = tuKhoa ? fold(tuKhoa) : ''

    if (!isSoTien) {
      const phatSinh = rawRows.filter(r => {
        if (r._b || r._t) return false
        if (!qFold) return true
        const text = Object.values(r)
          .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
          .join(' ')
        return fold(text).includes(qFold)
      })

      const map = new Map<string, { ngay: string; tonDauNgay: number; tonCuoiNgay: number; ds: Row[] }>()
      for (const r of phatSinh) {
        const ngay = String(r.ngay ?? '') || 'Chưa rõ ngày'
        const ton = Number(r.du ?? r.cuoi ?? r.no ?? 0)
        const nhom = map.get(ngay)
        if (nhom) {
          nhom.ds.push(r)
          nhom.tonCuoiNgay = ton
        } else {
          map.set(ngay, { ngay, tonDauNgay: 0, tonCuoiNgay: ton, ds: [r] })
        }
      }
      return Array.from(map.values())
    }

    // Sổ quỹ tiền mặt và Sổ tiền gửi ngân hàng (T433):
    // Tồn đầu ngày = tồn cuối ngày trước (ngày đầu kỳ = Tồn đầu kỳ).
    // Tồn cuối ngày = tồn đầu ngày + thu − chi trong ngày.
    const map = new Map<string, { ngay: string; thu: number; chi: number; ds: Row[] }>()
    for (const r of rawRows) {
      if (r._b || r._t) continue
      const ngay = String(r.ngay ?? '') || 'Chưa rõ ngày'
      const tienThu = Number(r.no ?? (r.thu ? r.no : r.ps) ?? 0)
      const tienChi = Number(r.co ?? (r.chi ? r.co : r.tra || r.tt) ?? 0)
      const nhom = map.get(ngay)
      if (nhom) {
        nhom.thu += tienThu
        nhom.chi += tienChi
        nhom.ds.push(r)
      } else {
        map.set(ngay, { ngay, thu: tienThu, chi: tienChi, ds: [r] })
      }
    }

    let tonHienTai = soDau
    const ketQua: { ngay: string; tonDauNgay: number; tonCuoiNgay: number; ds: Row[] }[] = []

    for (const nhom of map.values()) {
      const tonDauNgay = tonHienTai
      const tonCuoiNgay = tonDauNgay + nhom.thu - nhom.chi
      tonHienTai = tonCuoiNgay

      const dsHienThi = qFold
        ? nhom.ds.filter(r => {
            const text = Object.values(r)
              .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
              .join(' ')
            return fold(text).includes(qFold)
          })
        : nhom.ds

      if (dsHienThi.length > 0) {
        ketQua.push({
          ngay: nhom.ngay,
          tonDauNgay,
          tonCuoiNgay,
          ds: dsHienThi,
        })
      }
    }

    return ketQua
  }, [rawRows, q, isSoTien, soDau])

  const nhanDau = isSoCongNo ? 'Tồn đầu' : 'Tồn đầu'
  const nhanGiua = isSoCongNo ? 'Phát sinh Nợ / Có' : 'Thu / Chi'
  const nhanCuoi = isSoCongNo ? 'Dư cuối' : 'Tồn cuối'
  const xemTatCaCn = !cn || s.cuaHang === 'all' || s.cuaHang === ''

  // Lấy các cấu hình lọc riêng để hiển thị nhãn chip (T343)
  const code = sc.code ?? (sc.slug?.includes('-') ? sc.slug.replace(/-/g, '.') : undefined)
  const cfgBc = code ? CAU_HINH_BC[code] : undefined

  const nhanDieuKien = useMemo(() => {
    const map: Record<string, string> = {
      locDt: 'Đối tượng',
      locHang: 'Hàng hoá',
      locKho: 'Kho',
      locNhomHang: 'Nhóm hàng hoá',
      locQuy: 'Quỹ tiền',
      doiTuong: 'Đối tượng',
      hang: 'Hàng hoá',
      kho: 'Kho',
      nhomHang: 'Nhóm hàng hoá',
      ten: 'Mặt hàng',
      ncc: 'Nhà cung cấp',
      kh: 'Khách hàng',
      tk: 'Tài khoản',
      quy: 'Quỹ',
      kenh: 'Kênh bán',
      nhom: 'Nhóm',
    }
    for (const l of cfgBc?.loc ?? []) map[l.k] = l.nhan
    return map
  }, [cfgBc])

  const chipDieuKienKhac = useMemo(() => {
    const res: { k: string; nhan: string; giaTri: string }[] = []
    Object.entries(loc).forEach(([k, vals]) => {
      if (!vals || !Array.isArray(vals) || vals.length === 0) return
      if (k === 'ky' || k === 'cuaHang') return
      const nhan = nhanDieuKien[k] || k
      const giaTri = vals.join(', ')
      res.push({ k, nhan, giaTri })
    })
    return res
  }, [loc, nhanDieuKien])

  const xuatExcel = async () => {
    try {
      const n: NguonXuat = layNguonXuat() ?? {
        ma: sc.code,
        tieuDe: tenBC(sc.code, s.cheDo, s) || sc.ten || 'Báo cáo',
        phu: tenKy,
        cheDo: s.cheDo,
        dv: { ten: 'Đơn vị', diaChi: '', mst: '' },
        kho: 'doc',
        bang: [{ cols: rawCols, rows: rawRows }],
        ky: [],
        ngayLap: '',
        layHtml: () => '',
      }
      await xuatFile('xlsx', n)
    } catch {
      // ignore
    }
  }

  const toggleXoay = async () => {
    const moi = !xoayNgang
    setXoayNgang(moi)
    try {
      if (moi) {
        if (document.documentElement.requestFullscreen && screen.orientation && 'lock' in screen.orientation) {
          await document.documentElement.requestFullscreen()
          await (screen.orientation as any).lock('landscape')
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        }
        if (screen.orientation && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock()
        }
      }
    } catch {
      // CSS xoay-ngang will handle it
    }
  }

  const chipsHienThi = useMemo(() => {
    if (isSoQuy) {
      return [{ k: 'locQuy', nhan: 'Quỹ', giaTri: chonQuy ?? 'Tất cả' }]
    }
    if (isSoTienGui) {
      return [{ k: 'locQuy', nhan: 'TK', giaTri: chonTk ?? chonQuy ?? 'Tất cả' }]
    }
    return chipDieuKienKhac
  }, [isSoQuy, isSoTienGui, chonQuy, chonTk, chipDieuKienKhac])

  return (
    <div className={`m-so-bc m-so-bc-figma ${xoayNgang ? 'xoay-ngang' : ''}`}>
      <MBaoCaoDau
        sc={sc}
        mod={mod}
        hienTim={hienTim}
        onToggleTim={() => setHienTim(v => !v)}
        q={q}
        onDoiQ={setQ}
        timPlaceholder={kieuXem === 'bang' ? 'Nhập từ khoá' : (isSoTien ? 'Nhập diễn giải, số chứng từ…' : 'Nhập mã, tên')}
        soLuongLoc={soLuongLoc}
        onMoLoc={() => setMoLoc(true)}
        tenKy={tenKy}
        tenCn={tenCn}
        chipsKhac={chipsHienThi}
      />

      {/* Nội dung báo cáo: Dạng dòng hoặc Bảng cuộn ngang */}
      {!daTai ? (
        <MChuaTaiBaoCao onMoLoc={() => setMoLoc(true)} />
      ) : kieuXem === 'dong' && isSoApDung ? (
        !isSoCu && (khuon || laMauD || laTT152Hook) ? (
          <div className="m-so-dong" data-hd="to">
            <MBaoCaoDong
              maBc={sc.code ?? sc.slug}
              khuon={khuon ?? 'chi-tiet-ngay'}
              cols={rawCols}
              rows={rowsLoc}
              q={q}
              xemTatCaCn={xemTatCaCn}
            />
          </div>
        ) : (
          <div className={isSoTien ? 'm-t500-so-dong' : 'm-so-dong'} data-hd="to">
            {/* Lưới 2x2 thẻ cho Sổ quỹ / Sổ ngân hàng theo Figma T500, 3 ô cho sổ khác */}
            {isSoTien ? (
              <div className="mobile-stat-slider">
                <div className="m-stat-pill">
                  <span className="lbl">Tồn đầu kỳ</span>
                  <b className="val m-t638-den">{moneyD(soDau)}</b>
                </div>
                <div className="m-stat-pill">
                  <span className="lbl">Tồn cuối kỳ</span>
                  <b className="val m-t638-den">{moneyD(soCuoi)}</b>
                </div>
                <div className="m-stat-pill">
                  <span className="lbl">Tổng thu</span>
                  <b className="val m-t638-thu">+{moneyD(tongThu)}</b>
                </div>
                <div className="m-stat-pill">
                  <span className="lbl">Tổng chi</span>
                  <b className="val m-t638-chi">−{moneyD(tongChi)}</b>
                </div>
              </div>
            ) : (
              <div className="m-so-dong-tong">
                <div className="m-so-dong-tong-o">
                  <span className="m-so-dong-tong-nhan">{nhanDau}</span>
                  <b className="m-so-dong-tong-so m-so-dong-num">{rutGonSo(soDau)}</b>
                </div>
                <div className="m-so-dong-tong-o">
                  <span className="m-so-dong-tong-nhan">{nhanGiua}</span>
                  <b className="m-so-dong-tong-so m-so-dong-num">
                    <span className="m-so-dong-duong">{rutGonSo(tongThu)}</span>{' '}
                    <span className="m-so-dong-am">{rutGonSo(tongChi)}</span>
                  </b>
                </div>
                <div className="m-so-dong-tong-o">
                  <span className="m-so-dong-tong-nhan">{nhanCuoi}</span>
                  <b className="m-so-dong-tong-so m-so-dong-num">{rutGonSo(soCuoi)}</b>
                </div>
              </div>
            )}

            {isSoTien && <div className="m-t500-sec-title">Chi tiết phát sinh</div>}

            {/* Danh sách nhóm theo ngày */}
            {dsNhomNgay.length === 0 ? (
              <div className="m-so-dong-trong">
                {q.trim() ? 'Không tìm thấy dòng phát sinh phù hợp' : 'Không có phát sinh trong kỳ'}
              </div>
            ) : (
              dsNhomNgay.map(nhom => (
                <div key={nhom.ngay} className={isSoTien ? 'm-t500-nhom-ngay-wrap' : undefined}>
                  {isSoTien ? (
                    <div className="m-t500-dong-ngay">
                      <span className="m-t500-ngay-chu">{dinhDangThuNgay(nhom.ngay)}</span>
                      <span className="m-t500-ngay-ton m-so-dong-num">
                        Tồn đầu ngày <span className="m-t500-dau-so">{money(nhom.tonDauNgay)}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="m-so-dong-ngay">
                      <span className="m-so-dong-ngay-chu">{nhom.ngay}</span>
                      <span className="m-so-dong-ngay-ton m-so-dong-num">
                        {isSoCongNo ? 'Dư ' : 'Tồn '}{money(nhom.tonCuoiNgay)}
                      </span>
                    </div>
                  )}

                  <div className={isSoTien ? 'm-t500-the-trang' : 'm-so-dong-the'}>
                    {nhom.ds.map((r, i) => {
                      const dg = String(r.dg || r.dienGiai || r.ten || 'Chứng từ')
                      const soCt = String(r.thu || r.chi || r.so || r.soCt || r.soHieu || '')
                      const tenCnRow = r.cn ? String(r.cn) : ''
                      const tkStr = r.tk ? (String(r.tk).startsWith('TK') ? String(r.tk) : `TK ${r.tk}`) : ''
                      const phu = [
                        soCt,
                        xemTatCaCn && tenCnRow ? tenCnRow : null,
                        tkStr || null,
                      ].filter(Boolean).join(' · ')

                      const tienThu = Number(r.no ?? (r.thu ? r.no : r.ps) ?? 0)
                      const tienChi = Number(r.co ?? (r.chi ? r.co : r.tra || r.tt) ?? 0)
                      const to = layDuongDan(soCt)

                      const noiDungItem = isSoTien ? (
                        <div className="m-t500-sq-row-content">
                          <div className="m-t500-sq-row-trai">
                            <div className="m-t500-sq-row-dg" title={dg}>{dg}</div>
                            <div className="m-t500-sq-row-phu">
                              <span className="m-t500-sq-row-so-ct">{soCt}</span>
                              {tenCnRow && <span className="m-t500-sq-row-cn"> · {tenCnRow}</span>}
                            </div>
                          </div>
                          <div className="m-t500-sq-row-phai">
                            {tienThu > 0 && (
                              <span className="m-t500-sq-tien-thu m-so-dong-num">
                                +{money(tienThu)}
                              </span>
                            )}
                            {tienChi > 0 && (
                              <span className="m-t500-sq-tien-chi m-so-dong-num">
                                −{money(tienChi)}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="m-so-dong-trai">
                            <div className="m-so-dong-dg">{dg}</div>
                            {phu && <div className="m-so-dong-phu">{phu}</div>}
                          </div>
                          {tienThu > 0 && (
                            <span className="m-so-dong-tien m-so-dong-duong m-so-dong-num">
                              {money(tienThu)}
                            </span>
                          )}
                          {tienChi > 0 && (
                            <span className="m-so-dong-tien m-so-dong-am m-so-dong-num">
                              {money(tienChi)}
                            </span>
                          )}
                        </>
                      )

                      const isLast = i === nhom.ds.length - 1
                      return to ? (
                        <Link
                          key={i}
                          to={to}
                          className={isSoTien ? `m-t500-sq-row-item${isLast ? ' m-dong-cuoi-truoc-ton' : ''}` : 'm-so-dong-item m-so-dong-item-bam'}
                          title="Mở chứng từ gốc"
                        >
                          {noiDungItem}
                        </Link>
                      ) : (
                        <div key={i} className={isSoTien ? `m-t500-sq-row-item${isLast ? ' m-dong-cuoi-truoc-ton' : ''}` : 'm-so-dong-item'}>
                          {noiDungItem}
                        </div>
                      )
                    })}

                    {isSoTien && (
                      <div className="m-t500-cuoi-ngay">
                        <span className="m-t500-cuoi-nhan">Tồn cuối ngày</span>
                        <b className="m-t500-cuoi-so m-so-dong-num">{money(nhom.tonCuoiNgay)}</b>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isSoTien && (
              <div className="m-t500-keo-tiep">Kéo xuống để xem các ngày tiếp theo</div>
            )}
          </div>
        )
      ) : (
        /* Khung bảng cuộn ngang, trang không cuộn ngang (T273) */
        <div className="m-sbc-the-bang">
          <div className="m-sbc-bang-tac-vu">
            {!isS1a && (
              <button
                type="button"
                className="m-sbc-btn-icon m-sbc-btn-excel"
                onClick={xuatExcel}
                title="Tải file Excel"
                aria-label="Tải file Excel"
                data-hd="in"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="3.5" fill="#107C41" />
                  <path d="M7.5 7.5L16.5 16.5M16.5 7.5L7.5 16.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button
              type="button"
              className="m-sbc-btn-icon m-sbc-btn-xoay"
              onClick={toggleXoay}
              title={xoayNgang ? 'Xem dọc' : 'Xoay ngang'}
              aria-label="Xoay màn hình"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5.5" y="4" width="13" height="16" rx="2" transform="rotate(-15 12 12)" />
                <path d="M8 2.5C10 1.5 13 1.5 15.5 2.5" />
                <path d="M15 1.5L16.5 2.5L15 4" />
              </svg>
            </button>
          </div>
          <div ref={bangWrapRef} className={`m-sbc-bang-wrap ${coCuonNgang || pt.canPhanTrang ? 'co-goi' : ''}`}>
            {noiDungBang}
          </div>
          {coCuonNgang && (
            <div className="m-sbc-goi">
              <span>Vuốt ngang xem thêm cột</span>
            </div>
          )}
          {pt.canPhanTrang && (
            <ThanhPhanTrangM
              trang={pt.trangHt}
              soTrang={pt.soTrang}
              batDau={pt.batDau}
              ketThuc={pt.ketThuc}
              tongDong={pt.tongDong}
              onDoiTrang={doiTrangBang}
            />
          )}
        </div>
      )}

      {/* Nút xuất báo cáo dính đáy cho S1a (T553) */}
      {isS1a && daTai && (
        <div className="m-s1a-thanh-day">
          <button
            type="button"
            className="m-s1a-btn-xuat"
            onClick={xuatExcel}
            data-hd="in"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            Xuất báo cáo
          </button>
        </div>
      )}

      {/* Modal bộ lọc báo cáo */}
      {moLoc && (
        <MBaoCaoLoc
          mo={moLoc}
          onDong={() => setMoLoc(false)}
          onApDung={() => setDaTai(true)}
          path={path}
          sc={sc}
        />
      )}
    </div>
  )
}
