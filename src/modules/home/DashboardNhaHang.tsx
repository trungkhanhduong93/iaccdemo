// Dashboard nhà hàng gói Plus, Pro, thay màn Tổng quan (T941). Mẫu: docs/thiet-ke/T939-dashboard-nha-hang-v2.html
import { useState, type ReactNode } from 'react'
import { cuaHangHienTai, useSession } from '../../app/session'
import { datThangLamViec, thangLamViec } from '../../app/thangLamViec'
import { Link } from 'react-router-dom'
import { LenThanhTab } from '../../app/ModuleTabs'
import { FigmaGradientIcon } from '../../ui/FigmaIcon'
import { Icon } from '../../ui/Icon'
import { HuongDan, moLaiHuongDan } from './HuongDan'
import { TT_NHANH_STANDARD } from './BaBaiToanStandard'
import { CUA_HANG } from '../../data/mock'
import { locSo, money, moneyD } from '../../ui/format'
import { Card } from '../../ui/Page'
import { Select } from '../../ui/Dropdown'
import { CotDuongChart, SparkDinhMuc } from '../../ui/Charts'
import {
  CONG_NO, CO_CAU_CHI_PHI, KENH, NHOM_HAO_HUT, QUY_TIEN, THANG,
  chiaTheoTy, chuoiThang, dinhMuc, haoHut, ketQuaCuaHang, thuChi,
} from './soLieuDashboardNhaHang'

