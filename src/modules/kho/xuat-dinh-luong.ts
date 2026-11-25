// Dữ liệu Xuất kho định lượng (T849): sinh phiếu từ chứng từ Xuất bán POS (FABi),
// kéo nguyên vật liệu theo công thức chế biến và giá vốn bình quân.
// File dữ liệu: không import index.ts (BAY.md, vòng import)
import { useMemo, useSyncExternalStore } from 'react'
import { DAILY, HANG, cnTen } from '../../data/mock'
import { dmy, pad } from '../../ui/format'
import { docNgay } from '../../ui/ChonNgay'
import { MAN_BAN, donPosCua, dongCuaPhieu, mauTay, soFabi, soXb, theoDon } from '../ban-hang/ChungTuBanHang'
import { canXdlBanTay, taoXdlBanTay } from '../ban-hang/xdl-ban-tay'
import { apKhoPhieu, useBanPhieu } from '../../ui/generic/daXoa'
import { useSession } from '../../app/session'
import type { Dong } from '../../ui/generic/gen'
import type { Row } from '../types'
import { CONG_THUC_CB, hangCua, tron3 } from './san-xuat'
import { giaVonBq, useGiaVonBq } from './tinh-gia-von/giaVonBq'

export interface DongNvlXdl {
  ma: string
  ten: string
  dvt: string
  dinhLuong: number
  sl: number
  gia: number
  tien: number
  lyDo?: LyDoXdl   // chỉ lý do 5 (thiếu giá vốn): vẫn trừ NVL
}

/** Lý do món không xuất kho định lượng được (T907): 1 chưa có công thức, 2 chưa khớp mã hàng, 3 thiếu ĐVT, 4 công thức ngừng áp dụng, 5 thiếu giá vốn */
export interface LyDoXdl { loai: 1 | 2 | 3 | 4 | 5; text: string }

export interface DongMonXdl {
  ma: string
  ten: string
  dvt: string
  sl: number
  gia: number        // đơn giá bán trên phiếu POS
  tien: number       // thành tiền bán
  maCt?: string      // mã công thức chế biến đã dùng
  ctId?: string      // id công thức để mở màn Công thức chế biến (T908)
  maFabi?: string    // mã món FABi khi khác mã danh mục
  lyDo?: LyDoXdl     // món không trừ được NVL
  choBoSung?: boolean   // đã có công thức nhưng chưa xuất bổ sung (T935)
  coCongThuc: boolean
  tienVon: number
  nvl: DongNvlXdl[]
}

export interface PhieuXdl {
  id: string
  so: string
  ngay: string
  date: Date
  thang: number
  cn: string
  ghiChu: string
  posSo: string
  posId: string
  maHd: string
  soDon: string
  kenh: string
  ngayTao: string
  nguoiTao: string
  nguon: 'Xuất bán POS' | 'Xuất bán hàng'   // phiếu bán hàng thủ công sau này ghi "Xuất bán hàng" (T915)
  tong: number
  dong: DongMonXdl[]
  lichSu: LsXdl[]    // lịch sử xuất bổ sung, tạo lại (T935)
  btId?: string      // chứng từ bán hàng lập tay sinh phiếu này (id ở màn Bán hàng)
  chuaTao?: boolean  // chứng từ bán hàng lập tay chưa tạo xuất kho định lượng: không hiện ở danh sách, chỉ tính vào món thiếu
}

export interface LsXdl { t: string; nguoi: string; nd: string }

/** Dữ liệu mẫu (T907): FABi gửi mã món riêng chưa khớp danh mục hàng, để thấy lý do "chưa khớp mã hàng" */
const MA_FABI: Record<string, string> = { GOI01: 'GOICUON-TT' }

/* ── Trạng thái giả của thao tác Tạo xuất kho định lượng (T935): bổ sung món thiếu, tạo lại toàn bộ ──
   Dữ liệu phiếu sinh lại từ công thức mỗi lần vẽ, nên ghi nhớ riêng: món lỗi lúc đầu, món đã bổ sung, số phiếu mới sau khi tạo lại, lịch sử. */
const kho = {
  ver: 0,
  loiDau: null as Set<string> | null,     // khoá `${id}|${mã món}` món lỗi lý do 1 đến 4 lúc mở màn
  daBoSung: new Set<string>(),
  soMoi: new Map<string, string>(),
  ls: new Map<string, LsXdl[]>(),
  soTiep: 0,
}
const nguoiNghe = new Set<() => void>()
const phat = () => { kho.ver++; nguoiNghe.forEach(f => f()) }
const useVerXdl = () => useSyncExternalStore(f => { nguoiNghe.add(f); return () => { nguoiNghe.delete(f) } }, () => kho.ver)
const bayGio = () => { const d = new Date(); return `${dmy(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}` }
const khoa = (id: string, ma: string) => `${id}|${ma}`

