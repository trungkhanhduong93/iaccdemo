// Sổ, báo cáo chung: thanh lọc kỳ, trang báo cáo kiểu mẫu in, ô ký. Chi nhánh lấy trên thanh trên
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { chiNhanhHienTai, donViHienTai, useSession } from '../../app/session'
import { GOI, type Goi } from '../../app/plan'
import { CHI_NHANH, HANG, KHACH, NCC, NVL } from '../../data/mock'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { Table } from '../Table'
import { between, k, money, pick, rng } from '../format'
import { chungTu, soChiTiet } from './gen'
import { NutVuong, ThanhLoc } from '../ThanhLoc'
import { khoangThang } from '../ChonNgay'

export const KY_CHON: [string, string][] = [['9', 'Tháng 9/2026'], ['10', 'Tháng 10/2026 (đến 07/10)'], ['8', 'Tháng 8/2026']]

export function ReportToolbar({ ky, setKy, children }: { ky: string; setKy: (v: string) => void; children?: ReactNode }) {
  // Số liệu báo cáo mẫu tính theo tháng, nên lấy tháng của ngày bắt đầu làm kỳ.
  const [khoang, setKhoang] = useState(() => khoangThang(Number(ky), 2026))

  useEffect(() => {
    const thang = Number(ky)
    if (thang && khoang.tu.getMonth() + 1 !== thang) {
      setKhoang(khoangThang(thang, 2026))
    }
  }, [ky])

  return (
    <ThanhLoc
      ngay={{
        value: khoang,
        onChange: k => {
          setKhoang(k)
          setKy(String(k.tu.getMonth() + 1))
        },
      }}
      boLoc={children}
      phai={
        <>
          <NutVuong icon="printer" title="In" />
          <NutVuong icon="download" title="Xuất Excel" />
          <NutVuong icon="doc" title="Xuất PDF" />
        </>
      }
    />
  )
}

/** Trang báo cáo theo mẫu: đầu trang đơn vị, mẫu số, tiêu đề, kỳ, ô ký */
export function ReportPaper({ title, sub, mau, goi, children, ky = true }: { title: string; sub: string; mau?: string; goi: Goi; children: ReactNode; ky?: boolean }) {
  const { s } = useSession()
  const dv = donViHienTai(s)
  return (
    <div className="paper">
      <div className="paper-h">
        <div><b>Đơn vị: {dv.ten}</b><br />Địa chỉ: {dv.diaChi}<br />MST: {dv.mst}</div>
        {mau && goi !== 'F' && <div style={{ textAlign: 'center' }}><b>Mẫu số {mau}</b><br /><i>(Theo {GOI[goi].cheDo})</i></div>}
      </div>
      <h2>{title}</h2>
      <div className="sub">{sub}</div>
      <div className="unit">Đơn vị tính: đồng</div>
      {children}
      {ky && (
        <div className="sign">
          <div><b>Người lập biểu</b><i>(Ký, họ tên)</i>Lê Quốc Bảo</div>
          <div><b>Kế toán trưởng</b><i>(Ký, họ tên)</i>Trần Thu Hà</div>
          <div><b>Người đại diện theo pháp luật</b><i>(Ký, họ tên, đóng dấu)</i>{dv.nguoiDaiDien}</div>
        </div>
      )}
    </div>
  )
}

const kyTen = (ky: string) => KY_CHON.find(x => x[0] === ky)?.[1].replace(' (đến 07/10)', '') || `Tháng ${ky}/2026`
const dsTongHop: Record<string, { ma: string; ten: string }[]> = {
  kh: KHACH, ncc: NCC, hang: HANG, nvl: NVL, cn: CHI_NHANH.map(c => ({ ma: c.id.toUpperCase(), ten: c.ten })),
  tk: [['1111', 'Tiền mặt'], ['1121', 'Tiền gửi ngân hàng'], ['131', 'Phải thu của khách hàng'], ['1331', 'Thuế GTGT được khấu trừ'], ['152', 'Nguyên liệu, vật liệu'],
    ['156', 'Hàng hoá'], ['211', 'Tài sản cố định'], ['242', 'Chi phí trả trước'], ['331', 'Phải trả cho người bán'], ['33311', 'Thuế GTGT đầu ra'],
    ['334', 'Phải trả người lao động'], ['411', 'Vốn đầu tư của chủ sở hữu'], ['421', 'Lợi nhuận chưa phân phối'], ['511', 'Doanh thu bán hàng'], ['632', 'Giá vốn hàng bán'], ['642', 'Chi phí quản lý kinh doanh']].map(([ma, ten]) => ({ ma, ten })),
  ts: [['TS001', 'Hệ thống bếp công nghiệp Lê Lợi'], ['TS002', 'Tủ đông 1.500 lít'], ['TS003', 'Máy pha cà phê La Marzocco'], ['TS004', 'Hệ thống điều hoà Thảo Điền'], ['TS005', 'Xe tải giao hàng 1,5 tấn']].map(([ma, ten]) => ({ ma, ten })),
  ccdc: [['CC001', 'Bộ nồi inox 50 lít'], ['CC002', 'Bàn ghế gỗ khu ngoài trời'], ['CC003', 'Máy POS cầm tay'], ['CC004', 'Máy xay sinh tố công nghiệp'], ['CC005', 'Dao thớt bếp trọn bộ']].map(([ma, ten]) => ({ ma, ten })),
}

