// Dashboard nhà hàng trên điện thoại, gói Plus, Pro (T943). Cùng số liệu và bố cục với web (T941), xếp một cột.
import { useState, type ReactNode } from 'react'
import { cuaHangHienTai, useSession } from '../../app/session'
import { datThangLamViec, thangLamViec } from '../../app/thangLamViec'
import { CUA_HANG } from '../../data/mock'
import { money, moneyD } from '../format'
import { Select } from '../Dropdown'
import { CotDuongChart, SparkDinhMuc } from '../Charts'
import {
  CONG_NO, CO_CAU_CHI_PHI, KENH, NHOM_HAO_HUT, QUY_TIEN, THANG,
  chiaTheoTy, chuoiThang, dinhMuc, haoHut, ketQuaCuaHang, thuChi,
} from '../../modules/home/soLieuDashboardNhaHang'
import { Chu, ChuDuong, Doi, SoDinhMuc, ThanhTy, so1 } from '../../modules/home/DashboardNhaHang'

const RONG = 360   // bề rộng khung vẽ biểu đồ trên điện thoại

function The({ tieu, children }: { tieu: string; children: ReactNode }) {
  return (
    <div className="m-tc-the-ivt">
      <div className="m-tc-the-head"><div className="m-tc-the-tieu-hop"><h3 className="m-tc-the-tieu">{tieu}</h3></div></div>
      {children}
    </div>
  )
}

function Dong({ ten, v, ty, tong }: { ten: ReactNode; v: ReactNode; ty?: ReactNode; tong?: boolean }) {
  return <tr className={tong ? 'dnh-tong' : undefined}><td>{ten}</td><td>{v}</td>{ty !== undefined && <td className="dnh-ty">{ty}</td>}</tr>
}