export interface MonThieuXdl { ma: string; ten: string; dvt: string; cn: string[]; soPhieu: number; coCongThuc: boolean; loai: LyDoXdl['loai']; lyDo: string }

/** Hàng chuyển bán có theo dõi tồn kho đã xuất kho ngay tại phiếu bán hàng, không cảnh báo thiếu xuất kho định lượng */
const theoDoiTon = (ma: string) => Boolean(HANG.find(h => h.ma === ma)?.tonKho)

/** Món chưa tạo xuất kho định lượng (lý do 1 đến 4, cộng món vừa có công thức chờ xuất bổ sung), gộp theo mã món.
 *  Chỉ thành phẩm không theo dõi tồn kho. */
export function monThieuXdl(rows: PhieuXdl[]): MonThieuXdl[] {
  const mp = new Map<string, MonThieuXdl>()
  for (const p of rows) for (const m of p.dong) {
    if (theoDoiTon(m.ma)) continue
    if (!m.choBoSung && !(m.lyDo && m.lyDo.loai <= 4)) continue
    const o = mp.get(m.ma) ?? { ma: m.ma, ten: m.ten, dvt: m.dvt, cn: [], soPhieu: 0, coCongThuc: true, loai: m.lyDo?.loai ?? 1, lyDo: m.lyDo?.text ?? '' }
    if (!o.cn.includes(p.cn)) o.cn.push(p.cn)
    o.soPhieu++
    if (!m.choBoSung) { o.coCongThuc = false; o.loai = m.lyDo!.loai; o.lyDo = m.lyDo!.text }
    mp.set(m.ma, o)
  }
  return [...mp.values()].sort((a, b) => a.ma.localeCompare(b.ma))
}

/** Xuất bổ sung: chỉ món thiếu đã có công thức, ghi tiếp vào phiếu cũ. Trả số phiếu được bổ sung. */
export function xuatBoSungXdl(rows: PhieuXdl[], maMon: string[]): number {
  let n = 0
  for (const p of rows) {
    const them = p.dong.filter(m => m.choBoSung && maMon.includes(m.ma))
    if (!them.length) continue
    if (p.chuaTao) { if (p.btId) taoXdlBanTay(p.btId, 'Người dùng', p.ngay); n++; continue }   // chứng từ bán hàng lập tay chưa có phiếu: tạo phiếu
    them.forEach(m => kho.daBoSung.add(khoa(p.id, m.ma)))
    kho.ls.set(p.id, [...(kho.ls.get(p.id) ?? []), { t: bayGio(), nguoi: 'Người dùng', nd: `Xuất bổ sung món: ${them.map(m => m.ten).join(', ')}` }])
    n++
  }
  if (n) phat()
  return n
}

/** Phiếu Xuất kho định lượng thành dòng cho danh sách, xem phiếu trên điện thoại (cùng nguồn với bản web) */
export const rowTuPhieuXdl = (p: PhieuXdl): Row => ({
  id: p.id, so: p.so, ngay: p.ngay, cn: p.cn, doiTuong: p.cn, dienGiai: p.ghiChu, tong: p.tong, tt: 'ghiso', _kho: p.cn, _nguoiTao: p.nguoiTao,
  _thamChieu: p.posSo, _thamChieuDi: `/app/ban-hang/3-1-1/${p.posId}`,
  _mon: p.dong.filter(m => m.nvl.length).map(m => ({ ma: m.ma, ten: m.ten, sl: m.sl, maCt: m.maCt, ctId: m.ctId, nvl: m.nvl })),
  _loi: p.dong.filter(m => m.lyDo).map(m => ({ ma: m.ma, ten: m.ten, sl: m.sl, lyDo: m.lyDo!.text })),
  _dong: p.dong.flatMap(m => m.nvl).map(n => ({ ma: n.ma, ten: n.ten, dvt: n.dvt, sl: n.sl, gia: n.gia, tien: n.tien, ts: 0, thue: 0 })),
})

/** Phiếu bị xoá và tạo lại: phiếu trong phạm vi có chứa một trong các món đã chọn */
export const phieuTaoLaiXdl = (rows: PhieuXdl[], maMon: string[], tatCa = false) => (tatCa ? rows : rows.filter(p => p.dong.some(m => maMon.includes(m.ma)))).filter(p => !p.chuaTao)

