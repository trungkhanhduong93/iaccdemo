// Khởi tạo dữ liệu khi mở từ FABi (T138), phần popup: bấm Kết nối ở /khoi-tao-fabi thì vào phần mềm, popup 1 bước mở đè lên:
// chọn cửa hàng, ngày bắt đầu làm việc, xem PTTT FABi về quỹ nào. Loại hình, gói, thông tin đơn vị (3 bước cũ) hỏi khi mở Kê khai thuế.
// Thêm đơn vị kế toán vẫn đi đủ 3 bước. Tiến độ lưu ở localStorage để quay lại đúng bước.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SO_NGAY_DUNG_THU, batDauDungThu, dungThuDv, useSession, type Session } from '../../app/session'
import { CUA_HANG_FABI, cuaHangChuaDung, type CuaHangFabi } from './cua-hang-fabi'
import { DIEM_NOI_BAT, FEATURES, GIA_GOI_NAM, GIA_GOI_THANG, GOI, GOIS, GOI_MO, MODS, demTheoGoi, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_DN_STANDARD, CHE_DO_HOP_LE, CHE_DO_MAC_DINH, type CheDo } from '../../app/che-do'
import { CUA_HANG, DAILY, HOM_NAY, type DonVi } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Note, Pk } from '../../ui/Page'
import { Dropdown, MenuItem, Select } from '../../ui/Dropdown'
import { ChonHaiCot } from '../../ui/ChonHaiCot'
import { ONgay } from '../../ui/ChonNgay'
import { TiepHuongDan } from '../home/HuongDan'

export const BUOC = ['Loại hình và gói', 'Đơn vị', 'Cửa hàng']   // bỏ Đồng bộ bán hàng; FABi luôn kéo chi tiết theo hoá đơn (T158, T247)
const XONG = BUOC.length   // bước hoàn tất
export const KEY = 'iacc-khoi-tao-fabi'
/** Tên đơn vị trên FABi; FABi không có mã số thuế (T138) */
export const TEN_FABI = 'Phố Mây'
export const SO_KENH = 3   // Tại quán, Mang về, App giao đồ ăn (T113)

const DT_FABI = 29_000_000_000   // doanh thu 12 tháng lấy từ FABi
/** Năm tài chính đơn vị mới từ FABi tự bắt đầu ngày đầu năm hiện tại (T138) */
const DAU_NAM = `01/01/${HOM_NAY.getFullYear()}`
/** PTTT trên FABi về quỹ nào khi khởi tạo: tiền mặt về quỹ tiền mặt, ngân hàng và ví điện tử về một quỹ ngân hàng chung (T138) */
const PTTT_VE_QUY: [string, string][] = [
  ['Tiền mặt', 'Quỹ tiền mặt'],
  ['Chuyển khoản, QR, thẻ', 'Quỹ ngân hàng chung'],
  ['Ví điện tử (MoMo, ZaloPay, ShopeePay)', 'Quỹ ngân hàng chung'],
]

/** Cửa hàng hiện ở bước Cửa hàng: dùng thử từ FABi là đơn vị mới nên có mọi cửa hàng; thêm đơn vị chỉ có cửa hàng chưa dùng kế toán */
const dsCuaHang = (kieu: Nhap['kieu'], s: Pick<Session, 'cnThem' | 'donVi'>): CuaHangFabi[] => kieu === 'them' ? cuaHangChuaDung(s) : CUA_HANG.map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM' }))
/** Kênh bán online trên FABi; KENH_SAN là sàn giao đồ ăn khấu trừ, nộp thuế thay cho hộ, doanh nghiệp bán qua sàn (T138) */
export const KENH_ONLINE = ['GrabFood', 'ShopeeFood', 'Be', 'Zalo', 'Facebook', 'CRM', 'Call center', 'Giao hàng']
export const KENH_SAN = ['GrabFood', 'ShopeeFood', 'Be']

/** 4 nhóm hộ kinh doanh theo doanh thu năm, áp dụng từ 01/01/2026. PhuongXT đưa ngưỡng 11/10/2026 (T138); thuế suất chưa đối chiếu văn bản gốc */
export type PpHkd = 'doanhThu' | 'loiNhuan'
export type LoaiHinh = 'hkd' | 'dn'
export const NHOM_HKD: { nhom: number; tu: number; ten: string; thue: string; pp: PpHkd | null }[] = [
  { nhom: 1, tu: 0, ten: 'Dưới 1 tỷ đồng/năm', thue: 'Không phải nộp thuế GTGT, TNCN. Khai doanh thu', pp: 'doanhThu' },
  { nhom: 2, tu: 1e9, ten: 'Từ 1 tỷ đến dưới 3 tỷ đồng/năm', thue: 'Chọn thuế TNCN theo tỷ lệ % trên doanh thu, hoặc theo lợi nhuận 15%', pp: null },
  { nhom: 3, tu: 3e9, ten: 'Từ 3 tỷ đến dưới 50 tỷ đồng/năm', thue: 'Thuế TNCN theo lợi nhuận, thuế suất 17%', pp: 'loiNhuan' },
  { nhom: 4, tu: 50e9, ten: 'Từ 50 tỷ đồng trở lên/năm', thue: 'Thuế TNCN theo lợi nhuận, thuế suất 20%', pp: 'loiNhuan' },
]
const nhomTheoDt = (dt: number) => [...NHOM_HKD].reverse().find(x => dt >= x.tu)!.nhom
export const PP_HKD: Record<PpHkd, string> = { doanhThu: 'Theo tỷ lệ % trên doanh thu', loiNhuan: 'Theo lợi nhuận (doanh thu trừ chi phí)' }

/** Hộ kinh doanh luôn theo TT152: tính thuế theo doanh thu gợi ý Free, theo lợi nhuận gợi ý Standard.
 *  Doanh nghiệp chọn đủ 4 gói: Free theo TT58 trường hợp 1, chỉ sổ doanh thu S1-DNSN (T632);
 *  Standard theo TT58; Plus, Pro chọn TT133 hoặc TT99. PhuongXT chốt 11/10/2026 (T138) */
/** Doanh nghiệp cũng hỏi cách tính thuế (lưu chung trường ppHkd): GTGT, TNDN theo % doanh thu hay khấu trừ, lợi nhuận (T663) */
export const PP_DN: Record<PpHkd, string> = { doanhThu: 'Theo tỷ lệ % trên doanh thu', loiNhuan: 'Theo khấu trừ (GTGT) và lợi nhuận (TNDN)' }

