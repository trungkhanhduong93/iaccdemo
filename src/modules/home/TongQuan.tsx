// Tổng quan cho chủ doanh nghiệp: sức khoẻ tài chính, lời lỗ, dòng tiền, hiệu quả, rủi ro
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { coTrongGoi, minGoi } from '../../app/plan'
import { MODULES, hienMan } from '../../app/registry'
import { CUA_HANG, HOM_NAY } from '../../data/mock'
import { Icon, ONen } from '../../ui/Icon'
import { Card, PageHead, Pk } from '../../ui/Page'
import { Select } from '../../ui/Dropdown'
import { money, pct, short } from '../../ui/format'
import {
  Bars,
  BranchBarChart,
  CashFlowChart,
  CostStructureChart,
  HBars,
  Spark,
  TrendChart,
  WaterfallChart,
} from '../../ui/Charts'
import {
  type BlockConfig,
  type KyBaoCao,
  type SoSanhKieu,
  docBlocks,
  luuBlocks,
  resetBlocks,
  tinhToanTongQuan,
} from './chiSo'
import { BaBaiToanFree } from './BaBaiToanFree'

export function TongQuan({ sc }: ScreenProps) {
  const { s } = useSession()

  // 1. Toàn bộ hook khai báo trước
  const [ky, setKy] = useState<KyBaoCao>('thang-nay')
  // Gói Free chọn năm rồi tháng (T230); dữ liệu có từ tháng 7/2026, đơn vị bắt đầu dùng từ 01/07/2026
  const [namF, setNamF] = useState(2026)
  const [thangF, setThangF] = useState(10)
  const [soSanh] = useState<SoSanhKieu>('ky-truoc')
  const [selCns, setSelCns] = useState<string[]>(CUA_HANG.map(c => c.id))
  const [moCnPop, setMoCnPop] = useState(false)
  const [moTuyChinh, setMoTuyChinh] = useState(false)
  const [blocks, setBlocks] = useState<BlockConfig[]>(() => docBlocks(s.donVi, s.email))
  const cnPopRef = useRef<HTMLDivElement>(null)

  // Đóng popover cửa hàng khi bấm ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cnPopRef.current && !cnPopRef.current.contains(e.target as Node)) {
        setMoCnPop(false)
      }
    }
    if (moCnPop) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moCnPop])

  // 2. Tính toán số liệu tổng quan
  const isFree = s.goi === 'F'
  // Gói Free không có ô chọn cửa hàng riêng của trang, xem theo cửa hàng trên thanh trên (T230)
  const cnTren = cuaHangHienTai(s)
  const cnsXem = isFree ? (cnTren ? [cnTren.id] : CUA_HANG.map(c => c.id)) : selCns
  const kyXem: KyBaoCao = isFree ? (thangF === 10 ? 'thang-nay' : 'thang-truoc') : ky
  const d = tinhToanTongQuan(kyXem, cnsXem, s.cheDo, isFree ? thangF : undefined)
  const canhBao = coTrongGoi('11.6', s.goi)

  // Kiểm tra liên kết báo cáo theo gói và chế độ hiện tại (QD45)
  const layLinkBaoCao = (code?: string): string | null => {
    if (!code) return null
    for (const m of MODULES) {
      const scDef = m.screens.find(x => x.code === code)
      if (scDef) {
        if (hienMan(scDef, s.goi, s.cheDo, s)) {
          return `/app/bao-cao/${scDef.slug}`
        }
        return null
      }
    }
    return null
  }

  // Thao tác cửa hàng
  const tatCaCn = selCns.length === CUA_HANG.length
  const toggleAllCn = () => {
    if (tatCaCn) return
    setSelCns(CUA_HANG.map(c => c.id))
  }
  const toggleCn = (id: string) => {
    if (selCns.includes(id)) {
      if (selCns.length > 1) setSelCns(selCns.filter(x => x !== id))
    } else {
      setSelCns([...selCns, id])
    }
  }

  const nhanCnBtn = tatCaCn
    ? 'Tất cả cửa hàng'
    : selCns.length === 1
    ? (CUA_HANG.find(c => c.id === selCns[0])?.ngan ?? '1 cửa hàng')
    : `${selCns.length} cửa hàng`

  // Thao tác tuỳ chỉnh khối
  const doiAnKhoi = (id: string) => {
    const moi = blocks.map(b => (b.id === id ? { ...b, an: !b.an } : b))
    setBlocks(moi)
    luuBlocks(s.donVi, s.email, moi)
  }
  const diChuyenKhoi = (idx: number, huong: -1 | 1) => {
    const target = idx + huong
    if (target < 0 || target >= blocks.length) return
    const moi = [...blocks]
    const temp = moi[idx]
    moi[idx] = moi[target]
    moi[target] = temp
    setBlocks(moi)
    luuBlocks(s.donVi, s.email, moi)
  }
  const khoiPhucMacDinh = () => {
    const moi = resetBlocks(s.donVi, s.email)
    setBlocks(moi)
  }

  // Định dạng tăng giảm
  const badgeTang = (v: number | null, daoNguoc = false) => {
    if (v === null) return <span className="kpi-tang neutral">— Chưa có kỳ so sánh</span>
    if (v === 0) return <span className="kpi-tang neutral">0%</span>
    const tot = daoNguoc ? v < 0 : v > 0
    const dau = v > 0 ? '▲ +' : '▼ '
    return (
      <span className={`kpi-tang ${tot ? 'tot' : 'xau'}`}>
        {dau}{pct(Math.abs(v))}
      </span>
    )
  }

  // Render các khối theo thứ tự tuỳ chỉnh
  const renderBlock = (b: BlockConfig) => {
    if (b.an) return null

    switch (b.id) {
      case 'kpi': {
        const linkDT = layLinkBaoCao('3.2.5')
        const linkKQ = layLinkBaoCao('10.2.3')
        const linkTongHopQuy = layLinkBaoCao('2.2.8')
        const linkSoQuy = layLinkBaoCao('2.2.1')
        const linkQuy = linkTongHopQuy ?? linkSoQuy
        const nhanLinkQuy = linkTongHopQuy ? 'Tổng hợp quỹ tiền' : 'Sổ quỹ'

        return (
          <div key="kpi" className="tq-col-12">
            <div className="grid g4">
              <div className="card kpi kpi-adv">
                <div>
                  <div className="row">
                    <ONen n="receipt" kieu="dac" co="md" />
                    <span className="kpi-l">Doanh thu thuần</span>
                    <span className="grow" />
                    {linkDT && <Link to={linkDT} className="btn sm ghost" style={{ padding: '2px 6px', height: 24, fontSize: 11.5 }}>Sổ doanh thu</Link>}
                  </div>
                  <div className="kpi-v num">{short(d.dtThuan)}</div>
                </div>
                <div className="kpi-spark-row">
                  <div className="kpi-sub">
                    {badgeTang(d.tangDT)} {d.tangDT !== null ? d.soSanhLabel : ''}
                  </div>
                  <Spark values={d.sparkDT} w={86} h={26} color="#0560a6" />
                </div>
              </div>

              <div className="card kpi kpi-adv">
                <div>
                  <div className="row">
                    <ONen n="pulse" kieu="dac" co="md" />
                    <span className="kpi-l">Lợi nhuận gộp</span>
                    <span className="grow" />
                    {linkKQ && <Link to={linkKQ} className="btn sm ghost" style={{ padding: '2px 6px', height: 24, fontSize: 11.5 }}>KQKD</Link>}
                  </div>
                  <div className="kpi-v num">{short(d.lnGop)}</div>
                </div>
                <div className="kpi-spark-row">
                  <div className="kpi-sub">
                    {badgeTang(d.tangLG)} · Biên {pct(d.bienGop)}
                  </div>
                  <Spark values={d.sparkLG} w={86} h={26} color="#0f8f84" />
                </div>
              </div>

              <div className="card kpi kpi-adv">
                <div>
                  <div className="row">
                    <ONen n="chart" kieu="dac" co="md" />
                    <span className="kpi-l">Lợi nhuận trước thuế</span>
                    <span className="grow" />
                    {linkKQ && <Link to={linkKQ} className="btn sm ghost" style={{ padding: '2px 6px', height: 24, fontSize: 11.5 }}>KQKD</Link>}
                  </div>
                  <div className="kpi-v num">{short(d.lnTruocThue)}</div>
                </div>
                <div className="kpi-spark-row">
                  <div className="kpi-sub">
                    {badgeTang(d.tangLNTT)} · Biên {pct(d.bienLNTT)}
                  </div>
                  <Spark values={d.sparkLNTT} w={86} h={26} color="#138a52" />
                </div>
              </div>

              <div className="card kpi kpi-adv">
                <div>
                  <div className="row">
                    <ONen n="wallet" kieu="dac" co="md" />
                    <span className="kpi-l">Tiền khả dụng</span>
                    <span className="grow" />
                    {linkQuy && <Link to={linkQuy} className="btn sm ghost" style={{ padding: '2px 6px', height: 24, fontSize: 11.5 }}>{nhanLinkQuy}</Link>}
                  </div>
                  <div className="kpi-v num">{short(d.tienKhaDung)}</div>
                </div>
                <div className="kpi-spark-row">
                  <div className="kpi-sub">
                    {badgeTang(d.tangTien)} · Đủ chi {d.soNgayDuChi} ngày
                  </div>
                  <Spark values={d.sparkTien} w={86} h={26} color="#0b2c6b" />
                </div>
              </div>
            </div>
          </div>
        )
      }

      case 'suc-khoe': {
        return (
          <div key="suc-khoe" className="tq-col-12">
            <Card
              title="Chỉ số sức khoẻ tài chính"
              sub="8 chỉ số đo lường hiệu quả vận hành và an toàn tài chính F&B"
            >
              {isFree ? (
                <div className="empty" style={{ padding: 24 }}>
                  <div><Pk g="S" o /></div>
                  <b style={{ marginTop: 8 }}>Chỉ số sức khoẻ tài chính F&B có từ gói Standard</b>
                  <span style={{ maxWidth: 460 }}>
                    Theo dõi tự động Prime cost, Food cost, Chi phí mặt bằng, Điểm hoà vốn, Chu kỳ tiền mặt và Hệ số thanh toán.
                  </span>
                </div>
              ) : (
                <div className="tq-sk-grid">
                  {d.chiSo.map(item => {
                    const lnk = layLinkBaoCao(item.maBc)
                    const content = (
                      <>
                        <div className="sk-head">
                          <span className={`sk-den ${item.den}`} />
                          <b title={item.congThuc} style={{ color: 'var(--ink)', flex: 1 }}>{item.ten}</b>
                          {lnk && <Icon n="chevr" className="ic sm sk-link-ic" />}
                        </div>
                        <div className="sk-val-row">
                          <span className="sk-val num">{item.giaTri}</span>
                          {item.sub && <span className="sk-sub">{item.sub}</span>}
                        </div>
                        <div className="sk-desc">{item.giaiThich}</div>
                      </>
                    )

                    return lnk ? (
                      <Link key={item.id} to={lnk} className="sk-item co-link" title={`Bấm xem sổ: ${item.congThuc}`}>
                        {content}
                      </Link>
                    ) : (
                      <div key={item.id} className="sk-item" title={item.congThuc}>
                        {content}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )
      }

      case 'thac-nuoc': {
        const linkKQ = layLinkBaoCao('10.2.3')
        return (
          <div key="thac-nuoc" className="tq-col-6">
            <Card
              title="Thác nước lợi nhuận"
              sub="Doanh thu thuần → Giá vốn → Chi phí → Lợi nhuận trước thuế"
              act={linkKQ ? <Link className="btn sm ghost" to={linkKQ}>Xem KQKD</Link> : undefined}
            >
              <div className="chart-legend-row">
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0560a6' }} /> Doanh thu</span>
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#f28020' }} /> Giá vốn</span>
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#c2362b' }} /> Bán hàng</span>
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#a86a0c' }} /> Quản lý</span>
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#138a52' }} /> Lợi nhuận</span>
              </div>
              <WaterfallChart data={d.thacNuoc} h={230} />
            </Card>
          </div>
        )
      }

      case 'xu-huong': {
        return (
          <div key="xu-huong" className="tq-col-6">
            <Card
              title="Xu hướng kinh doanh 4 tháng"
              sub="Doanh thu (cột), lợi nhuận trước thuế và biên lãi (%) qua các tháng"
            >
              <div className="chart-legend-row">
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0560a6' }} /> Doanh thu thuần</span>
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#138a52' }} /> LNTT</span>
                <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#f28020' }} /> Biên lãi %</span>
              </div>
              <TrendChart data={d.trend} h={230} />
            </Card>
          </div>
        )
      }

      case 'dong-tien': {
        const linkDTien = layLinkBaoCao('2.2.9')
        return (
          <div key="dong-tien" className="tq-col-6">
            <Card
              title="Dòng tiền kỳ"
              sub={d.ghiChuDongTien ?? "Số dư đầu kỳ, dòng tiền thu, chi và tiền cuối kỳ khớp sổ cái"}
              act={!isFree && linkDTien ? <Link className="btn sm ghost" to={linkDTien}>Báo cáo dòng tiền</Link> : undefined}
            >
              {isFree ? (
                <div className="empty" style={{ padding: 24 }}>
                  <div><Pk g="PL" o /></div>
                  <b style={{ marginTop: 8 }}>Báo cáo lưu chuyển tiền tệ có ở gói Plus</b>
                </div>
              ) : (
                <>
                  <div className="chart-legend-row">
                    <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0b2c6b' }} /> Đầu kỳ</span>
                    <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#138a52' }} /> Thu tiền</span>
                    <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#c2362b' }} /> Chi tiền</span>
                    <span className="chart-legend-item"><i className="chart-legend-dot" style={{ background: '#0560a6' }} /> Cuối kỳ</span>
                  </div>
                  <CashFlowChart
                    dau={d.dongTien.dau}
                    thu={d.dongTien.thu}
                    chi={d.dongTien.chi}
                    cuoi={d.dongTien.cuoi}
                    h={210}
                  />
                  <div className="row" style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--line-2)', fontSize: 13 }}>
                    <span className="muted">Dòng tiền thuần trong kỳ:</span>
                    <span className="grow" />
                    <b className={d.dongTien.thu >= d.dongTien.chi ? 'up' : 'down'}>
                      {money(Math.abs(d.dongTien.thu - d.dongTien.chi))} đ
                    </b>
                  </div>
                </>
              )}
            </Card>
          </div>
        )
      }

      case 'cua-hang': {
        return (
          <div key="cua-hang" className="tq-col-6">
            <Card
              title="Hiệu quả theo cửa hàng"
              sub={`Doanh thu và biên lãi gộp từng điểm bán · ${d.kyLabel}`}
            >
              {isFree ? (
                <div className="empty" style={{ padding: 24 }}>
                  <div><Pk g="S" o /></div>
                  <b style={{ marginTop: 8 }}>Quản lý đa cửa hàng có ở gói Standard</b>
                </div>
              ) : (
                <>
                  <BranchBarChart data={d.cuaHang} />
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-2)' }} className="row">
                    <span className="muted">Số đơn hàng</span>
                    <span className="grow" />
                    <b className="num" style={{ color: 'var(--ink)' }}>{money(d.soDon)}</b>
                  </div>
                  <div className="row" style={{ marginTop: 4 }}>
                    <span className="muted">Giá trị trung bình một đơn (AOV)</span>
                    <span className="grow" />
                    <b className="num" style={{ color: 'var(--ink)' }}>{money(d.aov)} đ</b>
                  </div>
                </>
              )}
            </Card>
          </div>
        )
      }

      case 'co-cau-cp': {
        const linkCP = layLinkBaoCao('10.4.3')
        return (
          <div key="co-cau-cp" className="tq-col-4">
            <Card
              title="Cơ cấu chi phí"
              sub={d.isLocCn ? 'Chi phí phân bổ theo doanh thu' : `Chi phí hoạt động · ${d.kyLabel}`}
              act={!isFree && linkCP ? <Link className="btn sm ghost" to={linkCP}>Sổ chi phí</Link> : undefined}
            >
              {isFree ? (
                <div className="empty" style={{ padding: 24 }}>
                  <div><Pk g="S" o /></div>
                  <b style={{ marginTop: 8 }}>Phân tích chi phí có ở gói Standard</b>
                </div>
              ) : (
                <CostStructureChart parts={d.coCauCp} />
              )}
            </Card>
          </div>
        )
      }

      case 'canh-bao': {
        return (
          <div key="canh-bao" className="tq-col-4">
            {canhBao ? (
              <Card title="Cảnh báo rủi ro" act={<Link className="btn sm ghost" to="/app/tien-ich/11-6">Xem hết</Link>} pad={false}>
                {[
                  ['err', 'alert', 'Công nợ quá hạn 30 ngày', '4 khách công ty · 86,4 tr', '/app/tien/2-2-5'],
                  ['warn', 'box', 'Tồn kho âm', '2 mặt hàng tại Kho bếp Lê Lợi', '/app/kho/5-2-4'],
                  ['warn', 'receipt', 'Hoá đơn đầu vào bị huỷ', '1 hoá đơn của An Phú, 4,2 tr', '/app/tien-ich/11-4'],
                  ['info', 'scale', 'Doanh thu lệch hoá đơn', '3 dòng, chờ kế toán xử lý', '/app/tien-ich/11-7'],
                ].map(([k, ic, b, sub, to]) => (
                  <Link key={b} to={to} className="task" style={{ padding: '9px 14px' }}>
                    <span className={`task-ic ${k}`} style={{ width: 28, height: 28 }}><Icon n={ic} className="ic sm" /></span>
                    <span className="task-b"><b>{b}</b><span>{sub}</span></span>
                    <Icon n="chevr" className="ic sm" />
                  </Link>
                ))}
              </Card>
            ) : (
              <Card title="Cảnh báo rủi ro">
                <div className="empty" style={{ padding: 20 }}>
                  <div><Pk g={minGoi('11.6')} o /></div>
                  <b style={{ marginTop: 8 }}>Cảnh báo số liệu có ở gói Plus</b>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
                    Công nợ quá hạn, tồn kho âm, hoá đơn bị huỷ, lệch hoá đơn.
                  </span>
                </div>
              </Card>
            )}
          </div>
        )
      }

      case 'ban-chay': {
        return (
          <div key="ban-chay" className="tq-col-4">
            <Card title="Món bán chạy" sub={d.kyLabel}>
              {isFree ? (
                <div className="empty" style={{ padding: 24 }}>
                  <div><Pk g="S" o /></div>
                  <b style={{ marginTop: 8 }}>Phân tích món bán chạy có ở gói Standard</b>
                </div>
              ) : (
                <HBars
                  color="#f28020"
                  fmt={n => money(n) + ' phần'}
                  data={[
                    { l: 'Phở bò tái', v: Math.round(d.soDon * 0.42) },
                    { l: 'Cà phê sữa đá', v: Math.round(d.soDon * 0.38) },
                    { l: 'Cơm tấm sườn bì chả', v: Math.round(d.soDon * 0.27) },
                    { l: 'Trà đào cam sả', v: Math.round(d.soDon * 0.22) },
                    { l: 'Bún chả Hà Nội', v: Math.round(d.soDon * 0.18) },
                  ]}
                />
              )}
            </Card>
          </div>
        )
      }

      default:
        return null
    }
  }

  // Gói Free: chọn năm rồi tháng (T230)
  const chonThangFree = (
    <div className="bbt-chon">
      <Select className="sel-mini" style={{ height: 34, minWidth: 124 }} value={String(namF)} aria-label="Năm"
        onChange={e => setNamF(Number(e.target.value))}>
        <option value="2026">Năm 2026</option>
      </Select>
      <Select className="sel-mini" style={{ height: 34, minWidth: 150 }} value={String(thangF)} aria-label="Tháng"
        onChange={e => setThangF(Number(e.target.value))}>
        {[10, 9, 8, 7].map(t => <option key={t} value={t}>Tháng {t}</option>)}
      </Select>
    </div>
  )

  const chonKy = (
    <Select
      className="sel-mini"
      style={{ height: 34, minWidth: 170 }}
      value={ky}
      onChange={e => setKy(e.target.value as KyBaoCao)}
    >
      <option value="thang-nay">Tháng này (đến 07/10)</option>
      <option value="thang-truoc">Tháng trước (Tháng 9)</option>
      <option value="quy-nay">Quý này (đến 07/10)</option>
      <option value="tu-dau-nam">Từ đầu năm (từ 01/07/2026)</option>
    </Select>
  )

  return (
    <div className="page">
      {/* Gói Free bỏ tiêu đề, ô chọn kỳ nằm trên khối ba bài toán (T230) */}
      {!isFree && (
      <PageHead
        title="Tổng quan"
        code={sc.code}
        meta={isFree ? undefined : (
          <div className="row" style={{ gap: 8 }}>
            <span className="chip">Cập nhật 14:20 từ FABi</span>
            {d.ghiChuCn && (
              <span className="chip" style={{ background: 'var(--amber-t)', color: 'var(--amber)', fontWeight: 500 }}>
                {d.ghiChuCn}
              </span>
            )}
          </div>
        )}
      >
        <div className="tq-filters">
          {/* 1. Chọn Kỳ */}
          {chonKy}

          {/* 2. So với; 3. Lọc cửa hàng: gói Free bỏ, xem theo cửa hàng trên thanh trên (T230) */}
          {!isFree && (
          <div className="tq-so-sanh">
            <span className="tq-ss-label">So với:</span>
            <span className="tq-ss-pill">Kỳ trước</span>
            <span className="tq-ss-pill dis" title="Chưa lập kế hoạch">Kế hoạch</span>
          </div>
          )}

          {!isFree && (
          <div className="tq-cn-wrap" ref={cnPopRef}>
            <button
              type="button"
              className="tq-cn-btn"
              onClick={() => setMoCnPop(!moCnPop)}
            >
              <Icon n="cuahang" className="ic sm" />
              <span>{nhanCnBtn}</span>
              <span style={{ transform: moCnPop ? 'rotate(180deg)' : 'none', display: 'inline-flex', transition: 'transform .15s' }}>
                <Icon n="chevr" className="ic sm" />
              </span>
            </button>
            {moCnPop && (
              <div className="tq-cn-pop">
                <label className="tq-cn-opt" style={{ fontWeight: 600, borderBottom: '1px solid var(--line-2)', paddingBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={tatCaCn}
                    onChange={toggleAllCn}
                  />
                  <span>Tất cả cửa hàng</span>
                </label>
                {CUA_HANG.map(c => (
                  <label key={c.id} className="tq-cn-opt">
                    <input
                      type="checkbox"
                      checked={selCns.includes(c.id)}
                      onChange={() => toggleCn(c.id)}
                    />
                    <span>{c.ten}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          )}

          {/* 4. Nút Tuỳ chỉnh; gói Free chỉ có ba bài toán nên không có (T230) */}
          {!isFree && (
            <button
              type="button"
              className="btn sm ghost"
              style={{ height: 34, gap: 6 }}
              onClick={() => setMoTuyChinh(true)}
            >
              <Icon n="cog" kieu="net" className="ic sm" />
              <span>Tuỳ chỉnh</span>
            </button>
          )}
        </div>
      </PageHead>
      )}

      {/* Lưới các khối Tổng quan */}
      <div className="tq-grid-12">
        {isFree ? (
          // Gói Free chỉ hiện ba bài toán lãi lỗ, thu chi, kho; các khối khác tạm ẩn, PhuongXT chốt 14/10/2026 (T230)
          <div className="tq-col-12"><BaBaiToanFree d={d} thang={thangF} selCns={cnsXem} chonKy={chonThangFree} /></div>
        ) : blocks.map(renderBlock)}
      </div>

      {/* Modal Tuỳ chỉnh hiển thị khối */}
      {moTuyChinh && (
        <div className="tq-modal-bg" onClick={() => setMoTuyChinh(false)}>
          <div className="tq-modal-box" onClick={e => e.stopPropagation()}>
            <div className="tq-modal-hd">
              <div>
                <b>Tuỳ chỉnh khối Tổng quan</b>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                  Ẩn / hiện và sắp xếp thứ tự các khối hiển thị
                </div>
              </div>
              <button
                type="button"
                className="btn sm ghost"
                style={{ width: 28, height: 28, padding: 0 }}
                onClick={() => setMoTuyChinh(false)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="tq-modal-bd">
              {blocks.map((b, i) => (
                <div key={b.id} className={`tq-modal-it ${b.an ? 'an' : ''}`}>
                  <input
                    type="checkbox"
                    className="bat-tat"
                    checked={!b.an}
                    onChange={() => doiAnKhoi(b.id)}
                  />
                  <span className="ten">{b.ten}</span>
                  <button
                    type="button"
                    className="tq-modal-btn-order"
                    disabled={i === 0}
                    onClick={() => diChuyenKhoi(i, -1)}
                    title="Chuyển lên"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="tq-modal-btn-order"
                    disabled={i === blocks.length - 1}
                    onClick={() => diChuyenKhoi(i, 1)}
                    title="Chuyển xuống"
                  >
                    ▼
                  </button>
                </div>
              ))}
            </div>

            <div className="tq-modal-ft">
              <button
                type="button"
                className="btn sm ghost"
                onClick={khoiPhucMacDinh}
              >
                Khôi phục mặc định
              </button>
              <button
                type="button"
                className="btn sm primary"
                onClick={() => setMoTuyChinh(false)}
              >
                Lưu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
