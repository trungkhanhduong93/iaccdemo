// Sổ quỹ tiền mặt theo cửa hàng chọn trên thanh trên, xem tất cả thì gộp quỹ các cửa hàng. Thu bán hàng lấy đúng tiền mặt từng ngày trên FABi.
import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CUA_HANG, DAILY } from '../../data/mock'
import { dsTkTheoCheDo } from '../tong-hop/so-cai'
import { PageHead } from '../../ui/Page'
import { gopSo, ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { useTrangThaiLoc } from '../../ui/bao-cao/tuyChinhBC'
import { SoChungTu } from '../../ui/generic/SoChungTu'
import { chonCuaHang, tenQuyTm } from '../bao-cao/danh-sach'
import { between, dmy, k, pad, pick, rng } from '../../ui/format'

/** Sổ quỹ tiền mặt một cửa hàng trong tháng */
export function soQuyCn(cn: string, thang: number) {
  const r = rng('soquy' + cn + thang)
  const mo = k(between(r, 38e6, 52e6))
  let du = mo, pt = 0, pc = 0, tn = 0, tc = 0
  const rows: Row[] = []
  for (const x of DAILY.filter(d => d.cn === cn && d.date.getMonth() + 1 === thang)) {
    const ngay = dmy(x.date)
    du += x.tm; tn += x.tm
    rows.push({ ngay, thu: `PT${pad(thang)}-${pad(++pt, 3)}`, dg: `Thu tiền mặt bán hàng ngày ${ngay.slice(0, 5)}`, tk: '5111, 33311', no: x.tm, du })
    const chi: [string, string, number][] = []
    if (x.date.getDate() % 2 === 0) chi.push(['Nộp tiền bán hàng vào Vietcombank', '1121', k(du - between(r, 12e6, 18e6))])
    if (r() < 0.45) chi.push(pick(r, [['Chi mua rau, củ tại chợ', '152', k(between(r, 0.6e6, 2.4e6))], ['Chi tiền gas', '6421', k(between(r, 1.2e6, 2.8e6))],
      ['Chi tạm ứng nhân viên bếp', '141', 2_000_000], ['Chi sửa máy lạnh', '6422', k(between(r, 0.8e6, 1.6e6))]] as [string, string, number][]))
    for (const [dg, tk, v] of chi) {
      if (v <= 0) continue
      du -= v; tc += v
      rows.push({ ngay, chi: `PC${pad(thang)}-${pad(++pc, 3)}`, dg, tk, co: v, du })
    }
  }
  return { mo, rows, tn, tc, cuoi: du }
}

export function SoQuy({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const [ky, setKy] = useState('9')
  const cn = cuaHangHienTai(s)
  const thang = Number(ky)
  // Bộ lọc Quỹ tiền (T54); cửa hàng theo thanh trên. Sổ tính lại theo quỹ được chọn nên tồn đầu, tồn cuối đúng
  const { loc } = useTrangThaiLoc(useLocation().pathname)
  const chonQuy = loc.locQuy?.[0]
  const chonCh = cn ? [] : chonCuaHang(loc)   // ô Cửa hàng khi thanh trên xem tất cả cửa hàng, ghi tên gốc (T576)
  const dsCn = CUA_HANG.filter(c => (!cn || c.id === cn.id) && (!chonQuy || tenQuyTm(c.ngan) === chonQuy) && (!chonCh.length || chonCh.includes(c.ten)))
  const noco = kieuGhiSo(s.cheDo) === 'noco'
  // Số hiệu TK đối ứng đổi theo chế độ kế toán (TT99 hiện 641, 642)
  const so = useMemo(() => {
    // Dòng mang tên gốc cửa hàng để ô Cửa hàng của khung lọc chung giữ lại
    const moiCh = dsCn.map(c => { const x = soQuyCn(c.id, thang); return { cn: c.ngan, ...x, rows: x.rows.map((y): Row => ({ ...y, cuaHang: c.ten })) } })
    const g = moiCh.length === 1 ? moiCh[0] : gopSo(moiCh)
    // Dòng mang giá trị đang lọc để khung lọc chung giữ lại
    return { ...g, rows: g.rows.map(x => ({ ...x, locQuy: chonQuy, ...(x.tk ? { tk: dsTkTheoCheDo(String(x.tk), s.cheDo) } : {}) })) }
  }, [dsCn.map(c => c.id).join(), chonQuy, thang, s.cheDo])

  const cols: Col[] = [
    // số phiếu bấm mở chứng từ chi tiết như các báo cáo khác (T201, T491)
    { k: 'ngay', t: 'Ngày chứng từ', w: 100 }, { k: 'thu', t: 'Số phiếu thu', cls: 'code', r: x => <SoChungTu so={x.thu} /> },
    { k: 'chi', t: 'Số phiếu chi', cls: 'code', r: x => <SoChungTu so={x.chi} /> },
    ...(dsCn.length > 1 ? [{ k: 'cn', t: 'Cửa hàng' } as Col] : []), { k: 'dg', t: 'Diễn giải' },
    ...(noco ? [{ k: 'tk', t: 'TK đối ứng', c: true } as Col] : []),
    { k: 'no', t: 'Thu', num: true }, { k: 'co', t: 'Chi', num: true }, { k: 'du', t: 'Tồn', num: true },
  ]
  return (
    <div className="page page-report">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy} moTa={`Tháng ${thang}/2026 · ${cn ? 'Cửa hàng ' + cn.ten : chonCh.length ? 'Cửa hàng ' + chonCh.join(', ') : 'Tất cả cửa hàng'} · ${chonQuy ?? 'Quỹ tiền mặt'}`} />
        <ReportPaper title="Sổ quỹ tiền mặt" sub={`${dsCn.length === 1 ? tenQuyTm(dsCn[0].ngan) : dsCn.length < CUA_HANG.length ? tenQuyTm(dsCn.map(c => c.ngan).join(', ')) : 'Quỹ tiền mặt'} · Tháng ${thang}/2026`}>
          <RptTable cols={cols} rows={[{ dg: 'Số tồn đầu kỳ', du: so.mo, _b: 1 }, ...so.rows, { dg: 'Cộng phát sinh trong kỳ', no: so.tn, co: so.tc, _t: 1 }, { dg: 'Số tồn cuối kỳ', du: so.cuoi, _t: 1 }]} />
        </ReportPaper>
      </section>
    </div>
  )
}
