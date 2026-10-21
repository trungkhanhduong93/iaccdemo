// Bảng dòng chứng từ gõ trực tiếp và xem chi tiết theo chuẩn AMIS
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { VoucherCfg } from '../../modules/types'
import { CONG_VIEC, HANG, KHACH, KHO, KHOAN_MUC, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { Select } from '../Dropdown'
import { ChonDanhMuc, useMucDaThem } from '../ChonDanhMuc'
import { Icon } from '../Icon'
import { money } from '../format'
import { OLoc, dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc, type LocCot } from '../LocCot'
import { OSoGo } from '../OSoGo'
import { NHOM_HHDV, type Dong } from './gen'
import { ThemHangLoat, type HangChon } from './ThemHangLoat'
import { quyDoiTuDanhMuc } from '../../modules/danh-muc/QuyDoiDvt'

export const DS_DOI_TUONG = Array.from(new Set([
  ...KHACH.map(x => x.ten),
  ...NCC.map(x => x.ten),
  ...NHAN_VIEN.map(x => x.ten),
]))

export interface BangSuaProps {
  cfg: VoucherCfg
  dong: Dong[]
  onChange?: (ds: Dong[]) => void
  cheDo: 'xem' | 'sua'
  coTk?: boolean
  nhanTk?: [string, string]
  tkTheoLy?: (ly: string) => { tkNo?: string; tkCo?: string }
  coKho?: boolean
  coCk?: boolean
  coLo?: boolean
  coKm?: boolean               // dòng tiền có cột Khoản mục, Công việc; gói Free không có
  khoMacDinh?: string
  lyDo?: { nhan: string; ds: string[]; macDinh: string }   // cột Lý do thu, chi trên dòng phiếu tiền (T49)
  dtMacDinh?: string           // đối tượng của dòng mới, theo đối tượng đầu phiếu (T49)
  an?: string[]                // mã cột người dùng ẩn qua Tuỳ chỉnh giao diện phiếu (T49)
  khongTong?: boolean          // bỏ dòng Tổng cộng khi tổng đã hiện ở đáy form (phiếu thu chi)
  coNhapKho?: boolean          // phiếu mua: Tiền trước thuế trước cột thuế; Tổng tiền, Giá trị nhập kho cuối dòng (T84)
  gtnkCoThue?: boolean         // hộ kinh doanh: Giá trị nhập kho gồm cả tiền thuế GTGT (T164)
  hienLoc?: boolean            // hiện hàng ô lọc dưới tiêu đề cột, bấm nút Lọc trên thanh tab mới hiện (T383)
  themGon?: boolean            // thêm hàng mới tại form chỉ có Mã, Tên, ĐVT, Loại hàng hoá, vd phiếu mua hàng (T388)
  coNhomHhdv?: boolean         // phiếu mua có hoá đơn, gói Plus, Pro: cột Nhóm HHDV mua vào sau Tiền thuế (T162)
  chiXemLy?: boolean           // cột lý do chỉ xem, không cho chọn
  chiXemDt?: boolean           // cột đối tượng chỉ xem, không cho chọn
  giamThue?: (tien: number) => number   // GTGT theo % doanh thu (T450): cột Giảm thuế GTGT tính từ tiền sau CK thay Thuế suất, Tiền thuế
  coThemHangLoat?: boolean     // nút Thêm hàng loạt chọn nhiều hàng một lần, phiếu mua hàng (T465)
}

/** Các cột ẩn hiện được của bảng chi tiết, theo loại phiếu (T49). Mỗi cột trên bảng là một mục, theo thứ tự trên bảng (T86) */
export function cotTuyChon(cfg: VoucherCfg, o: { coKho?: boolean; coLo?: boolean; coCk?: boolean; coKm?: boolean; coLy?: boolean; coNhapKho?: boolean; coNhomHhdv?: boolean; coGiamThue?: boolean }): [string, string][] {
  const hang = cfg.dong === 'hang' || cfg.dong === 'nvl'
  const tien = cfg.dong === 'tien'
  const coThue = cfg.thue !== undefined || hang
  const ds: [string, string, boolean | undefined][] = [
    ['ma', 'Mã hàng', hang], ['kho', 'Kho', o.coKho], ['dvt', 'ĐVT', hang],
    ['lo', 'Số lô', hang && o.coLo], ['hsd', 'Hạn dùng', hang && o.coLo],
    ['ly', 'Lý do', tien && o.coLy], ['dt', 'Đối tượng', tien && cfg.doiTuong !== 'none'],
    ['km', 'Khoản mục', tien && o.coKm], ['cv', 'Công việc', tien && o.coKm],
    ['sl', 'Số lượng', hang], ['gia', 'Đơn giá', hang], ['tien', 'Thành tiền', true],
    ['ptCk', '% CK', o.coCk], ['ck', 'Tiền CK', o.coCk], ['truocThue', 'Tiền trước thuế', o.coNhapKho],
    ['ts', 'Thuế suất', coThue && !o.coGiamThue], ['thue', 'Tiền thuế', coThue && !o.coGiamThue], ['giamThue', 'Giảm thuế GTGT', o.coGiamThue], ['nhomHhdv', 'Nhóm HHDV mua vào', o.coNhomHhdv],
    ['gtnk', 'Giá trị nhập kho', o.coNhapKho], ['tongTien', 'Tổng tiền', o.coNhapKho],
  ]
  return ds.filter(x => x[2]).map(([k, ten]) => [k, ten])
}

/** Ô nhập số ở bảng chi tiết: đang gõ đã có chấm ngăn nghìn, báo số ngay để tổng tiền đổi theo; rời ô hiện định dạng có dấu chấm (T284) */
function OSo({ val, onChange, disabled, placeholder = '0', className = 'inp sm num' }: {
  val: number
  onChange?: (v: number) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}) {
  if (disabled) return <span className="num">{money(val)}</span>
  return <OSoGo val={val} onChange={onChange} hien={money} placeholder={placeholder} className={className} />
}

export function BangSua({
  cfg,
  dong,
  onChange,
  cheDo,
  coTk = false,
  nhanTk = ['TK Nợ', 'TK Có'],
  tkTheoLy,
  coKho = false,
  coCk = false,
  coLo = false,
  coKm = true,
  khoMacDinh = 'Kho tổng',
  lyDo,
  dtMacDinh = '',
  an = [],
  khongTong = false,
  coNhapKho = false,
  coNhomHhdv = false,
  gtnkCoThue = false,
  chiXemLy = false,
  chiXemDt = false,
  hienLoc = false,
  themGon = false,
  giamThue,
  coThemHangLoat = false,
}: BangSuaProps) {
  const hang = cfg.dong === 'hang' || cfg.dong === 'nvl'
  const tienDong = cfg.dong === 'tien'
  // Cột người dùng đã ẩn qua Tuỳ chỉnh giao diện phiếu
  const hien = (k: string) => !an.includes(k)
  coKho = coKho && hien('kho')
  // Mỗi cột bật tắt riêng (T86)
  const maCot = hang && hien('ma')
  const loCot = hang && coLo && hien('lo')
  const hsdCot = hang && coLo && hien('hsd')
  const dvtCot = hang && hien('dvt')
  const slCot = hang && hien('sl')
  const giaCot = hang && hien('gia')
  const tienCot = hien('tien')
  const ptCkCot = coCk && hien('ptCk')
  const ckCot = coCk && hien('ck')
  const truocThueCot = coNhapKho && hien('truocThue')
  const coThue = cfg.thue !== undefined || hang
  const tsCot = coThue && !giamThue && hien('ts')
  const thueCot = coThue && !giamThue && hien('thue')
  const giamCot = Boolean(giamThue) && hien('giamThue')
  const nhomCot = coNhomHhdv && hien('nhomHhdv')
  const gtnkCot = coNhapKho && hien('gtnk')
  const tongTienCot = coNhapKho && hien('tongTien')
  const kmDong = tienDong && coKm && hien('km')
  const cvDong = tienDong && coKm && hien('cv')
  const dtDong = tienDong && cfg.doiTuong !== 'none' && hien('dt')   // phiếu chuyển quỹ không có đối tượng
  const lyDong = tienDong && Boolean(lyDo) && hien('ly')
  const danhMucHang = cfg.dong === 'nvl' ? NVL : HANG
  // Hàng hoá thêm mới ngay tại form (T65): đơn vị tính tạm "cái", giá 0, sửa trên dòng
  const dmHang = cfg.dong === 'nvl' ? 'nvl' : 'hang'
  const hangThem = useMucDaThem(dmHang)
  // Thêm hàng loạt (T465): danh mục hàng cùng hàng vừa thêm tại form
  const [moHangLoat, setMoHangLoat] = useState(false)
  const loaiHang = cfg.dong === 'nvl' ? 'Nguyên vật liệu' : 'Hàng hoá'
  const dsHangLoat: HangChon[] = [
    ...danhMucHang.map(h => ({ ma: h.ma, ten: h.ten, dvt: h.dvt, nhom: h.nhom, loai: loaiHang })),
    ...hangThem.filter(m => !danhMucHang.some(h => h.ma === m.v)).map(m => ({ ma: m.v, ten: m.t.split(' - ').slice(1).join(' - '), dvt: m.dvt || 'cái', loai: loaiHang })),
  ]

  const colSpanDau = hang
    ? 2 + (maCot ? 1 : 0) + (dvtCot ? 1 : 0) + (coKho ? 1 : 0) + (loCot ? 1 : 0) + (hsdCot ? 1 : 0) + (coTk ? 2 : 0)
    : 2 + (coKho ? 1 : 0) + (coTk ? 2 : 0) + (lyDong ? 1 : 0) + (dtDong ? 1 : 0) + (kmDong ? 1 : 0) + (cvDong ? 1 : 0)

  function capNhat(idx: number, patch: Partial<Dong>) {
    if (!onChange) return
    const tkMoi = tkTheoLy && patch.ly !== undefined ? tkTheoLy(patch.ly) : undefined
    const moi = dong.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = {
        ...d,
        ...patch,
        ...(tkMoi?.tkNo ? { tkNo: tkMoi.tkNo } : {}),
        ...(tkMoi?.tkCo ? { tkCo: tkMoi.tkCo } : {}),
      }
      const sl = hopNhat.sl ?? 0
      const gia = hopNhat.gia ?? 0
      const tien = patch.tien !== undefined ? patch.tien : Math.round(sl * gia)
      const ptCk = hopNhat.ptCk ?? 0
      const ck = patch.ck !== undefined ? patch.ck : Math.round(tien * ptCk / 100)
      const ts = hopNhat.ts ?? 0
      const thue = patch.thue !== undefined ? patch.thue : Math.round((tien - ck) * ts / 100)
      return { ...hopNhat, sl, gia, tien, ptCk, ck, ts, thue }
    })
    onChange(moi)
  }

  function chonMaHang(idx: number, ma: string, muc?: { v: string; t: string; dvt?: string }) {
    const item = danhMucHang.find(x => x.ma === ma)
    if (!item) {
      const moi = muc ?? hangThem.find(x => x.v === ma)
      capNhat(idx, moi ? { ma, ten: moi.t.split(' - ').slice(1).join(' - '), dvt: moi.dvt || dong[idx]?.dvt || 'cái' } : { ma })   // hàng vừa thêm tại form lấy ĐVT đã chọn trong hộp thêm (T419)
      return
    }
    const sl = dong[idx]?.sl || 1
    const gia = item.gia
    const tien = sl * gia
    const ptCk = dong[idx]?.ptCk ?? 0
    const ck = Math.round(tien * ptCk / 100)
    const ts = cfg.thue === 0 ? 0 : item.ts
    const thue = Math.round((tien - ck) * ts / 100)
    capNhat(idx, {
      ma: item.ma,
      ten: item.ten,
      dvt: item.dvt,
      gia,
      sl,
      tien,
      ptCk,
      ck,
      ts,
      thue,
      kho: dong[idx]?.kho || khoMacDinh,
    })
  }

  function themDong() {
    if (!onChange) return
    const mauHang = danhMucHang[0]
    const tkMoi = tkTheoLy && lyDo?.macDinh ? tkTheoLy(lyDo.macDinh) : undefined
    const dongMoi: Dong = hang && mauHang ? {
      ma: mauHang.ma,
      ten: mauHang.ten,
      dvt: mauHang.dvt,
      sl: 1,
      gia: mauHang.gia,
      tien: mauHang.gia,
      ts: cfg.thue === 0 ? 0 : mauHang.ts,
      thue: Math.round(mauHang.gia * (cfg.thue === 0 ? 0 : mauHang.ts) / 100),
      ptCk: 0,
      ck: 0,
      kho: khoMacDinh,
      dt: '',
      km: '',
      cv: '',
      lo: '',
      hsd: '',
    } : {
      ma: '',
      ten: cfg.dienGiai?.[0] ?? 'Nội dung chứng từ',
      dvt: '',
      sl: 1,
      gia: 1_000_000,
      tien: 1_000_000,
      ts: cfg.thue ?? 0,
      thue: Math.round(1_000_000 * (cfg.thue ?? 0) / 100),
      dt: dtMacDinh,
      ly: lyDo?.macDinh,
      km: '',
      cv: '',
      lo: '',
      hsd: '',
      ...(tkMoi?.tkNo ? { tkNo: tkMoi.tkNo } : {}),
      ...(tkMoi?.tkCo ? { tkCo: tkMoi.tkCo } : {}),
    }
    onChange([...dong, dongMoi])
  }

  /** Mỗi hàng đã tích thành một dòng số lượng 1, giá, thuế suất theo danh mục như Thêm dòng (T465) */
  function themHangLoat(ds: HangChon[]) {
    if (!onChange || ds.length === 0) return
    onChange([...dong, ...ds.map((h): Dong => {
      const item = danhMucHang.find(x => x.ma === h.ma)
      const gia = item?.gia ?? 0
      const ts = cfg.thue === 0 ? 0 : item?.ts ?? 0
      return { ma: h.ma, ten: h.ten, dvt: h.dvt, sl: 1, gia, tien: gia, ts, thue: Math.round(gia * ts / 100), ptCk: 0, ck: 0, kho: khoMacDinh, dt: '', km: '', cv: '', lo: '', hsd: '' }
    })])
  }

  function xoaDong(idx: number) {
    if (!onChange) return
    onChange(dong.filter((_, i) => i !== idx))
  }

  function xoaHet() {
    if (!onChange) return
    onChange([])
  }

  // Lọc dòng chi tiết (T383): hàng lọc như danh sách chứng từ (ô gõ + phễu chọn điều kiện, OLoc); cột số lọc theo =, >, trong khoảng…
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  useEffect(() => { if (!hienLoc) setGtLoc({}) }, [hienLoc])
  const tienSauCk = (d: Dong) => (d.tien || 0) - (d.ck || 0)
  const giamDong = (d: Dong) => giamThue ? giamThue(tienSauCk(d)) : 0
  // [khoá, tên cột, có hiện, chữ của dòng, số của dòng (cột số)]
  const cotLoc: [string, string, boolean, (d: Dong) => string, ((d: Dong) => number)?][] = [
    ['ma', 'Mã hàng', maCot, d => d.ma ?? ''], ['ten', hang ? 'Tên hàng hoá, dịch vụ' : 'Diễn giải', true, d => d.ten ?? ''],
    ['kho', 'Kho', coKho, d => d.kho || khoMacDinh], ['dvt', 'ĐVT', dvtCot, d => d.dvt ?? ''],
    ['lo', 'Số lô', loCot, d => d.lo ?? ''], ['hsd', 'Hạn dùng', hsdCot, d => d.hsd ?? ''],
    ['tkNo', nhanTk[0], coTk, d => d.tkNo ?? ''], ['tkCo', nhanTk[1], coTk, d => d.tkCo ?? ''],
    ['ly', lyDo?.nhan ?? 'Lý do', tienDong && lyDong, d => d.ly ?? ''], ['dt', 'Đối tượng', tienDong && dtDong, d => d.dt ?? ''],
    ['km', 'Khoản mục', tienDong && kmDong, d => d.km ? (KHOAN_MUC.find(x => x.ma === d.km)?.ten ?? d.km) : ''],
    ['cv', 'Công việc', tienDong && cvDong, d => d.cv ? (CONG_VIEC.find(x => x.ma === d.cv)?.ten ?? d.cv) : ''],
    ['sl', 'Số lượng', slCot, d => money(d.sl), d => d.sl || 0], ['gia', 'Đơn giá', giaCot, d => money(d.gia), d => d.gia || 0],
    ['tien', 'Thành tiền', tienCot, d => money(d.tien), d => d.tien || 0], ['ptCk', '% CK', ptCkCot, d => String(d.ptCk ?? 0), d => d.ptCk || 0],
    ['ck', 'Tiền CK', ckCot, d => money(d.ck || 0), d => d.ck || 0], ['truocThue', 'Tiền trước thuế', truocThueCot, d => money(tienSauCk(d)), tienSauCk],
    ['ts', 'Thuế suất', tsCot, d => d.ts ? String(d.ts) : 'KCT'], ['thue', 'Tiền thuế', thueCot, d => money(d.thue), d => d.thue || 0],
    ['giamThue', 'Giảm thuế GTGT', giamCot, d => money(giamDong(d)), giamDong],
    ['nhomHhdv', 'Nhóm HHDV mua vào', nhomCot, d => d.nhomHhdv || NHOM_HHDV[0]],
    ['gtnk', 'Giá trị nhập kho', gtnkCot, d => money(tienSauCk(d) + (gtnkCoThue ? d.thue || 0 : 0)), d => tienSauCk(d) + (gtnkCoThue ? d.thue || 0 : 0)],
    ['tongTien', 'Tổng tiền', tongTienCot, d => money(tienSauCk(d) + (d.thue || 0)), d => tienSauCk(d) + (d.thue || 0)],
  ]
  const kieuLoc = (k: string): KieuLoc => cotLoc.find(c => c[0] === k)?.[4] ? 'so' : 'chon'   // cột chữ lọc kiểu chọn (T466)
  const loc: LocCot = { gt: gtLoc, dat: (k, g) => setGtLoc(t => ({ ...t, [k]: g })), kieu: c => kieuLoc(c.k),
    layLuaChon: k => { const lay = cotLoc.find(c => c[0] === k)?.[3]; return lay ? dsGiaTri(dong, lay) : [] } }
  const khop = (d: Dong) => !hienLoc || cotLoc.every(([k, , co, lay, so]) => !co || !dangLoc(gtLoc[k]) || khopLoc(kieuLoc(k), gtLoc[k], lay(d), so?.(d)))
  const hangLoc = (cuoi: boolean) => hienLoc && (
    <tr className="loc-hang">
      <th />
      {cotLoc.filter(c => c[2]).map(([k, t]) => <th key={k}><OLoc c={{ k, t }} loc={loc} /></th>)}
      {cuoi && <th />}
    </tr>
  )

  const tongSl = dong.reduce((a, d) => a + (d.sl || 0), 0)
  const tongTien = dong.reduce((a, d) => a + (d.tien || 0), 0)
  const tongCk = dong.reduce((a, d) => a + (d.ck || 0), 0)
  const tongThue = dong.reduce((a, d) => a + (d.thue || 0), 0)
  const tongGiam = dong.reduce((a, d) => a + giamDong(d), 0)

  if (cheDo === 'xem') {
    return (
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="dim" style={{ width: 40 }}>#</th>
              {maCot && <th className="code" style={{ width: 90 }}>Mã hàng</th>}
              <th>{hang ? 'Tên hàng hoá, dịch vụ' : 'Diễn giải'}</th>
              {coKho && <th style={{ width: 140 }}>Kho</th>}
              {dvtCot && <th style={{ width: 60 }}>ĐVT</th>}
              {loCot && <th style={{ width: 100 }}>Số lô</th>}
              {hsdCot && <th style={{ width: 105 }}>Hạn dùng</th>}
              {coTk && (
                <>
                  <th className="code" style={{ width: 80 }}>{nhanTk[0]}</th>
                  <th className="code" style={{ width: 80 }}>{nhanTk[1]}</th>
                </>
              )}
              {tienDong && (
                <>
                  {lyDong && <th style={{ width: 200 }}>{lyDo!.nhan}</th>}
                  {dtDong && <th style={{ width: 180 }}>Đối tượng</th>}
                  {kmDong && <th style={{ width: 160 }}>Khoản mục</th>}
                  {cvDong && <th style={{ width: 160 }}>Công việc</th>}
                </>
              )}
              {slCot && <th className="num" style={{ width: 80 }}>Số lượng</th>}
              {giaCot && <th className="num" style={{ width: 110 }}>Đơn giá</th>}
              {tienCot && <th className="num" style={{ width: tienDong ? '25%' : 120 }}>Thành tiền</th>}
              {ptCkCot && <th className="num" style={{ width: 65 }}>% CK</th>}
              {ckCot && <th className="num" style={{ width: 100 }}>Tiền CK</th>}
              {truocThueCot && <th className="num" style={{ width: 120 }}>Tiền trước thuế</th>}
              {tsCot && <th className="num" style={{ width: 75 }}>Thuế suất</th>}
              {thueCot && <th className="num" style={{ width: 110 }}>Tiền thuế</th>}
              {giamCot && <th className="num" style={{ width: 130 }}>Giảm thuế GTGT</th>}
              {nhomCot && <th style={{ width: 240 }}>Nhóm HHDV mua vào</th>}
              {gtnkCot && <th className="num" style={{ width: 130 }}>Giá trị nhập kho</th>}
              {tongTienCot && <th className="num" style={{ width: 120 }}>Tổng tiền</th>}
            </tr>
            {hangLoc(false)}
          </thead>
          <tbody>
            {dong.map((d, i) => khop(d) && (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                {maCot && <td className="code">{d.ma}</td>}
                <td>{d.ten}</td>
                {coKho && <td>{d.kho || khoMacDinh}</td>}
                {dvtCot && <td>{d.dvt}</td>}
                {loCot && <td>{d.lo || '—'}</td>}
                {hsdCot && <td>{d.hsd || '—'}</td>}
                {coTk && (
                  <>
                    <td className="code">{d.tkNo ?? '—'}</td>
                    <td className="code">{d.tkCo ?? '—'}</td>
                  </>
                )}
                {tienDong && (
                  <>
                    {lyDong && <td>{d.ly || '—'}</td>}
                    {dtDong && <td>{d.dt || '—'}</td>}
                    {kmDong && <td>{d.km ? (KHOAN_MUC.find(x => x.ma === d.km)?.ten ?? d.km) : '—'}</td>}
                    {cvDong && <td>{d.cv ? (CONG_VIEC.find(x => x.ma === d.cv)?.ten ?? d.cv) : '—'}</td>}
                  </>
                )}
                {slCot && <td className="num">{money(d.sl)}</td>}
                {giaCot && <td className="num">{money(d.gia)}</td>}
                {tienCot && <td className="num">{money(d.tien)}</td>}
                {ptCkCot && <td className="num">{d.ptCk ? `${d.ptCk}%` : '0%'}</td>}
                {ckCot && <td className="num">{money(d.ck || 0)}</td>}
                {truocThueCot && <td className="num">{money((d.tien || 0) - (d.ck || 0))}</td>}
                {tsCot && <td className="num">{d.ts ? `${d.ts}%` : 'KCT'}</td>}
                {thueCot && <td className="num">{money(d.thue)}</td>}
                {giamCot && <td className="num">{money(giamDong(d))}</td>}
                {nhomCot && <td>{d.nhomHhdv || NHOM_HHDV[0]}</td>}
                {gtnkCot && <td className="num">{money((d.tien || 0) - (d.ck || 0) + (gtnkCoThue ? d.thue || 0 : 0))}</td>}
                {tongTienCot && <td className="num">{money((d.tien || 0) - (d.ck || 0) + (d.thue || 0))}</td>}
              </tr>
            ))}
          </tbody>
          {!khongTong && <tfoot>
            <tr className="sum">
              <td colSpan={colSpanDau}>Tổng cộng ({dong.length} dòng)</td>
              {slCot && <td className="num">{money(tongSl)}</td>}
              {giaCot && <td />}
              {tienCot && <td className="num">{money(tongTien)}</td>}
              {ptCkCot && <td />}
              {ckCot && <td className="num">{money(tongCk)}</td>}
              {truocThueCot && <td className="num">{money(tongTien - tongCk)}</td>}
              {tsCot && <td />}
              {thueCot && <td className="num">{money(tongThue)}</td>}
              {giamCot && <td className="num">{money(tongGiam)}</td>}
              {nhomCot && <td />}
              {gtnkCot && <td className="num">{money(tongTien - tongCk + (gtnkCoThue ? tongThue : 0))}</td>}
              {tongTienCot && <td className="num">{money(tongTien - tongCk + tongThue)}</td>}
            </tr>
          </tfoot>}
        </table>
      </div>
    )
  }

  // Chế độ sửa (gõ trực tiếp trên bảng)
  return (
    <div className="bang-sua-wrap">
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className="tbl bang-sua">
          <thead>
            <tr>
              <th className="dim" style={{ width: 36 }}>#</th>
              {maCot && <th style={{ width: 120 }}>Mã hàng</th>}
              <th style={{ minWidth: 180 }}>{hang ? 'Tên hàng hoá, dịch vụ' : 'Diễn giải'}</th>
              {coKho && <th style={{ width: 140 }}>Kho</th>}
              {dvtCot && <th style={{ width: 65 }}>ĐVT</th>}
              {loCot && <th style={{ width: 100 }}>Số lô</th>}
              {hsdCot && <th style={{ width: 105 }}>Hạn dùng</th>}
              {coTk && (
                <>
                  <th style={{ width: 80 }}>{nhanTk[0]}</th>
                  <th style={{ width: 80 }}>{nhanTk[1]}</th>
                </>
              )}
              {tienDong && (
                <>
                  {lyDong && <th style={{ width: 200 }}>{lyDo!.nhan}</th>}
                  {dtDong && <th style={{ width: 180 }}>Đối tượng</th>}
                  {kmDong && <th style={{ width: 160 }}>Khoản mục</th>}
                  {cvDong && <th style={{ width: 160 }}>Công việc</th>}
                </>
              )}
              {slCot && <th className="num" style={{ width: 85 }}>Số lượng</th>}
              {giaCot && <th className="num" style={{ width: 110 }}>Đơn giá</th>}
              {/* T419: phiếu thu chi cột Thành tiền rộng 1/4 bảng */}
              {tienCot && <th className="num" style={{ width: tienDong ? '25%' : 120 }}>Thành tiền</th>}
              {ptCkCot && <th className="num" style={{ width: 65 }}>% CK</th>}
              {ckCot && <th className="num" style={{ width: 100 }}>Tiền CK</th>}
              {truocThueCot && <th className="num" style={{ width: 120 }}>Tiền trước thuế</th>}
              {tsCot && <th className="num" style={{ width: 80 }}>Thuế suất</th>}
              {thueCot && <th className="num" style={{ width: 110 }}>Tiền thuế</th>}
              {giamCot && <th className="num" style={{ width: 130 }}>Giảm thuế GTGT</th>}
              {nhomCot && <th style={{ width: 240 }}>Nhóm HHDV mua vào</th>}
              {gtnkCot && <th className="num" style={{ width: 130 }}>Giá trị nhập kho</th>}
              {tongTienCot && <th className="num" style={{ width: 120 }}>Tổng tiền</th>}
              <th style={{ width: 44 }} />
            </tr>
            {hangLoc(true)}
          </thead>
          <tbody>
            {dong.map((d, i) => khop(d) && (
              <tr key={i}>
                <td className="dim c">{i + 1}</td>
                {maCot && (
                  <td>
                    <ChonDanhMuc dm={dmHang} nhan={cfg.dong === 'nvl' ? 'nguyên vật liệu' : 'hàng hoá'} coMa chiMa className="inp sm" trong="Chọn" value={d.ma} gon={themGon}
                      onChange={(v, muc) => chonMaHang(i, v, muc)} ds={danhMucHang.map(x => ({ v: x.ma, t: `${x.ma} - ${x.ten}` }))} />
                  </td>
                )}
                <td>
                  <input
                    type="text"
                    className="inp sm"
                    value={d.ten}
                    placeholder={hang ? 'Tên hàng' : 'Diễn giải'}
                    onChange={e => capNhat(i, { ten: e.target.value })}
                  />
                </td>
                {coKho && (
                  <td>
                    <ChonDanhMuc dm="kho" nhan="kho" className="inp sm" value={d.kho || khoMacDinh} onChange={v => capNhat(i, { kho: v })} ds={KHO} />
                  </td>
                )}
                {dvtCot && (
                  <td>
                    {!d.ma ? (
                      <Select className="inp sm" disabled value="" ds={[{ v: '', t: '—' }]} aria-label="Đơn vị tính" />
                    ) : (() => {
                      const hangTim = danhMucHang.find(h => h.ma === d.ma) ?? hangThem.find(m => m.v === d.ma)
                      const dvtChinh = (hangTim && 'dvt' in hangTim && hangTim.dvt) ? hangTim.dvt : (d.dvt || '')
                      const tenHang = d.ten || (hangTim && 'ten' in hangTim ? hangTim.ten : '')
                      const dsQd = quyDoiTuDanhMuc(tenHang, dvtChinh).map(q => q.dv)
                      const setDvt = new Set<string>()
                      if (dvtChinh) setDvt.add(dvtChinh)
                      dsQd.forEach(dv => setDvt.add(dv))
                      if (d.dvt) setDvt.add(d.dvt)
                      const dsDvt = Array.from(setDvt).map(dv => ({ v: dv, t: dv }))
                      return (
                        <Select
                          className="inp sm"
                          value={d.dvt}
                          onChange={e => capNhat(i, { dvt: e.target.value })}
                          ds={dsDvt}
                          aria-label="Đơn vị tính"
                        />
                      )
                    })()}
                  </td>
                )}
                {loCot && (
                  <td>
                    <input
                      type="text"
                      className="inp sm"
                      value={d.lo ?? ''}
                      placeholder="Số lô"
                      onChange={e => capNhat(i, { lo: e.target.value })}
                    />
                  </td>
                )}
                {hsdCot && (
                  <td>
                    <input
                      type="text"
                      className="inp sm"
                      value={d.hsd ?? ''}
                      placeholder="dd/MM/yyyy"
                      onChange={e => capNhat(i, { hsd: e.target.value })}
                    />
                  </td>
                )}
                {coTk && (
                  <>
                    <td>
                      <input
                        type="text"
                        className="inp sm code"
                        value={d.tkNo ?? ''}
                        placeholder={nhanTk[0]}
                        onChange={e => capNhat(i, { tkNo: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="inp sm code"
                        value={d.tkCo ?? ''}
                        placeholder={nhanTk[1]}
                        onChange={e => capNhat(i, { tkCo: e.target.value })}
                      />
                    </td>
                  </>
                )}
                {tienDong && (
                  <>
                    {lyDong && (
                      chiXemLy ? (
                        <td className="o-chi-xem">{d.ly || '—'}</td>
                      ) : (
                        <td>
                          <ChonDanhMuc dm={`ly:${lyDo!.nhan}`} nhan={lyDo!.nhan.toLowerCase()} className="inp sm" value={d.ly ?? ''} onChange={v => capNhat(i, { ly: v })} ds={lyDo!.ds} />
                        </td>
                      )
                    )}
                    {dtDong && (
                      chiXemDt ? (
                        <td className="o-chi-xem">{d.dt || '—'}</td>
                      ) : (
                        <td>
                          <ChonDanhMuc dm="doiTuong" nhan="đối tượng" className="inp sm" trong="—" value={d.dt ?? ''} onChange={v => capNhat(i, { dt: v })} ds={DS_DOI_TUONG} />
                        </td>
                      )
                    )}
                    {kmDong && <td>
                      <ChonDanhMuc dm="khoanMuc" nhan="khoản mục" coMa className="inp sm" trong="—" value={d.km ?? ''} onChange={v => capNhat(i, { km: v })}
                        ds={KHOAN_MUC.map(km => ({ v: km.ma, t: `${km.ma} · ${km.ten}` }))} />
                    </td>}
                    {cvDong && <td>
                      <ChonDanhMuc dm="congViec" nhan="công việc" coMa className="inp sm" trong="—" value={d.cv ?? ''} onChange={v => capNhat(i, { cv: v })}
                        ds={CONG_VIEC.map(cv => ({ v: cv.ma, t: `${cv.ma} · ${cv.ten}` }))} />
                    </td>}
                  </>
                )}
                {slCot && (
                  <td className="num">
                    <OSo val={d.sl} onChange={sl => capNhat(i, { sl })} />
                  </td>
                )}
                {giaCot && (
                  <td className="num">
                    <OSo val={d.gia} onChange={gia => capNhat(i, { gia })} />
                  </td>
                )}
                {tienCot && (
                  <td className="num">
                    <OSo val={d.tien} onChange={tien => capNhat(i, { tien })} />
                  </td>
                )}
                {ptCkCot && (
                  <td className="num">
                    <OSo val={d.ptCk ?? 0} onChange={ptCk => capNhat(i, { ptCk })} />
                  </td>
                )}
                {ckCot && (
                  <td className="num">
                    <OSo val={d.ck ?? 0} onChange={ck => capNhat(i, { ck })} />
                  </td>
                )}
                {truocThueCot && <td className="num">{money((d.tien || 0) - (d.ck || 0))}</td>}
                {tsCot && (
                  <td>
                    <Select
                      className="inp sm"
                      value={String(d.ts ?? 0)}
                      onChange={e => capNhat(i, { ts: Number(e.target.value) })}
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={8}>8%</option>
                      <option value={10}>10%</option>
                    </Select>
                  </td>
                )}
                {thueCot && (
                  <td className="num">
                    <OSo val={d.thue} onChange={thue => capNhat(i, { thue })} />
                  </td>
                )}
                {giamCot && <td className="num">{money(giamDong(d))}</td>}
                {nhomCot && (
                  <td>
                    <Select className="inp sm" value={d.nhomHhdv || NHOM_HHDV[0]} aria-label="Nhóm HHDV mua vào" onChange={e => capNhat(i, { nhomHhdv: e.target.value })}
                      ds={NHOM_HHDV.map(v => ({ v, t: v }))} />
                  </td>
                )}
                {gtnkCot && <td className="num">{money((d.tien || 0) - (d.ck || 0) + (gtnkCoThue ? d.thue || 0 : 0))}</td>}
                {tongTienCot && <td className="num">{money((d.tien || 0) - (d.ck || 0) + (d.thue || 0))}</td>}
                <td className="c">
                  <button
                    type="button"
                    className="icon-btn sm"
                    title="Xoá dòng"
                    onClick={() => xoaDong(i)}
                  >
                    <Icon n="trash" className="ic sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {!khongTong && <tfoot>
            <tr className="sum">
              <td colSpan={colSpanDau}>Tổng cộng ({dong.length} dòng)</td>
              {slCot && <td className="num">{money(tongSl)}</td>}
              {giaCot && <td />}
              {tienCot && <td className="num">{money(tongTien)}</td>}
              {ptCkCot && <td />}
              {ckCot && <td className="num">{money(tongCk)}</td>}
              {truocThueCot && <td className="num">{money(tongTien - tongCk)}</td>}
              {tsCot && <td />}
              {thueCot && <td className="num">{money(tongThue)}</td>}
              {giamCot && <td className="num">{money(tongGiam)}</td>}
              {nhomCot && <td />}
              {gtnkCot && <td className="num">{money(tongTien - tongCk + (gtnkCoThue ? tongThue : 0))}</td>}
              {tongTienCot && <td className="num">{money(tongTien - tongCk + tongThue)}</td>}
              <td />
            </tr>
          </tfoot>}
        </table>
      </div>
      <div className="row" style={{ padding: '8px 12px', gap: 10 }}>
        <button type="button" className="btn sm ghost" onClick={themDong}>
          <Icon n="plus" className="ic sm" />Thêm dòng
        </button>
        {coThemHangLoat && hang && (
          <button type="button" className="btn sm ghost" onClick={() => setMoHangLoat(true)}>
            <Icon n="plus" className="ic sm" />Thêm hàng loạt
          </button>
        )}
        {moHangLoat && <ThemHangLoat ds={dsHangLoat} daCo={dong.map(d => d.ma ?? '')} onDong={() => setMoHangLoat(false)} onXacNhan={themHangLoat} />}
        {dong.length > 0 && (
          <button type="button" className="btn sm ghost" onClick={xoaHet} style={{ color: 'var(--red)' }}>
            <Icon n="trash" className="ic sm" />Xoá hết
          </button>
        )}
      </div>
    </div>
  )
}

/** Tuỳ chỉnh giao diện phiếu: bật tắt các cột của bảng chi tiết (T49), ô đầu phiếu và tổng chân phiếu (T89).
 *  Panel bên phải cùng kiểu panel danh mục (T81). Ô đầu phiếu, chân phiếu lưu chung danh sách ẩn với tiền tố dau:, chan: */
export function HopCotPhieu({ ds, dsDau = [], dsChan = [], an, macDinh = [], onDoi, onDong }: {
  ds: [string, string][]; dsDau?: [string, string][]; dsChan?: [string, string][]; an: string[]
  macDinh?: string[]   // các mục ẩn sẵn, nút Khôi phục mặc định trả về đây (T106)
  onDoi: (an: string[]) => void; onDong: () => void
}) {
  const khoi = (ten: string, tienTo: string, muc: [string, string][], ghiChu: string) => {
    const dsK = muc.map(([k, t]): [string, string] => [tienTo + k, t])
    const hien = dsK.filter(([k]) => !an.includes(k)).length
    return (
      <div className="pn-khoi mo" key={ten}>
        <div className="pn-khoi-dau"><span>{ten}</span><small className="muted">{hien}/{dsK.length} đang hiện</small></div>
        <div className="pn-khoi-than pn-ds-cot">
          {dsK.map(([k, t]) => (
            <label key={k} className="pn-tich pn-dong-cot">
              <span className="grow">{t}</span>
              <input type="checkbox" className="bat-tat" checked={!an.includes(k)} onChange={e => onDoi(e.target.checked ? an.filter(x => x !== k) : [...an, k])} />
            </label>
          ))}
          {ghiChu && <p className="muted pn-chu-nho pn-ghi-chu">{ghiChu}</p>}
        </div>
      </div>
    )
  }
  // Esc chỉ đóng panel, chặn lan để không đóng luôn form phiếu toàn màn hình phía sau
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [onDong])
  return createPortal(
    <>
      <div className="overlay" onMouseDown={onDong} />
      <aside className="pn-hop pn-hop-hep" role="dialog" aria-modal="true" aria-label="Tuỳ chỉnh giao diện phiếu">
        <div className="pn-dau">
          <div className="pn-dau-ic"><Icon n="layers" className="ic" /></div>
          <div className="grow">
            <h3>Tuỳ chỉnh giao diện phiếu</h3>
            <small className="muted">Bật tắt ô đầu phiếu, cột bảng chi tiết, tổng chân phiếu</small>
          </div>
          <button type="button" className="icon-btn" onClick={onDong} aria-label="Đóng"><Icon n="x" /></button>
        </div>
        <div className="pn-than">
          {dsDau.length > 0 && khoi('Đầu phiếu', 'dau:', dsDau, 'Ô bắt buộc (có dấu *), ngày, số phiếu luôn hiện. Tắt ô nào thì các ô sau dồn lên.')}
          {khoi('Cột bảng chi tiết', '', ds, 'Tên hàng hoặc Diễn giải luôn hiện.')}
          {dsChan.length > 0 && khoi('Chân phiếu', 'chan:', dsChan, '')}
        </div>
        <div className="pn-chan">
          <button type="button" className="btn" onClick={() => onDoi(macDinh)}>Khôi phục mặc định</button>
          <span className="grow" />
          <button type="button" className="btn pri" autoFocus onClick={onDong}>Xong</button>
        </div>
      </aside>
    </>,
    document.body,
  )
}
