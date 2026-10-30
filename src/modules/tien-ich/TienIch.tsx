// Tiện ích có màn riêng: đồng bộ dữ liệu, hoá đơn đầu vào, duyệt chứng từ, cảnh báo, nhật ký thao tác
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Col, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { donViHienTai, useSession } from '../../app/session'
import { CUA_HANG, DONG_BO, HANG, KHO, NCC } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Kpi, Note, PageHead } from '../../ui/Page'
import { St, Table } from '../../ui/Table'
import { between, dmy, fold, k, pad, pick, rng } from '../../ui/format'
import { Select } from '../../ui/Dropdown'
import { useNhatKyDayDu, THAO_TAC, canChuY } from '../he-thong/nhatKyMau'
import { HopDongBo } from '../../ui/HopDongBo'

const dsKho = CUA_HANG.flatMap(c =>
  c.kho.map(ten => {
    const idx = KHO.indexOf(ten)
    const ma = idx >= 0 ? `K${String(idx + 1).padStart(2, '0')}` : `K_${c.id}`
    return { ma, ten, phu: c.ten }
  }),
)

const dsMon = HANG.map(h => `${h.ma} - ${h.ten}`)

export function DongBo({ sc, mod }: ScreenProps) {
  const { toast, s } = useSession()
  const [tu, setTu] = useState(true)
  const [moHop, setMoHop] = useState(false)
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip ok"><span className="pulse" />Đang chạy theo lịch</span>}>
        <button className="btn pri" onClick={() => setMoHop(true)}><Icon n="refresh" className="ic sm" />Tải ngay</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <Kpi icon="pos" l="Đơn POS hôm nay" v="1.894" d="3 cửa hàng, tới 14:20" />
        <Kpi icon="check" l="Đã vào sổ" v="1.892" d="99,9%" />
        <Kpi icon="alert" l="Lỗi chờ xử lý" v="2" d={<Link to="/app/trang-chu/ban-lam-viec">Xem trên Bàn làm việc</Link>} />
        <Kpi icon="clock" l="Lần chạy sau" v="14:35" d="Mỗi 15 phút" />
      </div>
      <div className="grid g-21" style={{ alignItems: 'start' }}>
        <Card title="Nhật ký đồng bộ" sub="Chạy lại không nhân đôi dữ liệu" pad={false}>
          <Table cols={[{ k: 'luc', t: 'Lúc', w: 100 }, { k: 'nguon', t: 'Nguồn' }, { k: 'loai', t: 'Dữ liệu' }, { k: 'pham', t: 'Phạm vi', cls: 'dim' }, { k: 'lay', t: 'Lấy về', num: true }, { k: 'vao', t: 'Vào sổ', num: true },
            { k: 'loi', t: 'Lỗi', num: true, r: r => r.loi ? <b style={{ color: 'var(--red)' }}>{r.loi}</b> : <span className="muted">0</span> }, { k: 'ai', t: 'Chạy bởi', cls: 'dim' }]} rows={DONG_BO} />
        </Card>
        <Card title="Cài đặt đồng bộ">
          <div className="stack" style={{ gap: 12 }}>
            <div className="seg"><button className={tu ? 'on' : ''} onClick={() => setTu(true)}>Tự động theo lịch</button><button className={!tu ? 'on' : ''} onClick={() => setTu(false)}>Bấm tải khi cần</button></div>
            {tu ? <>
              <div className="f"><label>Đơn bán FABi</label><Select className="inp"><option>Mỗi 15 phút</option><option>Theo ca</option><option>Cuối ngày 23:30</option></Select></div>
              <div className="f"><label>Phiếu kho iPOS Inventory</label><Select className="inp"><option>Mỗi giờ</option><option>Cuối ngày</option></Select></div>
            </> : <div className="f"><label>Khoảng ngày</label><input className="inp" defaultValue="01/10/2026 – 07/10/2026" /></div>}
            <div className="f"><label>Gom chứng từ bán hàng</label><Select className="inp"><option>Mỗi cửa hàng một chứng từ mỗi ngày</option><option>Mỗi ca một chứng từ</option></Select></div>
            <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => toast('Đã lưu cài đặt đồng bộ')}>Lưu cài đặt</button>
          </div>
        </Card>
      </div>
      {moHop && (
        <HopDongBo
          tieuDe="Đồng bộ dữ liệu bán hàng từ máy POS"
          phu="Chọn khoảng thời gian và kho cần lấy lại dữ liệu về hệ thống kế toán."
          nhanDs="Kho đồng bộ"
          ds={dsKho}
          coMon
          dsMon={dsMon}
          nhanLamLai="Đồng bộ lại hoá đơn đã có"
          nutChinh="Đồng bộ ngay"
          tichPhu={{
            nhan: 'Tự động hạch toán chứng từ theo phương thức thanh toán',
            ghiChu: 'Mỗi hoá đơn sinh một phiếu thu: Nợ TK của phương thức, Có 131',   // FABi kéo chi tiết theo hoá đơn (T247)
            macDinh: true,
          }}
          onDong={() => setMoHop(false)}
          onDongBo={({ tu: dTu, den: dDen, chon, tichPhu }) => {
            setMoHop(false)
            const soDon = chon.length === 3 ? 188 : chon.length * 62 + 2
            const vThu = tichPhu ? `, sinh ${soDon} phiếu thu theo phương thức thanh toán` : ''
            toast(`Đã đồng bộ ${soDon} đơn từ ${chon.length} kho, ${dmy(dTu)} đến ${dmy(dDen)}${vThu}`)
          }}
        />
      )}
    </div>
  )
}

