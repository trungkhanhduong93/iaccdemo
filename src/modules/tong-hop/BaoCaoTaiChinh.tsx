// Báo cáo tài chính: KQKD, cân đối kế toán, cân đối số phát sinh, lưu chuyển tiền tệ, báo cáo quản trị F&B.
// Mẫu đổi theo chế độ kế toán: TT152 bản đơn giản, TT58 dạng tinh gọn, TT133 B0x-DNN, TT99 B0x-DN.
import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import type { CheDo } from '../../app/che-do'
import { CHI_NHANH, chiPhiThang, kqkd, tongKy } from '../../data/mock'
import { Note, PageHead } from '../../ui/Page'
import { KY_CHON, ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { pct } from '../../ui/format'
import { TEN_TK, du, soCai, tkTheoCheDo } from './so-cai'
import { dongB01, dongB02 } from '../bao-cao/tt58'

const kyTen = (ky: string) => KY_CHON.find(x => x[0] === ky)![1]
const truoc = (ky: string) => String(Math.max(8, Number(ky) - 1))

function Khung({ sc, mod, children, note }: ScreenProps & { children: (ky: string) => ReactNode; note?: ReactNode }) {
  const [ky, setKy] = useState('9')
  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} />
      {note}
      <section className="report"><ReportToolbar ky={ky} setKy={setKy} />{children(ky)}</section>
    </div>
  )
}

// ── Báo cáo kết quả kinh doanh ──
function dongKqkd(cd: CheDo, thang: number) {
  const q = kqkd(thang, 2026)
  if (cd === 'TT152' || cd === 'TT58') return [
    { ct: 'Doanh thu bán hàng', v: q.dtThuan, _b: 1, _drill: '/app/ban-hang/3-2-5' }, { ct: 'Giá vốn', v: q.gv, _drill: '/app/kho/5-2-3' },
    { ct: 'Lãi gộp', v: q.lnGop, _b: 1 }, { ct: 'Chi phí hoạt động', v: q.cpQlkd + q.cpTc - q.dtTc },
    { ct: 'Thu nhập, chi phí khác', v: q.lnKhac }, { ct: 'Lợi nhuận trước thuế', v: q.lnTruocThue, _t: 1 },
    ...(cd === 'TT58' ? [{ ct: 'Thuế thu nhập doanh nghiệp', v: q.thue }, { ct: 'Lợi nhuận sau thuế', v: q.lnSauThue, _t: 1 }] : []),
  ]
  const PR = cd === 'TT99'
  return [
    { ma: '01', ct: 'Doanh thu bán hàng và cung cấp dịch vụ', v: q.dt, _drill: '/app/ban-hang/3-2-5' }, { ma: '02', ct: 'Các khoản giảm trừ doanh thu', v: q.giamTru },
    { ma: '10', ct: 'Doanh thu thuần về bán hàng và cung cấp dịch vụ', v: q.dtThuan, _b: 1 }, { ma: '11', ct: 'Giá vốn hàng bán', v: q.gv, _drill: '/app/kho/5-2-3' },
    { ma: '20', ct: 'Lợi nhuận gộp về bán hàng và cung cấp dịch vụ', v: q.lnGop, _b: 1 }, { ma: '21', ct: 'Doanh thu hoạt động tài chính', v: q.dtTc },
    { ma: '22', ct: 'Chi phí tài chính', v: q.cpTc }, { ma: '23', ct: 'Trong đó: Chi phí lãi vay', v: q.laiVay, _i: 1 },
    ...(PR ? [{ ma: '25', ct: 'Chi phí bán hàng', v: q.cpBh }, { ma: '26', ct: 'Chi phí quản lý doanh nghiệp', v: q.cpQl }]
      : [{ ma: '24', ct: 'Chi phí quản lý kinh doanh', v: q.cpQlkd }]),
    { ma: '30', ct: 'Lợi nhuận thuần từ hoạt động kinh doanh', v: q.lnThuan, _b: 1 }, { ma: '31', ct: 'Thu nhập khác', v: q.tnKhac },
    { ma: '32', ct: 'Chi phí khác', v: q.cpKhac }, { ma: '40', ct: 'Lợi nhuận khác', v: q.lnKhac, _b: 1 },
    { ma: '50', ct: 'Tổng lợi nhuận kế toán trước thuế', v: q.lnTruocThue, _b: 1 }, { ma: '51', ct: PR ? 'Chi phí thuế TNDN hiện hành' : 'Chi phí thuế thu nhập doanh nghiệp', v: q.thue },
    ...(PR ? [{ ma: '52', ct: 'Chi phí thuế TNDN hoãn lại', v: 0, _z: 1 }] : []),
    { ma: '60', ct: 'Lợi nhuận sau thuế thu nhập doanh nghiệp', v: q.lnSauThue, _t: 1 },
  ]
}

