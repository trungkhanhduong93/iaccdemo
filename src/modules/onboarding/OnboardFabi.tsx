// Khởi tạo sổ sách khi mở từ FABi (T138), phần popup: bấm Dùng thử ở /khoi-tao-fabi thì vào phần mềm gói Free,
// popup 5 bước (loại hình và gói, đơn vị, chi nhánh, đồng bộ, số dư) mở đè lên. Đóng popup thì còn thẻ nhắc nổi ở góc dưới phải.
// Tiến độ lưu ở localStorage để quay lại đúng bước.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { DIEM_NOI_BAT, FEATURES, GIA_GOI_NAM, GIA_GOI_THANG, GOI, GOIS, MODS, demTheoGoi, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_HOP_LE, CHE_DO_MAC_DINH, type CheDo } from '../../app/che-do'
import { CHI_NHANH, DAILY, HOM_NAY } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note, Pk } from '../../ui/Page'
import { Dropdown, MenuItem, Select } from '../../ui/Dropdown'

export const BUOC = ['Loại hình và gói', 'Đơn vị', 'Chi nhánh', 'Đồng bộ bán hàng', 'Số dư đầu kỳ']
const XONG = BUOC.length   // bước hoàn tất
export const KEY = 'iacc-khoi-tao-fabi'
export const SO_KENH = 3   // Tại quán, Mang về, App giao đồ ăn (T113)

const DT_FABI = 29_000_000_000   // doanh thu 12 tháng lấy từ FABi
/** Kênh bán online trên FABi; KENH_SAN là sàn giao đồ ăn khấu trừ, nộp thuế thay cho hộ, doanh nghiệp bán qua sàn (T138) */
const KENH_ONLINE = ['GrabFood', 'ShopeeFood', 'Be', 'Zalo', 'Facebook', 'CRM', 'Call center', 'Giao hàng']
const KENH_SAN = ['GrabFood', 'ShopeeFood', 'Be']

/** 4 nhóm hộ kinh doanh theo doanh thu năm, áp dụng từ 01/01/2026. PhuongXT đưa ngưỡng 11/10/2026 (T138); thuế suất chưa đối chiếu văn bản gốc */
type PpHkd = 'doanhThu' | 'loiNhuan'
type LoaiHinh = 'hkd' | 'dn'
const NHOM_HKD: { nhom: number; tu: number; ten: string; thue: string; pp: PpHkd | null }[] = [
  { nhom: 1, tu: 0, ten: 'Dưới 1 tỷ đồng/năm', thue: 'Không phải nộp thuế GTGT, TNCN. Khai doanh thu', pp: 'doanhThu' },
  { nhom: 2, tu: 1e9, ten: 'Từ 1 tỷ đến dưới 3 tỷ đồng/năm', thue: 'Chọn thuế TNCN theo tỷ lệ % trên doanh thu, hoặc theo lợi nhuận 15%', pp: null },
  { nhom: 3, tu: 3e9, ten: 'Từ 3 tỷ đến dưới 50 tỷ đồng/năm', thue: 'Thuế TNCN theo lợi nhuận, thuế suất 17%', pp: 'loiNhuan' },
  { nhom: 4, tu: 50e9, ten: 'Từ 50 tỷ đồng trở lên/năm', thue: 'Thuế TNCN theo lợi nhuận, thuế suất 20%', pp: 'loiNhuan' },
]
const nhomTheoDt = (dt: number) => [...NHOM_HKD].reverse().find(x => dt >= x.tu)!.nhom
const PP_HKD: Record<PpHkd, string> = { doanhThu: 'Theo tỷ lệ % trên doanh thu', loiNhuan: 'Theo lợi nhuận (doanh thu trừ chi phí)' }

/** Hộ kinh doanh luôn theo TT152: tính thuế theo doanh thu gợi ý Free, theo lợi nhuận gợi ý Standard.
 *  Doanh nghiệp chọn đủ 4 gói: Free chỉ quản lý lãi lỗ, không theo thông tư (bên trong ghi sổ như TT152, không hạch toán);
 *  Standard theo TT58; Plus, Pro chọn TT133 hoặc TT99. PhuongXT chốt 11/10/2026 (T138) */