export const TT_HD: Record<string, [string, string]> = { ok: ['ok', 'Hợp lệ, chờ hạch toán'], ht: ['dim', 'Đã hạch toán'], huy: ['err', 'Người bán đã huỷ'], mst: ['err', 'Sai mã số thuế người mua'], trung: ['warn', 'Trùng hoá đơn đã nhận'] }

export interface HoaDonDauVaoRow {
  id: number
  so: string
  ngay: string
  ban: string
  mst: string
  tien: number
  thue: number
  tt: string
}

export function dsHoaDonDauVao(): HoaDonDauVaoRow[] {
  const r = rng('hddv')
  return Array.from({ length: 23 }, (_, i) => {
    const n = pick(r, NCC), tien = k(between(r, 0.8e6, 36e6)), d = 7 - Math.floor(i / 4)
    const tt = i === 2 ? 'huy' : i === 6 ? 'mst' : i === 9 || i === 15 ? 'trung' : i === 12 ? 'huy' : i < 18 ? 'ok' : 'ht'
    return { id: i, so: `C26T${n.ma.slice(-2)}${pad(1200 + i * 7, 6)}`, ngay: `${pad(Math.max(1, d))}/10/2026`, ban: n.ten, mst: n.mst, tien, thue: Math.round(tien * 0.08), tt }
  })
}

export function HoaDonDauVao({ sc, mod }: ScreenProps) {
  const { toast, s } = useSession()
  const dv = donViHienTai(s)
  const [moHop, setMoHop] = useState(false)
  const dsCuaHang = CUA_HANG.map(c => ({
    ma: c.id.toUpperCase(),
    ten: c.ten,
    phu: dv.mst ? `MST: ${dv.mst}` : undefined,
  }))
  const rows = dsHoaDonDauVao()
  const cols: Col[] = [{ k: 'chk', t: '', w: 34, r: () => <input type="checkbox" /> }, { k: 'so', t: 'Số hoá đơn', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'ban', t: 'Người bán' }, { k: 'mst', t: 'MST người bán', cls: 'dim' },
    { k: 'tien', t: 'Tiền hàng', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tt', t: 'Kiểm tra', r: x => <St k={TT_HD[x.tt][0]}>{TT_HD[x.tt][1]}</St> }]
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Lưu trữ 10 năm</span>}>
        <button className="btn" onClick={() => setMoHop(true)}><Icon n="refresh" className="ic sm" />Tải từ iPOS Invoice</button>
        <button className="btn pri" onClick={() => toast('Đã hạch toán 13 hoá đơn hợp lệ')}><Icon n="check" className="ic sm" />Hạch toán hoá đơn hợp lệ</button>
      </PageHead>
      <Note icon="filein">Hoá đơn tải về được kiểm tra trạng thái trên hệ thống thuế, mã số thuế người mua, trùng lặp. Sau đó khớp với phiếu mua hàng nếu có.</Note>
      <section className="card" style={{ marginTop: 14 }}><Table cols={cols} rows={rows} rowCls={x => ['huy', 'mst'].includes(x.tt) ? 'bad' : ''} /></section>
      {moHop && (
        <HopDongBo
          tieuDe="Tải hoá đơn đầu vào từ iPOS Invoice"
          phu="Chọn khoảng thời gian và đơn vị nhận hoá đơn cần tải về."
          nhanDs="Đơn vị nhận hoá đơn"
          ds={dsCuaHang}
          nhanLamLai="Tải lại hoá đơn đã có"
          nutChinh="Tải hoá đơn"
          onDong={() => setMoHop(false)}
          onDongBo={({ tu: dTu, den: dDen, chon }) => {
            setMoHop(false)
            const soHd = chon.length === 3 ? 23 : chon.length * 8 + 3
            toast(`Đã tải ${soHd} hoá đơn từ ${chon.length} đơn vị nhận, ${dmy(dTu)} đến ${dmy(dDen)}`)
          }}
        />
      )}
    </div>
  )
}