export function KetQuaKinhDoanh(p: ScreenProps) {
  const { s } = useSession()
  const nav = useNavigate()
  return (
    <Khung {...p} note={<Note icon="info">Bấm dòng doanh thu hoặc giá vốn để xem số chi tiết. Số khớp Tổng quan, báo cáo doanh thu, bảng cân đối số phát sinh.</Note>}>
      {ky => {
        if (s.cheDo === 'TT58') {
          const rows = dongB02(Number(ky))
          const cols: Col[] = [
            { k: 'ct', t: 'Chỉ tiêu', kyHieu: 'A' },
            { k: 'ma', t: 'Mã số', c: true, w: 70, kyHieu: 'B' },
            { k: 'nay', t: 'Năm nay', num: true, kyHieu: '1' },
            { k: 'truoc', t: 'Năm trước', num: true, kyHieu: '2' },
          ]
          return (
            <ReportPaper title="Báo cáo kết quả hoạt động kinh doanh" sub={kyTen(ky)}>
              <RptTable cols={cols} rows={rows} kyHieuCot="so" />
            </ReportPaper>
          )
        }
        const nay = dongKqkd(s.cheDo, Number(ky)), cu = dongKqkd(s.cheDo, Number(truoc(ky)))
        const ma = kieuGhiSo(s.cheDo) === 'noco'
        const cols: Col[] = [{ k: 'ct', t: 'Chỉ tiêu' }, ...(ma ? [{ k: 'ma', t: 'Mã số', c: true, w: 70 } as Col] : []), { k: 'v', t: kyTen(ky).replace(' (đến 07/10)', ''), num: true }, { k: 'cu', t: kyTen(truoc(ky)), num: true }]
        return (
          <ReportPaper title="Báo cáo kết quả hoạt động kinh doanh" sub={`${kyTen(ky)}${s.cheDo === 'TT152' ? ' · Bản đơn giản, chưa theo chế độ kế toán' : ''}`}>
            <RptTable cols={cols} rows={nay.map((x, i) => ({ ...x, cu: cu[i]?.v }))} onRow={x => nav(x._drill)} />
          </ReportPaper>
        )
      }}
    </Khung>
  )
}

