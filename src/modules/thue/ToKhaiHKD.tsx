// Kê khai thuế gói Free theo iFaster (T261): danh sách tờ khai, hộp Lập tờ khai, hộp tờ khai 4 bước.
// Tờ khai hộ kinh doanh doanh thu dưới 1 tỷ, kỳ 6 tháng. GTGT, TNCN theo tỷ lệ % trên doanh thu của ngành nghề (nganh-nghe.ts);
// TNCN tính trên phần doanh thu cộng dồn từ đầu năm vượt 1 tỷ, PhuongXT chốt 15/10/2026. Số liệu giả, mẫu chờ kế toán trưởng duyệt (T04).
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { useSession } from '../../app/session'
import { CUA_HANG, DON_VI, tongKy } from '../../data/mock'
import { DS_QUY_TIEN_112 } from '../danh-muc/data'
import { NGANH_NGHE_CON, NHOM_NGANH_NGHE } from '../danh-muc/nganh-nghe'
import { Icon } from '../../ui/Icon'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { BoLoc, useCauHinhLoc, useDongEsc, useLocNhap, type OLocDef } from '../../ui/LocNangCao'
import { fold, money } from '../../ui/format'

type TrangThai = 'Chưa nộp' | 'Đã nộp' | 'Bị từ chối' | 'Đã huỷ'
interface ToKhai { id: string; ma: string; nam: number; dau: boolean; lan: number; tt: TrangThai }   // dau: 6 tháng đầu năm; lan: 0 lần đầu, n bổ sung lần n

const TEN_TO_KHAI = 'Tờ khai thuế đối với hộ kinh doanh, cá nhân kinh doanh doanh thu dưới 1 tỷ (TT89/2026)'
const NHOM_DT = 'Nhóm 1 (Dưới 1 tỷ đồng/năm)'
const GIAM_TRU_NAM = 1_000_000_000
const NGANH = NGANH_NGHE_CON.find(x => x.ten === 'Dịch vụ ăn uống') ?? NGANH_NGHE_CON[0]
const TT_CLS: Record<TrangThai, string> = { 'Chưa nộp': 'warn', 'Đã nộp': 'ok', 'Bị từ chối': 'err', 'Đã huỷ': '' }

const tenKy = (t: Pick<ToKhai, 'dau' | 'nam'>) => `6 tháng ${t.dau ? 'đầu' : 'cuối'} năm ${t.nam}`
const tenLoai = (lan: number) => lan ? `Bổ sung (lần ${lan})` : 'Lần đầu'

// Danh sách giữ trong phiên chạy, lập thêm thì vẫn còn khi chuyển màn
let soCuoi = 8
const DS: ToKhai[] = [
  { id: '8', ma: 'TK000008/7/2026', nam: 2026, dau: false, lan: 0, tt: 'Chưa nộp' },
  { id: '7', ma: 'TK000007/1/2026', nam: 2026, dau: true, lan: 2, tt: 'Đã nộp' },
  { id: '6', ma: 'TK000006/1/2026', nam: 2026, dau: true, lan: 1, tt: 'Bị từ chối' },
  { id: '5', ma: 'TK000005/1/2026', nam: 2026, dau: true, lan: 0, tt: 'Đã nộp' },
  { id: '4', ma: 'TK000004/1/2026', nam: 2026, dau: true, lan: 0, tt: 'Đã huỷ' },
  { id: '3', ma: 'TK000003/7/2025', nam: 2025, dau: false, lan: 0, tt: 'Đã nộp' },
  { id: '2', ma: 'TK000002/1/2025', nam: 2025, dau: true, lan: 0, tt: 'Đã nộp' },
  { id: '1', ma: 'TK000001/7/2024', nam: 2024, dau: false, lan: 0, tt: 'Đã nộp' },
]

