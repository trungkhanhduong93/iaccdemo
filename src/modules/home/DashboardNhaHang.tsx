// Dashboard nhà hàng gói Plus, Pro, thay màn Tổng quan (T941, T956). Mẫu: docs/thiet-ke/T956-dashboard-plus-pro.html
import { useState, type CSSProperties, type ReactNode } from 'react'
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
import { IconKpi, VanhKhuyen } from './VanhKhuyenNhaHang'
import {
  CONG_NO, NGUON_HAO_HUT, THANG,
  chiaTheoTy, chuoiThang, coCauThang, dinhMuc, haoHut, ketQuaCuaHang, thuChi,
} from './soLieuDashboardNhaHang'

export const so1 = (n: number) => n.toLocaleString(locSo(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** Số cộng một khung tỷ lệ: xanh khi tốt, đỏ khi xấu */
export function Doi({ gia, tot, hau }: { gia: number; tot: boolean; hau: string }) {
  return <><span className={tot ? 'dnh-tot' : 'dnh-xau'}>{gia >= 0 ? '▲' : '▼'} {so1(Math.abs(gia))}%</span> {hau}</>
}

export function Kpi({ ten, v, phu }: { ten: string; v: string; phu: ReactNode }) {
  return <div className="card dnh-kpi"><div className="dnh-l">{ten}</div><div className="dnh-v">{v}</div><div className="dnh-s">{phu}</div></div>
}

export function ThanhTy({ phan }: { phan: { ty: number; mau: string }[] }) {
  return <div className="dnh-bar">{phan.map((p, i) => <i key={i} style={{ width: `${p.ty}%`, background: p.mau }} />)}</div>
}

export function Chu({ mau, ten }: { mau: string; ten: string }) {
  return <span className="dnh-chu"><i className="dnh-o" style={{ background: mau }} />{ten}</span>
}
export function ChuDuong({ mau, ten, net }: { mau: string; ten: string; net?: boolean }) {
  return <span className="dnh-chu"><i className="dnh-d" style={{ borderTopColor: mau, borderTopStyle: net ? 'dashed' : 'solid' }} />{ten}</span>
}

/** Dòng "Định mức x%, vượt/thấp hơn y%": đỏ khi vượt định mức, xanh khi thấp hơn */
export function SoDinhMuc({ r, dm }: { r: number; dm?: number }) {
  if (dm === undefined) return <span className="dnh-mo">Chưa đặt định mức ở Danh mục cửa hàng</span>
  const c = Math.round((r - dm) * 10) / 10
  return <>Định mức {so1(dm)}%, <span className={c > 0 ? 'dnh-xau' : 'dnh-tot'}>{c > 0 ? 'vượt ' : 'thấp hơn '}{so1(Math.abs(c))}%</span></>
}

function TheKpi({ loai, ten, giaTri, mau, ty, tyNhan, phu }: {
  loai: 'dt' | 'nvl' | 'hd' | 'ln'
  ten: string
  giaTri: string
  mau: string
  ty?: number
  tyNhan?: string
  phu: ReactNode
}) {
  return (
    <div className="dnh-kpi-v2" style={{ '--k': mau } as CSSProperties}>
      <div className="dnh-kpi-dau">
        <IconKpi loai={loai} />
        <span className="dnh-kpi-ten">{ten}</span>
      </div>
      <div className="dnh-kpi-vh">
        <div className="dnh-kpi-so">{giaTri}</div>
        {ty !== undefined && <span className="dnh-kpi-ty">{so1(ty)}%<small>{tyNhan}</small></span>}
      </div>
      <div className="dnh-kpi-s">{phu}</div>
    </div>
  )
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
  const cc = coCauThang(k, i)
  const nguonHh = chiaTheoTy(hh.gia[i], NGUON_HAO_HUT.map(g => g.ty))
  const congNo = [
    { ten: 'Phải thu cuối kỳ', da: 'Đã thu', mau: 'var(--dnh-thu)', ...CONG_NO.thu },
    { ten: 'Phải trả cuối kỳ', da: 'Đã trả', mau: 'var(--dnh-chiT)', ...CONG_NO.tra },
  ]
  const rong = CONG_NO.thu.cuoi - CONG_NO.tra.cuoi
  const kq = ketQuaCuaHang(i)
  const kqTruoc = i > 0 ? ketQuaCuaHang(i - 1) : kq
  // Dòng Tổng lấy từ chuỗi toàn đơn vị để khớp thẻ đầu trang, không cộng số đã làm tròn từng cửa hàng
  const ct = chuoiThang(-1)
  const tDt = ct.dt[i], tNvl = ct.nvl[i], tLn = ct.ln[i], tHd = tDt - tNvl - tLn
  const tLnTruoc = i > 0 ? ct.ln[i - 1] : ct.ln[i]
  const dmNvlTong = dinhMuc(s, -1, 'nvl')
  const lechNvl = dmNvl !== undefined ? c.tyLeNvl[i] - dmNvl : 0
  const maxNvl = Math.max(...c.tyLeNvl)
  const thangMaxNvl = THANG[c.tyLeNvl.indexOf(maxNvl)]
  const minNvl = Math.min(...c.tyLeNvl)
  const thangMinNvl = THANG[c.tyLeNvl.indexOf(minNvl)]
  const bqNvl = c.tyLeNvl.reduce((a, v) => a + v, 0) / c.tyLeNvl.length

  const dongCuaHang = (ten: string, dt: number, nvl: number, ln: number, lnTr: number, dm: number | undefined, lop: string) => {
    const hdC = dt - nvl - ln, tl = nvl / dt * 100, bien = ln / dt * 100
    const dLn = lnTr ? (ln - lnTr) / Math.abs(lnTr) * 100 : 0
    return (
      <tr key={ten} className={lop || undefined}>
        <td>{ten}</td>
        <td className="nh">{money(dt)}</td>
        <td className="pt">{so1(dt / tDt * 100)}%</td>
        <td className="nh">{money(nvl)}</td>
        <td className="pt">
          <b className={dm === undefined ? undefined : tl > dm ? 'dnh-xau' : 'dnh-tot'}
            title={dm !== undefined ? `Định mức ${so1(dm)}%` : undefined}>{so1(tl)}%</b>
        </td>
        <td className="nh">{money(hdC)}</td>
        <td className="pt">{so1(hdC / dt * 100)}%</td>
        <td className="nh">{money(ln)}</td>
        <td className="pt">
          <b className={bien >= 17 ? 'dnh-tot' : bien < 13 ? 'dnh-xau' : undefined}>{so1(bien)}%</b>
        </td>
        <td className="pt">
          <span className={dLn >= 0 ? 'dnh-tot' : 'dnh-xau'}>{dLn >= 0 ? '▲' : '▼'} {so1(Math.abs(dLn))}%</span>
        </td>
      </tr>
    )
  }

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
        <TheKpi loai="dt" ten="Doanh thu" giaTri={moneyD(c.dt[i])} mau="var(--dnh-dt)"
          phu={<Doi gia={tang(c.dt)} tot={c.dt[i] >= c.dt[j]} hau={`so với ${nhanTruoc}`} />} />
        <TheKpi loai="nvl" ten="Chi phí NVL" giaTri={moneyD(c.nvl[i])} mau="var(--dnh-cp)"
          ty={c.tyLeNvl[i]} tyNhan="so với DT"
          phu={<Doi gia={tang(c.nvl)} tot={c.nvl[i] <= c.nvl[j]} hau={`so với ${nhanTruoc}`} />} />
        <TheKpi loai="hd" ten="Chi phí hoạt động" giaTri={moneyD(hd[i])} mau="var(--dnh-cp)"
          ty={hd[i] / c.dt[i] * 100} tyNhan="so với DT"
          phu={<Doi gia={tang(hd)} tot={hd[i] <= hd[j]} hau={`so với ${nhanTruoc}`} />} />
        <TheKpi loai="ln" ten="Lợi nhuận" giaTri={moneyD(c.ln[i])} mau="var(--dnh-ln)"
          ty={c.bien[i]} tyNhan="biên LN"
          phu={<Doi gia={tang(c.ln)} tot={c.ln[i] >= c.ln[j]} hau={`so với ${nhanTruoc}`} />} />
      </div>

      <div className="dnh-g3">
        <Card className="dnh-kc" title="Doanh thu theo kênh" sub="đồng · %">
          <VanhKhuyen phan={cc.kenh} nhan="Doanh thu" tenCot="Kênh" ngang />
        </Card>
        <Card className="dnh-kc" title="Cơ cấu chi phí" sub="đồng · %">
          <VanhKhuyen phan={cc.chiPhi} nhan="Tổng chi phí" tenCot="Khoản" ngang />
        </Card>
        <Card className="dnh-kc" title="Tiền và ngân hàng" sub="đồng · %">
          <VanhKhuyen phan={cc.quy} nhan="Tổng số dư" tenCot="Quỹ" ngang />
        </Card>
      </div>

      <div className="dnh-g2">
        <Card title="Kết quả kinh doanh 13 tháng" sub="đồng · biên ròng %">
          <div className="dnh-lg">
            <Chu mau="var(--dnh-dt)" ten="Doanh thu" /><Chu mau="var(--dnh-cp)" ten="Chi phí NVL" />
            <ChuDuong mau="var(--dnh-ln)" ten="Lợi nhuận" /><ChuDuong mau="var(--dnh-ton)" ten="Biên LN ròng (%)" net />
          </div>
          <CotDuongChart nhan={THANG} h={220} chon={i}
            cot={[{ ten: 'Doanh thu', mau: 'var(--dnh-dt)', v: c.dt }, { ten: 'Chi phí NVL', mau: 'var(--dnh-cp)', v: c.nvl }]}
            duong={[{ ten: 'Lợi nhuận', mau: 'var(--dnh-ln)', v: c.ln }, { ten: 'Biên LN ròng', mau: 'var(--dnh-ton)', v: c.bien, phai: true, net: true }]} />
        </Card>
        <Card title="Thu chi 13 tháng" sub="đồng">
          <div className="dnh-lg">
            <Chu mau="var(--dnh-thu)" ten="Thu" /><Chu mau="var(--dnh-chiT)" ten="Chi" />
            <ChuDuong mau="var(--dnh-thuan)" ten="Chênh lệch thu chi" /><ChuDuong mau="var(--dnh-ton)" ten="Số dư cuối kỳ" net />
          </div>
          <CotDuongChart nhan={THANG} h={220} chon={i}
            cot={[{ ten: 'Thu', mau: 'var(--dnh-thu)', v: tc.thu }, { ten: 'Chi', mau: 'var(--dnh-chiT)', v: tc.chi }]}
            duong={[{ ten: 'Chênh lệch thu chi', mau: 'var(--dnh-thuan)', v: tc.chenh }, { ten: 'Số dư cuối kỳ', mau: 'var(--dnh-ton)', v: tc.soDu, net: true }]} />
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
            <div className="dnh-nv-st">
              {dmNvl !== undefined && <>
                <div>
                  <span>{lechNvl > 0 ? 'Hao hụt vượt định mức' : 'Tiết kiệm so với định mức'}</span>
                  <b className={lechNvl > 0 ? 'dnh-xau' : 'dnh-tot'}>{moneyD(Math.abs(lechNvl) / 100 * c.dt[i])}</b>
                </div>
                <div>
                  <span>Tháng vượt định mức</span>
                  <b>{c.tyLeNvl.filter(v => v > dmNvl).length}/{c.tyLeNvl.length} tháng</b>
                </div>
              </>}
              {/* Chưa đặt định mức: thay 2 ô định mức bằng Thấp nhất, Tháng trước để lưới luôn đủ 4 ô (T958) */}
              {dmNvl === undefined && i > 0 && <>
                <div>
                  <span>Thấp nhất</span>
                  <b>{so1(minNvl)}% <small className="dnh-s">{thangMinNvl}</small></b>
                </div>
                <div>
                  <span>Tháng trước ({THANG[i - 1]})</span>
                  <b>{so1(c.tyLeNvl[i - 1])}%</b>
                </div>
              </>}
              <div>
                <span>Bình quân 13 tháng</span>
                <b>{so1(bqNvl)}%</b>
              </div>
              <div>
                <span>Cao nhất</span>
                <b>{so1(maxNvl)}% <small className="dnh-s">{thangMaxNvl}</small></b>
              </div>
            </div>
          </div>
          <div>
            <div className="dnh-lg">
              <ChuDuong mau="var(--dnh-cp)" ten="Tỷ lệ NVL (%)" />
              {dmNvl !== undefined && <>
                <ChuDuong mau="var(--faint)" ten={`Định mức NVL ${so1(dmNvl)}%`} net />
                <Chu mau="var(--red)" ten="Tháng vượt định mức" />
              </>}
            </div>
            <SparkDinhMuc nhan={THANG} v={c.tyLeNvl} dm={dmNvl} min={28} max={38} h={180} mau="var(--dnh-cp)" ten="Tỷ lệ NVL" chon={i} vuaKhung />
          </div>
        </div>
      </Card>

      <div className="dnh-g2">
        <Card className="dnh-cnc" title="Công nợ phải thu và phải trả" sub={`${nhanT} · đồng`}>
          <div className="dnh-congno">
            <div className="dnh-cn2">
              {congNo.map(n => {
                const S = n.dau + n.phatSinh
                const pDa = S ? n.daThanhToan / S * 100 : 0
                const doi = n.cuoi - n.dau
                return (
                  <div key={n.ten}>
                    <div className="dnh-cn-l"><span className="dnh-dot" style={{ background: n.mau }} />{n.ten}</div>
                    <div className="dnh-cn-v">{moneyD(n.cuoi)}</div>
                    <div className="dnh-cn-p">
                      <span className={doi > 0 ? 'dnh-xau' : 'dnh-tot'}>{doi > 0 ? '▲' : '▼'} {moneyD(Math.abs(doi))} ({so1(Math.abs(doi) / n.dau * 100)}%)</span> so với đầu kỳ
                    </div>
                    <div className="dnh-cn-bar" role="img" aria-label={`${n.da} ${so1(pDa)}%`}>
                      <i style={{ width: `${pDa}%`, background: n.mau }} />
                      <i style={{ flex: 1, background: `color-mix(in srgb, ${n.mau} 22%, var(--white))` }} />
                    </div>
                    <div className="dnh-dc">
                      <span>Đầu kỳ</span><span>{money(n.dau)}</span><span className="pt" />
                      <span>Phát sinh</span><span>+ {money(n.phatSinh)}</span><span className="pt" />
                      <span>{n.da}</span><span>− {money(n.daThanhToan)}</span><span className="pt">{so1(pDa)}%</span>
                      <span className="cuoi">Cuối kỳ</span><span className="cuoi">{money(n.cuoi)}</span><span className="cuoi pt">{so1(100 - pDa)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="dnh-cn-net">
              <span>Phải thu trừ phải trả cuối kỳ</span>
              <b className={rong < 0 ? 'dnh-xau' : 'dnh-tot'}>{rong < 0 ? '− ' : rong > 0 ? '+ ' : ''}{moneyD(Math.abs(rong))}</b>
            </div>
          </div>
        </Card>
        <Card title="Hao hụt NVL">
          <div className="dnh-hh-wrap">
            <div className="dnh-hh-dau" tabIndex={0}>
              <div className="dnh-s">Giá trị hao hụt {nhanT}<span className="dnh-hoi" aria-hidden="true">?</span></div>
              <div>
                <span className="dnh-big">{moneyD(hh.gia[i])}</span>{' '}
                <span className="dnh-s">· {so1(hh.tyLe[i])}% giá trị NVL · <SoDinhMuc r={hh.tyLe[i]} dm={dmHh} /></span>
              </div>
              <div className="dnh-s">
                <span className={hhDoi > 0 ? 'dnh-xau' : 'dnh-tot'}>{hhDoi > 0 ? '▲' : '▼'} {moneyD(Math.abs(hhDoi))}</span> so với {nhanTruoc}
              </div>
              <div className="dnh-hoi-tip" role="tooltip">
                <b>Hao hụt {nhanT} lấy từ đâu</b>
                {NGUON_HAO_HUT.map((g, n) => (
                  <div className="dnh-hoi-d" key={g.ten}>
                    <span><b>{g.ten}</b><small>{g.tu}</small></span>
                    <b>{moneyD(nguonHh[n])}</b>
                  </div>
                ))}
                <div className="dnh-hoi-d tong"><span>Tổng hao hụt</span><b>{moneyD(hh.gia[i])}</b></div>
              </div>
            </div>
            <SparkDinhMuc nhan={THANG} v={hh.tyLe} dm={dmHh} min={0} max={4} h={130} mau="var(--dnh-c4)" ten="Tỷ lệ hao hụt" chon={i} />
            <VanhKhuyen phan={cc.haoHut} nhan="Hao hụt" tenCot="Nhóm" ngang />
          </div>
        </Card>
      </div>

      <Card title="Kết quả kinh doanh theo cửa hàng" sub={`${nhanT} · đồng`}>
        <div className="dnh-ch-cuon">
          <table className="dnh-t dnh-bch">
            <thead>
              <tr className="t1">
                <th rowSpan={2}>Cửa hàng</th>
                <th colSpan={2} className="nh">Doanh thu</th>
                <th colSpan={2} className="nh">Chi phí NVL</th>
                <th colSpan={2} className="nh">Chi phí hoạt động</th>
                <th colSpan={3} className="nh">Lợi nhuận</th>
              </tr>
              <tr className="t2">
                <th className="nh">Số tiền</th><th>Tỷ trọng</th>
                <th className="nh">Số tiền</th><th>% DT</th>
                <th className="nh">Số tiền</th><th>% DT</th>
                <th className="nh">Số tiền</th><th>Biên LN</th><th>So với {nhanTruoc}</th>
              </tr>
            </thead>
            <tbody>
              {kq.map((r, n) => dongCuaHang(r.ten, r.dt, r.nvl, r.ln, kqTruoc[n].ln, dinhMuc(s, n, 'nvl'), ''))}
              {dongCuaHang('Tổng', tDt, tNvl, tLn, tLnTruoc, dmNvlTong, 'dnh-tong')}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    </div>
  )
}