// ── Bảng cân đối kế toán ──
function dongCdkt(cd: CheDo, c: Record<string, number>) {
  const tien = du(c, '1111', '1121'), pt = du(c, '131'), htk = du(c, '152'), ng = du(c, '211'), hm = du(c, '214'), vat = du(c, '1331'), ttr = du(c, '242')
  const ts = tien + pt + htk + ng + hm + vat + ttr
  const ncc = -du(c, '331'), thue = -du(c, '33311', '3334'), luong = -du(c, '334'), vay = -du(c, '341'), von = -du(c, '411'), ln = -du(c, '421')
  const npt = ncc + thue + luong + vay
  if (cd === 'TT99') return [
    { ct: 'TÀI SẢN', _b: 1 }, { ma: '100', ct: 'A. Tài sản ngắn hạn', v: tien + pt + htk + vat, _b: 1 }, { ma: '110', ct: 'Tiền và các khoản tương đương tiền', v: tien, _i: 1 },
    { ma: '130', ct: 'Các khoản phải thu ngắn hạn', v: pt, _i: 1 }, { ma: '140', ct: 'Hàng tồn kho', v: htk, _i: 1 }, { ma: '150', ct: 'Tài sản ngắn hạn khác', v: vat, _i: 1 },
    { ma: '200', ct: 'B. Tài sản dài hạn', v: ng + hm + ttr, _b: 1 }, { ma: '220', ct: 'Tài sản cố định', v: ng + hm, _i: 1 }, { ma: '260', ct: 'Tài sản dài hạn khác', v: ttr, _i: 1 },
    { ma: '270', ct: 'TỔNG CỘNG TÀI SẢN', v: ts, _t: 1 },
    { ct: 'NGUỒN VỐN', _b: 1 }, { ma: '300', ct: 'C. Nợ phải trả', v: npt, _b: 1 }, { ma: '310', ct: 'Nợ ngắn hạn', v: ncc + thue + luong, _i: 1 }, { ma: '330', ct: 'Nợ dài hạn', v: vay, _i: 1 },
    { ma: '400', ct: 'D. Vốn chủ sở hữu', v: von + ln, _b: 1 }, { ma: '411', ct: 'Vốn góp của chủ sở hữu', v: von, _i: 1 }, { ma: '421', ct: 'Lợi nhuận sau thuế chưa phân phối', v: ln, _i: 1 },
    { ma: '440', ct: 'TỔNG CỘNG NGUỒN VỐN', v: npt + von + ln, _t: 1 },
  ]
  return [
    { ct: 'TÀI SẢN', _b: 1 }, { ma: '110', ct: 'I. Tiền và các khoản tương đương tiền', v: tien, _b: 1, _drill: '/app/tien/2-2-1' },
    { ma: '130', ct: 'III. Các khoản phải thu', v: pt, _b: 1 }, { ma: '131', ct: 'Phải thu của khách hàng', v: pt, _i: 1, _drill: '/app/tien/2-2-5' },
    { ma: '140', ct: 'IV. Hàng tồn kho', v: htk, _b: 1, _drill: '/app/kho/5-2-3' },
    { ma: '150', ct: 'V. Tài sản cố định', v: ng + hm, _b: 1 }, { ma: '151', ct: 'Nguyên giá', v: ng, _i: 1 }, { ma: '152', ct: 'Giá trị hao mòn luỹ kế', v: hm, _i: 1 },
    { ma: '180', ct: 'VIII. Tài sản khác', v: vat + ttr, _b: 1 }, { ma: '181', ct: 'Thuế GTGT được khấu trừ', v: vat, _i: 1 }, { ma: '182', ct: 'Tài sản khác', v: ttr, _i: 1 },
    { ma: '200', ct: 'TỔNG CỘNG TÀI SẢN', v: ts, _t: 1 },
    { ct: 'NGUỒN VỐN', _b: 1 }, { ma: '300', ct: 'I. Nợ phải trả', v: npt, _b: 1 }, { ma: '311', ct: 'Phải trả người bán', v: ncc, _i: 1 },
    { ma: '313', ct: 'Thuế và các khoản phải nộp Nhà nước', v: thue, _i: 1 }, { ma: '314', ct: 'Phải trả người lao động', v: luong, _i: 1 }, { ma: '316', ct: 'Vay và nợ thuê tài chính', v: vay, _i: 1 },
    { ma: '400', ct: 'II. Vốn chủ sở hữu', v: von + ln, _b: 1 }, { ma: '411', ct: 'Vốn góp của chủ sở hữu', v: von, _i: 1 }, { ma: '417', ct: 'Lợi nhuận sau thuế chưa phân phối', v: ln, _i: 1 },
    { ma: '500', ct: 'TỔNG CỘNG NGUỒN VỐN', v: npt + von + ln, _t: 1 },
  ]
}

export function CanDoiKeToan(p: ScreenProps) {
  const { s } = useSession()
  const nav = useNavigate()
  return (
    <Khung {...p}>
      {ky => {
        const ngay = ky === '10' ? '07/10/2026' : ky === '9' ? '30/09/2026' : '31/08/2026'
        if (s.cheDo === 'TT58') {
          const b01 = dongB01(Number(ky))
          const cols: Col[] = [
            { k: 'ct', t: 'Chỉ tiêu', kyHieu: 'A' },
            { k: 'ma', t: 'Mã số', c: true, w: 70, kyHieu: 'B' },
            { k: 'cuoi', t: 'Số cuối năm', num: true, kyHieu: '1' },
            { k: 'dau', t: 'Số đầu năm', num: true, kyHieu: '2' },
          ]
          return (
            <ReportPaper title="Báo cáo tình hình tài chính" sub={`Tại ngày ${ngay}`}>
              <div className="row" style={{ marginBottom: 8, fontSize: 12.5 }}>
                <span className={`chip ${b01.can ? 'ok' : 'err'}`}>
                  {b01.can ? 'Tài sản bằng nguồn vốn' : 'Lệch tài sản và nguồn vốn'}
                </span>
              </div>
              <RptTable cols={cols} rows={b01.rows} kyHieuCot="so" />
            </ReportPaper>
          )
        }
        const sd = soCai(Number(ky))
        const cuoi = dongCdkt(s.cheDo, sd.cuoi), dau = dongCdkt(s.cheDo, sd.mo)
        const PR = s.cheDo === 'TT99'
        const ts = cuoi.find(x => x.ma === (PR ? '270' : '200'))!.v!, nv = cuoi.find(x => x.ma === (PR ? '440' : '500'))!.v!
        return (
          <ReportPaper title="Báo cáo tình hình tài chính" sub={`Tại ngày ${ngay}`}>
            <div className="row" style={{ marginBottom: 8, fontSize: 12.5 }}>
              <span className={`chip ${ts === nv ? 'ok' : 'err'}`}>{ts === nv ? 'Tài sản bằng nguồn vốn' : 'Lệch tài sản và nguồn vốn'}</span>
            </div>
            <RptTable cols={[{ k: 'ct', t: 'Chỉ tiêu' }, { k: 'ma', t: 'Mã số', c: true, w: 70 }, { k: 'v', t: 'Số cuối kỳ', num: true }, { k: 'dau', t: 'Số đầu kỳ', num: true }]}
              rows={cuoi.map((x, i) => ({ ...x, dau: dau[i].v }))} onRow={x => nav(x._drill)} />
          </ReportPaper>
        )
      }}
    </Khung>
  )
}