export function ReportScreen({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const [ky, setKy] = useState('9')
  const cfg: ReportCfg = sc.report ?? { kieu: 'tonghop', doiTuong: 'tk' }
  const ten = tenMan(sc)
  const thang = Number(ky)
  const cn = cfg.theoCn ? chiNhanhHienTai(s) : undefined
  const body = useMemo(() => renderReport(cfg, sc.code ?? sc.slug, thang, cn?.id), [cfg, ky, sc, cn])
  const sub = cfg.theoCn ? `${kyTen(ky)} · ${cn ? 'Chi nhánh ' + cn.ngan : 'Tất cả chi nhánh'}` : kyTen(ky)
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={ten} code={sc.code} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy} />
        <ReportPaper title={ten} sub={sub} mau={s.goi === 'PL' ? cfg.mau : undefined} goi={s.goi}>{body}</ReportPaper>
      </section>
    </div>
  )
}

/** Gộp sổ của nhiều chi nhánh: xếp theo ngày, thêm cột chi nhánh, tính lại số dư luỹ kế */
export function gopSo(phan: { cn: string; mo: number; rows: Row[]; tn: number; tc: number }[]) {
  const mo = phan.reduce((a, p) => a + p.mo, 0)
  const ngay = (x: Row) => Number(String(x.ngay).slice(0, 2))
  const rows = phan.flatMap(p => p.rows.map((x): Row => ({ ...x, cn: p.cn }))).sort((a, b) => ngay(a) - ngay(b))
  let du = mo
  for (const x of rows) { du += (x.no ?? 0) - (x.co ?? 0); x.du = du }
  return { mo, rows, tn: phan.reduce((a, p) => a + p.tn, 0), tc: phan.reduce((a, p) => a + p.tc, 0), cuoi: du }
}

