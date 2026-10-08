// Chứng từ bán hàng: mỗi chi nhánh một chứng từ mỗi ngày, gom từ đơn POS trên FABi. Số khớp KQKD, Tổng quan.
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { GOI, kieuGhiSo } from '../../app/plan'
import { CHI_NHANH, DAILY, HANG, cnTen, soBH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { VoucherDetail } from '../../ui/generic/VoucherScreen'
import { St, Table } from '../../ui/Table'
import { dmy, fold, moneyD } from '../../ui/format'
import { Select } from '../../ui/Dropdown'
import { PhanTrang } from '../../ui/PhanTrang'
import { LocO, ThanhLoc } from '../../ui/ThanhLoc'
import { docNgay, thangNay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'

/** Bán hàng ngoài POS: tiệc mang về, khách công ty đặt trước. Lập tay, không qua FABi */
const NGOAI_POS: VoucherCfg = {
  prefix: 'BH', doiTuong: 'kh', nhan: 'Khách hàng', them: 'Bán hàng ngoài POS', dong: 'hang', tien: [0, 0], nguon: 'tay', soTT58: 'Sổ doanh thu bán hàng hoá, dịch vụ',
  dienGiai: ['Bán tiệc mang về cho khách công ty', 'Bán set quà Trung thu'], noCo: [['1111', '5111', 'Doanh thu'], ['1111', '33311', 'Thuế GTGT đầu ra'], ['632', '152', 'Giá vốn']],
}

const TY_LE = [0.21, 0.09, 0.12, 0.14, 0.07, 0.15, 0.1, 0.09, 0.03]   // cơ cấu doanh thu theo món trong HANG

function dongMon(dt: number) {
  let con = dt
  return HANG.map((h, i) => {
    const tien = i === HANG.length - 1 ? con : Math.round(dt * TY_LE[i] / h.gia) * h.gia
    con -= tien
    const sl = Math.max(1, Math.round(tien / h.gia))
    return { ...h, sl, tien, thue: Math.round(tien * h.ts / 100), stt: i + 1 }
  })
}

export function ChungTuBanHang({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const rows = useMemo(() => DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().map((x, i) => ({
    id: String(i), so: soBH(x), ngay: dmy(x.date), thang: x.date.getMonth() + 1, cn: cnTen(x.cn), x,
    dienGiai: `Doanh thu ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`, doiTuong: 'Khách lẻ POS',
    tien: x.dt, thue: x.vat, tong: x.dt + x.vat, nguon: 'FABi', tt: i < 3 ? 'nhap' : x.cn === 'q5' && x.date.getDate() === 5 && x.date.getMonth() === 9 ? 'loi' : 'ghi',
  })), [])
  if (id === 'moi') return <VoucherDetail sc={sc} mod={mod} cfg={NGOAI_POS} />
  if (id) return <ChiTiet sc={sc} mod={mod} row={rows.find(r => r.id === id) ?? rows[0]} />
  return <DanhSach sc={sc} mod={mod} rows={rows} />
}

function DanhSach({ sc, mod, rows }: ScreenProps & { rows: Row[] }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const [khoang, setKhoang] = useState<KhoangNgay>(thangNay)
  const [cn, setCn] = useState('all')
  const [q, setQ] = useState('')
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const [tabPanel, setTabPanel] = useState('ct')
  const kieu = kieuGhiSo(s.goi)
  const ghi = kieu !== 'khong'

  const list = rows.filter(r => {
    const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
    if (!trongKhoang(d, khoang)) return false
    if (cn !== 'all' && r.x?.cn !== cn) return false
    if (q && !fold(`${r.so} ${r.dienGiai}`).includes(fold(q))) return false
    return true
  })
  const [activeId, setActiveId] = useState<string>(() => list[0]?.id ?? '')
  const activeRow = list.find(r => r.id === activeId) ?? list[0]

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(list.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return list.slice(batDau, batDau + coTrang)
  }, [list, trangHienTai, coTrang])

  const sum = (k: string) => list.reduce((a, r) => a + r[k], 0)
  const cols: Col[] = [
    { k: 'ngay', t: 'Ngày', w: 96 }, { k: 'so', t: 'Số chứng từ', cls: 'code' }, { k: 'dienGiai', t: 'Diễn giải' }, { k: 'cn', t: 'Chi nhánh', cls: 'dim' },
    { k: 'tien', t: 'Doanh thu chưa thuế', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }, { k: 'tong', t: 'Tổng tiền', num: true },
    { k: 'nguon', t: 'Nguồn', r: () => <span className="src">FABi</span> },
    { k: 'tt', t: 'Trạng thái', r: r => r.tt === 'loi' && ghi ? <St k="err">Lệch đối soát</St> : r.tt === 'nhap' ? <St k="warn">{ghi ? 'Chưa ghi sổ' : 'Nháp'}</St> : <St k="ok">{ghi ? 'Đã ghi sổ' : 'Đã lưu'}</St> },
  ]

  return (
    <div className="page page-voucher">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn" onClick={() => toast('Đã tải 612 đơn mới từ FABi, gom vào 3 chứng từ ngày 07/10')}><Icon n="refresh" className="ic sm" />Tải từ FABi</button>
        <button className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        <Link className="btn pri" to={`${duongDan(mod, sc)}/moi`}><Icon n="plus" className="ic sm" />Bán hàng ngoài POS</Link>
      </PageHead>
      <div style={{ flex: 'none' }}>
        <Note icon="pos">Đơn POS trên FABi tự gom thành một chứng từ cho mỗi chi nhánh mỗi ngày. Đơn huỷ, trả hàng sau khi chốt ca được điều chỉnh vào chứng từ cùng ngày, không tạo chứng từ trùng.</Note>
      </div>
      <div className="voucher-split">
        <section className="card voucher-top">
          <ThanhLoc
            tim={{
              value: q,
              onChange: v => { setQ(v); setTrang(1) },
              placeholder: 'Số chứng từ, diễn giải',
            }}
            ngay={{
              value: khoang,
              onChange: k => { setKhoang(k); setTrang(1) },
            }}
            boLoc={
              <LocO nhan="Chi nhánh">
                <Select className="inp" value={cn} onChange={e => { setCn(e.target.value); setTrang(1) }}>
                  <option value="all">Tất cả</option>
                  {CHI_NHANH.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                </Select>
              </LocO>
            }
            dangLoc={cn !== 'all'}
            onLamMoi={() => { setCn('all'); setTrang(1) }}
            onTaiLai={() => toast('Đã tải lại danh sách')}
            phai={ghi && <button className="btn sm" onClick={() => toast('Đã ghi sổ 3 chứng từ')}>Ghi sổ</button>}
          />
          {list.length ? (
            <>
              <Table
                cols={cols}
                rows={pagedRows}
                motDong
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${duongDan(mod, sc)}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' ? 'chua-ghi' : '',
                  r.tt === 'loi' && ghi ? 'bad' : '',
                ].filter(Boolean).join(' ')}
                sum={{ ngay: `${list.length} chứng từ`, tien: sum('tien'), thue: sum('thue'), tong: sum('tong') }}
              />
              <PhanTrang
                tong={list.length}
                trang={trangHienTai}
                coTrang={coTrang}
                onTrang={setTrang}
                onCoTrang={ct => { setCoTrang(ct); setTrang(1) }}
              />
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Không có chứng từ khớp bộ lọc</b>
              <button
                type="button"
                className="btn sm"
                style={{ marginTop: 10 }}
                onClick={() => { setKhoang(thangNay()); setCn('all'); setQ(''); setTrang(1) }}
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
        </section>

        <section className="card ct-panel voucher-bottom">
          {activeRow ? (
            <>
              <div className="voucher-bottom-h">
                <div className="row" style={{ gap: 8, minWidth: 0, flex: '1 1 auto' }}>
                  <Icon n="doc" className="ic sm" />
                  <b style={{ whiteSpace: 'nowrap' }}>Chi tiết {activeRow.so}</b>
                  <span className="dim" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ({activeRow.ngay}) — {activeRow.dienGiai}
                  </span>
                </div>
                <div className="tabs" style={{ margin: 0, flex: 'none' }}>
                  {[
                    ['ct', 'Hàng bán'],
                    ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'],
                    ['tt', 'Thanh toán'],
                    ['goc', 'Đơn POS gốc'],
                  ].map(([k, l]) => (
                    <button
                      key={k}
                      type="button"
                      className={tabPanel === k ? 'on' : ''}
                      onClick={() => setTabPanel(k)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn sm"
                  style={{ flex: 'none', marginLeft: 8 }}
                  onClick={() => nav(`${duongDan(mod, sc)}/${activeRow.id}`)}
                  title="Mở form toàn màn hình (hoặc đúp chuột vào dòng)"
                >
                  <Icon n="eye" className="ic sm" />Xem chi tiết
                </button>
              </div>
              <div className="voucher-bottom-b">
                <NoiDungTab x={activeRow.x} tab={tabPanel} kieu={kieu} />
              </div>
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Chọn một chứng từ ở bảng trên để xem chi tiết</b>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function NoiDungTab({ x, tab, kieu }: { x: (typeof DAILY)[number]; tab: string; kieu: ReturnType<typeof kieuGhiSo> }) {
  const dong = dongMon(x.dt)
  const ht = [
    { dg: 'Thu tiền mặt', no: '1111', co: '5111, 33311', tien: x.tm },
    { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: '5111, 33311', tien: x.ck + x.the },
    { dg: 'Phải thu app giao đồ ăn', no: '131', co: '5111, 33311', tien: x.app },
    { dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: x.gv },
  ]
  return (
    <>
      {tab === 'ct' && <Table cols={[{ k: 'stt', t: '#', w: 40, cls: 'dim' }, { k: 'ma', t: 'Mã món', cls: 'code' }, { k: 'ten', t: 'Tên món' }, { k: 'dvt', t: 'ĐVT' }, { k: 'sl', t: 'Số lượng', num: true },
        { k: 'gia', t: 'Đơn giá', num: true }, { k: 'tien', t: 'Thành tiền', num: true }, { k: 'ts', t: 'Thuế suất', num: true, r: r => `${r.ts}%` }, { k: 'thue', t: 'Tiền thuế', num: true }]} rows={dong} />}
      {tab === 'ht' && <div style={{ padding: 14 }}>
        {kieu === 'khong' && <Note kind="gray">Gói Free không hạch toán. Doanh thu vào báo cáo kết quả kinh doanh, tiền mặt vào sổ quỹ.</Note>}
        {kieu === 'so' && <><Note icon="book">{GOI.S.cheDo}: ghi vào sổ doanh thu và sổ tiền, không dùng tài khoản.</Note>
          <div style={{ marginTop: 10 }}><Table cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'tien', t: 'Số tiền', num: true }]} rows={[{ so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: x.dt }, { so: 'Sổ theo dõi thuế GTGT', tien: x.vat }, { so: 'Sổ tiền mặt', tien: x.tm }, { so: 'Sổ tiền gửi ngân hàng', tien: x.ck + x.the }]} /></div></>}
        {kieu === 'noco' && <Table cols={[{ k: 'dg', t: 'Diễn giải' }, { k: 'no', t: 'TK Nợ', cls: 'code' }, { k: 'co', t: 'TK Có', cls: 'code' }, { k: 'tien', t: 'Số tiền', num: true }]} rows={ht}
          sum={{ dg: `Doanh thu ${moneyD(x.dt)} · thuế ${moneyD(x.vat)}`, tien: x.tm + x.ck + x.the + x.app + x.gv }} />}
      </div>}
      {tab === 'tt' && <Table cols={[{ k: 'ht', t: 'Hình thức' }, { k: 'tien', t: 'Số tiền', num: true }]} rows={[{ ht: 'Tiền mặt', tien: x.tm }, { ht: 'Chuyển khoản, QR', tien: x.ck }, { ht: 'Thẻ', tien: x.the }, { ht: 'GrabFood, ShopeeFood', tien: x.app }]}
        sum={{ ht: 'Tổng', tien: x.tm + x.ck + x.the + x.app }} />}
      {tab === 'goc' && <Table cols={[{ k: 'ca', t: 'Ca' }, { k: 'gio', t: 'Giờ chốt' }, { k: 'don', t: 'Số đơn', num: true }, { k: 'tn', t: 'Thu ngân' }]}
        rows={[{ ca: 'Ca sáng', gio: '14:00', don: Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' }, { ca: 'Ca tối', gio: '22:30', don: x.don - Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' }]} />}
    </>
  )
}

function ChiTiet({ sc, mod, row }: ScreenProps & { row: Row }) {
  const { s, toast } = useSession()
  const dong0 = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState('ct')
  const x = row.x
  const kieu = kieuGhiSo(s.goi)
  return (
    <FormToanMan icon={mod.icon} onClose={dong0} tong={x.dt + x.vat} title={`Chứng từ bán hàng ${row.so}`}
      meta={<><span className="src">FABi</span><span className="chip">{row.cn}</span><span className="chip">{x.don} đơn POS</span>{kieu !== 'khong' && <span className="chip ok">Đã ghi sổ</span>}</>}
      foot={<>
        <button className="btn" onClick={dong0}>Đóng</button>
        <span className="grow" />
        <button className="btn"><Icon n="printer" className="ic sm" />In</button>
        <button className="btn" disabled={!['M', 'A'].includes(s.goi)} title={['M', 'A'].includes(s.goi) ? '' : 'Xuất hoá đơn điện tử có từ gói Medium'} onClick={() => toast('Đã gửi hoá đơn tổng hợp sang iPOS Invoice')}><Icon n="receipt" className="ic sm" />Xuất hoá đơn</button>
        <button className="btn pri" onClick={() => { toast('Đã lưu'); dong0() }}>Lưu</button>
      </>}>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px', alignItems: 'start' }}>
        <section className="card">
          <div className="tabs">
            {[['ct', 'Hàng bán'], ['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'], ['tt', 'Thanh toán'], ['goc', 'Đơn POS gốc']].map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
          </div>
          <NoiDungTab x={x} tab={tab} kieu={kieu} />
          <div className="tot">
            <span>Doanh thu chưa thuế</span><b>{moneyD(x.dt)}</b><span>Thuế GTGT</span><b>{moneyD(x.vat)}</b><span>Tổng thanh toán</span><b className="big">{moneyD(x.dt + x.vat)}</b>
          </div>
        </section>
        <div className="stack">
          <Card title="Thông tin">
            <div className="stack" style={{ gap: 8, fontSize: 13 }}>
              <div className="row"><span className="muted">Ngày</span><span className="grow" />{row.ngay}</div>
              <div className="row"><span className="muted">Chi nhánh</span><span className="grow" />{row.cn}</div>
              <div className="row"><span className="muted">Khách hàng</span><span className="grow" />Khách lẻ POS</div>
              <div className="row"><span className="muted">Đồng bộ lúc</span><span className="grow" />23:30 cùng ngày</div>
            </div>
          </Card>
          {row.tt === 'loi' && <Note kind="err" icon="alert">Doanh thu trên FABi lớn hơn sổ 1.250.000 đ. <Link to="/app/tien-ich/11-7">Mở đối soát</Link></Note>}
        </div>
      </div>
    </FormToanMan>
  )
}