// ── Bảng cân đối số phát sinh ──
export function CanDoiPhatSinh(p: ScreenProps) {
  const { s } = useSession()
  return (
    <Khung {...p}>
      {ky => {
        const sd = soCai(Number(ky))
        const tks = Object.keys(TEN_TK).filter(t => sd.mo[t] || sd.no[t] || sd.co[t] || sd.cuoi[t])
        const rows: Row[] = tks.map(t => {
          const m = sd.mo[t] ?? 0, c = sd.cuoi[t] ?? 0
          const h = tkTheoCheDo(t, s.cheDo)
          return { tk: h.so, ten: h.ten, dn: Math.max(0, m), dc: Math.max(0, -m), pn: sd.no[t] ?? 0, pc: sd.co[t] ?? 0, cn: Math.max(0, c), cc: Math.max(0, -c) }
        })
        const sum = (k: string) => rows.reduce((a, r) => a + r[k], 0)
        const tong = { ten: 'Tổng cộng', dn: sum('dn'), dc: sum('dc'), pn: sum('pn'), pc: sum('pc'), cn: sum('cn'), cc: sum('cc'), _t: 1 }
        const can = tong.dn === tong.dc && tong.pn === tong.pc && tong.cn === tong.cc
        return (
          <ReportPaper title="Bảng cân đối số phát sinh" sub={kyTen(ky)}>
            <div style={{ marginBottom: 8 }}><span className={`chip ${can ? 'ok' : 'err'}`}>{can ? 'Cân: Nợ bằng Có ở cả 3 cột' : 'Lệch Nợ, Có'}</span></div>
            <RptTable cols={[{ k: 'tk', t: 'Số hiệu TK', cls: 'code', w: 80 }, { k: 'ten', t: 'Tên tài khoản' }, { k: 'dn', t: 'Dư Nợ đầu kỳ', num: true }, { k: 'dc', t: 'Dư Có đầu kỳ', num: true },
              { k: 'pn', t: 'Phát sinh Nợ', num: true }, { k: 'pc', t: 'Phát sinh Có', num: true }, { k: 'cn', t: 'Dư Nợ cuối kỳ', num: true }, { k: 'cc', t: 'Dư Có cuối kỳ', num: true }]} rows={[...rows, tong]} />
          </ReportPaper>
        )
      }}
    </Khung>
  )
}