const so1 = (n: number) => n.toLocaleString(locSo(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Số cộng một khung tỷ lệ: xanh khi tốt, đỏ khi xấu */
function Doi({ gia, tot, hau }: { gia: number; tot: boolean; hau: string }) {
  return <><span className={tot ? 'dnh-tot' : 'dnh-xau'}>{gia >= 0 ? '▲' : '▼'} {so1(Math.abs(gia))}%</span> {hau}</>
}

function Kpi({ ten, v, phu }: { ten: string; v: string; phu: ReactNode }) {
  return <div className="card dnh-kpi"><div className="dnh-l">{ten}</div><div className="dnh-v">{v}</div><div className="dnh-s">{phu}</div></div>
}

function ThanhTy({ phan }: { phan: { ty: number; mau: string }[] }) {
  return <div className="dnh-bar">{phan.map((p, i) => <i key={i} style={{ width: `${p.ty}%`, background: p.mau }} />)}</div>
}

function Chu({ mau, ten }: { mau: string; ten: string }) {
  return <span className="dnh-chu"><i className="dnh-o" style={{ background: mau }} />{ten}</span>
}
function ChuDuong({ mau, ten, net }: { mau: string; ten: string; net?: boolean }) {
  return <span className="dnh-chu"><i className="dnh-d" style={{ borderTopColor: mau, borderTopStyle: net ? 'dashed' : 'solid' }} />{ten}</span>
}

/** Dòng "Định mức x%, vượt/thấp hơn y%": đỏ khi vượt định mức, xanh khi thấp hơn */
function SoDinhMuc({ r, dm }: { r: number; dm?: number }) {
  if (dm === undefined) return <span className="dnh-mo">Chưa đặt định mức ở Danh mục cửa hàng</span>
  const c = Math.round((r - dm) * 10) / 10
  return <>Định mức {so1(dm)}%, <span className={c > 0 ? 'dnh-xau' : 'dnh-tot'}>{c > 0 ? 'vượt ' : 'thấp hơn '}{so1(Math.abs(c))}%</span></>
}

function ODuLieu({ v, max, mau }: { v: number; max: number; mau: string }) {
  return <div className="dnh-db"><i style={{ width: `${v / max * 100}%`, background: mau }} /><span>{money(v)}</span></div>
}

export function DashboardNhaHang() {
  const { s } = useSession()
  // Cửa hàng theo thanh trên; năm, tháng chọn như gói Standard (T230, T617)
  const k = CUA_HANG.findIndex(ch => ch.id === cuaHangHienTai(s)?.id)
  const [namF, setNamF] = useState(2026)
  const [thangF, setThangFGoc] = useState(() => thangLamViec() ?? 10)
  const setThangF = (t: number) => { setThangFGoc(t); datThangLamViec(t) }
  const c = chuoiThang(k), hh = haoHut(k, c), tc = thuChi(k)
  const i = 12 - (10 - thangF), j = i - 1   // chuỗi 13 tháng kết thúc ở T10/2026
  const nhanT = `T${thangF}`, nhanTruoc = `T${thangF - 1}`
  const hd = c.dt.map((x, m) => x - c.nvl[m] - c.ln[m])
  const dmNvl = dinhMuc(s, k, 'nvl'), dmHh = dinhMuc(s, k, 'haoHut')
  const tang = (a: number[]) => (a[i] / a[j] - 1) * 100
  const hhDoi = hh.gia[i] - hh.gia[j]
  const kenh = chiaTheoTy(c.dt[i], KENH.map(r => r.ty))
  const chiPhi = c.dt[i] - c.ln[i]
  const coCau = chiaTheoTy(chiPhi, CO_CAU_CHI_PHI.map(r => r.ty))
  const quy = chiaTheoTy(tc.soDu[i], QUY_TIEN.map(r => r.ty))
  const nhomHh = chiaTheoTy(hh.gia[i], NHOM_HAO_HUT.map(g => g.ty))
  const congNo = [
    { ten: 'Phải thu', da: 'Đã thu', ...CONG_NO.thu },
    { ten: 'Phải trả', da: 'Đã trả', ...CONG_NO.tra },
  ]
  const kq = ketQuaCuaHang(i)
  const max = (f: (r: (typeof kq)[number]) => number) => Math.max(...kq.map(f))
  // Dòng Tổng lấy từ chuỗi toàn đơn vị để khớp thẻ đầu trang, không cộng số đã làm tròn từng cửa hàng
  const ct = chuoiThang(-1)
  const tDt = ct.dt[i], tNvl = ct.nvl[i], tLn = ct.ln[i], tHd = tDt - tNvl - tLn
  const dmNvlTong = dinhMuc(s, -1, 'nvl')

  return (
    <div className="page">
    <div className="bbt dnh">
      {/* Năm, tháng lên hàng tab và Thao tác nhanh dưới hàng tab, như gói Standard (T290) */}
      <LenThanhTab>
      <div className="bbt-chon">
        <Select className="sel-mini" style={{ height: 34, minWidth: 124 }} value={String(namF)} aria-label="Năm"
          onChange={e => setNamF(Number(e.target.value))}>
          <option value="2026">Năm 2026</option>
        </Select>
        <Select className="sel-mini" style={{ height: 34, minWidth: 150 }} value={String(thangF)} aria-label="Tháng"
          onChange={e => setThangF(Number(e.target.value))}>
          {[10, 9, 8, 7].map(m => <option key={m} value={m}>Tháng {m}</option>)}
        </Select>
        <button type="button" className="btn sm tq-xem-hd" title="Xem lại hướng dẫn" aria-label="Xem lại hướng dẫn" onClick={moLaiHuongDan}>
          <Icon n="la-ban" className="ic sm" />
        </button>
      </div>
      </LenThanhTab>
      <div className="bbt-thanh-dau">
        <nav className="bbt-tt-nhanh" aria-label="Thao tác nhanh">
          <span className="bbt-tt-nhanh-nhan"><Icon n="sparkle" className="ic sm" />Thao tác nhanh</span>
          {TT_NHANH_STANDARD.map(m => {
            const tenIc = m.icon === 'cashin' ? 'thu-tien' : m.icon === 'cashout' ? 'chi-tien' : m.icon === 'truck' ? 'mua-hang' : m.icon === 'percent' ? 'ke-khai-thue' : 'nhap-kho'
            return (
              <Link key={m.ten} to={m.to} title={m.goiY} className="bbt-tt-nhanh-nut">
                <FigmaGradientIcon name={tenIc} size={20} />
                <span>{m.ten}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <HuongDan />

      <div className="dnh-g4">
        <Kpi ten="Doanh thu" v={moneyD(c.dt[i])} phu={<Doi gia={tang(c.dt)} tot={c.dt[i] >= c.dt[j]} hau={`so với ${nhanTruoc}`} />} />
        <Kpi ten="Chi phí NVL" v={moneyD(c.nvl[i])} phu={<><Doi gia={tang(c.nvl)} tot={c.nvl[i] <= c.nvl[j]} hau="" />· {so1(c.tyLeNvl[i])}% DT</>} />
        <Kpi ten="Chi phí hoạt động" v={moneyD(hd[i])} phu={<><Doi gia={tang(hd)} tot={hd[i] <= hd[j]} hau="" />· {so1(hd[i] / c.dt[i] * 100)}% DT</>} />
        <Kpi ten="Lợi nhuận" v={moneyD(c.ln[i])} phu={<><Doi gia={tang(c.ln)} tot={c.ln[i] >= c.ln[j]} hau="" />· biên {so1(c.bien[i])}%</>} />
      </div>

      <div className="dnh-g4">
        <Card className="dnh-sp2 dnh-kc" title="Doanh thu và biên LN gộp theo kênh" sub="đồng · %">
          <ThanhTy phan={KENH} />
          <table className="dnh-t">
            <thead><tr><th>Kênh</th><th>Doanh thu</th><th>Tỷ trọng</th><th>Biên LN gộp</th></tr></thead>
            <tbody>
              {KENH.map((r, n) => (
                <tr key={r.ten}><td><Chu mau={r.mau} ten={r.ten} /></td><td>{money(kenh[n])}</td><td>{r.ty}%</td><td className={r.bien < 62 ? 'dnh-xau' : ''}>{r.bien}%</td></tr>
              ))}
              <tr className="dnh-tong"><td>Tổng</td><td>{money(c.dt[i])}</td><td>100%</td><td>66,9%</td></tr>
            </tbody>
          </table>
        </Card>
        <Card className="dnh-kc" title="Cơ cấu chi phí">
          <ThanhTy phan={CO_CAU_CHI_PHI} />
          <table className="dnh-t"><tbody>
            {CO_CAU_CHI_PHI.map((r, n) => <tr key={r.ten}><td><Chu mau={r.mau} ten={r.ten} /></td><td>{money(coCau[n])}</td><td className="dnh-ty">{so1(r.ty)}%</td></tr>)}
            <tr className="dnh-tong"><td>Tổng cộng</td><td>{money(chiPhi)}</td><td className="dnh-ty">100%</td></tr>
          </tbody></table>
        </Card>
        <Card className="dnh-kc" title="Tiền và ngân hàng">
          <ThanhTy phan={QUY_TIEN} />
          <table className="dnh-t"><tbody>
            {QUY_TIEN.map((r, n) => <tr key={r.ten}><td><Chu mau={r.mau} ten={r.ten} /></td><td>{money(quy[n])}</td><td className="dnh-ty">{so1(r.ty)}%</td></tr>)}
            <tr className="dnh-tong"><td>Tổng cộng</td><td>{money(tc.soDu[i])}</td><td className="dnh-ty">100%</td></tr>
          </tbody></table>
        </Card>
      </div>

      <div className="dnh-g2">
        <Card title="Kết quả kinh doanh 13 tháng" sub="đồng · biên ròng %">
          <div className="dnh-lg">
            <Chu mau="var(--blue)" ten="Doanh thu" /><Chu mau="var(--amber)" ten="Chi phí NVL" />
            <ChuDuong mau="var(--green)" ten="Lợi nhuận" /><ChuDuong mau="var(--orange)" ten="Biên LN ròng (%)" net />
          </div>
          <CotDuongChart nhan={THANG} h={280}
            cot={[{ ten: 'Doanh thu', mau: '#0560a6', v: c.dt }, { ten: 'Chi phí NVL', mau: '#d9a21b', v: c.nvl }]}
            duong={[{ ten: 'Lợi nhuận', mau: '#138a52', v: c.ln }, { ten: 'Biên LN ròng', mau: '#f28020', v: c.bien, phai: true, net: true }]} />
        </Card>
        <Card title="Thu chi 13 tháng" sub="đồng">
          <div className="dnh-lg">
            <Chu mau="var(--blue)" ten="Thu" /><Chu mau="var(--faint)" ten="Chi" />
            <ChuDuong mau="var(--green)" ten="Chênh lệch thu chi" net /><ChuDuong mau="var(--orange)" ten="Số dư cuối kỳ" />
          </div>
          <CotDuongChart nhan={THANG} h={280}
            cot={[{ ten: 'Thu', mau: '#0560a6', v: tc.thu }, { ten: 'Chi', mau: '#9ca3af', v: tc.chi }]}
            duong={[{ ten: 'Chênh lệch thu chi', mau: '#138a52', v: tc.chenh, net: true }, { ten: 'Số dư cuối kỳ', mau: '#f28020', v: tc.soDu }]} />
        </Card>
      </div>

      <Card title="Chi phí NVL" sub="13 tháng · % doanh thu">
        <div className="dnh-nv">
          <div>
            <div className="dnh-l">Tỷ lệ NVL / doanh thu {nhanT}</div>
            <div className="dnh-v">{so1(c.tyLeNvl[i])}%</div>
            <div className="dnh-s"><SoDinhMuc r={c.tyLeNvl[i]} dm={dmNvl} /></div>
            <div className="dnh-bl" role="img" aria-label="Tỷ lệ NVL so với định mức">
              <i style={{ width: `${c.tyLeNvl[i] / 40 * 100}%` }} />
              {dmNvl !== undefined && <b style={{ left: `${dmNvl / 40 * 100}%` }} />}
            </div>
            <div className="dnh-s dnh-2dau"><span>0%</span><span>40%</span></div>
          </div>
          <div>
            <div className="dnh-lg">
              <ChuDuong mau="var(--blue)" ten="Tỷ lệ NVL (%)" />
              {dmNvl !== undefined && <ChuDuong mau="var(--faint)" ten={`Định mức NVL ${so1(dmNvl)}%`} net />}
            </div>
            <SparkDinhMuc nhan={THANG} v={c.tyLeNvl} dm={dmNvl} min={28} max={38} h={130} ten="Tỷ lệ NVL" />
          </div>
        </div>
      </Card>

      <div className="dnh-g4">
        <Card className="dnh-sp2" title="Công nợ phải thu và phải trả" sub={`đồng · ${nhanT}`}>
          <div className="dnh-cn">
            {congNo.map(n => {
              const ty = n.daThanhToan / (n.dau + n.phatSinh) * 100
              const doi = n.cuoi - n.dau
              return (
                <div key={n.ten}>
                  <div className="dnh-l">{n.ten} cuối kỳ</div>
                  <div className="dnh-v">{moneyD(n.cuoi)}</div>
                  <div className="dnh-s"><span className={doi > 0 ? 'dnh-xau' : 'dnh-tot'}>{doi > 0 ? '▲' : '▼'} {moneyD(Math.abs(doi))} ({so1(Math.abs(doi) / n.dau * 100)}%)</span> so với đầu kỳ</div>
                  <ThanhTy phan={[{ ty, mau: 'var(--blue)' }, { ty: 100 - ty, mau: 'var(--amber)' }]} />
                  <table className="dnh-t"><tbody>
                    <tr><td><Chu mau="var(--blue)" ten={`${n.da} trong kỳ`} /></td><td>{money(n.daThanhToan)}</td><td className="dnh-ty">{so1(ty)}%</td></tr>
                    <tr><td><Chu mau="var(--amber)" ten="Còn lại cuối kỳ" /></td><td>{money(n.cuoi)}</td><td className="dnh-ty">{so1(100 - ty)}%</td></tr>
                    <tr><td>Đầu kỳ</td><td>{money(n.dau)}</td><td /></tr>
                    <tr><td>Phát sinh trong kỳ</td><td>+ {money(n.phatSinh)}</td><td /></tr>
                  </tbody></table>
                </div>
              )
            })}
          </div>
          <div className="dnh-s">Phải thu trừ phải trả cuối kỳ: <span className="dnh-xau">− {moneyD(CONG_NO.tra.cuoi - CONG_NO.thu.cuoi)}</span></div>
        </Card>
        <Card className="dnh-sp2" title="Hao hụt NVL">
          <div className="dnh-l">Giá trị hao hụt</div>
          <div className="dnh-hh">
            <div className="dnh-v">{moneyD(hh.gia[i])} <span className="dnh-r">· {so1(hh.tyLe[i])}% giá trị NVL</span></div>
            <div className="dnh-s dnh-pha"><SoDinhMuc r={hh.tyLe[i]} dm={dmHh} /></div>
          </div>
          <div className="dnh-s"><span className={hhDoi > 0 ? 'dnh-xau' : 'dnh-tot'}>{hhDoi > 0 ? '▲' : '▼'} {moneyD(Math.abs(hhDoi))}</span> so với {nhanTruoc}</div>
          <SparkDinhMuc nhan={THANG} v={hh.tyLe} dm={dmHh} min={0} max={4} h={100} mau="var(--amber)" ten="Tỷ lệ hao hụt" />
          <ThanhTy phan={NHOM_HAO_HUT.map(g => ({ ty: g.ty * 100, mau: g.mau }))} />
          <table className="dnh-t"><tbody>
            {NHOM_HAO_HUT.map((g, n) => <tr key={g.ten}><td><Chu mau={g.mau} ten={g.ten} /></td><td>{money(nhomHh[n])}</td><td className="dnh-ty">{Math.round(g.ty * 100)}%</td></tr>)}
          </tbody></table>
        </Card>
      </div>

      <Card title="Kết quả kinh doanh theo cửa hàng">
        <table className="dnh-t dnh-tb">
          <thead><tr><th>Cửa hàng</th><th>Doanh thu</th><th>Chi phí NVL</th><th>% NVL / DT</th><th>Chi phí hoạt động</th><th>Lợi nhuận</th><th>Biên LN ròng</th></tr></thead>
          <tbody>
            {kq.map((r, n) => {
              const dm = dinhMuc(s, n, 'nvl')
              return (
                <tr key={r.id} className={n === k ? 'dnh-chon' : ''}>
                  <td>{r.ten}</td>
                  <td><ODuLieu v={r.dt} max={max(x => x.dt)} mau="var(--blue)" /></td>
                  <td><ODuLieu v={r.nvl} max={max(x => x.nvl)} mau="var(--amber)" /></td>
                  <td className={dm === undefined ? '' : r.tyLeNvl > dm ? 'dnh-xau' : 'dnh-tot'}>{so1(r.tyLeNvl)}%</td>
                  <td><ODuLieu v={r.hoatDong} max={max(x => x.hoatDong)} mau="var(--orange)" /></td>
                  <td><ODuLieu v={r.ln} max={max(x => x.ln)} mau="var(--green)" /></td>
                  <td className={r.bien >= 17 ? 'dnh-tot' : r.bien < 13 ? 'dnh-xau' : ''}>{so1(r.bien)}%</td>
                </tr>
              )
            })}
            <tr className="dnh-tong">
              <td>Tổng</td><td>{money(tDt)}</td><td>{money(tNvl)}</td>
              <td className={dmNvlTong === undefined ? '' : tNvl / tDt * 100 > dmNvlTong ? 'dnh-xau' : 'dnh-tot'}>{so1(tNvl / tDt * 100)}%</td>
              <td>{money(tHd)}</td><td>{money(tLn)}</td><td>{so1(tLn / tDt * 100)}%</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
    </div>
  )
}