export interface DuyetChungTuRow {
  id: string
  so: string
  ngay: string
  loai: string
  nguoi: string
  tien: number
}

export function dsDuyetChungTu(cap: number): DuyetChungTuRow[] {
  const r = rng('duyet' + cap)
  return Array.from({ length: cap === 1 ? 12 : 5 }, (_, i) => ({
    id: `${cap}-${i}`,
    so: `${pick(r, ['PC', 'MH', 'NVK'])}2610-${pad(120 + i * 3, 4)}`, ngay: `${pad(7 - (i % 6))}/10/2026`, loai: pick(r, ['Phiếu chi', 'Phiếu mua hàng', 'Chứng từ tổng hợp']),
    nguoi: pick(r, ['Lê Quốc Bảo', 'Phạm Ngọc Lan']), tien: k(between(r, 1.2e6, 64e6)),
  }))
}

export function DuyetChungTu({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const [cap, setCap] = useState(1)
  const rows = dsDuyetChungTu(cap)
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn">Trả lại</button>
        <button className="btn pri" onClick={() => toast(`Đã duyệt ${rows.length} chứng từ cấp ${cap}`)}><Icon n="check" className="ic sm" />Duyệt hàng loạt</button>
      </PageHead>
      <section className="card">
        <div className="tabs">
          <button className={cap === 1 ? 'on' : ''} onClick={() => setCap(1)}>Cấp 1: duyệt vào sổ<span className="n">12</span></button>
          <button className={cap === 2 ? 'on' : ''} onClick={() => setCap(2)}>Cấp 2: duyệt khoá chứng từ<span className="n">5</span></button>
        </div>
        <Table cols={[{ k: 'chk', t: '', w: 34, r: () => <input type="checkbox" defaultChecked /> }, { k: 'so', t: 'Số chứng từ', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'loai', t: 'Loại' },
          { k: 'nguoi', t: 'Người lập' }, { k: 'tien', t: 'Số tiền', num: true }]} rows={rows} />
      </section>
    </div>
  )
}

export type CanhBaoItem = [string, string, string, string, string]

export const DS_CANH_BAO: CanhBaoItem[] = [
  ['err', 'alert', 'Công nợ quá hạn 30 ngày', '4 khách công ty, tổng 86.400.000 đ. Lâu nhất 47 ngày: Công ty CP Du lịch Biển Xanh.', '/app/tien/2-2-5'],
  ['err', 'receipt', 'Hoá đơn đầu vào bị người bán huỷ', '2 hoá đơn đã nhận, 1 hoá đơn đã hạch toán cần điều chỉnh.', '/app/tien-ich/11-4'],
  ['warn', 'box', 'Tồn kho âm', 'Thịt bò thăn −2,4 kg, Bánh phở tươi −6 kg tại Kho bếp Lê Lợi.', '/app/kho/5-2-4'],
  ['warn', 'scale', 'Doanh thu lệch hoá đơn', 'Ngày 03/10 cửa hàng Lê Lợi lệch 85.000 đ.', '/app/tien-ich/11-7'],
  ['warn', 'flask', 'Giá vốn vượt định mức', 'Phở bò tái tháng 9: giá vốn 41% doanh thu, định mức 36%.', '/app/kho/5-2-6'],
  ['info', 'percent', 'Sắp đến hạn nộp tờ khai GTGT quý 3', 'Hạn 30/10/2026.', '/app/thue/6-2-3'],
]