// ── Lưu chuyển tiền tệ (trực tiếp) ──
export function LuuChuyenTien(p: ScreenProps) {
  return (
    <Khung {...p}>
      {ky => {
        const sd = soCai(Number(ky))
        const tien = (tk: string) => tk === '1111' || tk === '1121'
        const theo = (nhom: string[]) => sd.bt.reduce((a, [n, c, v, g]) => {
          if (!nhom.includes(g) || tien(n) === tien(c)) return a
          return a + (tien(n) ? v : -v)
        }, 0)
        const l01 = theo(['thu']), l02 = theo(['trancc']), l03 = theo(['luong']), l04 = theo(['laivay']), l06 = theo(['tc', 'thukhac']), l07 = theo(['chikhac', 'thuetruoc'])
        const l20 = l01 + l02 + l03 + l04 + l06 + l07, l34 = theo(['travay']), l40 = l34, l50 = l20 + l40
        const l60 = du(sd.mo, '1111', '1121'), l70 = du(sd.cuoi, '1111', '1121')
        return (
          <ReportPaper title="Báo cáo lưu chuyển tiền tệ" sub={`${kyTen(ky)} · Phương pháp trực tiếp`}>
            <div style={{ marginBottom: 8 }}><span className={`chip ${l60 + l50 === l70 ? 'ok' : 'err'}`}>{l60 + l50 === l70 ? 'Tiền cuối kỳ khớp bảng cân đối kế toán' : 'Lệch tiền cuối kỳ'}</span></div>
            <RptTable cols={[{ k: 'ct', t: 'Chỉ tiêu' }, { k: 'ma', t: 'Mã số', c: true, w: 70 }, { k: 'v', t: 'Kỳ này', num: true, r: x => x.v === undefined ? '' : x.v.toLocaleString('vi-VN') }]} rows={[
              { ct: 'I. Lưu chuyển tiền từ hoạt động kinh doanh', _b: 1 },
              { ma: '01', ct: 'Tiền thu từ bán hàng, cung cấp dịch vụ và doanh thu khác', v: l01 }, { ma: '02', ct: 'Tiền chi trả cho người cung cấp hàng hoá, dịch vụ', v: l02 },
              { ma: '03', ct: 'Tiền chi trả cho người lao động', v: l03 }, { ma: '04', ct: 'Tiền lãi vay đã trả', v: l04 },
              { ma: '06', ct: 'Tiền thu khác từ hoạt động kinh doanh', v: l06 }, { ma: '07', ct: 'Tiền chi khác cho hoạt động kinh doanh', v: l07 },
              { ma: '20', ct: 'Lưu chuyển tiền thuần từ hoạt động kinh doanh', v: l20, _b: 1 },
              { ct: 'III. Lưu chuyển tiền từ hoạt động tài chính', _b: 1 }, { ma: '34', ct: 'Tiền trả nợ gốc vay', v: l34 },
              { ma: '40', ct: 'Lưu chuyển tiền thuần từ hoạt động tài chính', v: l40, _b: 1 },
              { ma: '50', ct: 'Lưu chuyển tiền thuần trong kỳ', v: l50, _b: 1 }, { ma: '60', ct: 'Tiền và tương đương tiền đầu kỳ', v: l60 },
              { ma: '70', ct: 'Tiền và tương đương tiền cuối kỳ', v: l70, _t: 1 },
            ]} />
          </ReportPaper>
        )
      }}
    </Khung>
  )
}

// ── Bộ báo cáo quản trị F&B ──
export function BaoCaoQuanTri(p: ScreenProps) {
  const { s } = useSession()
  return (
    <Khung {...p}>
      {ky => {
        const thang = Number(ky), cp = chiPhiThang(thang, 2026), all = tongKy(thang, 2026)
        const rows = CHI_NHANH.map(c => {
          const t = tongKy(thang, 2026, c.id), w = t.dt / all.dt
          const luong = cp.luong * w, mb = cp.matBang * w
          return { cn: c.ten, dt: t.dt, don: t.don, tb: Math.round(t.dt / t.don), fc: pct(t.gv / t.dt), lc: pct(luong / t.dt), rc: pct(mb / t.dt), lg: t.dt - t.gv, lgp: pct((t.dt - t.gv) / t.dt) }
        })
        return (
          <ReportPaper title="Báo cáo quản trị chuỗi F&B" sub={`${kyTen(ky)} · Theo chi nhánh`} ky={false}>
            <RptTable cols={[{ k: 'cn', t: 'Chi nhánh' }, { k: 'dt', t: 'Doanh thu', num: true }, { k: 'don', t: 'Số đơn', num: true }, { k: 'tb', t: 'TB một đơn', num: true },
              { k: 'fc', t: 'Giá vốn / DT', num: true }, { k: 'lc', t: 'Lương / DT', num: true }, { k: 'rc', t: 'Mặt bằng / DT', num: true }, { k: 'lg', t: 'Lãi gộp', num: true }, { k: 'lgp', t: 'Biên lãi gộp', num: true }]}
              rows={[...rows, { cn: 'Toàn chuỗi', dt: all.dt, don: all.don, tb: Math.round(all.dt / all.don), fc: pct(all.gv / all.dt), lc: pct(cp.luong / all.dt), rc: pct(cp.matBang / all.dt), lg: all.dt - all.gv, lgp: pct((all.dt - all.gv) / all.dt), _t: 1 }]} />
          </ReportPaper>
        )
      }}
    </Khung>
  )
}
