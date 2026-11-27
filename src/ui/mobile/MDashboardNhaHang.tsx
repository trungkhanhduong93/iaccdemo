// Dashboard nhà hàng trên điện thoại, gói Plus, Pro (T956, nâng từ T943). Mẫu: docs/thiet-ke/T956-dashboard-plus-pro.html
import { useState, type CSSProperties, type ReactNode } from 'react'
import { cuaHangHienTai, useSession } from '../../app/session'
import { datThangLamViec, thangLamViec } from '../../app/thangLamViec'
import { CUA_HANG } from '../../data/mock'
import { money, moneyD } from '../format'
import { Select } from '../Dropdown'
import { CotDuongChart, SparkDinhMuc } from '../Charts'
import {
  CONG_NO, NGUON_HAO_HUT, THANG, chiaTheoTy, chuoiThang, coCauThang, dinhMuc, haoHut, ketQuaCuaHang, thuChi,
} from '../../modules/home/soLieuDashboardNhaHang'
import { Chu, ChuDuong, Doi, SoDinhMuc, so1 } from '../../modules/home/DashboardNhaHang'
import { IconKpi, VanhKhuyen } from '../../modules/home/VanhKhuyenNhaHang'

const RONG = 360   // bề rộng khung vẽ biểu đồ trên điện thoại

function The({ tieu, children }: { tieu: string; children: ReactNode }) {
  return (
    <div className="m-tc-the-ivt">
      <div className="m-tc-the-head"><div className="m-tc-the-tieu-hop"><h3 className="m-tc-the-tieu">{tieu}</h3></div></div>
      {children}
    </div>
  )
}

function DongCuaHang({ r, tDt, dm, lnTruoc, nhanTruoc, chon }: {
  r: ReturnType<typeof ketQuaCuaHang>[number]
  tDt: number
  dm?: number
  lnTruoc: number
  nhanTruoc: string
  chon?: boolean
}) {
  const doiLn = (r.ln - lnTruoc) / Math.abs(lnTruoc) * 100
  return (
    <div className={`mdnh-ch${chon ? ' chon' : ''}`}>
      <div className="mdnh-ch-ten">{r.ten}</div>
      <div className="mdnh-ch-luoi">
        <span>Doanh thu</span><span className="mdnh-so-o">{money(r.dt)}</span><span className="mdnh-pt">{so1(r.dt / tDt * 100)}%</span>
        <span>Chi phí NVL</span><span className="mdnh-so-o">{money(r.nvl)}</span>
        <span className={`mdnh-pt mdnh-dam ${dm === undefined ? '' : r.tyLeNvl > dm ? 'dnh-xau' : 'dnh-tot'}`}>{so1(r.tyLeNvl)}%</span>
        <span>Chi phí hoạt động</span><span className="mdnh-so-o">{money(r.hoatDong)}</span><span className="mdnh-pt">{so1(r.hoatDong / r.dt * 100)}%</span>
        <span>Lợi nhuận</span><span className="mdnh-so-o">{money(r.ln)}</span>
        <span className={`mdnh-pt mdnh-dam ${r.bien >= 17 ? 'dnh-tot' : r.bien < 13 ? 'dnh-xau' : ''}`}>{so1(r.bien)}%</span>
        <span>So với {nhanTruoc}</span>
        <span className={`mdnh-ch-ss ${doiLn >= 0 ? 'dnh-tot' : 'dnh-xau'}`}>{doiLn >= 0 ? '▲' : '▼'} {so1(Math.abs(doiLn))}%</span>
      </div>
    </div>
  )
}