// Doanh thu tháng: dữ liệu mẫu có từ 01/07/2026; tháng trước đó lấy trung bình tháng 7–9/2026 nhân hệ số mùa vụ, như biểu đồ lãi lỗ 13 tháng (T255)
const HE_SO = [1.16, 0.74, 0.86, 0.93, 0.97, 1.01, 1, 1, 1, 0.9, 0.94, 1.08]
function doanhThuThang(t: number, nam: number) {
  if (nam === 2026 && t >= 7) return tongKy(t, 2026).dt
  if (nam > 2026 || (nam === 2026 && t > 10)) return 0
  const tb = [7, 8, 9].reduce((a, x) => a + tongKy(x, 2026).dt, 0) / 3
  return Math.round(tb * HE_SO[t - 1] * (nam === 2026 ? 1 : 0.92))
}
const thangKy = (dau: boolean) => (dau ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12])

/** Số liệu Bước 2: doanh thu kỳ, mức giảm trừ trước khi tính TNCN, thuế GTGT, TNCN */
function soLieu(tk: Pick<ToKhai, 'dau' | 'nam'>) {
  const dt = thangKy(tk.dau).reduce((a, t) => a + doanhThuThang(t, tk.nam), 0)
  const luyKe = tk.dau ? 0 : thangKy(true).reduce((a, t) => a + doanhThuThang(t, tk.nam), 0)
  const giam = Math.min(dt, Math.max(0, GIAM_TRU_NAM - luyKe))
  const gtgt = Math.round(dt * NGANH.gtgt / 100)
  const tncn = Math.round((dt - giam) * NGANH.tncn / 100)
  return { dt, giam, gtgt, tncn, tong: gtgt + tncn }
}

// Bộ lọc như danh sách chứng từ các phân hệ (T389): Năm, Tìm kiếm, Loại tờ khai, Trạng thái; bấm Lọc mới áp dụng
interface GtLoc { nam: string; tim: string; loai: string; tt: string }
const locMacDinh = (): GtLoc => ({ nam: '2026', tim: '', loai: '', tt: '' })
const DS_TT: TrangThai[] = ['Chưa nộp', 'Đã nộp', 'Bị từ chối', 'Đã huỷ']

