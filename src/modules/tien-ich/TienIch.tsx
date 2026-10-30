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
import { useNhatKyDayDu, THAO_TAC_GOI, HOM_NAY, laHomNay, dongTu, doiTuongTT, vietTat } from '../he-thong/nhatKyMau'
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
  const tatCa = useNhatKyDayDu(s.goi)

  const [chonMa, setChonMa] = useState<string | null>(() => tatCa[0]?.ma ?? null)
  const [locThaoTac, setLocThaoTac] = useState('')
  const [locCuaHang, setLocCuaHang] = useState('')
  const [tim, setTim] = useState('')

  const dsThaoTac = THAO_TAC_GOI[s.goi] ?? THAO_TAC_GOI.S
  const dsCuaHang = useMemo(() => Array.from(new Set(tatCa.map(d => d.ch).filter(Boolean))), [tatCa])

  const dsHienThi = useMemo(() => {
    const q = fold(tim.trim())
    return tatCa.filter(d => {
      if (!laHomNay(d)) return false
      if (locThaoTac && d.tt !== locThaoTac) return false
      if (locCuaHang && d.ch !== locCuaHang) return false
      if (q) {
        const khop =
          fold(d.so).includes(q) ||
          fold(d.ai).includes(q) ||
          fold(d.tk).includes(q)
        if (!khop) return false
      }
      return true
    })
  }, [tatCa, locThaoTac, locCuaHang, tim])

  const dongChon = useMemo(() => {
    if (chonMa === null) return null
    return dsHienThi.find(d => d.ma === chonMa) ?? dsHienThi[0] ?? null
  }, [dsHienThi, chonMa])

  return (
    <div className="page">
      <PageHead
        crumb={[mod.ten, sc.nhom ?? '']}
        title="Nhật ký thao tác"
        code={sc.code}
      />

      <div className="nk-than">
        <section className="nk-bang" data-hd="bang">
          <div className="ds-toolbar-figma" data-hd="loc">
            <button
              type="button"
              className="ds-btn-pheu-figma"
              aria-label="Bộ lọc"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 5h18l-7 8v6l-4-2v-4z" />
              </svg>
            </button>

            <button type="button" className="ds-chip-ky-figma" aria-label="Kỳ kế toán">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              Hôm nay: {HOM_NAY}
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
                {dsThaoTac.map(t => (
                  <option key={t} value={t}>{t}</option>
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

            <div className="ds-toolbar-phai">
              <div className="ds-tim-figma">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="text"
                  aria-label="Tìm nhật ký"
                  placeholder="Tìm số chứng từ, tài khoản"
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
            </div>
          </div>

          <div className="nk-bang-cuon">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 164 }}>Ngày giờ thao tác</th>
                  <th style={{ width: 150 }}>Tài khoản</th>
                  <th style={{ width: 136 }}>Chức vụ</th>
                  <th style={{ width: 110 }}>Thao tác</th>
                  <th style={{ width: 160 }}>Tên chứng từ</th>
                  <th style={{ width: 136 }}>Số chứng từ</th>
                  <th style={{ width: 120 }}>Ngày chứng từ</th>
                  <th style={{ width: 170 }}>Cửa hàng</th>
                  <th style={{ width: 248, borderRight: 0 }}>Thiết bị</th>
                </tr>
              </thead>
              <tbody>
                {dsHienThi.map(d => {
                  const dangChon = d.ma === dongChon?.ma
                  return (
                    <tr
                      key={d.ma}
                      className={dangChon ? 'dang-chon' : ''}
                      onClick={() => setChonMa(d.ma)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{d.luc}:{d.giay}</td>
                      <td>{d.ai}</td>
                      <td>{d.vaiTro}</td>
                      <td>{d.tt}</td>
                      <td>{d.loai}</td>
                      <td>
                        {d.so ? <span className="ds-link-so">{d.so}</span> : ''}
                      </td>
                      <td>{d.ngay}</td>
                      <td>{d.ch}</td>
                      <td style={{ borderRight: 0 }}>{d.tb}</td>
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
          <aside className="nk-pa" data-hd="chiTiet" aria-label="Chi tiết nhật ký">
            <div className="nk-hd">
              <span className="nk-av">{vietTat(dongChon.ai)}</span>
              <div className="nk-hd-t">
                <b>{dongChon.ai}</b> {dongTu(dongChon)} {doiTuongTT(dongChon) ? <b>{doiTuongTT(dongChon)}</b> : null}
              </div>
            </div>

            <div className="nk-pa-than">
              {dongChon.canhBao && (
                <div className="nk-cb">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange-d)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 2 20h20z" />
                    <path d="M12 10v4M12 17h.01" />
                  </svg>
                  <span>{dongChon.canhBao}</span>
                </div>
              )}

              <div className="nk-muc">
                <h3 className="nk-mt">Thông tin chi tiết</h3>
                <div className="nk-ds">
                  <div className="nk-dsr">
                    <span className="nk-dsn">Tài khoản</span>
                    <span className="nk-dsg">
                      {dongChon.ai} {dongChon.tk && <span style={{ color: 'var(--muted)' }}>({dongChon.tk})</span>}
                    </span>
                  </div>
                  <div className="nk-dsr">
                    <span className="nk-dsn">Chức vụ</span>
                    <span className="nk-dsg">{dongChon.vaiTro}</span>
                  </div>
                  <div className="nk-dsr">
                    <span className="nk-dsn">Thao tác</span>
                    <span className="nk-dsg">{dongChon.tt}</span>
                  </div>
                  <div className="nk-dsr">
                    <span className="nk-dsn">Thời gian thao tác</span>
                    <span className="nk-dsg">{dongChon.luc}:{dongChon.giay}</span>
                  </div>
                  <div className="nk-dsr">
                    <span className="nk-dsn">Thiết bị</span>
                    <span className="nk-dsg">{dongChon.tb}</span>
                  </div>
                </div>
              </div>

              {dongChon.so && (
                <div className="nk-muc">
                  <h3 className="nk-mt">Chứng từ</h3>
                  <div className="nk-ds">
                    <div className="nk-dsr">
                      <span className="nk-dsn">Tên chứng từ</span>
                      <span className="nk-dsg">{dongChon.loai}</span>
                    </div>
                    <div className="nk-dsr">
                      <span className="nk-dsn">Số chứng từ</span>
                      <span className="nk-dsg">
                        <a href="#" className="ds-link-so" onClick={e => e.preventDefault()}>{dongChon.so}</a>
                      </span>
                    </div>
                    <div className="nk-dsr">
                      <span className="nk-dsn">Ngày chứng từ</span>
                      <span className="nk-dsg">{dongChon.ngay}</span>
                    </div>
                    <div className="nk-dsr">
                      <span className="nk-dsn">Cửa hàng</span>
                      <span className="nk-dsg">{dongChon.ch || 'Không gắn cửa hàng'}</span>
                    </div>
                    {s.goi !== 'S' && (
                      <div className="nk-dsr">
                        <span className="nk-dsn">Trạng thái</span>
                        <span className="nk-dsg">{dongChon.trangThai}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="nk-muc">
                <h3 className="nk-mt">Lịch sử thao tác</h3>
                <ol className="nk-nd">
                  {(dongChon.noiDung || []).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ol>
                {dongChon.lyDo && (
                  <div className="nk-ly">
                    <span className="nk-nho">Lý do người làm nhập</span>
                    <div>{dongChon.lyDo}</div>
                  </div>
                )}
                <div className="nk-nho" style={{ margin: '16px 0 12px' }}>Mã nhật ký {dongChon.ma}</div>
              </div>
            </div>

            <div className="nk-pa-day">
              <button
                type="button"
                className="nk-btn-dong"
                onClick={() => setChonMa(null)}
              >
                Đóng
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