const goiGoiY = (loai: LoaiHinh, pp: PpHkd): Goi => loai === 'hkd' ? (pp === 'doanhThu' ? 'F' : 'S') : CHI_NHANH.length > 1 ? 'PL' : 'S'
const cheDoMoi = (loai: LoaiHinh, g: Goi): CheDo => loai === 'hkd' ? 'TT152' : CHE_DO_MAC_DINH[g]
const tenCheDo = (loai: LoaiHinh, cd: CheDo) => loai === 'dn' && cd === 'TT152' ? 'Quản lý lãi lỗ, không theo thông tư' : CHE_DO[cd].ten
const nganCheDo = (loai: LoaiHinh, cd: CheDo) => loai === 'dn' && cd === 'TT152' ? 'Lãi lỗ' : CHE_DO[cd].ngan
const MO_TA_GOI: Record<LoaiHinh, Partial<Record<Goi, string>>> = {
  hkd: { F: 'Quản lý đơn giản: thu chi, bán hàng, kho. Hợp với tính thuế theo doanh thu', S: 'Theo dõi đủ chi phí để tính thuế theo lợi nhuận' },
  dn: { F: 'Chỉ quản lý lãi lỗ, không theo thông tư nào', S: 'Doanh nghiệp siêu nhỏ theo TT58, ghi sổ không dùng tài khoản', PL: 'Hạch toán Nợ/Có theo TT133 hoặc TT99', PR: 'Như Plus, đủ tính năng cho chuỗi lớn' },
}

/** Danh sách chi nhánh FABi lên sổ, dùng được cho chuỗi vài chục chi nhánh: gom theo khu vực khi có từ 2 khu vực (tích cả nhóm, thu gọn nhóm),
 *  tìm (từ 6 chi nhánh), lọc đã chọn, chưa chọn, chọn tất cả theo kết quả đang lọc. Hộ kinh doanh (coChinh) chọn chi nhánh chính ngay trên dòng, bắt buộc */
type CnFabi = { id: string; ten: string; khuVuc?: string }
function DsChiNhanh({ ds, chon, chinh, doi, coChinh }: { ds: CnFabi[]; chon: string[]; chinh: string; doi: (chon: string[], chinh: string) => void; coChinh: boolean }) {
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState<'tat' | 'co' | 'chua'>('tat')
  const [dong, setDong] = useState<string[]>([])   // khu vực đang thu gọn
  const datChon = (moi: string[]) => doi(moi, moi.includes(chinh) ? chinh : '')
  const tu = tim.trim().toLowerCase()
  const hien = ds.filter(c => (!tu || c.ten.toLowerCase().includes(tu)) && (loc === 'tat' || (loc === 'co') === chon.includes(c.id)))
  const khuVuc = [...new Set(ds.map(c => c.khuVuc ?? 'Khác'))]
  const coNhom = khuVuc.length > 1
  const hetChon = hien.length > 0 && hien.every(c => chon.includes(c.id))
  const batNhieu = (ids: string[], on: boolean) => datChon(on ? [...new Set([...chon, ...ids])] : chon.filter(x => !ids.includes(x)))
  const dongCn = (c: CnFabi) => (
    <div key={c.id} className={`ktf-ds-dong ${chon.includes(c.id) ? 'on' : ''}`}>
      <label><input type="checkbox" checked={chon.includes(c.id)} onChange={() => batNhieu([c.id], !chon.includes(c.id))} /><span>{c.ten}</span></label>
      {coChinh && chon.includes(c.id) && (
        <button className={`ktf-ds-chinh ${c.id === chinh ? 'on' : ''}`} title="Đặt làm chi nhánh chính" onClick={() => doi(chon, c.id)}>
          <span className="radio" />{c.id === chinh ? 'Chi nhánh chính' : 'Chính'}
        </button>
      )}
    </div>
  )
  return (
    <div className="ktf-ds-khung">
      <div className="row ktf-ds-dau">
        {ds.length >= 6 && <div className="ktf-cn-tim"><Icon n="search" className="ic sm" /><input value={tim} onChange={e => setTim(e.target.value)} placeholder="Tìm chi nhánh" /></div>}
        <div className="ktf-ds-loc">
          {([['tat', 'Tất cả', ds.length], ['co', 'Đã chọn', chon.length], ['chua', 'Chưa chọn', ds.length - chon.length]] as const).map(([k, t, d]) => (
            <button key={k} className={loc === k ? 'on' : ''} onClick={() => setLoc(k)}>{t} <b>{d}</b></button>
          ))}
        </div>
        <span className="grow" />
        <button className="btn ghost sm" disabled={!hien.length} onClick={() => batNhieu(hien.map(c => c.id), !hetChon)}>{hetChon ? 'Bỏ chọn' : 'Chọn'} {tu || loc !== 'tat' ? `${hien.length} chi nhánh đang lọc` : 'tất cả'}</button>
      </div>
      <div className="ktf-ds">
        {!hien.length && <div className="ktf-ds-trong muted">Không có chi nhánh khớp</div>}
        {coNhom
          ? khuVuc.map(kv => {
              const nhom = hien.filter(c => (c.khuVuc ?? 'Khác') === kv)
              if (!nhom.length) return null
              const tatCa = ds.filter(c => (c.khuVuc ?? 'Khác') === kv)
              const so = tatCa.filter(c => chon.includes(c.id)).length
              const thuGon = dong.includes(kv) && !tu
              return (
                <div key={kv}>
                  <div className="ktf-ds-nhom">
                    <input type="checkbox" checked={so === tatCa.length} ref={el => { if (el) el.indeterminate = so > 0 && so < tatCa.length }}
                      onChange={() => batNhieu(tatCa.map(c => c.id), so < tatCa.length)} aria-label={`Chọn cả ${kv}`} />
                    <button onClick={() => setDong(x => x.includes(kv) ? x.filter(y => y !== kv) : [...x, kv])}>
                      <Icon n={thuGon ? 'chevr' : 'chevd'} className="ic sm" /><b>{kv}</b><span className="muted">{so}/{tatCa.length}</span>
                    </button>
                  </div>
                  {!thuGon && nhom.map(dongCn)}
                </div>
              )
            })
          : hien.map(dongCn)}
      </div>
      {coChinh && <div className={`ktf-ds-chan ${chinh ? '' : 'thieu'}`}>
        {chinh
          ? <>Chi nhánh chính: <b>{ds.find(c => c.id === chinh)?.ten}</b></>
          : <><Icon n="alert" className="ic sm" />Chưa chọn chi nhánh chính. Bấm nút <b>Chính</b> ở dòng chi nhánh là địa điểm kinh doanh chính.</>}
      </div>}
    </div>
  )
}