export function ToKhaiHKD({ sc, mod }: ScreenProps) {
  const { toast } = useSession()
  const [, setLan] = useState(0)   // vẽ lại sau khi đổi danh sách
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  // ?buoc=n từ sơ đồ quy trình: mở tờ khai chưa nộp mới nhất ở bước n; chưa có thì mở hộp Lập tờ khai
  const [thamSo, setThamSo] = useSearchParams()
  const buocMo = Math.min(4, Math.max(1, Number(thamSo.get('buoc')) || 1)) - 1
  const dangLam = thamSo.get('buoc') ? DS.find(x => x.tt === 'Chưa nộp') : undefined
  const [lap, setLap] = useState(Boolean(thamSo.get('buoc')) && !dangLam)
  const [mo, setMo] = useState<ToKhai | null>(dangLam ?? null)
  const [buocDau, setBuocDau] = useState(dangLam ? buocMo : 0)
  useEffect(() => { if (thamSo.get('buoc')) setThamSo({}, { replace: true }) }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const dsLoai = [...new Set(DS.map(x => tenLoai(x.lan)))].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
  const chon = (k: keyof GtLoc, ten: string, ds: { v: string; t: string }[], tatCa = true) => (
    <Select className="ds-o-sel" value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)} ds={[...(tatCa ? [{ v: '', t: 'Tất cả' }] : []), ...ds]} />
  )
  const oLoc: OLocDef[] = [
    { k: 'nam', ten: 'Năm', coGiaTri: nhap.nam !== '2026', o: chon('nam', 'Năm', [{ v: '2026', t: '2026' }, { v: '2025', t: '2025' }, { v: '2024', t: '2024' }, { v: 'tat-ca', t: 'Tất cả các năm' }], false) },
    { k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder="Mã, kỳ, tên tờ khai" aria-label="Tìm kiếm"
      onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') loc0.loc() }} /> },
    { k: 'loai', ten: 'Loại tờ khai', coGiaTri: Boolean(nhap.loai), o: chon('loai', 'Loại tờ khai', dsLoai.map(v => ({ v, t: v }))) },
    { k: 'tt', ten: 'Trạng thái', coGiaTri: Boolean(nhap.tt), o: chon('tt', 'Trạng thái', DS_TT.map(v => ({ v, t: v }))) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(`/app/${mod.key}/${sc.slug}`, oLoc.map(o => o.k), ['nam', 'tim', 'loai', 'tt'])
  const rows = DS.filter(x => (ap.nam === 'tat-ca' || String(x.nam) === ap.nam) && (!ap.tim.trim() || fold(`${x.ma} ${tenKy(x)} ${TEN_TO_KHAI}`).includes(fold(ap.tim.trim())))
    && (!ap.loai || tenLoai(x.lan) === ap.loai) && (!ap.tt || x.tt === ap.tt))
    .map((x, i) => ({ ...x, stt: i + 1, ky: tenKy(x), loai: tenLoai(x.lan) }) as Row)
  const cols: Col[] = [
    { k: 'stt', t: '#', c: true, w: 50 },
    { k: 'ma', t: 'Mã tờ khai', cls: 'code', w: 170 },
    { k: 'ky', t: 'Kỳ kê khai', w: 200 },
    { k: 'loai', t: 'Loại tờ khai', w: 150 },
    { k: 'tt', t: 'Trạng thái', w: 130, r: r => <span className={`chip ${TT_CLS[r.tt as TrangThai]}`}>{r.tt}</span> },
  ]
  const lapMoi = (dau: boolean, n: number) => {
    const cu = DS.filter(x => x.nam === n && x.dau === dau && x.tt !== 'Đã huỷ')
    soCuoi += 1
    const tk: ToKhai = { id: String(soCuoi), ma: `TK${String(soCuoi).padStart(6, '0')}/${dau ? 1 : 7}/${n}`, nam: n, dau, lan: cu.length ? Math.max(...cu.map(x => x.lan)) + 1 : 0, tt: 'Chưa nộp' }
    DS.unshift(tk)
    setLap(false)
    setBuocDau(0)
    setMo(tk)
    toast(`Đã lập tờ khai ${tk.ma}`)
  }
  return (
    <div className="page page-voucher">
      <h1 className="sr-only">Danh sách tờ khai</h1>
      <section className="card voucher-top">
        <div className="ds-toolbar-figma">
          <BoLoc
            ds={oLoc}
            cauHinh={cauHinhLoc}
            datCauHinh={datCauHinhLoc}
            dangLoc={loc0.dangLoc}
            khacNhap={loc0.khacNhap}
            onLoc={loc0.loc}
            onXoaHet={loc0.xoaNhap}
            chiNutPheu
            ngoaiRieng={{
              tim: (
                <div key="tim" className="ds-tim-figma">
                  <IconFigmaSearch size={16} />
                  <input
                    value={nhap.tim}
                    placeholder="Mã, kỳ, tên tờ khai"
                    title="Tìm theo mã, kỳ, tên tờ khai"
                    aria-label="Tìm kiếm"
                    onChange={e => dat('tim', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') loc0.loc()
                    }}
                  />
                </div>
              ),
            }}
          />
          <div className="ds-toolbar-phai">
            <button type="button" className="btn pri" onClick={() => setLap(true)}>
              <Icon n="plus" className="ic sm" />
              Thêm mới
            </button>
          </div>
        </div>
        <Table cols={cols} rows={rows} onRow={r => { setBuocDau(0); setMo(DS.find(x => x.id === r.id) ?? null) }} sum={{ stt: '', ma: `Tổng: ${rows.length}` }} />
      </section>
      {lap && <HopLapToKhai onDong={() => setLap(false)} onLap={lapMoi} />}
      {mo && <HopToKhai tk={mo} buocDau={buocDau} onDong={() => setMo(null)} onDoi={() => setLan(x => x + 1)} />}
    </div>
  )
}

/** Hộp Lập tờ khai: nhóm doanh thu khoá theo thiết lập, năm, kỳ 6 tháng (nhóm dưới 1 tỷ chỉ kê khai 6 tháng như iFaster) */
function HopLapToKhai({ onDong, onLap }: { onDong: () => void; onLap: (dau: boolean, nam: number) => void }) {
  useDongEsc(onDong)
  const [nam, setNam] = useState('2026')
  const [ky, setKy] = useState('cuoi')   // 6 tháng đầu năm 2026 đã có tờ khai nên mặc định kỳ đang chạy
  const o = (nhan: string, noiDung: ReactNode) => <div className="tk-o"><span>{nhan}</span><div>{noiDung}</div></div>
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop tk-lap" role="dialog" aria-modal="true" aria-label="Lập tờ khai">
        <div className="ds-hop-dau"><b>Lập tờ khai</b></div>
        <div className="tk-lap-than">
          {o('Nhóm doanh thu', <input className="inp" value={NHOM_DT} disabled aria-label="Nhóm doanh thu" />)}
          {o('Năm', <Select className="inp" value={nam} aria-label="Năm" onChange={e => setNam(e.target.value)} ds={[{ v: '2026', t: '2026' }, { v: '2025', t: '2025' }]} />)}
          {o('Kỳ kê khai', <input className="inp" value="6 tháng" disabled aria-label="Kỳ kê khai" />)}
          {o('Kỳ', <Select className="inp" value={ky} aria-label="Kỳ" onChange={e => setKy(e.target.value)} ds={[{ v: 'dau', t: '6 tháng đầu năm' }, { v: 'cuoi', t: '6 tháng cuối năm' }]} />)}
          {o('Tờ khai', <span className="tk-ten">{TEN_TO_KHAI}</span>)}
        </div>
        <div className="ds-chan">
          <span className="grow" />
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri" onClick={() => onLap(ky === 'dau', Number(nam))}>Lập tờ khai</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

const BUOC = [{ ten: 'Thông tin hộ kinh doanh' }, { ten: 'Kê khai doanh thu tính thuế' }, { ten: 'Khai phụ lục' }, { ten: 'Xem và nộp tờ khai' }]

// Địa bàn, cơ quan thuế của từng điểm bán (mẫu)
const DIA_BAN = [
  { db: '26734 - Phường Sài Gòn - TP. Hồ Chí Minh', cq: '79101 - Thuế cơ sở 1 TP. Hồ Chí Minh', dc: '86 Lê Lợi, phường Sài Gòn, TP. Hồ Chí Minh' },
  { db: '27301 - Phường Chợ Quán - TP. Hồ Chí Minh', cq: '79105 - Thuế cơ sở 5 TP. Hồ Chí Minh', dc: '215 Nguyễn Trãi, phường Chợ Quán, TP. Hồ Chí Minh' },
  { db: '26794 - Phường An Khánh - TP. Hồ Chí Minh', cq: '79102 - Thuế cơ sở 2 TP. Hồ Chí Minh', dc: '12 Quốc Hương, phường An Khánh, TP. Hồ Chí Minh' },
]

/** Hộp tờ khai 4 bước như iFaster: cột bước bên trái, nội dung bước bên phải, Huỷ, Quay lại, Tiếp tục ở chân */
function HopToKhai({ tk, buocDau = 0, onDong, onDoi }: { tk: ToKhai; buocDau?: number; onDong: () => void; onDoi: () => void }) {
  const { s, toast } = useSession()
  useDongEsc(onDong)
  const [buoc, setBuoc] = useState(buocDau)
  const [xong, setXong] = useState(tk.tt === 'Chưa nộp' ? buocDau + 1 : 4)
  const dv = DON_VI.find(x => x.id === s.donVi) ?? DON_VI[0]
  const so = useMemo(() => soLieu(tk), [tk])
  const sua = tk.tt === 'Chưa nộp'
  const den = (b: number) => { setBuoc(b); setXong(x => Math.max(x, b + 1)) }
  const truong = (nhan: string, v: string) => <label className="tk-truong"><span>{nhan} <i>*</i></span><input className="inp" value={v} readOnly /></label>
  const nganHang = DS_QUY_TIEN_112.filter(x => x.loai === 'Ngân hàng')

  const noiDung = [
    <>
      <h3>Thông tin hộ kinh doanh</h3>
      <div className="tk-luu-y"><Icon n="info" className="ic sm" />Vui lòng kiểm tra kỹ thông tin Mã số thuế để đảm bảo quyền lợi khi thực hiện nghĩa vụ thuế điện tử.</div>
      <div className="tk-luoi">
        {truong('Mã số thuế', dv.mst || 'Chưa khai')}
        {truong('Tên hộ kinh doanh', dv.ten)}
        {truong('Tên người nộp thuế', dv.nguoiDaiDien)}
        {truong('Số điện thoại người nộp thuế', '0903 118 226')}
        {truong('Email người nộp thuế', 'ketoan@phomay.vn')}
      </div>
      <h4>Danh sách điểm bán hàng</h4>
      <Table cols={[{ k: 'ma', t: 'Mã địa điểm kinh doanh', cls: 'code', w: 150 }, { k: 'ten', t: 'Tên điểm bán', w: 180 }, { k: 'pos', t: 'Mã POS', cls: 'code', w: 90 },
        { k: 'db', t: 'Địa bàn hành chính', w: 260 }, { k: 'cq', t: 'Cơ quan thuế quản lý', w: 260 }, { k: 'dc', t: 'Địa chỉ', w: 320 }]}
        rows={CUA_HANG.map((c, i) => ({ ma: `0000${i + 1}`, ten: c.ten, pos: c.posId, ...DIA_BAN[i % DIA_BAN.length] }))} />
    </>,
    <>
      <h3>Kê khai doanh thu tính thuế</h3>
      <div className="tk-the-hai">
        <div className="tk-the"><span>Doanh thu {tenKy(tk)}</span><b>{money(so.dt)}</b></div>
        <div className="tk-the"><span>Tổng thuế phải nộp</span><b>{money(so.tong)}</b></div>
      </div>
      <div className="tk-nhom">
        <div className="tk-nhom-dau">I. Hoạt động sản xuất, kinh doanh hàng hoá, cung cấp dịch vụ có địa điểm kinh doanh cố định</div>
        <div className="tk-nhom-ten">{NHOM_NGANH_NGHE.find(x => x.ma === NGANH.nhom)?.ten} · {NGANH.ten}</div>
        <div className="tk-dong"><span>Doanh thu</span><b>{money(so.dt)}</b></div>
        <div className="tk-dong"><span>Thuế GTGT ({NGANH.gtgt}%)</span><b>{money(so.gtgt)}</b></div>
        <div className="tk-dong"><span>Thuế TNCN ({String(NGANH.tncn).replace('.', ',')}%)</span><b>{money(so.tncn)}</b></div>
        {so.giam > 0 && <div className="tk-giam"><Icon n="info" className="ic sm" />Bạn được giảm {money(so.giam)} trước khi tính thuế TNCN (doanh thu cả năm đến 1 tỷ đồng không tính thuế TNCN)</div>}
      </div>
    </>,
    <>
      <h3>Khai phụ lục</h3>
      <div className="tk-pl">01/BK-STK · Bảng kê số tài khoản ngân hàng dùng cho kinh doanh</div>
      <Table cols={[{ k: 'stt', t: 'STT', c: true, w: 50 }, { k: 'diem', t: 'Tên điểm bán', w: 170 }, { k: 'ma', t: 'Mã địa điểm kinh doanh', cls: 'code', w: 150 },
        { k: 'stk', t: 'Số tài khoản', cls: 'code', w: 140 }, { k: 'chu', t: 'Tên chủ tài khoản', w: 180 }, { k: 'nh', t: 'Ngân hàng, cửa hàng', w: 220 },
        { k: 'tt', t: 'Trạng thái tài khoản', w: 140, r: () => <span className="chip ok">Đang hoạt động</span> }]}
        rows={nganHang.map((x, i) => ({ stt: i + 1, diem: CUA_HANG[0].ten, ma: '00001', stk: x.stk, chu: dv.nguoiDaiDien.toUpperCase(), nh: x.ten }))} />
    </>,
    <>
      <h3>Xem và nộp tờ khai</h3>
      <div className="tk-giay">
        <div className="tk-giay-dau"><b>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><span>Độc lập - Tự do - Hạnh phúc</span></div>
        <h2>TỜ KHAI THUẾ ĐỐI VỚI HỘ KINH DOANH, CÁ NHÂN KINH DOANH</h2>
        <p className="tk-giay-ky">Kỳ tính thuế: {tenKy(tk)} · {tenLoai(tk.lan)}</p>
        <div className="tk-giay-tt">
          <span>Người nộp thuế: <b>{dv.ten}</b></span><span>Mã số thuế: <b>{dv.mst || 'Chưa khai'}</b></span>
          <span>Ngành nghề: <b>{NGANH.ten}</b></span><span>Số điểm kinh doanh: <b>{CUA_HANG.length}</b></span>
        </div>
        <table className="tk-giay-bang">
          <thead><tr><th>Nhóm ngành nghề</th><th>Doanh thu</th><th>Thuế GTGT</th><th>Thuế TNCN</th></tr></thead>
          <tbody>
            <tr><td>{NHOM_NGANH_NGHE.find(x => x.ma === NGANH.nhom)?.ten}</td><td>{money(so.dt)}</td><td>{money(so.gtgt)}</td><td>{money(so.tncn)}</td></tr>
            <tr className="tong"><td>Tổng cộng</td><td>{money(so.dt)}</td><td>{money(so.gtgt)}</td><td>{money(so.tncn)}</td></tr>
          </tbody>
        </table>
        <p className="tk-giay-chu">Mẫu xem trước, số liệu giả. Mẫu tờ khai cần kế toán trưởng duyệt trước khi dùng thật.</p>
      </div>
    </>,
  ]

  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop tk-hop" role="dialog" aria-modal="true" aria-label={`Kê khai thuế: ${tenKy(tk)}`}>
        <div className="ds-hop-dau">
          <b>Kê khai thuế: {tenKy(tk)}</b><span className={`chip ${TT_CLS[tk.tt]}`}>{tk.tt}</span><span className="grow" />
          <button type="button" className="pheu-dong" title="Đóng" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="tk-hop-than">
          <aside className="tk-buoc">
            <div className="tk-tien-do"><span className="tk-vach">{BUOC.map((_, i) => <i key={i} className={i < xong ? 'on' : ''} />)}</span><b>Hoàn thành {xong} / {BUOC.length}</b></div>
            <p>Thực hiện {BUOC.length} bước dưới đây để tạo nhanh tờ khai và xem trước khi nộp.</p>
            {BUOC.map((b, i) => (
              <button type="button" key={b.ten} className={`tk-buoc-nut${i === buoc ? ' on' : ''}${i < xong && i !== buoc ? ' xong' : ''}`} onClick={() => den(i)}>
                <span className="tk-so">{i < xong && i !== buoc ? <Icon n="check" className="ic sm" /> : i + 1}</span>
                <span className="tk-buoc-chu"><small>Bước {i + 1}</small>{b.ten}</span>
                <Icon n="chevr" className="ic sm" />
              </button>
            ))}
          </aside>
          <div className="tk-noi-dung">{noiDung[buoc]}</div>
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <span className="grow" />
          {buoc > 0 && <button type="button" className="btn" onClick={() => setBuoc(buoc - 1)}>Quay lại</button>}
          {buoc < BUOC.length - 1 && <button type="button" className="btn pri" onClick={() => den(buoc + 1)}>Tiếp tục</button>}
          {buoc === BUOC.length - 1 && <>
            <button type="button" className="btn" onClick={() => toast(`Đã tải xuống tờ khai ${tk.ma} dạng XML`)}><Icon n="download" className="ic sm" />Tải xuống XML</button>
            {sua && <button type="button" className="btn pri" onClick={() => { tk.tt = 'Đã nộp'; onDoi(); toast(`Đã ghi nhận ${tk.ma} đã nộp cơ quan thuế`); onDong() }}>Đã nộp CQT</button>}
          </>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