export function CanhBao({ sc, mod }: ScreenProps) {
  const ds = DS_CANH_BAO
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">Gửi email cho kế toán trưởng lúc 08:00 hằng ngày</span>} />
      <Card title="Cảnh báo đang mở" sub={`${ds.length} cảnh báo`} pad={false}>
        {ds.map(([kk, ic, b, s, to]) => (
          <div className="task" key={b}>
            <span className={`task-ic ${kk}`}><Icon n={ic} /></span>
            <span className="task-b"><b>{b}</b><span>{s}</span></span>
            <Link className="btn sm" to={to}>Xem</Link>
          </div>
        ))}
      </Card>
    </div>
  )
}

export function NhatKyThaoTac({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const dv = donViHienTai(s)
  const tatCa = useNhatKyDayDu()

  const [chonMa, setChonMa] = useState<string | null>(() => tatCa[0]?.ma ?? null)
  const [locThaoTac, setLocThaoTac] = useState('')
  const [locTaiKhoan, setLocTaiKhoan] = useState('')
  const [locCuaHang, setLocCuaHang] = useState('')
  const [locLoaiPhieu, setLocLoaiPhieu] = useState('')
  const [locKetQua, setLocKetQua] = useState('')
  const [chiChuY, setChiChuY] = useState(false)
  const [tim, setTim] = useState('')

  const dsTaiKhoan = useMemo(() => Array.from(new Set(tatCa.map(d => d.ai).filter(Boolean))), [tatCa])
  const dsCuaHang = useMemo(() => Array.from(new Set(tatCa.map(d => d.ch).filter(Boolean))), [tatCa])
  const dsLoaiPhieu = useMemo(() => Array.from(new Set(tatCa.map(d => d.loai).filter(Boolean))), [tatCa])
  const soChuY = useMemo(() => tatCa.filter(canChuY).length, [tatCa])

  const dsHienThi = useMemo(() => {
    const q = fold(tim.trim())
    return tatCa.filter(d => {
      if (chiChuY && !canChuY(d)) return false
      if (locThaoTac && d.tt !== locThaoTac) return false
      if (locTaiKhoan && d.ai !== locTaiKhoan) return false
      if (locCuaHang && d.ch !== locCuaHang) return false
      if (locLoaiPhieu && d.loai !== locLoaiPhieu) return false
      if (locKetQua === 'tc' && d.kqLoi) return false
      if (locKetQua === 'ktc' && !d.kqLoi) return false
      if (q) {
        const khop =
          fold(d.so).includes(q) ||
          fold(d.dg).includes(q) ||
          fold(d.ai).includes(q) ||
          fold(d.tk).includes(q)
        if (!khop) return false
      }
      return true
    })
  }, [tatCa, chiChuY, locThaoTac, locTaiKhoan, locCuaHang, locLoaiPhieu, locKetQua, tim])

  const locDem = (locThaoTac ? 1 : 0) + (locTaiKhoan ? 1 : 0) + (locCuaHang ? 1 : 0) + (locLoaiPhieu ? 1 : 0) + (locKetQua ? 1 : 0) + (chiChuY ? 1 : 0) + (tim.trim() ? 1 : 0)

  const dongChon = useMemo(() => {
    if (chonMa === null) return null
    return dsHienThi.find(d => d.ma === chonMa) ?? dsHienThi[0] ?? null
  }, [dsHienThi, chonMa])

  const tieuDe = dongChon
    ? (dongChon.so
        ? `${dongChon.tt} ${dongChon.loai.toLowerCase()} ${dongChon.so}`
        : (dongChon.tt === 'Xem báo cáo' || dongChon.tt === 'Xuất Excel')
          ? `${dongChon.tt}: ${dongChon.dg}`
          : `${dongChon.tt}${dongChon.dg ? ': ' + dongChon.dg : ''}`)
    : ''

  return (
    <div className="page">
      <PageHead
        crumb={[mod.ten, sc.nhom ?? '']}
        title={tenMan(sc)}
        code={sc.code}
        meta={<span className="chip" data-hd="ghiChu">Nhật ký không sửa, không xoá được. Lưu 10 năm theo chứng từ kế toán.</span>}
      />

      <div className="nk-than">
        <section className="nk-bang" data-hd="bang">
          <div className="ds-toolbar-figma" data-hd="loc">
            <button
              type="button"
              className={`ds-btn-pheu-figma${locDem > 0 ? ' on' : ''}`}
              aria-label={`Bộ lọc nâng cao${locDem > 0 ? `, đang lọc ${locDem} điều kiện` : ''}`}
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h18l-7 8v6l-4-2v-4z" />
              </svg>
              {locDem > 0 && <span className="ds-badge-so">{locDem}</span>}
            </button>

            <button type="button" className="ds-chip-ky-figma" aria-label="Kỳ kế toán">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              01/10/2026 – 07/10/2026
            </button>

            <label className="ds-o">
              <span className="ds-o-nhan">Thao tác</span>
              <select
                className="ds-o-sel"
                aria-label="Thao tác"
                value={locThaoTac}
                onChange={e => setLocThaoTac(e.target.value)}
              >
                <option value="">Tất cả</option>
                {THAO_TAC.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="ds-o">
              <span className="ds-o-nhan">Tài khoản</span>
              <select
                className="ds-o-sel"
                aria-label="Tài khoản"
                value={locTaiKhoan}
                onChange={e => setLocTaiKhoan(e.target.value)}
              >
                <option value="">Tất cả</option>
                {dsTaiKhoan.map(tk => (
                  <option key={tk} value={tk}>{tk}</option>
                ))}
              </select>
            </label>

            <label className="ds-o">
              <span className="ds-o-nhan">Cửa hàng</span>
              <select
                className="ds-o-sel"
                aria-label="Cửa hàng"
                value={locCuaHang}
                onChange={e => setLocCuaHang(e.target.value)}
              >
                <option value="">Tất cả</option>
                {dsCuaHang.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </label>

            <label className="ds-o">
              <span className="ds-o-nhan">Loại phiếu</span>
              <select
                className="ds-o-sel"
                aria-label="Loại phiếu"
                value={locLoaiPhieu}
                onChange={e => setLocLoaiPhieu(e.target.value)}
              >
                <option value="">Tất cả</option>
                {dsLoaiPhieu.map(lp => (
                  <option key={lp} value={lp}>{lp}</option>
                ))}
              </select>
            </label>

            <label className="ds-o">
              <span className="ds-o-nhan">Kết quả</span>
              <select
                className="ds-o-sel"
                aria-label="Kết quả"
                value={locKetQua}
                onChange={e => setLocKetQua(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="tc">Thành công</option>
                <option value="ktc">Không thành công</option>
              </select>
            </label>

            <button
              type="button"
              className={`nk-btn-chuy${chiChuY ? ' bat' : ''}`}
              onClick={() => setChiChuY(v => !v)}
              aria-pressed={chiChuY}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 2 20h20z" />
                <path d="M12 10v4M12 17h.01" />
              </svg>
              Cần chú ý ({soChuY})
            </button>

            <div className="ds-toolbar-phai">
              <div className="ds-tim-figma">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  aria-label="Tìm nhật ký"
                  placeholder="Số chứng từ, diễn giải"
                  value={tim}
                  onChange={e => setTim(e.target.value)}
                />
              </div>
              <button type="button" className="ds-nut-vuong-36" aria-label="Chọn cột hiển thị">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M9 4v16M15 4v16" />
                </svg>
              </button>
              <button type="button" className="ds-nut-vuong-36 ds-nut-excel" aria-label="Xuất Excel">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
              </button>
            </div>
          </div>

          <div className="nk-bang-cuon">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ngày thao tác</th>
                  <th>Tài khoản</th>
                  <th>Thao tác</th>
                  <th>Cửa hàng</th>
                  <th>Loại phiếu</th>
                  <th>Số chứng từ</th>
                  <th>Ngày chứng từ</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                  <th>Diễn giải</th>
                  <th>Kết quả</th>
                  <th>Thiết bị</th>
                </tr>
              </thead>
              <tbody>
                {dsHienThi.map(d => {
                  const dangChon = d.ma === dongChon?.ma
                  const coChuY = canChuY(d)
                  return (
                    <tr
                      key={d.ma}
                      className={dangChon ? 'dang-chon' : ''}
                      onClick={() => setChonMa(d.ma)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{d.luc}</td>
                      <td>{d.ai}</td>
                      <td style={{ fontWeight: 600 }}>
                        <span className="nk-tt-cot">
                          {d.tt}
                          {coChuY && (
                            <svg role="img" aria-label="Cần chú ý" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--orange-d)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
                              <path d="M12 3 2 20h20z" />
                              <path d="M12 10v4M12 17h.01" />
                            </svg>
                          )}
                        </span>
                      </td>
                      <td>{d.ch}</td>
                      <td>{d.loai}</td>
                      <td>
                        {d.so ? <span className="ds-link-so">{d.so}</span> : ''}
                      </td>
                      <td>{d.ngay}</td>
                      <td style={{ textAlign: 'right' }}>{d.tien}</td>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.dg}>{d.dg}</td>
                      <td style={{ color: d.kqLoi ? 'var(--red)' : undefined }}>
                        {d.kqLoi ? 'Không thành công' : 'Thành công'}
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{d.tbNgan}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="nk-dem">
            <span>Hiển thị {dsHienThi.length} dòng</span>
          </div>
        </section>

        {dongChon && (
          <aside className="nk-pa" data-hd="chiTiet">
            <div className="nk-pa-dau">
              <div className="nk-pa-dau-chu">
                <h2 className="nk-pa-tieu-de">{tieuDe}</h2>
                <div className="nk-pa-phu">Mã nhật ký {dongChon.ma} · {dongChon.luc}:{dongChon.giay}</div>
              </div>
              {dongChon.so && dongChon.tt !== 'Xoá' && (
                <button
                  type="button"
                  className="btn pri"
                  style={{ height: 36, padding: '0 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, flex: 'none' }}
                >
                  Mở phiếu
                </button>
              )}
              <button
                type="button"
                className="nk-nut-vuong"
                aria-label="Đóng"
                onClick={() => setChonMa(null)}
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="nk-pa-than">
              {dongChon.canhBao && (
                <div className="nk-canh-bao">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange-d)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: 2 }}>
                    <path d="M12 3 2 20h20z" />
                    <path d="M12 10v4M12 17h.01" />
                  </svg>
                  <span>{dongChon.canhBao}</span>
                </div>
              )}

              <div className="nk-muc">
                <h3 className="nk-muc-t">Ai làm, làm ở đâu</h3>
                <div className="nk-luoi">
                  <div className="nk-tt">
                    <span className="nk-tt-n">Tài khoản</span>
                    <span className="nk-tt-g">{dongChon.ai}</span>
                    {dongChon.tk && <span className="nk-tt-p">{dongChon.tk}</span>}
                  </div>
                  {s.goi !== 'S' && (
                    <div className="nk-tt">
                      <span className="nk-tt-n">Vai trò lúc thao tác</span>
                      <span className="nk-tt-g">{dongChon.vaiTro}</span>
                    </div>
                  )}
                  <div className="nk-tt">
                    <span className="nk-tt-n">Đơn vị</span>
                    <span className="nk-tt-g">{dv?.ten ?? 'Công ty TNHH Phố Mây'}</span>
                  </div>
                  <div className="nk-tt">
                    <span className="nk-tt-n">Cửa hàng</span>
                    <span className="nk-tt-g">{dongChon.ch || 'Không gắn cửa hàng'}</span>
                  </div>
                  <div className="nk-tt">
                    <span className="nk-tt-n">Thiết bị</span>
                    <span className="nk-tt-g">{dongChon.tb}</span>
                  </div>
                  <div className="nk-tt">
                    <span className="nk-tt-n">Phiên đăng nhập</span>
                    <span className="nk-tt-g">{dongChon.phien}</span>
                  </div>
                  <div className="nk-tt">
                    <span className="nk-tt-n">Màn hình</span>
                    <span className="nk-tt-g">{dongChon.manHinh}</span>
                  </div>
                  <div className="nk-tt">
                    <span className="nk-tt-n">Kết quả</span>
                    <span className="nk-tt-g" style={{ color: dongChon.kqLoi ? 'var(--red)' : undefined }}>
                      {dongChon.kqLoi ? `Không thành công, ${dongChon.kqLoi.toLowerCase()}` : 'Thành công'}
                    </span>
                  </div>
                </div>
              </div>

              {dongChon.so && (
                <div className="nk-muc">
                  <h3 className="nk-muc-t">Chứng từ</h3>
                  <div className="nk-luoi">
                    {dongChon.loai && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Loại phiếu</span>
                        <span className="nk-tt-g">{dongChon.loai}</span>
                      </div>
                    )}
                    {dongChon.so && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Số chứng từ</span>
                        <span className="ds-link-so">{dongChon.so}</span>
                      </div>
                    )}
                    {dongChon.ngay && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Ngày chứng từ</span>
                        <span className="nk-tt-g">{dongChon.ngay}</span>
                      </div>
                    )}
                    {dongChon.ky && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Kỳ kế toán</span>
                        <span className="nk-tt-g">{dongChon.ky}</span>
                      </div>
                    )}
                    {dongChon.doiTuong && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Đối tượng</span>
                        <span className="nk-tt-g">{dongChon.doiTuong}</span>
                      </div>
                    )}
                    {dongChon.tien && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Số tiền</span>
                        <span className="nk-tt-g" style={{ fontWeight: 600 }}>{dongChon.tien}</span>
                      </div>
                    )}
                    {dongChon.trangThai && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Trạng thái</span>
                        <span className="nk-tt-g">{dongChon.trangThai}</span>
                      </div>
                    )}
                    {dongChon.nguon && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Nguồn</span>
                        <span className="nk-tt-g">{dongChon.nguon}</span>
                      </div>
                    )}
                  </div>
                  {dongChon.dg && (
                    <div className="nk-tt" style={{ marginTop: 10 }}>
                      <span className="nk-tt-n">Diễn giải</span>
                      <span className="nk-tt-g">{dongChon.dg}</span>
                    </div>
                  )}
                </div>
              )}

              {dongChon.thamSo && (
                <div className="nk-muc">
                  <h3 className="nk-muc-t">Báo cáo</h3>
                  <div className="nk-luoi">
                    {dongChon.dg && (
                      <div className="nk-tt">
                        <span className="nk-tt-n">Tên báo cáo</span>
                        <span className="nk-tt-g">{dongChon.dg}</span>
                      </div>
                    )}
                    <div className="nk-tt">
                      <span className="nk-tt-n">Điều kiện lọc</span>
                      <span className="nk-tt-g">{dongChon.thamSo}</span>
                    </div>
                  </div>
                </div>
              )}

              {dongChon.lyDo && (
                <div className="nk-muc">
                  <h3 className="nk-muc-t">Lý do người làm nhập</h3>
                  <div style={{ fontSize: '13.5px', color: 'var(--ink)' }}>{dongChon.lyDo}</div>
                </div>
              )}

              {dongChon.doi && dongChon.doi.length > 0 && (
                <div className="nk-muc">
                  <h3 className="nk-muc-t">Nội dung thay đổi ({dongChon.doi.length})</h3>
                  <div className="nk-doi-bang-wrap">
                    <table className="nk-doi-bang">
                      <thead>
                        <tr>
                          <th style={{ width: '34%' }}>Trường</th>
                          <th style={{ width: '33%' }}>Trước</th>
                          <th>Sau</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dongChon.doi.map((d, i) => (
                          <tr key={i}>
                            <td className="nk-doi-truong">{d.truong}</td>
                            <td className="nk-doi-cu">{d.cu}</td>
                            <td className="nk-doi-moi">{d.moi}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {dongChon.lichSu && dongChon.lichSu.length > 0 && (
                <div className="nk-muc" style={{ borderBottom: 0 }}>
                  <h3 className="nk-muc-t">Lịch sử chứng từ {dongChon.so}</h3>
                  <div className="nk-ls-ds">
                    {dongChon.lichSu.map((h, i) => (
                      <div key={i} className="nk-ls-dong">
                        <div className="nk-ls-cot">
                          <span className={`nk-ls-cham${h.dangXem ? ' on' : ''}`} />
                          {i < dongChon.lichSu!.length - 1 && <span className="nk-ls-vach" />}
                        </div>
                        <div className="nk-ls-noi-dung">
                          <div className={`nk-ls-viec${h.dangXem ? ' on' : ''}`}>{h.viec}</div>
                          <div className="nk-ls-phu">{h.luc} · {h.ai}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