/** Tạo lại toàn bộ: xoá phiếu cũ, tạo phiếu mới cùng đơn POS, số phiếu cấp lại. Trả số phiếu tạo lại. */
export function taoLaiXdl(rows: PhieuXdl[], maMon: string[], tatCa = false): number {
  const ds = phieuTaoLaiXdl(rows, maMon, tatCa)
  for (const p of ds) {
    const so = `XDL${String(p.date.getFullYear()).slice(2)}${pad(p.date.getMonth() + 1)}-${pad(kho.soTiep++, 4)}`
    kho.soMoi.set(p.id, so)
    p.dong.filter(m => m.choBoSung).forEach(m => kho.daBoSung.add(khoa(p.id, m.ma)))
    kho.ls.set(p.id, [{ t: bayGio(), nguoi: 'Hệ thống', nd: `Tạo mới xuất kho định lượng do tạo lại toàn bộ, thay phiếu ${p.so}` }])
  }
  if (ds.length) phat()
  return ds.length
}

/** Tính một món bán ra NVL theo công thức chế biến: dùng cho đơn POS và chứng từ bán hàng lập tay */
function monXdl(m: { ma: string; ten: string; dvt: string; sl: number; gia: number; tien: number }, date: Date, cn: string): DongMonXdl {
  const maFabi = MA_FABI[m.ma]
  const chung = { ma: m.ma, ten: m.ten, dvt: m.dvt, sl: m.sl, gia: m.gia, tien: m.tien, maFabi }
  const loi = (lyDo: LyDoXdl, ct?: { ma: string; id: string }): DongMonXdl => ({ ...chung, maCt: ct?.ma, ctId: ct?.id, lyDo, coCongThuc: false, tienVon: 0, nvl: [] })
  if (maFabi && !hangCua(maFabi)) return loi({ loai: 2, text: 'Món trên FABi chưa khớp mã hàng trong danh mục' })
  const dsCt = CONG_THUC_CB.filter(c => c.spMa === m.ma && c.nvl.length)
  if (!dsCt.length) return loi({ loai: 1, text: 'Chưa có công thức chế biến' })
  const ct = dsCt.find(c => c.tt === 'on' && docNgay(c.ngay) <= date && (!c.cuaHang.length || c.cuaHang.includes(cn)))
  if (!ct) {
    const c = dsCt[0]
    return loi({ loai: 4, text: c.tt !== 'on' ? `Công thức ${c.ma} đang ngừng áp dụng`
      : docNgay(c.ngay) > date ? `Công thức ${c.ma} áp dụng từ ${c.ngay}` : `Công thức ${c.ma} không áp dụng cho cửa hàng này` }, c)
  }
  if (ct.dvt && ct.dvt !== m.dvt) return loi({ loai: 3, text: `Công thức chỉ có ĐVT ${ct.dvt}, chưa có ${m.dvt}` }, ct)

  const nvl: DongNvlXdl[] = ct.nvl.map(n => {
    const h = hangCua(n.ma)
    const sl = tron3(n.sl * m.sl)
    const gia = giaVonBq(n.ma, date) ?? h?.gia ?? 0
    return {
      ma: n.ma,
      ten: h?.ten ?? n.ma,
      dvt: n.dvt || h?.dvt || '',
      dinhLuong: n.sl,
      sl,
      gia,
      tien: Math.round(gia * sl),
      lyDo: gia ? undefined : { loai: 5, text: 'NVL chưa có giá vốn, tiền vốn tạm ghi 0' },
    }
  })
  return { ...chung, maCt: ct.ma, ctId: ct.id, coCongThuc: true, tienVon: nvl.reduce((sum, item) => sum + item.tien, 0), nvl }
}