/** Quản lý (lãi lỗ, thu chi, mua hàng, công nợ, kho) gói nào cũng đáp ứng mọi mô hình; kê khai thuế, sổ theo thông tư
 *  chỉ đáp ứng các trường hợp khai ở đây. Gói chưa khai coi như đáp ứng mọi trường hợp. PhuongXT chốt 26/10/2026 (T663) */
const KE_KHAI: Partial<Record<Goi, { loai: LoaiHinh; nhom?: number[]; pp: PpHkd }[]>> = {
  S: [{ loai: 'hkd', nhom: [1, 2], pp: 'doanhThu' }, { loai: 'dn', pp: 'doanhThu' }],
}
const keKhaiDuoc = (g: Goi, loai: LoaiHinh, nhom: number, pp: PpHkd) =>
  !KE_KHAI[g] || KE_KHAI[g].some(k => k.loai === loai && (!k.nhom || k.nhom.includes(nhom)) && k.pp === pp)
/** Gói mở bán theo loại hình: hộ kinh doanh chỉ Standard, Plus */
const goiCua = (loai: LoaiHinh) => (loai === 'hkd' ? (['S', 'PL'] as Goi[]) : GOIS).filter(g => GOI_MO.includes(g))
/** Gợi ý gói nhỏ nhất kê khai được; không gói nào kê khai được thì gói lớn nhất đang mở */
const goiGoiY = (loai: LoaiHinh, nhom: number, pp: PpHkd): Goi => {
  const ds = goiCua(loai)
  return ds.find(g => keKhaiDuoc(g, loai, nhom, pp)) ?? ds[ds.length - 1]
}
const cheDoMoi = (loai: LoaiHinh, g: Goi): CheDo => loai === 'hkd' ? 'TT152' : g === 'S' ? CHE_DO_DN_STANDARD : CHE_DO_MAC_DINH[g]
const nganCheDo = (loai: LoaiHinh, cd: CheDo) => loai === 'dn' && cd === 'TT152' ? 'Lãi lỗ' : CHE_DO[cd].ngan
const MO_TA_GOI: Record<LoaiHinh, Partial<Record<Goi, string>>> = {
  hkd: { S: 'Quản lý đơn giản: lãi lỗ, thu chi, mua hàng và công nợ, hao hụt hàng bán thẳng. Hợp với tính thuế theo doanh thu', PL: 'Theo dõi đủ chi phí để tính thuế theo lợi nhuận' },
  dn: { S: 'Doanh nghiệp siêu nhỏ theo TT58, chỉ sổ doanh thu S1-DNSN', PL: 'Doanh nghiệp siêu nhỏ theo TT58, ghi sổ không dùng tài khoản', PR: 'Hạch toán Nợ/Có theo TT133 hoặc TT99, đủ tính năng cho chuỗi lớn' },
}

/** Danh sách cửa hàng FABi lên sổ, dùng được cho chuỗi vài chục cửa hàng: gom theo khu vực khi có từ 2 khu vực (tích cả nhóm, thu gọn nhóm),
 *  tìm (từ 6 cửa hàng), lọc đã chọn, chưa chọn, chọn tất cả theo kết quả đang lọc. Hộ kinh doanh (coChinh) chọn cửa hàng chính ngay trên dòng, bắt buộc.
 *  chiChinh: cửa hàng đã lên sổ, chỉ chọn cửa hàng chính, không tích bỏ (popup kê khai thuế, PhuongXT 29/10/2026) */
type CnFabi = { id: string; ten: string; khuVuc?: string }
export function DsCuaHang({ ds, chon, chinh, doi, coChinh, chiChinh }: { ds: CnFabi[]; chon: string[]; chinh: string; doi: (chon: string[], chinh: string) => void; coChinh: boolean; chiChinh?: boolean }) {
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
      {chiChinh
        ? <span className="ktf-ds-ten">{c.ten}</span>
        : <label><input type="checkbox" checked={chon.includes(c.id)} onChange={() => batNhieu([c.id], !chon.includes(c.id))} /><span>{c.ten}</span></label>}
      {coChinh && chon.includes(c.id) && (
        <button className={`ktf-ds-chinh ${c.id === chinh ? 'on' : ''}`} title="Đặt làm cửa hàng chính" onClick={() => doi(chon, c.id)}>
          <span className="radio" />{c.id === chinh ? 'Cửa hàng chính' : 'Chính'}
        </button>
      )}
    </div>
  )
  return (
    <div className="ktf-ds-khung">
      {(!chiChinh || ds.length >= 6) && <div className="row ktf-ds-dau">
        {ds.length >= 6 && <div className="ktf-cn-tim"><Icon n="search" className="ic sm" /><input value={tim} onChange={e => setTim(e.target.value)} placeholder="Tìm cửa hàng" /></div>}
        {!chiChinh && <><div className="ktf-ds-loc">
          {([['tat', 'Tất cả', ds.length], ['co', 'Đã chọn', chon.length], ['chua', 'Chưa chọn', ds.length - chon.length]] as const).map(([k, t, d]) => (
            <button key={k} className={loc === k ? 'on' : ''} onClick={() => setLoc(k)}>{t} <b>{d}</b></button>
          ))}
        </div>
        <span className="grow" />
        <button className="btn ghost sm" disabled={!hien.length} onClick={() => batNhieu(hien.map(c => c.id), !hetChon)}>{hetChon ? 'Bỏ chọn' : 'Chọn'} {tu || loc !== 'tat' ? `${hien.length} cửa hàng đang lọc` : 'tất cả'}</button></>}
      </div>}
      <div className="ktf-ds">
        {!hien.length && <div className="ktf-ds-trong muted">Không có cửa hàng khớp</div>}
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
                    {!chiChinh && <input type="checkbox" checked={so === tatCa.length} ref={el => { if (el) el.indeterminate = so > 0 && so < tatCa.length }}
                      onChange={() => batNhieu(tatCa.map(c => c.id), so < tatCa.length)} aria-label={`Chọn cả ${kv}`} />}
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
          ? <>Cửa hàng chính: <b>{ds.find(c => c.id === chinh)?.ten}</b></>
          : <><Icon n="alert" className="ic sm" />Chưa chọn cửa hàng chính. Bấm nút <b>Chính</b> ở dòng cửa hàng là địa điểm kinh doanh chính.</>}
      </div>}
    </div>
  )
}