export function MDashboardNhaHang() {
  const { s } = useSession()
  const k = CUA_HANG.findIndex(ch => ch.id === cuaHangHienTai(s)?.id)
  const [namF, setNamF] = useState(2026)
  const [thangF, setThangFGoc] = useState(() => thangLamViec() ?? 10)
  const [moNguonHh, setMoNguonHh] = useState(false)
  const setThangF = (t: number) => { setThangFGoc(t); datThangLamViec(t) }
  const c = chuoiThang(k), hh = haoHut(k, c), tc = thuChi(k), cc = coCauThang(k, iOrIdx(thangF))
  const i = iOrIdx(thangF), j = i - 1   // chuỗi 13 tháng kết thúc ở T10/2026
  const nhanT = `T${thangF}`, nhanTruoc = `T${thangF - 1}`
  const hd = c.dt.map((x, m) => x - c.nvl[m] - c.ln[m])
  const dmNvl = dinhMuc(s, k, 'nvl'), dmHh = dinhMuc(s, k, 'haoHut')
  const tang = (a: number[]) => (a[i] / a[j] - 1) * 100
  const hhDoi = hh.gia[i] - hh.gia[j]
  const nguonHh = chiaTheoTy(hh.gia[i], NGUON_HAO_HUT.map(g => g.ty))
  const lechNvl = dmNvl !== undefined ? c.tyLeNvl[i] - dmNvl : undefined
  const maxNvl = Math.max(...c.tyLeNvl)
  const maxThangNvl = THANG[c.tyLeNvl.indexOf(maxNvl)]
  const tbNvl = c.tyLeNvl.reduce((a, v) => a + v, 0) / c.tyLeNvl.length
  const congNo = [
    { ten: 'Phải thu', da: 'Đã thu', mau: 'var(--blue)', ...CONG_NO.thu },
    { ten: 'Phải trả', da: 'Đã trả', mau: 'var(--orange)', ...CONG_NO.tra },
  ]
  const cnRong = CONG_NO.thu.cuoi - CONG_NO.tra.cuoi
  const kq = ketQuaCuaHang(i), kqTruoc = ketQuaCuaHang(j)
  const tDt = kq.reduce((a, r) => a + r.dt, 0)
  const tNvl = kq.reduce((a, r) => a + r.nvl, 0)
  const tHd = kq.reduce((a, r) => a + r.hoatDong, 0)
  const tLn = kq.reduce((a, r) => a + r.ln, 0)
  const tLnTruoc = kqTruoc.reduce((a, r) => a + r.ln, 0)
  const tBien = tLn / tDt * 100
  const tDoiLn = (tLn - tLnTruoc) / Math.abs(tLnTruoc) * 100
  const dmNvlTong = dinhMuc(s, -1, 'nvl')

  const kpiCards: {
    loai: 'dt' | 'nvl' | 'hd' | 'ln'; ten: string; v: number; mau: string; doi: ReactNode; ty?: [number, string]
  }[] = [
    { loai: 'dt', ten: 'Doanh thu', v: c.dt[i], mau: 'var(--blue)', doi: <Doi gia={tang(c.dt)} tot={c.dt[i] >= c.dt[j]} hau={`so với ${nhanTruoc}`} /> },
    { loai: 'nvl', ten: 'Chi phí NVL', v: c.nvl[i], mau: 'var(--orange)', ty: [c.tyLeNvl[i], 'so với DT'], doi: <Doi gia={tang(c.nvl)} tot={c.nvl[i] <= c.nvl[j]} hau={`so với ${nhanTruoc}`} /> },
    { loai: 'hd', ten: 'Chi phí hoạt động', v: hd[i], mau: 'var(--orange)', ty: [hd[i] / c.dt[i] * 100, 'so với DT'], doi: <Doi gia={tang(hd)} tot={hd[i] <= hd[j]} hau={`so với ${nhanTruoc}`} /> },
    { loai: 'ln', ten: 'Lợi nhuận', v: c.ln[i], mau: 'var(--green)', ty: [c.bien[i], 'biên LN'], doi: <Doi gia={tang(c.ln)} tot={c.ln[i] >= c.ln[j]} hau={`so với ${nhanTruoc}`} /> },
  ]

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

      <div className="mdnh-kpi-luoi">
        {kpiCards.map(card => (
          <div key={card.loai} className="mdnh-kpi" style={{ '--k': card.mau } as CSSProperties}>
            <div className="mdnh-kpi-dau">
              <IconKpi loai={card.loai} />
              <span className="mdnh-kpi-ten">{card.ten}</span>
            </div>
            <div className="mdnh-kpi-so">{moneyD(card.v)}</div>
            {card.ty && (
              <div className="mdnh-kpi-ty">
                <span>{so1(card.ty[0])}%</span>
                <small>{card.ty[1]}</small>
              </div>
            )}
            <div className="mdnh-kpi-ss">{card.doi}</div>
          </div>
        ))}
      </div>

      <The tieu="Doanh thu theo kênh">
        <VanhKhuyen phan={cc.kenh} nhan="Doanh thu" tenCot="Kênh" />
      </The>

      <The tieu="Cơ cấu chi phí">
        <VanhKhuyen phan={cc.chiPhi} nhan="Tổng chi phí" tenCot="Khoản" />
      </The>

      <The tieu="Tiền và ngân hàng">
        <VanhKhuyen phan={cc.quy} nhan="Tổng số dư" tenCot="Quỹ" />
      </The>

      <The tieu="Kết quả kinh doanh 13 tháng">
        <div className="dnh-lg">
          <Chu mau="var(--blue)" ten="Doanh thu" /><Chu mau="var(--amber)" ten="Chi phí NVL" />
          <ChuDuong mau="var(--green)" ten="Lợi nhuận" /><ChuDuong mau="var(--orange)" ten="Biên LN ròng (%)" net />
        </div>
        <CotDuongChart nhan={THANG} h={240} rong={RONG} chon={i}
          cot={[{ ten: 'Doanh thu', mau: '#0560a6', v: c.dt }, { ten: 'Chi phí NVL', mau: '#d9a21b', v: c.nvl }]}
          duong={[{ ten: 'Lợi nhuận', mau: '#138a52', v: c.ln }, { ten: 'Biên LN ròng', mau: '#f28020', v: c.bien, phai: true, net: true }]} />
      </The>

      <The tieu="Thu chi 13 tháng">
        <div className="dnh-lg">
          <Chu mau="var(--blue)" ten="Thu" /><Chu mau="var(--faint)" ten="Chi" />
          <ChuDuong mau="var(--green)" ten="Chênh lệch thu chi" net /><ChuDuong mau="var(--orange)" ten="Số dư cuối kỳ" />
        </div>
        <CotDuongChart nhan={THANG} h={240} rong={RONG} chon={i}
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
        <div className="mdnh-nv-luoi">
          {dmNvl !== undefined && lechNvl !== undefined && (
            <>
              <div className="mdnh-nv-o">
                <span>{lechNvl > 0 ? 'Hao hụt vượt định mức' : 'Tiết kiệm so với định mức'}</span>
                <b className={lechNvl > 0 ? 'dnh-xau' : 'dnh-tot'}>{moneyD(Math.abs(lechNvl) / 100 * c.dt[i])}</b>
              </div>
              <div className="mdnh-nv-o">
                <span>Tháng vượt định mức</span>
                <b>{c.tyLeNvl.filter(v => v > dmNvl).length}/{c.tyLeNvl.length} tháng</b>
              </div>
            </>
          )}
          <div className="mdnh-nv-o">
            <span>Bình quân 13 tháng</span>
            <b>{so1(tbNvl)}%</b>
          </div>
          <div className="mdnh-nv-o">
            <span>Cao nhất</span>
            <b>{so1(maxNvl)}% <small>{maxThangNvl}</small></b>
          </div>
        </div>
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
            <div key={n.ten} className="mdnh-cn-khoi">
              <div className="mdnh-cn-nhan"><i className="mdnh-dot" style={{ background: n.mau }} />{n.ten} cuối kỳ</div>
              <div className="mdnh-cn-so">{moneyD(n.cuoi)}</div>
              <div className="dnh-s">
                <span className={doi > 0 ? 'dnh-xau' : 'dnh-tot'}>{doi > 0 ? '▲' : '▼'} {moneyD(Math.abs(doi))} ({so1(Math.abs(doi) / n.dau * 100)}%)</span> so với đầu kỳ
              </div>
              <div className="mdnh-cn-bar" role="img" aria-label={`${n.da} ${so1(ty)}%`}>
                <i style={{ width: `${ty}%`, background: n.mau }} />
                <i style={{ flex: 1, background: `color-mix(in srgb, ${n.mau} 22%, var(--white))` }} />
              </div>
              <div className="mdnh-dc">
                <span>Đầu kỳ</span><span>{money(n.dau)}</span><span className="mdnh-pt" />
                <span>Phát sinh</span><span>+ {money(n.phatSinh)}</span><span className="mdnh-pt" />
                <span>{n.da}</span><span>− {money(n.daThanhToan)}</span><span className="mdnh-pt">{so1(ty)}%</span>
                <span className="mdnh-dc-cuoi">Cuối kỳ</span><span className="mdnh-dc-cuoi">{money(n.cuoi)}</span><span className="mdnh-dc-cuoi mdnh-pt">{so1(100 - ty)}%</span>
              </div>
            </div>
          )
        })}
        <div className="mdnh-cn-net">
          <span>Phải thu trừ phải trả cuối kỳ</span>
          <b className={cnRong < 0 ? 'dnh-xau' : 'dnh-tot'}>
            {cnRong < 0 ? '− ' : cnRong > 0 ? '+ ' : ''}{moneyD(Math.abs(cnRong))}
          </b>
        </div>
      </The>

      <The tieu="Hao hụt NVL">
        <div className="mdnh-hh-dau">
          <div className="dnh-l mdnh-hh-nhan">
            <span>Giá trị hao hụt {nhanT}</span>
            <button
              type="button"
              className={`mdnh-hoi${moNguonHh ? ' on' : ''}`}
              aria-label="Xem nguồn hao hụt"
              aria-expanded={moNguonHh}
              onClick={() => setMoNguonHh(v => !v)}
            >?</button>
          </div>
          <div className="mdnh-cn-so">{moneyD(hh.gia[i])}</div>
          <div className="dnh-s">{so1(hh.tyLe[i])}% giá trị NVL · <SoDinhMuc r={hh.tyLe[i]} dm={dmHh} /></div>
          <div className="dnh-s"><span className={hhDoi > 0 ? 'dnh-xau' : 'dnh-tot'}>{hhDoi > 0 ? '▲' : '▼'} {moneyD(Math.abs(hhDoi))}</span> so với {nhanTruoc}</div>
          {moNguonHh && (
            <div className="mdnh-hoi-hop">
              <b>Hao hụt {nhanT} lấy từ đâu</b>
              {NGUON_HAO_HUT.map((g, n) => (
                <div key={g.ten} className="mdnh-hoi-d">
                  <span><b>{g.ten}</b><small>{g.tu}</small></span>
                  <b>{moneyD(nguonHh[n])}</b>
                </div>
              ))}
              <div className="mdnh-hoi-d tong">
                <span>Tổng hao hụt</span>
                <b>{moneyD(hh.gia[i])}</b>
              </div>
            </div>
          )}
        </div>
        <SparkDinhMuc nhan={THANG} v={hh.tyLe} dm={dmHh} min={0} max={4} h={100} rong={RONG} mau="var(--amber)" ten="Tỷ lệ hao hụt" />
        <VanhKhuyen phan={cc.haoHut} nhan="Hao hụt" tenCot="Nhóm" />
      </The>

      <The tieu="Kết quả kinh doanh theo cửa hàng">
        {kq.map((r, n) => (
          <DongCuaHang
            key={r.id}
            r={r}
            tDt={tDt}
            dm={dinhMuc(s, n, 'nvl')}
            lnTruoc={kqTruoc[n].ln}
            nhanTruoc={nhanTruoc}
            chon={n === k}
          />
        ))}
        <div className="mdnh-ch mdnh-ch-tong">
          <div className="mdnh-ch-ten">Tổng</div>
          <div className="mdnh-ch-luoi">
            <span>Doanh thu</span><span className="mdnh-so-o">{money(tDt)}</span><span className="mdnh-pt">{so1(100)}%</span>
            <span>Chi phí NVL</span><span className="mdnh-so-o">{money(tNvl)}</span>
            <span className={`mdnh-pt mdnh-dam ${dmNvlTong === undefined ? '' : tNvl / tDt * 100 > dmNvlTong ? 'dnh-xau' : 'dnh-tot'}`}>{so1(tNvl / tDt * 100)}%</span>
            <span>Chi phí hoạt động</span><span className="mdnh-so-o">{money(tHd)}</span><span className="mdnh-pt">{so1(tHd / tDt * 100)}%</span>
            <span>Lợi nhuận</span><span className="mdnh-so-o">{money(tLn)}</span>
            <span className={`mdnh-pt mdnh-dam ${tBien >= 17 ? 'dnh-tot' : tBien < 13 ? 'dnh-xau' : ''}`}>{so1(tBien)}%</span>
            <span>So với {nhanTruoc}</span>
            <span className={`mdnh-ch-ss ${tDoiLn >= 0 ? 'dnh-tot' : 'dnh-xau'}`}>{tDoiLn >= 0 ? '▲' : '▼'} {so1(Math.abs(tDoiLn))}%</span>
          </div>
        </div>
      </The>
    </div>
  )
}

function iOrIdx(thangF: number) {
  return 12 - (10 - thangF)
}