/** Sinh danh sách phiếu Xuất kho định lượng từ Xuất bán POS */
export function useDsPhieuXdl(): PhieuXdl[] {
  const verGiaVon = useGiaVonBq()   // tự động vẽ lại khi vừa tính giá vốn xong (5.1.7)
  const verXdl = useVerXdl()        // vẽ lại khi bổ sung hoặc tạo lại (T935)
  const verBan = useBanPhieu()      // vẽ lại khi chứng từ bán hàng lập tay lưu, sửa, xoá
  const plus = useSession().s.goi === 'PL'

  return useMemo(() => {
    const posList = DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(x => theoDon(x).reverse())

    const goc = posList.map((p, idx): PhieuXdl => {
      const posId = String(idx)
      const posSo = soXb(p.seed)   // tham chiếu ghi số chứng từ XB của phiếu bán (T897)
      const yy = String(p.date.getFullYear()).slice(2)
      const mm = pad(p.date.getMonth() + 1)
      const so = `XDL${yy}${mm}-${pad(idx + 1, 4)}`

      const cn = cnTen(p.cn)
      const dong: DongMonXdl[] = dongCuaPhieu(p).map(m => monXdl(m, p.date, cn))

      const tong = dong.reduce((sum, m) => sum + m.tienVon, 0)

      return {
        id: posId,
        so,
        ngay: dmy(p.date),
        date: p.date,
        thang: p.date.getMonth() + 1,
        cn,
        ghiChu: 'Xuất kho theo định lượng món bán',
        posSo,
        posId,
        maHd: soFabi(`fabi-${p.seed}`),   // cùng mã hoá đơn với phiếu Xuất bán POS (QD114)
        soDon: donPosCua(p).soDon,
        kenh: p.kenh,
        ngayTao: `${dmy(p.date)} 23:30`,
        nguoiTao: 'Hệ thống',
        nguon: 'Xuất bán POS',
        tong,
        dong,
        lichSu: [],
      }
    })

    // Chụp danh sách món lỗi lúc đầu, rồi áp trạng thái bổ sung, tạo lại
    if (!kho.loiDau) {
      kho.loiDau = new Set(goc.flatMap(p => p.dong.filter(m => m.lyDo && m.lyDo.loai <= 4).map(m => khoa(p.id, m.ma))))
      kho.soTiep = goc.length + 1
    }
    const loiDau = kho.loiDau
    const pos = goc.map(p => {
      const dong = p.dong.map(m => {
        const k = khoa(p.id, m.ma)
        if (!loiDau.has(k) || kho.daBoSung.has(k) || !m.coCongThuc) return m
        return { ...m, coCongThuc: false, tienVon: 0, nvl: [], choBoSung: true, lyDo: { loai: 1 as const, text: 'Đã có công thức, chờ xuất bổ sung' } }
      })
      return {
        ...p, dong,
        so: kho.soMoi.get(p.id) ?? p.so,
        tong: dong.reduce((sum, m) => sum + m.tienVon, 0),
        lichSu: [{ t: p.ngayTao, nguoi: p.nguoiTao, nd: `Tạo mới phiếu xuất kho định lượng từ ${p.posSo}` }, ...(kho.ls.get(p.id) ?? [])],
      }
    })
    if (!plus) return pos

    // Chứng từ bán hàng lập tay: có số phiếu (_xdlSo) là đã xuất định lượng, chưa có thì chỉ tính vào món thiếu
    const tay = apKhoPhieu(MAN_BAN, mauTay()).filter(canXdlBanTay).map((r): PhieuXdl => {
      const ngay = String(r.ngay).split(' ')[0], date = docNgay(ngay), cn = cnTen(String(r.cn))
      const co = Boolean(r._xdlSo)
      const dong = ((r._dong as Dong[] | undefined) ?? []).filter(d => d.ma).map(d => {
        const m = monXdl(d, date, cn)
        return co || !m.coCongThuc ? m : { ...m, coCongThuc: false, tienVon: 0, nvl: [], choBoSung: true, lyDo: { loai: 1 as const, text: 'Chưa tạo xuất kho định lượng' } }
      })
      return {
        id: `bt-${r.id}`, so: String(r._xdlSo ?? ''), ngay, date, thang: date.getMonth() + 1, cn, ghiChu: 'Xuất kho theo định lượng món bán',
        posSo: String(r.so), posId: String(r.id), maHd: '', soDon: '', kenh: String(r.kenh ?? ''),
        ngayTao: String(r._xdlNgay ?? r._ngayTao ?? ngay), nguoiTao: String(r._xdlNguoi ?? 'Người dùng'), nguon: 'Xuất bán hàng',
        tong: dong.reduce((sum, m) => sum + m.tienVon, 0), dong, btId: String(r.id), chuaTao: !co,
        lichSu: [{ t: String(r._xdlNgay ?? r._ngayTao ?? ngay), nguoi: String(r._xdlNguoi ?? 'Người dùng'), nd: `Tạo mới phiếu xuất kho định lượng từ ${r.so}` }],
      }
    })
    return [...tay, ...pos]
  }, [verGiaVon, verXdl, verBan, plus])
}