/** Ô chọn nhiều kênh bán hai cột (T381) */
export function ChonKenh({ ds, chon, doi, trong }: { ds: string[]; chon: string[]; doi: (k: string) => void; trong: string }) {
  return (
    <ChonHaiCot
      ds={ds}
      value={chon}
      onChange={moi => {
        const them = moi.filter(x => !chon.includes(x))
        const bot = chon.filter(x => !moi.includes(x))
        for (const k of [...them, ...bot]) doi(k)
      }}
      nhan={trong}
      goiY={trong}
      btnClass="ktf-kenh-o"
    />
  )
}

/** Tính năng của gói, gom theo phân hệ. Tính năng gói liền trước chưa có thì đánh dấu Thêm */
/** Tính năng kê khai thuế thêm vào gói khi loại hình, nhóm, cách tính thuế kê khai được ở gói (T663) */
const TN_KE_KHAI = ['6.2.3']
/** Khởi tạo gọi phân hệ Thuế GTGT là Kê khai thuế (T663) */
const TEN_MOD: Record<string, string> = { 'Thuế GTGT': 'Kê khai thuế' }

const MOD_THUE = MODS.indexOf('Thuế GTGT')
/** Tính năng gói hiện ở khởi tạo: kê khai được thì thêm TN_KE_KHAI, chưa kê khai được thì bỏ cả nhóm Kê khai thuế (T663) */
const tnKhoiTao = (g: Goi, keKhai: boolean) => FEATURES.filter(f => keKhai ? f.g.includes(g) || TN_KE_KHAI.includes(f.c) : f.g.includes(g) && f.m !== MOD_THUE)