/** Ô thả xuống chọn nhiều kênh bán; kênh đã chọn hiện gọn trong ô */
function ChonKenh({ ds, chon, doi, trong }: { ds: string[]; chon: string[]; doi: (k: string) => void; trong: string }) {
  return (
    <Dropdown btnClass="inp ktf-kenh-o" width={260} label={<>
      <span className="ktf-kenh-chon">{chon.length ? chon.join(', ') : <span className="muted">{trong}</span>}</span>
      <Icon n="chevd" className="ic sm" />
    </>}>
      {ds.map(k => <MenuItem key={k} on={chon.includes(k)} onClick={() => doi(k)}>{k}</MenuItem>)}
    </Dropdown>
  )
}

/** Tính năng của gói, gom theo phân hệ. Tính năng gói liền trước chưa có thì đánh dấu Thêm */
function TinhNangGoi({ g, truoc }: { g: Goi; truoc?: Goi }) {
  const ds = FEATURES.filter(f => f.g.includes(g))
  return (
    <div className="ktf-tn">
      <div className="row ktf-tn-dau"><b>Tính năng gói {GOI[g].ten}</b><span className="muted">{ds.length} tính năng{truoc ? `, đánh dấu là phần thêm so với gói ${GOI[truoc].ten}` : ''}</span></div>
      <div className="ktf-tn-luoi">
        {MODS.map((m, i) => {
          const fs = ds.filter(f => f.m === i)
          if (!fs.length) return null
          return (
            <div key={m} className="ktf-tn-mod">
              <b>{m} <span className="muted">{fs.length}</span></b>
              <ul>{fs.map(f => <li key={f.c} className={truoc && !f.g.includes(truoc) ? 'moi' : ''}>{f.n}</li>)}</ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface Nhap {
  b: number            // bước đang làm; -2 là màn chào, -1 là giới thiệu giao diện, 0 tới 4 là bước trong popup, XONG là hoàn tất
  mo: boolean          // popup đang mở; đóng thì hiện thẻ nhắc
  loai: LoaiHinh
  nhom: number         // nhóm hộ kinh doanh 1 tới 4
  ppHkd: PpHkd         // cách tính thuế TNCN của hộ kinh doanh
  goi: Goi
  cheDo: CheDo
  traCuu: boolean
  ngayDauNam: string   // ngày bắt đầu năm tài chính, ghi vào Thông tin đơn vị; số dư đầu kỳ, chứng từ POS tính từ ngày này
  chon: string[]       // id chi nhánh lên sổ
  cnChinh: string      // địa điểm kinh doanh chính, một trong các chi nhánh đã chọn
  kenhOnline: string[] // kênh bán online lấy từ FABi
  kenhSan: string[]    // kênh bán qua sàn đã khấu trừ thuế thay
  dongBo: 'chiTiet' | 'kenh'
  gioChot: string
  soDu: 'nhanh' | 'excel' | 'sau'
  tienMat: string
  tienGui: string
}
export const MAC_DINH: Nhap = {
  b: -2, mo: false, loai: 'dn', nhom: nhomTheoDt(DT_FABI), ppHkd: 'loiNhuan', goi: goiGoiY('dn', 'loiNhuan'), cheDo: cheDoMoi('dn', goiGoiY('dn', 'loiNhuan')), traCuu: true, ngayDauNam: '01/01/2026', chon: CHI_NHANH.map(c => c.id),
  cnChinh: '', kenhOnline: KENH_ONLINE, kenhSan: KENH_SAN,
  dongBo: 'kenh', gioChot: '23:30',
  soDu: 'nhanh', tienMat: '', tienGui: '',
}

export function docNhap(): Nhap {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...MAC_DINH, ...JSON.parse(raw) } : MAC_DINH
  } catch { return MAC_DINH }
}
export function luuNhap(n: Nhap) {
  try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* trình duyệt chặn lưu thì thôi */ }
}

/** Số chứng từ Xuất bán POS sinh từ ngày tu tới hôm nay: chi tiết thì mỗi đơn một chứng từ, theo kênh thì mỗi ngày, chi nhánh, kênh một chứng từ */
function demCt(chon: string[], dongBo: Nhap['dongBo'], tu: number) {
  const ds = DAILY.filter(d => +d.date >= tu && +d.date <= +HOM_NAY && chon.includes(d.cn))
  return dongBo === 'chiTiet' ? ds.reduce((t, d) => t + d.don, 0) : ds.length * SO_KENH
}
const ngay = (dmy: string) => { const [d, m, y] = dmy.split('/').map(Number); return +new Date(y, m - 1, d) }

const so = (n: number) => n.toLocaleString('vi-VN')

/** Popup khởi tạo và thẻ nhắc, đặt trong Shell. Không có tiến độ khởi tạo từ FABi thì không hiện gì */
export function OnboardFabi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [n, setN] = useState<Nhap>(docNhap)
  const sua = (p: Partial<Nhap>) => setN(x => ({ ...x, ...p }))
  const [tai, setTai] = useState(0)   // phần trăm lấy dữ liệu ở bước hoàn tất

  useEffect(() => { if (n.b >= 0) luuNhap(n) }, [n])

  // Esc đóng popup, vẫn ở gói đang dùng
  useEffect(() => {
    if (!n.mo || n.b >= XONG) return
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') sua({ mo: false }) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [n.mo, n.b])

  useEffect(() => {
    if (n.b !== XONG || tai >= 100) return
    const t = setTimeout(() => setTai(x => Math.min(100, x + 7)), 120)
    return () => clearTimeout(t)
  }, [n.b, tai])

  const goiChon = n.loai === 'hkd' ? (['F', 'S'] as Goi[]) : GOIS
  const goiY = goiGoiY(n.loai, n.ppHkd)
  const nhomGoiY = nhomTheoDt(DT_FABI)
  const free = n.goi === 'F'
  const cnChon = CHI_NHANH.filter(c => n.chon.includes(c.id))
  const soCt = demCt(n.chon, n.dongBo, +HOM_NAY - 29 * 86400000)   // ước một tháng, hiện ở bước đồng bộ
  const soCtDaTao = demCt(n.chon, n.dongBo, ngay(n.ngayDauNam))
  const dem = demTheoGoi(n.goi)
  // Điểm nổi bật của gói, bỏ dòng nói về thông tư khác chế độ đang chọn (vd hộ kinh doanh dùng Standard vẫn TT152)
  const ngan = nganCheDo(n.loai, n.cheDo)
  const diemGoi = DIEM_NOI_BAT[n.goi].ds.filter(t => !/TT\d+/.test(t) || t.includes(ngan))

  const bat = (ds: string[], k: string) => ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k]
  const doiKenh = (k: string) => { const on = bat(n.kenhOnline, k); sua({ kenhOnline: on, kenhSan: n.kenhSan.filter(x => on.includes(x)) }) }
  const xong = () => {
    set({ goi: n.goi, cheDo: n.cheDo, khoiTao: true, dongBoFabi: n.dongBo,
      ngayDauNam: { ...s.ngayDauNam, [s.donVi]: n.ngayDauNam }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: Number(n.ngayDauNam.slice(-4)) } })
    try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
    setN(MAC_DINH)
    nav('/app')
  }
  const tiep = () => { sua({ b: n.b + 1 }); if (n.b === XONG - 1) setTai(0) }
  /** Đổi loại hình, nhóm hay cách tính thuế thì gói, chế độ về gợi ý mới */
  const doiLoai = (p: Partial<Pick<Nhap, 'loai' | 'nhom' | 'ppHkd'>>) => {
    const x = { ...n, ...p }
    const pp = x.loai === 'hkd' ? (NHOM_HKD[x.nhom - 1].pp ?? x.ppHkd) : x.ppHkd
    const g = goiGoiY(x.loai, pp)
    sua({ ...p, ppHkd: pp, goi: g, cheDo: cheDoMoi(x.loai, g) })
  }
  const chonGoi = (g: Goi) => sua({ goi: g, cheDo: cheDoMoi(n.loai, g) })

  if (n.b < 0) return null
  if (!n.mo) {
    return (
      <div className="ktf-dai">
        <Icon n="sparkle" className="ic sm" />
        <span><b>Hoàn tất khởi tạo sổ sách</b> · bước {Math.min(n.b + 1, BUOC.length)}/{BUOC.length}{n.b < XONG ? `: ${BUOC[n.b]}` : ''}</span>
        <span className="ktf-dai-tien"><i style={{ width: `${Math.min(n.b, BUOC.length) / BUOC.length * 100}%` }} /></span>
        <button className="btn sm pri" onClick={() => sua({ mo: true })}>Tiếp tục</button>
      </div>
    )
  }

  return (
    <div className="ktf-pop-nen">
      <div className="ktf-pop" role="dialog" aria-label="Khởi tạo sổ sách">
        <div className="row ktf-pop-dau">
          <h2 className="ktf-h">Khởi tạo sổ sách</h2>
          <span className="grow" />
          {n.b < XONG && <span className="muted ktf-luu"><Icon n="check" className="ic sm" />Đã lưu, đóng lại vẫn dùng thử gói Free</span>}
          {n.b < XONG && <button className="btn ghost sm" title="Đóng, làm tiếp sau (Esc)" onClick={() => sua({ mo: false })}><Icon n="x" className="ic sm" /></button>}
        </div>
            {n.b < XONG && (
              <>
                <div className="steps">{BUOC.map((t, i) => <div key={t} className={i <= n.b ? 'on' : ''}><i /><span>{i + 1}. {t}</span></div>)}</div>
                <div className="ktf-luoi">
                  <div className="card" style={{ padding: '24px 26px' }}>
                    {n.b === 0 && (
                      <>
                        <h2 className="ktf-h">Đơn vị thuộc loại hình nào?</h2>
                        <p className="muted ktf-p">Loại hình quyết định chế độ kế toán và gói gợi ý. Chọn xong là có gói ngay bên dưới.</p>
                        <div className="grid g2">
                          {([['hkd', 'store', 'Hộ kinh doanh', 'Hộ, cá nhân kinh doanh. Chế độ kế toán TT152'], ['dn', 'building', 'Doanh nghiệp', 'Công ty TNHH, cổ phần, doanh nghiệp tư nhân']] as const).map(([k, ic, t, m]) => (
                            <button key={k} className={`opt ${n.loai === k ? 'on' : ''}`} onClick={() => doiLoai({ loai: k })}>
                              <span className="radio" /><span className="grow"><b>{t}</b><small>{m}</small></span><Icon n={ic} />
                            </button>
                          ))}
                        </div>
                        {n.loai === 'hkd' && (
                          <>
                            <h3 className="ktf-h3">Hộ kinh doanh thuộc nhóm nào?</h3>
                            <div className="ktf-nhom">
                              {NHOM_HKD.map(x => (
                                <button key={x.nhom} className={`opt ${n.nhom === x.nhom ? 'on' : ''}`} onClick={() => doiLoai({ nhom: x.nhom })}>
                                  <span className="radio" />
                                  <span className="grow">
                                    <span className="row"><b>Nhóm {x.nhom}</b><span className="muted ktf-nhom-dt">{x.ten}</span><span className="grow" />{x.nhom === nhomGoiY && <span className="chip info">Theo doanh thu FABi</span>}</span>
                                    <small>{x.thue}</small>
                                  </span>
                                </button>
                              ))}
                            </div>
                            {NHOM_HKD[n.nhom - 1].pp === null && (
                              <>
                                <h3 className="ktf-h3">Cách tính thuế TNCN</h3>
                                <div className="grid g2">
                                  {(['doanhThu', 'loiNhuan'] as const).map(pp => (
                                    <button key={pp} className={`opt ${n.ppHkd === pp ? 'on' : ''}`} onClick={() => doiLoai({ ppHkd: pp })}>
                                      <span className="radio" /><span><b>{PP_HKD[pp]}</b><small>{pp === 'doanhThu' ? 'Không cần theo dõi chi phí. Gợi ý gói Free' : 'Phải có chứng từ chi phí hợp lý. Gợi ý gói Standard'}</small></span>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                            <Note icon="sparkle">Doanh thu 12 tháng trên FABi khoảng {so(DT_FABI / 1e9)} tỷ đồng, thuộc nhóm {nhomGoiY}.</Note>
                          </>
                        )}
                        <h3 className="ktf-h3">{n.loai === 'hkd' ? 'Gói cho hộ kinh doanh' : 'Doanh nghiệp chọn được cả 4 gói'}</h3>
                        <div className="ktf-goi-xem">
                          {goiChon.map(g => (
                            <button key={g} className={n.goi === g ? 'on' : ''} onClick={() => chonGoi(g)}>
                              <span className="radio" />
                              <Pk g={g} logo />
                              <span>{MO_TA_GOI[n.loai][g]}</span>
                              <span className="ktf-goi-dem">{g === goiY && <span className="chip info">Gợi ý</span>}<b>{demTheoGoi(g).co}</b> tính năng</span>
                            </button>
                          ))}
                        </div>
                        {n.loai === 'dn' && (n.goi === 'PL' || n.goi === 'PR') && (
                          <div className="f" style={{ marginTop: 14, maxWidth: 420 }}>
                            <label>Chế độ kế toán</label>
                            <Select className="inp" value={n.cheDo} onChange={e => sua({ cheDo: e.target.value as CheDo })}>
                              {CHE_DO_HOP_LE[n.goi].map(cd => <option key={cd} value={cd}>{CHE_DO[cd].ngan} · {CHE_DO[cd].ten}</option>)}
                            </Select>
                          </div>
                        )}
                        <details className="ktf-tn-mo">
                          <summary>Xem {demTheoGoi(n.goi).co} tính năng gói {GOI[n.goi].ten}</summary>
                          <TinhNangGoi g={n.goi} truoc={goiChon[goiChon.indexOf(n.goi) - 1]} />
                        </details>
                      </>
                    )}

                    {n.b === 1 && (
                      <>
                        <h2 className="ktf-h">Thông tin đơn vị</h2>
                        <p className="muted ktf-p">Điền thông tin {n.loai === 'hkd' ? 'hộ kinh doanh' : 'công ty'} của bạn. Tên, địa chỉ tra cứu từ dữ liệu thuế.</p>
                        <div className="form-grid">
                          <div className="f c2"><label>Mã số thuế <em>*</em></label>
                            <div className="row"><input className="inp" defaultValue="0319990001" />
                              <button className="btn" onClick={() => sua({ traCuu: true })}>Tra cứu</button></div>
                          </div>
                          <div className="f c2"><label>Ngày bắt đầu năm tài chính</label>
                            <Select className="inp" value={n.ngayDauNam} onChange={e => sua({ ngayDauNam: e.target.value })}>
                              {['01/01/2026', '01/04/2026', '01/07/2026', '01/10/2026'].map(d => <option key={d}>{d}</option>)}
                            </Select>
                          </div>
                          <div className="f c4"><label>{n.loai === 'hkd' ? 'Tên hộ kinh doanh' : 'Tên công ty'} <em>*</em></label><input className="inp" value={n.traCuu ? (n.loai === 'hkd' ? 'Hộ kinh doanh Ẩm thực Phố Mây' : 'Công ty TNHH Ẩm thực Phố Mây') : ''} onChange={() => {}} /></div>
                          <div className="f c4"><label>Địa chỉ</label><input className="inp" value={n.traCuu ? '86 Lê Lợi, phường Sài Gòn, TP.HCM' : ''} onChange={() => {}} /></div>
                        </div>
                      </>
                    )}

                    {n.b === 2 && (
                      <>
                        <h2 className="ktf-h">Chi nhánh</h2>
                        <p className="muted ktf-p">Tích chi nhánh lên sổ kế toán.</p>
                        <DsChiNhanh ds={CHI_NHANH} chon={n.chon} chinh={n.cnChinh} doi={(chon, cnChinh) => sua({ chon, cnChinh })} coChinh={n.loai === 'hkd'} />
                        {cnChon.length === 0 && <Note kind="warn" icon="alert">Chọn ít nhất một chi nhánh để tiếp tục.</Note>}
                        {n.loai === 'hkd' && cnChon.length > 0 && (
                          <>
                            <h3 className="ktf-h3">Kênh bán</h3>
                            <div className="ktf-kenh">
                              <label>Kênh bán online</label>
                              <div><ChonKenh ds={KENH_ONLINE} chon={n.kenhOnline} doi={doiKenh} trong="Chọn kênh bán" /></div>
                              <label>Kênh bán qua sàn đã khấu trừ thuế</label>
                              <div>
                                <ChonKenh ds={KENH_SAN.filter(k => n.kenhOnline.includes(k))} chon={n.kenhSan} doi={k => sua({ kenhSan: bat(n.kenhSan, k) })} trong="Chọn sàn" />
                                <small className="muted">Doanh thu qua các sàn này đã được sàn khấu trừ, nộp thuế thay.</small>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {n.b === 3 && (
                      <>
                        <h2 className="ktf-h">Đồng bộ bán hàng từ FABi</h2>
                        <p className="muted ktf-p">Đơn bán trên FABi tự về thành chứng từ Xuất bán POS. Chọn cách gom.</p>
                        <div className="grid g2">
                          <button className={`opt ${n.dongBo === 'kenh' ? 'on' : ''}`} onClick={() => sua({ dongBo: 'kenh' })}><span className="radio" />
                            <span><b>Tổng hợp theo kênh</b><small>Mỗi ngày, mỗi chi nhánh, mỗi kênh bán một chứng từ. Sổ gọn</small></span></button>
                          <button className={`opt ${n.dongBo === 'chiTiet' ? 'on' : ''}`} onClick={() => sua({ dongBo: 'chiTiet' })}><span className="radio" />
                            <span><b>Chi tiết theo hoá đơn</b><small>Mỗi hoá đơn FABi một chứng từ. Tra được từng đơn</small></span></button>
                        </div>
                        <div className="f" style={{ marginTop: 14, maxWidth: 260 }}><label>Giờ chốt cuối ngày</label>
                          <Select className="inp" value={n.gioChot} onChange={e => sua({ gioChot: e.target.value })}>
                            {['22:00', '23:00', '23:30', '02:00 hôm sau'].map(g => <option key={g}>{g}</option>)}
                          </Select>
                        </div>
                        <div className="ktf-xem">
                          <Icon n="receipt" />
                          <span>Theo số đơn 30 ngày gần nhất, cách này sinh khoảng <b>{so(soCt)} chứng từ</b> Xuất bán POS mỗi tháng cho {cnChon.length} chi nhánh.</span>
                        </div>
                      </>
                    )}

                    {n.b === 4 && (
                      <>
                        <h2 className="ktf-h">Số dư đầu kỳ</h2>
                        <p className="muted ktf-p">Số dư ngày {n.ngayDauNam}. Chưa có số thì để sau, phần mềm vẫn dùng được.</p>
                        {!free && (
                          <div className="grid g3" style={{ marginBottom: 16 }}>
                            {([['nhanh', 'edit', 'Nhập nhanh', 'Tiền mặt, tiền gửi'], ['excel', 'upload', 'Nhập từ Excel', 'Số dư tài khoản, công nợ, tồn kho'], ['sau', 'clock', 'Để sau', 'Nhập ở Kế toán tổng hợp']] as const).map(([k, ic, t, m]) => (
                              <button key={k} className={`opt ${n.soDu === k ? 'on' : ''}`} onClick={() => sua({ soDu: k })}><Icon n={ic} /><span><b>{t}</b><small>{m}</small></span></button>
                            ))}
                          </div>
                        )}
                        {(free || n.soDu === 'nhanh') && (
                          <div className="form-grid">
                            <div className="f c2"><label>Tiền mặt tại quỹ</label><input className="inp num" value={n.tienMat} onChange={e => sua({ tienMat: e.target.value })} placeholder="0 đ" /></div>
                            <div className="f c2"><label>Tiền gửi ngân hàng</label><input className="inp num" value={n.tienGui} onChange={e => sua({ tienGui: e.target.value })} placeholder="0 đ" /></div>
                          </div>
                        )}
                        {!free && n.soDu === 'excel' && (
                          <div className="card ktf-tha">
                            <Icon n="filein" className="ic lg" />
                            <p>Kéo thả tệp Excel vào đây</p>
                            <button className="btn sm"><Icon n="download" className="ic sm" />Tải mẫu Excel số dư</button>
                          </div>
                        )}
                        {free && <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>Tồn kho đầu kỳ lấy theo kiểm kê đầu tiên ở phân hệ Kho.</p>}
                      </>
                    )}

                    <div className="row" style={{ marginTop: 22, justifyContent: 'flex-end', gap: 8 }}>
                      {n.b > 0 && <button className="btn lg" onClick={() => sua({ b: n.b - 1 })}>Quay lại</button>}
                      {n.b === 4 && <button className="btn ghost lg" onClick={() => { sua({ soDu: 'sau', tienMat: '', tienGui: '' }); tiep() }}>Bỏ qua</button>}
                      <button className="btn pri lg" disabled={n.b === 2 && (cnChon.length === 0 || (n.loai === 'hkd' && !n.cnChinh))} onClick={tiep}>
                        {n.b === XONG - 1 ? 'Hoàn tất' : 'Tiếp tục'}<Icon n="arrow" className="ic sm" />
                      </button>
                    </div>
                  </div>

                  <aside className="card ktf-ben">
                    <h3>Bạn sẽ có gì</h3>
                    <div className="row" style={{ gap: 8 }}><Pk g={n.goi} logo /><span className="chip">{nganCheDo(n.loai, n.cheDo)}</span></div>
                    <div className="ktf-gia">
                      <b>{GIA_GOI_NAM[n.goi].gia}</b><span>{GIA_GOI_NAM[n.goi].chuKy}</span>
                      <small>{n.goi === 'F' ? GIA_GOI_NAM.F.ghiChu : `${GIA_GOI_NAM[n.goi].ghiChu}. Trả từng tháng ${GIA_GOI_THANG[n.goi].gia}`}</small>
                    </div>
                    <ul>
                      <li><Icon n="book" className="ic sm" /><span>{tenCheDo(n.loai, n.cheDo)}</span></li>
                      {diemGoi.map(t => <li key={t}><Icon n="check" className="ic sm" /><span>{t}</span></li>)}
                    </ul>
                    <small className="muted">{n.loai === 'hkd' ? `Hộ kinh doanh nhóm ${n.nhom}` : 'Doanh nghiệp'} · {cnChon.length} chi nhánh · {dem.co}/{dem.tong} tính năng</small>
                  </aside>
                </div>
              </>
            )}

            {n.b === XONG && (
              <div className="card ktf-chao">
                {tai < 100
                  ? <>
                      <h1>Đang lấy dữ liệu từ FABi</h1>
                      <p>Doanh thu từ {n.ngayDauNam} của {cnChon.length} chi nhánh.</p>
                      <div className="ktf-tai"><i style={{ width: `${tai}%` }} /></div>
                      <p className="muted" style={{ fontSize: 12.5 }}>{tai < 40 ? 'Lấy danh mục món, kênh bán' : tai < 80 ? `Tạo ${so(soCtDaTao)} chứng từ Xuất bán POS` : 'Ghi sổ doanh thu, thuế đầu ra'}</p>
                    </>
                  : <>
                      <div className="ktf-chao-ic ok"><Icon n="check" className="ic lg" /></div>
                      <h1>Xong. Sổ sách đã sẵn sàng</h1>
                      <p>Đã tạo {so(soCtDaTao)} chứng từ Xuất bán POS từ {n.ngayDauNam}. Việc nên làm tiếp:</p>
                      <ul className="ktf-viec">
                        <li><Icon n="bank" className="ic sm" />Khai báo tài khoản ngân hàng</li>
                        <li><Icon n="alert" className="ic sm" />Xem đơn POS đồng bộ lỗi</li>
                        <li><Icon n="users" className="ic sm" />Mời kế toán cùng làm</li>
                      </ul>
                      <button className="btn acc lg" onClick={xong}>Bắt đầu làm việc<Icon n="arrow" className="ic sm" /></button>
                    </>}
              </div>
            )}
      </div>
    </div>
  )
}