export function MDashboardNhaHang() {
  const { s } = useSession()
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
  const congNo = [{ ten: 'Phải thu', da: 'Đã thu', ...CONG_NO.thu }, { ten: 'Phải trả', da: 'Đã trả', ...CONG_NO.tra }]
  const kq = ketQuaCuaHang(i)
  const ct = chuoiThang(-1)
  const tDt = ct.dt[i], tNvl = ct.nvl[i], tLn = ct.ln[i], tHd = tDt - tNvl - tLn
  const dmNvlTong = dinhMuc(s, -1, 'nvl')

  const kpi = (ten: string, v: number, doi: ReactNode) => (
    <div className="m-tc-kpi-muc"><div className="m-tc-kpi-nhan">{ten}</div><div className="mdnh-so">{moneyD(v)}</div><div className="dnh-s">{doi}</div></div>
  )

  return (
    <div className="m-dnh">
      <div className="m-dnh-loc">
        <Select className="sel-mini" value={String(namF)} aria-label="Năm" onChange={e => setNamF(Number(e.target.value))}>
          <option value="2026">Năm 2026</option>
        </Select>
        <Select className="sel-mini" value={String(thangF)} aria-label="Tháng" onChange={e => setThangF(Number(e.target.value))}>
          {[10, 9, 8, 7].map(m => <option key={m} value={m}>Tháng {m}</option>)}
        </Select>
      </div>

      <div className="m-tc-the-ivt">
        <div className="m-tc-kpi-luoi">
          {kpi('Doanh thu', c.dt[i], <Doi gia={tang(c.dt)} tot={c.dt[i] >= c.dt[j]} hau={`so với ${nhanTruoc}`} />)}
          {kpi('Chi phí NVL', c.nvl[i], <><Doi gia={tang(c.nvl)} tot={c.nvl[i] <= c.nvl[j]} hau="" />· {so1(c.tyLeNvl[i])}% DT</>)}
          {kpi('Chi phí hoạt động', hd[i], <><Doi gia={tang(hd)} tot={hd[i] <= hd[j]} hau="" />· {so1(hd[i] / c.dt[i] * 100)}% DT</>)}
          {kpi('Lợi nhuận', c.ln[i], <><Doi gia={tang(c.ln)} tot={c.ln[i] >= c.ln[j]} hau="" />· biên {so1(c.bien[i])}%</>)}
        </div>
      </div>

      <The tieu="Doanh thu và biên LN gộp theo kênh">
        <ThanhTy phan={KENH} />
        <table className="dnh-t">
          <thead><tr><th>Kênh</th><th>Doanh thu</th><th>Biên LN gộp</th></tr></thead>
          <tbody>
            {KENH.map((r, n) => <tr key={r.ten}><td><Chu mau={r.mau} ten={`${r.ten} ${r.ty}%`} /></td><td>{money(kenh[n])}</td><td className={r.bien < 62 ? 'dnh-xau' : ''}>{r.bien}%</td></tr>)}
            <tr className="dnh-tong"><td>Tổng</td><td>{money(c.dt[i])}</td><td>66,9%</td></tr>
          </tbody>
        </table>
      </The>

      <The tieu="Cơ cấu chi phí">
        <ThanhTy phan={CO_CAU_CHI_PHI} />
        <table className="dnh-t"><tbody>
          {CO_CAU_CHI_PHI.map((r, n) => <Dong key={r.ten} ten={<Chu mau={r.mau} ten={r.ten} />} v={money(coCau[n])} ty={`${so1(r.ty)}%`} />)}
          <Dong tong ten="Tổng cộng" v={money(chiPhi)} ty="100%" />
        </tbody></table>
      </The>

      <The tieu="Tiền và ngân hàng">
        <ThanhTy phan={QUY_TIEN} />
        <table className="dnh-t"><tbody>
          {QUY_TIEN.map((r, n) => <Dong key={r.ten} ten={<Chu mau={r.mau} ten={r.ten} />} v={money(quy[n])} ty={`${so1(r.ty)}%`} />)}
          <Dong tong ten="Tổng cộng" v={money(tc.soDu[i])} ty="100%" />
        </tbody></table>
      </The>

      <The tieu="Kết quả kinh doanh 13 tháng">
        <div className="dnh-lg">
          <Chu mau="var(--blue)" ten="Doanh thu" /><Chu mau="var(--amber)" ten="Chi phí NVL" />
          <ChuDuong mau="var(--green)" ten="Lợi nhuận" /><ChuDuong mau="var(--orange)" ten="Biên LN ròng (%)" net />
        </div>
        <CotDuongChart nhan={THANG} h={240} rong={RONG}
          cot={[{ ten: 'Doanh thu', mau: '#0560a6', v: c.dt }, { ten: 'Chi phí NVL', mau: '#d9a21b', v: c.nvl }]}
          duong={[{ ten: 'Lợi nhuận', mau: '#138a52', v: c.ln }, { ten: 'Biên LN ròng', mau: '#f28020', v: c.bien, phai: true, net: true }]} />
      </The>

      <The tieu="Thu chi 13 tháng">
        <div className="dnh-lg">
          <Chu mau="var(--blue)" ten="Thu" /><Chu mau="var(--faint)" ten="Chi" />
          <ChuDuong mau="var(--green)" ten="Chênh lệch thu chi" net /><ChuDuong mau="var(--orange)" ten="Số dư cuối kỳ" />
        </div>
        <CotDuongChart nhan={THANG} h={240} rong={RONG}
          cot={[{ ten: 'Thu', mau: '#0560a6', v: tc.thu }, { ten: 'Chi', mau: '#9ca3af', v: tc.chi }]}
          duong={[{ ten: 'Chênh lệch thu chi', mau: '#138a52', v: tc.chenh, net: true }, { ten: 'Số dư cuối kỳ', mau: '#f28020', v: tc.soDu }]} />
      </The>

      <The tieu="Chi phí NVL">
        <div className="dnh-l">Tỷ lệ NVL / doanh thu {nhanT}</div>
        <div className="dnh-v">{so1(c.tyLeNvl[i])}%</div>
        <div className="dnh-s"><SoDinhMuc r={c.tyLeNvl[i]} dm={dmNvl} /></div>
        <div className="dnh-bl" role="img" aria-label="Tỷ lệ NVL so với định mức">
          <i style={{ width: `${c.tyLeNvl[i] / 40 * 100}%` }} />
          {dmNvl !== undefined && <b style={{ left: `${dmNvl / 40 * 100}%` }} />}
        </div>
        <div className="dnh-s dnh-2dau"><span>0%</span><span>40%</span></div>
        <div className="dnh-lg" style={{ marginTop: 12 }}>
          <ChuDuong mau="var(--blue)" ten="Tỷ lệ NVL (%)" />
          {dmNvl !== undefined && <ChuDuong mau="var(--faint)" ten={`Định mức NVL ${so1(dmNvl)}%`} net />}
        </div>
        <SparkDinhMuc nhan={THANG} v={c.tyLeNvl} dm={dmNvl} min={28} max={38} h={130} rong={RONG} ten="Tỷ lệ NVL" />
      </The>

      <The tieu="Công nợ phải thu và phải trả">
        {congNo.map(n => {
          const ty = n.daThanhToan / (n.dau + n.phatSinh) * 100
          const doi = n.cuoi - n.dau
          return (
            <div key={n.ten} className="mdnh-cn">
              <div className="dnh-l">{n.ten} cuối kỳ</div>
              <div className="mdnh-so">{moneyD(n.cuoi)}</div>
              <div className="dnh-s"><span className={doi > 0 ? 'dnh-xau' : 'dnh-tot'}>{doi > 0 ? '▲' : '▼'} {moneyD(Math.abs(doi))} ({so1(Math.abs(doi) / n.dau * 100)}%)</span> so với đầu kỳ</div>
              <ThanhTy phan={[{ ty, mau: 'var(--blue)' }, { ty: 100 - ty, mau: 'var(--amber)' }]} />
              <table className="dnh-t"><tbody>
                <Dong ten={<Chu mau="var(--blue)" ten={`${n.da} trong kỳ`} />} v={money(n.daThanhToan)} ty={`${so1(ty)}%`} />
                <Dong ten={<Chu mau="var(--amber)" ten="Còn lại cuối kỳ" />} v={money(n.cuoi)} ty={`${so1(100 - ty)}%`} />
                <Dong ten="Đầu kỳ" v={money(n.dau)} ty="" />
                <Dong ten="Phát sinh trong kỳ" v={`+ ${money(n.phatSinh)}`} ty="" />
              </tbody></table>
            </div>
          )
        })}
        <div className="dnh-s">Phải thu trừ phải trả cuối kỳ: <span className="dnh-xau">− {moneyD(CONG_NO.tra.cuoi - CONG_NO.thu.cuoi)}</span></div>
      </The>

      <The tieu="Hao hụt NVL">
        <div className="dnh-l">Giá trị hao hụt</div>
        <div className="mdnh-so">{moneyD(hh.gia[i])}</div>
        <div className="dnh-s">{so1(hh.tyLe[i])}% giá trị NVL · <SoDinhMuc r={hh.tyLe[i]} dm={dmHh} /></div>
        <div className="dnh-s"><span className={hhDoi > 0 ? 'dnh-xau' : 'dnh-tot'}>{hhDoi > 0 ? '▲' : '▼'} {moneyD(Math.abs(hhDoi))}</span> so với {nhanTruoc}</div>
        <SparkDinhMuc nhan={THANG} v={hh.tyLe} dm={dmHh} min={0} max={4} h={100} rong={RONG} mau="var(--amber)" ten="Tỷ lệ hao hụt" />
        <ThanhTy phan={NHOM_HAO_HUT.map(g => ({ ty: g.ty * 100, mau: g.mau }))} />
        <table className="dnh-t"><tbody>
          {NHOM_HAO_HUT.map((g, n) => <Dong key={g.ten} ten={<Chu mau={g.mau} ten={g.ten} />} v={money(nhomHh[n])} ty={`${Math.round(g.ty * 100)}%`} />)}
        </tbody></table>
      </The>

      <The tieu="Kết quả kinh doanh theo cửa hàng">
        {kq.map((r, n) => {
          const dm = dinhMuc(s, n, 'nvl')
          return (
            <div key={r.id} className={`mdnh-ch${n === k ? ' chon' : ''}`}>
              <div className="mdnh-ch-ten">{r.ten}</div>
              <table className="dnh-t"><tbody>
                <Dong ten="Doanh thu" v={money(r.dt)} />
                <Dong ten="Chi phí NVL" v={money(r.nvl)} />
                <Dong ten="% NVL / DT" v={<span className={dm === undefined ? '' : r.tyLeNvl > dm ? 'dnh-xau' : 'dnh-tot'}>{so1(r.tyLeNvl)}%</span>} />
                <Dong ten="Chi phí hoạt động" v={money(r.hoatDong)} />
                <Dong ten="Lợi nhuận" v={money(r.ln)} />
                <Dong ten="Biên LN ròng" v={<span className={r.bien >= 17 ? 'dnh-tot' : r.bien < 13 ? 'dnh-xau' : ''}>{so1(r.bien)}%</span>} />
              </tbody></table>
            </div>
          )
        })}
        <div className="mdnh-ch tong">
          <div className="mdnh-ch-ten">Tổng</div>
          <table className="dnh-t"><tbody>
            <Dong ten="Doanh thu" v={money(tDt)} />
            <Dong ten="Chi phí NVL" v={money(tNvl)} />
            <Dong ten="% NVL / DT" v={<span className={dmNvlTong === undefined ? '' : tNvl / tDt * 100 > dmNvlTong ? 'dnh-xau' : 'dnh-tot'}>{so1(tNvl / tDt * 100)}%</span>} />
            <Dong ten="Chi phí hoạt động" v={money(tHd)} />
            <Dong ten="Lợi nhuận" v={money(tLn)} />
            <Dong ten="Biên LN ròng" v={`${so1(tLn / tDt * 100)}%`} />
          </tbody></table>
        </div>
      </The>
    </div>
  )
}