function TinhNangGoi({ g, truoc, keKhai }: { g: Goi; truoc?: Goi; keKhai: boolean }) {
  const ds = tnKhoiTao(g, keKhai)
  return (
    <div className="ktf-tn">
      <div className="row ktf-tn-dau"><b>Tính năng gói {GOI[g].ten}</b><span className="muted">{ds.length} tính năng{truoc ? `, đánh dấu là phần thêm so với gói ${GOI[truoc].ten}` : ''}</span></div>
      <div className="ktf-tn-luoi">
        {MODS.map((m, i) => {
          const fs = ds.filter(f => f.m === i)
          if (!fs.length) return null
          return (
            <div key={m} className="ktf-tn-mod">
              <b>{TEN_MOD[m] ?? m} <span className="muted">{fs.length}</span></b>
              <ul>{fs.map(f => <li key={f.c} className={truoc && !f.g.includes(truoc) ? 'moi' : ''}>{f.n}</li>)}</ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export interface Nhap {
  kieu: 'fabi' | 'them'   // fabi: dùng thử từ FABi (đơn vị mới, mọi cửa hàng); them: Thêm đơn vị kế toán khi đã dùng IACC
  b: number            // bước đang làm; -1 là giới thiệu giao diện, 0 tới 3 là bước trong popup, XONG là hoàn tất
  mo: boolean          // popup đang mở (3 bước bắt buộc nên luôn mở khi đang khởi tạo, T158)
  loai: LoaiHinh
  nhom: number         // nhóm hộ kinh doanh 1 tới 4
  ppHkd: PpHkd         // cách tính thuế TNCN của hộ kinh doanh
  goi: Goi
  cheDo: CheDo
  traCuu: boolean
  mst: string          // FABi không có, người dùng nhập
  tenDv: string        // mặc định tên FABi, tra cứu thì theo dữ liệu thuế
  diaChi: string
  ngayDauNam: string   // ngày bắt đầu năm tài chính, ghi vào Thông tin đơn vị; từ FABi tự là ngày đầu năm hiện tại, sửa ở Cấu hình hệ thống
  ngayLam: string      // ngày bắt đầu làm việc (nhập liệu trên IACC), từ FABi: doanh thu POS, thu chi FABi tự về từ ngày này
  thue: boolean        // đang hỏi 3 bước cũ khi mở Kê khai thuế (đơn vị đã khởi tạo nhanh từ FABi)
  chon: string[]       // id cửa hàng lên sổ
  cnChinh: string      // địa điểm kinh doanh chính, một trong các cửa hàng đã chọn
  kenhOnline: string[] // kênh bán online lấy từ FABi
  kenhSan: string[]    // kênh bán qua sàn đã khấu trừ thuế thay
  dongBo: 'chiTiet' | 'kenh'
}
export const MAC_DINH: Nhap = {
  kieu: 'fabi', b: -1, mo: false, loai: 'dn', nhom: nhomTheoDt(DT_FABI), ppHkd: 'loiNhuan', goi: goiGoiY('dn', nhomTheoDt(DT_FABI), 'loiNhuan'), cheDo: cheDoMoi('dn', goiGoiY('dn', nhomTheoDt(DT_FABI), 'loiNhuan')), traCuu: false, mst: '', tenDv: TEN_FABI, diaChi: '', ngayDauNam: DAU_NAM, chon: CUA_HANG.map(c => c.id),
  ngayLam: `01/${String(HOM_NAY.getMonth() + 1).padStart(2, '0')}/${HOM_NAY.getFullYear()}`, thue: false,
  cnChinh: '', kenhOnline: KENH_ONLINE, kenhSan: KENH_SAN,
  dongBo: 'chiTiet',   // đồng bộ FABi chỉ kéo chi tiết theo hoá đơn (T247)
}

export function docNhap(): Nhap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return MAC_DINH
    const n: Nhap = { ...MAC_DINH, ...JSON.parse(raw) }
    // bản nháp cũ đã chọn gói chưa mở bán thì về gợi ý mới (T663)
    if (GOI_MO.includes(n.goi)) return n
    const g = goiGoiY(n.loai, n.nhom, n.ppHkd)
    return { ...n, goi: g, cheDo: cheDoMoi(n.loai, g) }
  } catch { return MAC_DINH }
}
export function luuNhap(n: Nhap) {
  try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* trình duyệt chặn lưu thì thôi */ }
}
const SU_KIEN = 'iacc-mo-khoi-tao'
const CHI_XEM_GOI = 'chi-xem'   // tham số đường dẫn: tab mở từ Xem so sánh gói, không hiện popup khởi tạo (T663)
/** Lưu tiến độ rồi báo popup trong Shell đọc lại, để mở popup khi Shell đã mở sẵn (Thêm đơn vị kế toán) */
function moKhoiTao(n: Nhap) {
  luuNhap(n)
  window.dispatchEvent(new Event(SU_KIEN))
}

/** Thêm đơn vị kế toán: tạo đơn vị mới gói Free, chưa có MST, rồi mở popup khởi tạo 4 bước; bước Cửa hàng chỉ có cửa hàng FABi chưa dùng kế toán */
export function useThemDonVi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  return () => {
    const dvMoi: DonVi = { id: 'moi', ten: 'Đơn vị mới', viettat: 'DV', mst: '', goi: 'S', diaChi: '', diem: 0, nguoiDaiDien: '' }
    set({ goi: 'S', cheDo: 'TT152', donVi: dvMoi.id, dvMoi, khoiTao: true, cuaHang: 'all', dungThu: { ...s.dungThu, [dvMoi.id]: batDauDungThu() } })
    const moi = dsCuaHang('them', s).map(c => c.id)
    moKhoiTao({ ...MAC_DINH, kieu: 'them', b: 0, mo: true, tenDv: '', chon: moi })
    nav('/app')
  }
}

/** Số chứng từ Xuất bán POS sinh từ ngày tu tới hôm nay: chi tiết thì mỗi đơn một chứng từ, theo kênh thì mỗi ngày, cửa hàng, kênh một chứng từ */
function demCt(chon: string[], dongBo: Nhap['dongBo'], tu: number) {
  const dem = (ids: string[]) => {
    const ds = DAILY.filter(d => +d.date >= tu && +d.date <= +HOM_NAY && ids.includes(d.cn))
    return dongBo === 'chiTiet' ? ds.reduce((t, d) => t + d.don, 0) : ds.length * SO_KENH
  }
  const coSo = chon.filter(id => CUA_HANG.some(c => c.id === id))
  // cửa hàng chưa có số bán mẫu (thêm đơn vị) tính bằng bình quân một cửa hàng mẫu
  return dem(coSo) + Math.round(dem(CUA_HANG.map(c => c.id)) / CUA_HANG.length) * (chon.length - coSo.length)
}
const ngay = (dmy: string) => { const [d, m, y] = dmy.split('/').map(Number); return +new Date(y, m - 1, d) }

const so = (n: number) => n.toLocaleString('vi-VN')
/** Chữ viết tắt đơn vị: chữ đầu hai từ cuối tên, vd Công ty TNHH Nhà hàng Phố Mây thành PM */
const vietTat = (ten: string) => ten.trim().split(/\s+/).filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase()

/** Popup khởi tạo và thẻ nhắc, đặt trong Shell. Không có tiến độ khởi tạo từ FABi thì không hiện gì */
export function OnboardFabi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [n, setN] = useState<Nhap>(docNhap)
  const dt = dungThuDv(s)
  useEffect(() => {
    const doc = () => setN(docNhap())
    window.addEventListener(SU_KIEN, doc)
    return () => window.removeEventListener(SU_KIEN, doc)
  }, [])
  const sua = (p: Partial<Nhap>) => setN(x => ({ ...x, ...p }))
  const [tai, setTai] = useState(0)   // phần trăm lấy dữ liệu ở bước hoàn tất
  const loc = useLocation()
  const chiXemGoi = new URLSearchParams(loc.search).has(CHI_XEM_GOI)

  useEffect(() => { if (n.b >= 0) luuNhap(n) }, [n])
  // Đơn vị khởi tạo nhanh từ FABi mở Kê khai thuế: hỏi loại hình, gói, thông tin đơn vị (3 bước cũ), cửa hàng giữ như đã kết nối
  useEffect(() => {
    if (!s.choKeKhai?.[s.donVi] || !loc.pathname.startsWith('/app/thue') || n.b >= 0) return
    const cn = (s.cnThem?.[s.donVi] ?? []).map(c => c.id)
    // gói Standard chỉ kê khai được hộ kinh doanh nhóm 1, 2 và doanh nghiệp theo % doanh thu (KE_KHAI): mặc định theo % doanh thu
    setN({ ...MAC_DINH, thue: true, b: 0, mo: true, nhom: 1, ppHkd: 'doanhThu', tenDv: s.dvMoi?.ten ?? TEN_FABI, chon: cn, ngayDauNam: s.ngayDauNam?.[s.donVi] ?? DAU_NAM })
  }, [loc.pathname, s.donVi])   // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (n.b !== XONG || tai >= 100) return
    const t = setTimeout(() => setTai(x => Math.min(100, x + 4)), 120)
    return () => clearTimeout(t)
  }, [n.b, tai])
  // Kết nối từ FABi: lấy dữ liệu xong thì về thẳng Trang chủ, không dừng ở màn Dữ liệu đã sẵn sàng (T138)
  useEffect(() => {
    if (!nhanh || n.b !== XONG || tai < 100) return
    const t = setTimeout(xong, 400)
    return () => clearTimeout(t)
  }, [n.b, tai])   // eslint-disable-line react-hooks/exhaustive-deps

  const goiChon = goiCua(n.loai)
  const goiSap = GOIS.filter(g => !GOI_MO.includes(g))
  const goiY = goiGoiY(n.loai, n.nhom, n.ppHkd)
  const keKhai = keKhaiDuoc(n.goi, n.loai, n.nhom, n.ppHkd)
  const thue = n.loai === 'hkd' ? (n.nhom === 1 ? 'doanh thu' : n.ppHkd === 'doanhThu' ? 'thuế TNCN theo % doanh thu' : 'thuế TNCN theo lợi nhuận') : (n.ppHkd === 'doanhThu' ? 'thuế GTGT, TNDN theo % doanh thu' : 'thuế GTGT khấu trừ, TNDN theo lợi nhuận')
  const nhomGoiY = nhomTheoDt(DT_FABI)
  // nhanh: khởi tạo từ FABi 1 bước; thue: 3 bước cũ hỏi khi mở Kê khai thuế, hộ kinh doanh thêm bước cửa hàng chính, kênh bán
  const nhanh = n.kieu === 'fabi' && !n.thue
  const buoc = n.thue && n.loai === 'dn' ? BUOC.slice(0, 2) : BUOC
  const cuaHang = n.thue ? (s.cnThem?.[s.donVi] ?? []).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc })) : dsCuaHang(n.kieu, s)
  const anCh = n.kieu === 'them' ? CUA_HANG_FABI.length - cuaHang.length : 0   // cửa hàng FABi đã dùng kế toán ở đơn vị khác
  const cnChon = cuaHang.filter(c => n.chon.includes(c.id))
  const soCt = demCt(n.chon, n.dongBo, +HOM_NAY - 29 * 86400000)   // ước một tháng, hiện ở bước đồng bộ
  const tuNgay = n.kieu === 'fabi' ? n.ngayLam : n.ngayDauNam   // chứng từ FABi lấy từ ngày này
  const ngayLamHopLe = /^\d{2}\/\d{2}\/\d{4}$/.test(n.ngayLam) && ngay(n.ngayLam) >= ngay(DAU_NAM) && ngay(n.ngayLam) <= +HOM_NAY
  const soCtDaTao = ngayLamHopLe || n.kieu !== 'fabi' ? demCt(n.chon, n.dongBo, ngay(tuNgay)) : 0
  // phiếu thu, chi tiền lập trên FABi (T667): số mẫu, bình quân 3 phiếu một cửa hàng một ngày
  const soTcDaTao = ngayLamHopLe || n.kieu !== 'fabi' ? Math.max(0, Math.round((+HOM_NAY - ngay(tuNgay)) / 86400000) + 1) * cnChon.length * 3 : 0
  // các việc lúc lấy dữ liệu, mỗi việc chạy tới mốc phần trăm của nó
  const viecTai: [number, string, string][] = [
    [30, 'Danh mục món, kênh bán', ''],
    [65, 'Doanh thu bán hàng', `${so(soCtDaTao)} chứng từ Xuất bán POS`],
    [100, 'Thu chi tiền', `${so(soTcDaTao)} phiếu thu, phiếu chi lập trên FABi`],   // bỏ dòng Ghi sổ (PhuongXT 28/10/2026)
  ]
  const dmGoi = FEATURES.filter(f => f.m === 0 && f.g.includes(n.goi))   // danh mục của gói, gợi ý khởi tạo ở màn hoàn tất
  const dem = { ...demTheoGoi(n.goi), co: tnKhoiTao(n.goi, keKhai).length }
  // Điểm nổi bật của gói, bỏ dòng nói về thông tư khác chế độ đang chọn (vd hộ kinh doanh dùng Standard vẫn TT152)
  const ngan = nganCheDo(n.loai, n.cheDo)
  // Sổ sách hộ kinh doanh theo nhóm: nhóm 1 mẫu S1a, nhóm 2 mẫu S2a, nhóm 3, 4 chưa có nên ẩn dòng (T663)
  const SO_HKD: Record<number, string> = { 1: 'S1a', 2: 'S2a' }
  const diemGoi = DIEM_NOI_BAT[n.goi].ds.filter(t => (!/TT\d+/.test(t) || t.includes(ngan)) && (t !== 'Kê khai thuế' || keKhai))
    .flatMap(t => n.loai !== 'hkd' || !t.includes('HKD theo TT152') ? [t] : SO_HKD[n.nhom] ? [`${t} (${SO_HKD[n.nhom]})`] : [])

  const bat = (ds: string[], k: string) => ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k]
  const doiKenh = (k: string) => { const on = bat(n.kenhOnline, k); sua({ kenhOnline: on, kenhSan: n.kenhSan.filter(x => on.includes(x)) }) }
  const xong = () => {
    if (nhanh) {
      // chưa chọn loại hình, gói: giữ gói, chế độ lúc bấm Kết nối; mở Kê khai thuế thì hỏi (choKeKhai)
      // huongDan false: khởi tạo xong, chờ hiện hướng dẫn từng bước ở Trang chủ
      set({ khoiTao: true, choKeKhai: { ...s.choKeKhai, [s.donVi]: true }, huongDan: { ...s.huongDan, [s.donVi]: false },
        ...(s.dvMoi && s.donVi === s.dvMoi.id ? { cnThem: { ...s.cnThem, [s.donVi]: cnChon.map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc ?? '', tuNgay: n.ngayLam, banDau: true })) }, dvMoi: { ...s.dvMoi, diem: cnChon.length } } : {}),
        ngayDauNam: { ...s.ngayDauNam, [s.donVi]: DAU_NAM }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: HOM_NAY.getFullYear() } })
      try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
      setN(MAC_DINH)
      nav('/app')
      return
    }
    // thông tin kê khai lưu theo đơn vị, sửa lại ở Hệ thống, Thông tin đơn vị (T145)
    const ttDv = { ...s.ttDv, [s.donVi]: { ...s.ttDv?.[s.donVi], loai: n.loai, nhom: n.nhom, ppHkd: n.ppHkd, cnChinh: n.cnChinh, kenhOnline: n.kenhOnline, kenhSan: n.kenhSan } }
    if (n.thue) {
      // hỏi lúc mở Kê khai thuế: không đổi cửa hàng, ngày đầu năm; xong thì ở lại màn đang mở
      // không chọn gói ở đây (PhuongXT 29/10/2026): giữ gói đang dùng, chế độ theo loại hình
      set({ cheDo: cheDoMoi(n.loai, s.goi), ttDv, choKeKhai: { ...s.choKeKhai, [s.donVi]: false },
        ...(s.dvMoi && s.donVi === s.dvMoi.id ? { dvMoi: { ...s.dvMoi, ten: n.tenDv || s.dvMoi.ten, viettat: vietTat(n.tenDv) || s.dvMoi.viettat, mst: n.mst, diaChi: n.diaChi } } : {}) })
      try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
      setN(MAC_DINH)
      return
    }
    set({ goi: n.goi, cheDo: n.cheDo, khoiTao: true, ttDv, huongDan: { ...s.huongDan, [s.donVi]: false }, ...(s.dvMoi && s.donVi === s.dvMoi.id ? { cnThem: { ...s.cnThem, [s.donVi]: cnChon.map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay: n.ngayDauNam, banDau: true })) }, dvMoi: { ...s.dvMoi, ten: n.tenDv || s.dvMoi.ten, viettat: vietTat(n.tenDv) || s.dvMoi.viettat, mst: n.mst, diaChi: n.diaChi, goi: n.goi, diem: n.chon.length } } : {}),
      ngayDauNam: { ...s.ngayDauNam, [s.donVi]: n.ngayDauNam }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: Number(n.ngayDauNam.slice(-4)) } })
    try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
    setN(MAC_DINH)
    nav('/app/danh-muc')   // vào phân hệ Danh mục để khởi tạo danh mục
  }
  const tiep = () => {
    if (nhanh) { sua({ b: XONG }); setTai(0); return }   // 1 bước rồi lấy dữ liệu
    if (n.thue) { xong(); return }   // kê khai thuế: một màn
    sua({ b: n.b + 1 }); if (n.b === XONG - 1) setTai(0)
  }
  const deSau = () => { setN(MAC_DINH); try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }; nav('/app') }   // thoát hỏi kê khai thuế
  /** Đổi loại hình, nhóm hay cách tính thuế thì gói, chế độ về gợi ý mới */
  const doiLoai = (p: Partial<Pick<Nhap, 'loai' | 'nhom' | 'ppHkd'>>) => {
    const x = { ...n, ...p }
    // nhóm 2 tự chọn thuế: vừa đổi sang nhóm 2 thì mặc định theo % doanh thu, gói Standard kê khai được (T663)
    const pp = x.thue ? 'doanhThu' : x.loai === 'hkd' ? (NHOM_HKD[x.nhom - 1].pp ?? (p.nhom ? 'doanhThu' : x.ppHkd)) : x.ppHkd
    const g = goiGoiY(x.loai, x.nhom, pp)
    sua({ ...p, ppHkd: pp, goi: g, cheDo: cheDoMoi(x.loai, g) })
  }
  const chonGoi = (g: Goi) => sua({ goi: g, cheDo: cheDoMoi(n.loai, g) })

  if (n.b < 0) return <TiepHuongDan />   // không khởi tạo thì chỗ này giữ nút Tiếp tục hướng dẫn (T138)
  // Xem so sánh gói mở Gói thuê bao ở tab trình duyệt mới, tab đó không hiện popup; tab cũ vẫn khởi tạo tiếp (T663)
  if (chiXemGoi) return null
  // 3 bước khởi tạo bắt buộc: popup không đóng được, xong mới dùng phần mềm (T158)
  return (
    <div className="ktf-pop-nen">
      <div className="ktf-pop" role="dialog" aria-label={n.thue ? 'Thông tin kê khai thuế' : 'Khởi tạo dữ liệu'}>
        <div className="row ktf-pop-dau">
          <h2 className="ktf-h">{n.thue ? 'Thông tin kê khai thuế' : nhanh ? 'Kết nối dữ liệu FABi' : 'Khởi tạo dữ liệu'}</h2>
          <span className="grow" />
          {dt && <span className="chip info ktf-dt"><Icon n="clock" className="ic sm" />Dùng thử {SO_NGAY_DUNG_THU} ngày · đến {dt.den}</span>}
          {n.b < XONG && !nhanh && <span className="muted ktf-luu">{n.thue ? 'Khai một lần để lập tờ khai thuế' : `Hoàn tất ${BUOC.length} bước để bắt đầu dùng phần mềm`}</span>}
          {n.thue && <button className="btn ghost" onClick={deSau}>Để sau</button>}
        </div>
            {n.b < XONG && nhanh && (
              <div className="ktf-luoi">
                <div className="card" style={{ padding: '24px 26px' }}>
                  <h3 className="ktf-h3 ktf-h3-dau">Cửa hàng</h3>
                  <p className="muted ktf-p">Tích cửa hàng FABi lên sổ kế toán. Thêm cửa hàng sau ở Danh mục cửa hàng.</p>
                  <DsCuaHang ds={cuaHang} chon={n.chon} chinh="" doi={chon => sua({ chon })} coChinh={false} />
                  {cnChon.length === 0 && <Note kind="warn" icon="alert">Chọn ít nhất một cửa hàng để tiếp tục.</Note>}

                  <h3 className="ktf-h3">Ngày bắt đầu làm việc</h3>
                  <div className="ktf-ngay">
                    <ONgay value={n.ngayLam} onChange={v => sua({ ngayLam: v })} ariaLabel="Ngày bắt đầu làm việc" />
                    <small className="muted">Ngày bắt đầu nhập liệu trên iPOS Accounting. Từ ngày này, doanh thu bán hàng POS và phiếu thu, chi lập trên FABi tự về sổ.</small>
                  </div>
                  {!ngayLamHopLe && <Note kind="warn" icon="alert">Chọn ngày từ {DAU_NAM} đến hôm nay.</Note>}

                  <h3 className="ktf-h3">Tiền từ FABi về quỹ nào</h3>
                  <div className="ktf-pttt">
                    {PTTT_VE_QUY.map(([pt, quy]) => (
                      <div key={pt}>
                        <span>{pt}</span>
                        <Icon n="arrow" className="ic sm" />
                        <b>{quy}</b>
                      </div>
                    ))}
                  </div>
                  <small className="muted ktf-pttt-chu">Đổi quỹ nhận cho từng phương thức thanh toán ở Danh mục › Quỹ tiền.</small>

                  <div className="row ktf-pop-nut">
                    <button className="btn pri lg" disabled={cnChon.length === 0 || !ngayLamHopLe} onClick={tiep}>Kết nối và lấy dữ liệu<Icon n="arrow" className="ic sm" /></button>
                  </div>
                </div>

                <aside className="card ktf-ben">
                  <h3>Tự về sổ từ {ngayLamHopLe ? n.ngayLam : '…'}</h3>
                  <ul>
                    <li><Icon n="check" className="ic sm" /><span>Doanh thu bán hàng POS: {so(soCtDaTao)} chứng từ Xuất bán POS</span></li>
                    <li><Icon n="check" className="ic sm" /><span>Phiếu thu, phiếu chi lập trên FABi: {so(soTcDaTao)} phiếu</span></li>
                    <li><Icon n="check" className="ic sm" /><span>Tiền vào quỹ tiền mặt, quỹ ngân hàng chung theo phương thức thanh toán</span></li>
                  </ul>
                </aside>
              </div>
            )}
            {n.b < XONG && !nhanh && (
              <>
                {!n.thue && <div className="steps">{buoc.map((t, i) => <div key={t} className={i <= n.b ? 'on' : ''}><i /><span>{i + 1}. {t}</span></div>)}</div>}
                {/* kê khai thuế: gộp loại hình, thông tin đơn vị (hộ kinh doanh thêm cửa hàng chính, kênh bán) vào một màn, bỏ chọn gói (PhuongXT 29/10/2026) */}
                <div className={`ktf-luoi${n.thue ? ' ktf-mot' : ''}`}>
                  <div className="card" style={{ padding: '24px 26px' }}>
                    {(n.thue || n.b === 0) && (
                      <>
                        <h2 className="ktf-h">Đơn vị thuộc loại hình nào?</h2>
                        <p className="muted ktf-p">{n.thue ? 'Loại hình quyết định chế độ kế toán và cách kê khai thuế.' : 'Loại hình quyết định chế độ kế toán và gói gợi ý. Chọn xong là có gói ngay bên dưới.'}</p>
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
                              {NHOM_HKD.filter(x => !n.thue || x.nhom <= 2).map(x => (   // kê khai thuế gói Standard: chỉ nhóm 1, 2
                                <button key={x.nhom} className={`opt ${n.nhom === x.nhom ? 'on' : ''}`} onClick={() => doiLoai({ nhom: x.nhom })}>
                                  <span className="radio" />
                                  <span className="grow">
                                    <span className="row"><b>Nhóm {x.nhom}</b><span className="muted ktf-nhom-dt">{x.ten}</span></span>
                                    <small>{n.thue && x.nhom === 2 ? 'Thuế TNCN theo tỷ lệ % trên doanh thu' : x.thue}</small>
                                  </span>
                                </button>
                              ))}
                            </div>
                            {NHOM_HKD[n.nhom - 1].pp === null && (
                              <>
                                <h3 className="ktf-h3">Cách tính thuế TNCN</h3>
                                <div className="grid g2">
                                  {(n.thue ? ['doanhThu'] as const : ['doanhThu', 'loiNhuan'] as const).map(pp => (
                                    <button key={pp} className={`opt ${n.ppHkd === pp ? 'on' : ''}`} onClick={() => doiLoai({ ppHkd: pp })}>
                                      <span className="radio" /><span><b>{PP_HKD[pp]}</b><small>{pp === 'doanhThu' ? 'Không cần theo dõi chi phí' : 'Phải có chứng từ chi phí hợp lý'}</small></span>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                            {!n.thue && <Note icon="sparkle">Doanh thu 12 tháng trên FABi khoảng {so(DT_FABI / 1e9)} tỷ đồng, thuộc nhóm {nhomGoiY}.</Note>}
                          </>
                        )}
                        {n.loai === 'dn' && (
                          <>
                            <h3 className="ktf-h3">Cách tính thuế GTGT, TNDN</h3>
                            <div className="grid g2">
                              {(n.thue ? ['doanhThu'] as const : ['doanhThu', 'loiNhuan'] as const).map(pp => (   // kê khai thuế gói Standard: chỉ theo % doanh thu
                                <button key={pp} className={`opt ${n.ppHkd === pp ? 'on' : ''}`} onClick={() => doiLoai({ ppHkd: pp })}>
                                  <span className="radio" /><span><b>{PP_DN[pp]}</b><small>{pp === 'doanhThu' ? 'Doanh nghiệp siêu nhỏ, không theo dõi chi phí' : 'Phải có hoá đơn đầu vào, chứng từ chi phí'}</small></span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                        {!n.thue && (<>
                        <h3 className="ktf-h3">{goiChon.length === 1 ? 'Gói đang mở bán' : n.loai === 'hkd' ? 'Gói cho hộ kinh doanh' : `Doanh nghiệp chọn được cả ${goiChon.length} gói`}</h3>
                        <div className="ktf-goi-xem">
                          {goiChon.map(g => (
                            <button key={g} className={n.goi === g ? 'on' : ''} onClick={() => chonGoi(g)}>
                              <span className="radio" />
                              <Pk g={g} logo />
                              <span>{MO_TA_GOI[n.loai][g]}</span>
                              <span className="ktf-goi-dem">{g === goiY && goiChon.length > 1 && <span className="chip info">Gợi ý</span>}<b>{g === n.goi ? dem.co : demTheoGoi(g).co}</b> tính năng</span>
                            </button>
                          ))}
                        </div>
                        <div className="ktf-goi-lop">
                          <div><Icon n="check" className="ic sm ktf-lop-co" /><span><b>Quản lý kinh doanh</b><small className="muted">Lãi lỗ, thu chi, mua hàng, công nợ, hao hụt hàng bán thẳng. Đáp ứng mọi mô hình</small></span></div>
                          <div><Icon n={keKhai ? 'check' : 'alert'} className={`ic sm ${keKhai ? 'ktf-lop-co' : 'ktf-lop-chua'}`} />
                            <span><b>Kê khai {thue}</b><small className="muted">{keKhai ? `Tờ khai, sổ sách theo ${nganCheDo(n.loai, n.cheDo)}` : `Chưa có ở gói ${GOI[n.goi].ten}`}</small></span>
                          </div>
                          {!keKhai && <p className="ktf-lop-note">Bạn vẫn dùng đủ phần quản lý. Kê khai {thue} sẽ có ở gói cao hơn, sắp ra mắt.</p>}
                        </div>
                        {goiSap.length > 0 && (
                          <p className="muted ktf-goi-sap">
                            Gói {goiSap.map(g => GOI[g].ten).join(', ')} sắp ra mắt. <a href={`#/app/he-thong/goi-thue-bao?${CHI_XEM_GOI}`} target="_blank" rel="noreferrer">Xem so sánh gói</a>
                          </p>
                        )}
                        {n.loai === 'dn' && n.goi === 'PR' && (
                          <div className="f" style={{ marginTop: 14, maxWidth: 420 }}>
                            <label>Chế độ kế toán</label>
                            <Select className="inp" value={n.cheDo} onChange={e => sua({ cheDo: e.target.value as CheDo })}>
                              {CHE_DO_HOP_LE[n.goi].map(cd => <option key={cd} value={cd}>{CHE_DO[cd].ngan} · {CHE_DO[cd].ten}</option>)}
                            </Select>
                          </div>
                        )}
                        <details className="ktf-tn-mo">
                          <summary>Xem {dem.co} tính năng gói {GOI[n.goi].ten}</summary>
                          <TinhNangGoi g={n.goi} truoc={goiChon[goiChon.indexOf(n.goi) - 1]} keKhai={keKhai} />
                        </details>
                        </>)}
                      </>
                    )}

                    {(n.thue || n.b === 1) && (
                      <>
                        <h2 className={`ktf-h${n.thue ? ' ktf-h-tiep' : ''}`}>Thông tin đơn vị</h2>
                        <p className="muted ktf-p">Điền thông tin {n.loai === 'hkd' ? 'hộ kinh doanh' : 'công ty'} của bạn. Tên, địa chỉ tra cứu từ dữ liệu thuế.</p>
                        <div className="form-grid">
                          <div className="f c2">{n.loai === 'hkd' ? <label>CCCD/MST</label> : <label>Mã số thuế <em>*</em></label>}
                            <div className="row"><input className="inp" value={n.mst} placeholder={n.loai === 'hkd' ? 'Nhập CCCD hoặc mã số thuế' : 'Nhập mã số thuế'} onChange={e => sua({ mst: e.target.value })} />
                              <button className="btn" onClick={() => sua({ traCuu: true, mst: n.mst || '0319 990 088',   // kết quả tra cứu mẫu, khác 3 đơn vị mẫu
                                tenDv: n.loai === 'hkd' ? 'Hộ kinh doanh Nhà hàng Phố Mây' : 'Công ty TNHH Nhà hàng Phố Mây', diaChi: '24 Nguyễn Huệ, phường Sài Gòn, TP.HCM' })}>Tra cứu</button></div>
                          </div>
                          {!n.thue && (   // từ FABi: ngày đầu năm đã tự đặt lúc kết nối, sửa ở Cấu hình hệ thống
                            <div className="f c2"><label>Ngày bắt đầu năm tài chính</label>
                              <Select className="inp" value={n.ngayDauNam} onChange={e => sua({ ngayDauNam: e.target.value })}>
                                {['01/01/2026', '01/04/2026', '01/07/2026', '01/10/2026'].map(d => <option key={d}>{d}</option>)}
                              </Select>
                            </div>
                          )}
                          <div className="f c4"><label>{n.loai === 'hkd' ? 'Tên hộ kinh doanh' : 'Tên công ty'} <em>*</em></label><input className="inp" value={n.tenDv} onChange={e => sua({ tenDv: e.target.value })} /></div>
                          <div className="f c4"><label>Địa chỉ</label><input className="inp" value={n.diaChi} placeholder={n.loai === 'hkd' ? 'Tra cứu theo CCCD/MST hoặc nhập' : 'Tra cứu theo mã số thuế hoặc nhập'} onChange={e => sua({ diaChi: e.target.value })} /></div>
                        </div>
                      </>
                    )}

                    {(n.thue ? n.loai === 'hkd' : n.b === 2) && (
                      <>
                        <h2 className={`ktf-h${n.thue ? ' ktf-h-tiep' : ''}`}>Cửa hàng</h2>
                        <p className="muted ktf-p">{n.thue ? 'Chọn địa điểm kinh doanh chính trong các cửa hàng đã kết nối.' : 'Tích cửa hàng lên sổ kế toán.'}{anCh > 0 && ` Chỉ hiện cửa hàng FABi chưa dùng kế toán, đã ẩn ${anCh} cửa hàng đang ở đơn vị khác.`}</p>
                        <DsCuaHang ds={cuaHang} chon={n.chon} chinh={n.cnChinh} doi={(chon, cnChinh) => sua({ chon, cnChinh })} coChinh={n.loai === 'hkd'} chiChinh={n.thue} />
                        {cnChon.length === 0 && <Note kind="warn" icon="alert">Chọn ít nhất một cửa hàng để tiếp tục.</Note>}
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

                    <div className="row ktf-pop-nut">
                      {n.b > 0 && !n.thue && <button className="btn lg" onClick={() => sua({ b: n.b - 1 })}>Quay lại</button>}
                      <button className="btn pri lg" disabled={n.thue ? (n.loai === 'dn' && !n.mst.trim()) || !n.tenDv.trim() || (n.loai === 'hkd' && !n.cnChinh) : (n.b === 1 && ((n.loai === 'dn' && !n.mst.trim()) /* doanh nghiệp bắt buộc mã số thuế, hộ kinh doanh không (T665) */ || !n.tenDv.trim() /* tên bắt buộc (T669) */)) || (n.b === 2 && (cnChon.length === 0 || (n.loai === 'hkd' && !n.cnChinh)))} onClick={tiep}>
                        {n.thue || n.b === buoc.length - 1 ? 'Hoàn tất' : 'Tiếp tục'}<Icon n="arrow" className="ic sm" />
                      </button>
                    </div>
                  </div>

                  {!n.thue && <aside className="card ktf-ben">
                    <h3>Bạn sẽ có gì</h3>
                    <div className="row" style={{ gap: 8 }}><Pk g={n.goi} logo /><span className="chip">{nganCheDo(n.loai, n.cheDo)}</span></div>
                    <div className="ktf-gia">
                      {n.goi !== 'S' && <small className="ktf-gia-thu">Miễn phí {SO_NGAY_DUNG_THU} ngày dùng thử, sau đó</small>}   {/* Standard miễn phí, không ghi dùng thử */}
                      <b>{GIA_GOI_NAM[n.goi].gia}</b><span>{GIA_GOI_NAM[n.goi].chuKy}</span>
                      <small>{n.goi === 'S' ? GIA_GOI_NAM.S.ghiChu : `${GIA_GOI_NAM[n.goi].ghiChu}. Trả từng tháng ${GIA_GOI_THANG[n.goi].gia}`}</small>
                    </div>
                    <ul>
                      {diemGoi.map(t => <li key={t}><Icon n="check" className="ic sm" /><span>{t}</span></li>)}
                    </ul>
                    <small className="muted">{n.loai === 'hkd' ? `Hộ kinh doanh nhóm ${n.nhom}` : 'Doanh nghiệp'} · {cnChon.length} cửa hàng · {dem.co}/{dem.tong} tính năng</small>
                  </aside>}
                </div>
              </>
            )}

            {n.b === XONG && (
              <div className="card ktf-chao">
                {tai < 100 || nhanh   // từ FABi: 100% thì tự về Trang chủ
                  ? <>
                      <h1>Đang lấy dữ liệu từ FABi</h1>
                      <p>Doanh thu và thu chi tiền từ {tuNgay} của {cnChon.length} cửa hàng.</p>
                      <div className="ktf-tai"><i style={{ width: `${tai}%` }} /></div>
                      <ul className="ktf-tai-ds">
                        {viecTai.map(([moc, t, m], i) => {
                          const tt = tai >= moc ? 'xong' : tai >= (i ? viecTai[i - 1][0] : 0) ? 'dang' : 'cho'
                          return <li key={t} className={tt}>{tt === 'xong' ? <Icon n="check" className="ic sm" /> : <i />}<span><b>{t}</b>{m && <small>{m}</small>}</span></li>
                        })}
                      </ul>
                    </>
                  : <>
                      <div className="ktf-chao-ic ok"><Icon n="check" className="ic lg" /></div>
                      <h1>Dữ liệu đã sẵn sàng</h1>
                      <p className="muted">Đã lấy {so(soCtDaTao)} chứng từ Xuất bán POS và {so(soTcDaTao)} phiếu thu, phiếu chi từ FABi.</p>
                      <p>Việc nên làm tiếp: khởi tạo các loại danh mục</p>
                      <ul className="ktf-viec">
                        {dmGoi.slice(0, 6).map(f => <li key={f.c}><Icon n="folder" className="ic sm" />{f.n}</li>)}
                        {dmGoi.length > 6 && <li className="muted">và {dmGoi.length - 6} danh mục khác</li>}
                      </ul>
                      <button className="btn acc lg" onClick={xong}>Bắt đầu làm việc<Icon n="arrow" className="ic sm" /></button>
                    </>}
              </div>
            )}
      </div>
    </div>
  )
}