function renderReport(cfg: ReportCfg, seed: string, thang: number, cn?: string): ReactNode {
  const r = rng(seed + thang)
  // Sổ, báo cáo theo chi nhánh: mỗi chi nhánh một hạt giống riêng, xem tất cả thì cộng các chi nhánh
  const dsCn = cfg.theoCn ? CHI_NHANH.filter(c => !cn || c.id === cn) : []
  if (cfg.kieu === 'so') {
    const soMot = (hat: string) => soChiTiet(hat, k(between(rng(hat + thang), 80e6, 260e6) / (cfg.theoCn ? 3 : 1)), ['Thu tiền bán hàng ngày', 'Chi mua nguyên vật liệu', 'Chi tiền điện tháng', 'Thu tiền khách công ty',
      'Chi tạm ứng nhân viên', 'Nộp tiền vào tài khoản ngân hàng', 'Chi phí vận chuyển', 'Thu hoàn ứng'], ['5111', '331', '6422', '131', '141', '1121', '6421'], [1.5e6, 38e6], thang)
    const gop = dsCn.length > 1
    const so = cfg.theoCn ? gopSo(dsCn.map(c => ({ cn: c.ngan, ...soMot(seed + c.id) }))) : soMot(seed)
    const cols: Col[] = [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số chứng từ', cls: 'code', w: 130 }, ...(gop ? [{ k: 'cn', t: 'Chi nhánh', w: 110 } as Col] : []), { k: 'dienGiai', t: 'Diễn giải' },
      { k: 'tk', t: 'TK đối ứng', c: true, w: 90 }, { k: 'no', t: 'Phát sinh Nợ', num: true }, { k: 'co', t: 'Phát sinh Có', num: true }, { k: 'du', t: 'Số dư', num: true }]
    return <RptTable cols={cols} rows={[{ dienGiai: 'Số dư đầu kỳ', du: so.mo, _b: 1 }, ...so.rows, { dienGiai: 'Cộng phát sinh', no: so.tn, co: so.tc, _t: 1 }, { dienGiai: 'Số dư cuối kỳ', du: so.cuoi, _t: 1 }]} />
  }
  if (cfg.kieu === 'dinhmuc') {
    const rows = NVL.slice(0, 10).map(n => {
      const dm = Math.round(between(r, 40, 400)), tt = Math.round(dm * between(r, 0.93, 1.12))
      return { ma: n.ma, ten: n.ten, dvt: n.dvt, dm, tt, cl: tt - dm, pct: ((tt - dm) / dm * 100).toFixed(1).replace('.', ',') + '%', gt: (tt - dm) * n.gia / (n.gia > 100000 ? 10 : 1) }
    })
    return <RptTable cols={[{ k: 'ma', t: 'Mã NVL', cls: 'code' }, { k: 'ten', t: 'Tên nguyên vật liệu' }, { k: 'dvt', t: 'ĐVT', c: true }, { k: 'dm', t: 'Theo định mức', num: true },
      { k: 'tt', t: 'Thực tế xuất', num: true }, { k: 'cl', t: 'Chênh lệch', num: true, r: x => <b style={{ color: x.cl > 0 ? 'var(--red)' : 'var(--green)' }}>{x.cl > 0 ? '+' : ''}{money(x.cl)}</b> },
      { k: 'pct', t: 'Tỷ lệ', num: true }, { k: 'gt', t: 'Giá trị chênh lệch', num: true }]} rows={rows} />
  }
  if (cfg.kieu === 'bangke') {
    if (cfg.cols && cfg.rows) return <RptTable cols={cfg.cols} rows={cfg.rows(thang)} />
    const rows = chungTu({ prefix: 'HD', doiTuong: 'ncc', dienGiai: ['Mua hàng'], tien: [2e6, 40e6], dong: 'nvl' }, seed).filter(x => x.thang === thang || thang === 8)
    return <RptTable cols={[{ k: 'stt', t: 'STT', c: true, w: 50 }, { k: 'so', t: 'Số hoá đơn', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'doiTuong', t: 'Tên người bán' },
      { k: 'tien', t: 'Giá trị chưa thuế', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }]}
      rows={[...rows.map((x, i) => ({ ...x, stt: i + 1 })), { doiTuong: 'Tổng cộng', tien: rows.reduce((a, x) => a + x.tien, 0), thue: rows.reduce((a, x) => a + x.thue, 0), _t: 1 }]} />
  }
  const ds = dsTongHop[cfg.doiTuong ?? 'tk']
  const motBo = (r: () => number, chia: number) => ds.map(() => {
    const dau = k(between(r, 5e6, 220e6) / chia), tang = k(between(r, 2e6, 180e6) / chia), giam = k(Math.min(dau + tang, between(r, 2e6, 190e6) / chia))
    return { dau, tang, giam }
  })
  const bo = cfg.theoCn ? dsCn.map(c => motBo(rng(seed + c.id + thang), 3)) : [motBo(r, 1)]
  const rows = ds.map((d, i) => {
    const [dau, tang, giam] = (['dau', 'tang', 'giam'] as const).map(f => bo.reduce((a, b) => a + b[i][f], 0))
    return { ma: d.ma, ten: d.ten, dau, tang, giam, cuoi: dau + tang - giam }
  })
  const s = (f: string) => rows.reduce((a, x) => a + (x as Row)[f], 0)
  return <RptTable cols={[{ k: 'ma', t: 'Mã', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên' }, { k: 'dau', t: 'Đầu kỳ', num: true }, { k: 'tang', t: 'Phát sinh tăng', num: true },
    { k: 'giam', t: 'Phát sinh giảm', num: true }, { k: 'cuoi', t: 'Cuối kỳ', num: true }]}
    rows={[...rows, { ten: 'Tổng cộng', dau: s('dau'), tang: s('tang'), giam: s('giam'), cuoi: s('cuoi'), _t: 1 }]} />
}

/** Bảng in kiểu báo cáo: dòng _b in đậm, _t dòng tổng */
export function RptTable({ cols, rows, onRow }: { cols: Col[]; rows: Row[]; onRow?: (r: Row) => void }) {
  return (
    <table className="rpt">
      <thead><tr>{cols.map(c => <th key={c.k} style={c.w ? { width: c.w } : undefined}>{c.t}</th>)}</tr></thead>
      <tbody>
        {rows.map((x, i) => (
          <tr key={i} className={`${x._t ? 't' : x._b ? 'b' : ''} ${onRow && x._drill ? 'drill' : ''}`} onClick={onRow && x._drill ? () => onRow(x) : undefined}>
            {cols.map(c => {
              const v = c.r ? c.r(x) : x[c.k]
              return <td key={c.k} className={[c.num ? 'num' : c.c ? 'c' : '', c.cls ?? '', c.k === cols[1]?.k && x._i ? `i${x._i}` : ''].join(' ')}>
                {typeof v === 'number' && !c.r ? (v === 0 && !x._z ? '' : money(v)) : v}
              </td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export { pick }
