// Khởi tạo đơn vị kế toán khi bấm từ FABi sang (T138): hỏi ít, xác nhận nhiều vì FABi đã có tài khoản, chi nhánh, món, kênh bán.
// Màn /khoi-tao giữ cho người tự đăng ký. Lưu dở ở localStorage để quay lại đúng bước.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { FEATURES, GOI, GOIS, MODS, demTheoGoi, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_HOP_LE, CHE_DO_MAC_DINH, type CheDo } from '../../app/che-do'
import { CHI_NHANH, DAILY, HOM_NAY } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Logo } from '../../ui/Logo'
import { Note, Pk } from '../../ui/Page'
import { Select } from '../../ui/Dropdown'

const BUOC = ['Loại hình', 'Chọn gói', 'Đơn vị', 'Chi nhánh và kho', 'Đồng bộ bán hàng', 'Số dư đầu kỳ']
const XONG = BUOC.length   // bước hoàn tất
const KEY = 'iacc-khoi-tao-fabi'
const SO_KENH = 3   // Tại quán, Mang về, App giao đồ ăn (T113)

const DT_FABI = 29_000_000_000   // doanh thu 12 tháng lấy từ FABi

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

interface Nhap {
  b: number            // bước đang làm; -2 là màn chào, -1 là giới thiệu giao diện, XONG là hoàn tất
  loai: LoaiHinh
  nhom: number         // nhóm hộ kinh doanh 1 tới 4
  ppHkd: PpHkd         // cách tính thuế TNCN của hộ kinh doanh
  goi: Goi
  cheDo: CheDo
  traCuu: boolean
  ngayBatDau: string
  chon: string[]       // id chi nhánh lên sổ
  khoFree: Record<string, string>   // gói Free: mỗi chi nhánh một kho
  dongBo: 'chiTiet' | 'kenh'
  gioChot: string
  soDu: 'nhanh' | 'excel' | 'sau'
  tienMat: string
  tienGui: string
}
const MAC_DINH: Nhap = {
  b: -2, loai: 'dn', nhom: nhomTheoDt(DT_FABI), ppHkd: 'loiNhuan', goi: goiGoiY('dn', 'loiNhuan'), cheDo: cheDoMoi('dn', goiGoiY('dn', 'loiNhuan')), traCuu: true, ngayBatDau: '01/10/2026', chon: CHI_NHANH.map(c => c.id),
  khoFree: Object.fromEntries(CHI_NHANH.map(c => [c.id, c.kho[0]])), dongBo: 'kenh', gioChot: '23:30',
  soDu: 'nhanh', tienMat: '', tienGui: '',
}

function docNhap(): Nhap {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...MAC_DINH, ...JSON.parse(raw) } : MAC_DINH
  } catch { return MAC_DINH }
}

/** Số chứng từ Xuất bán POS sinh từ ngày tu tới hôm nay: chi tiết thì mỗi đơn một chứng từ, theo kênh thì mỗi ngày, chi nhánh, kênh một chứng từ */
function demCt(chon: string[], dongBo: Nhap['dongBo'], tu: number) {
  const ds = DAILY.filter(d => +d.date >= tu && +d.date <= +HOM_NAY && chon.includes(d.cn))
  return dongBo === 'chiTiet' ? ds.reduce((t, d) => t + d.don, 0) : ds.length * SO_KENH
}
const ngay = (dmy: string) => { const [d, m, y] = dmy.split('/').map(Number); return +new Date(y, m - 1, d) }

const so = (n: number) => n.toLocaleString('vi-VN')

export function KhoiTaoFabi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const [n, setN] = useState<Nhap>(docNhap)
  const [tai, setTai] = useState(0)   // phần trăm lấy dữ liệu ở bước hoàn tất
  const [veFabi, setVeFabi] = useState(false)   // bấm Để sau: quay lại FABi, tiến độ vẫn lưu
  const sua = (p: Partial<Nhap>) => setN(x => ({ ...x, ...p }))

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* trình duyệt chặn lưu thì thôi */ }
  }, [n])

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
  const soKho = free ? cnChon.length : cnChon.reduce((t, c) => t + c.kho.length, 0)
  const soCt = demCt(n.chon, n.dongBo, +HOM_NAY - 29 * 86400000)   // ước một tháng, hiện ở bước đồng bộ
  const soCtDaTao = demCt(n.chon, n.dongBo, ngay(n.ngayBatDau))
  const dem = demTheoGoi(n.goi)
  const tenNguoi = s.ten.split(' ').slice(-2).join(' ')

  const doiChon = (id: string) => sua({ chon: n.chon.includes(id) ? n.chon.filter(x => x !== id) : [...n.chon, id] })
  const xong = () => {
    set({ loggedIn: true, goi: n.goi, cheDo: n.cheDo, donVi: 'pm', khoiTao: true, dongBoFabi: n.dongBo })
    try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
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

  return (
    <div className="ktf">
      <div className="ktf-in">
        <div className="row ktf-dau">
          <div className="brand" style={{ color: 'var(--ink)' }}><Logo cao={36} /></div>
          <span className="chip info"><Icon n="link" className="ic sm" />Mở từ FABi</span>
          <span className="grow" />
          {!veFabi && n.b >= 0 && n.b < XONG && <span className="muted ktf-luu"><Icon n="check" className="ic sm" />Đã lưu, quay lại sau vẫn tiếp được</span>}
          {!veFabi && <button className="btn ghost" title="Quay lại FABi, tiến độ đã lưu" onClick={() => setVeFabi(true)}>Để sau</button>}
        </div>

        {veFabi && (
          <div className="card ktf-chao">
            <div className="ktf-chao-ic"><Icon n="pos" className="ic lg" /></div>
            <h1>Đang quay lại FABi</h1>
            <p>Tiến độ khởi tạo đã lưu. Lần sau bấm sang IACC từ FABi sẽ tiếp tục đúng bước đang dừng.</p>
            <p className="muted" style={{ fontSize: 12.5 }}>Bản mẫu chưa nối FABi thật.</p>
            <button className="btn lg" onClick={() => setVeFabi(false)}>Mở lại khởi tạo</button>
          </div>
        )}

        {!veFabi && n.b === -2 && (
          <div className="card ktf-chao">
            <div className="ktf-chao-ic"><Icon n="pos" className="ic lg" /></div>
            <h1>Chào {tenNguoi}</h1>
            <p>Bắt đầu sổ sách cho <b>Phố Mây</b> trong {BUOC.length} bước, khoảng 3 phút.</p>
            <div className="ktf-nhan">
              <span className="muted">Thông tin từ FABi</span>
              <div><b>1</b> thương hiệu</div>
              <div><b>{CHI_NHANH.length}</b> cửa hàng</div>
              <div><b>{SO_KENH}</b> kênh bán</div>
              <div><b>86</b> món</div>
            </div>
            <button className="btn pri lg" onClick={() => sua({ b: -1 })}>Bắt đầu<Icon n="arrow" className="ic sm" /></button>
          </div>
        )}

        {!veFabi && n.b === -1 && (
          <div className="card ktf-gt">
            <h2 className="ktf-h">Giao diện kế toán IACC</h2>
            <p className="muted ktf-p">Số bán hàng từ FABi tự về sổ kế toán. Bạn làm việc trên 4 vùng chính.</p>
            <div className="ktf-gt-luoi">
              <div className="ktf-mo" aria-hidden>
                <div className="ktf-mo-ben">
                  <i className="ktf-so">1</i>
                  {['Tổng quan', 'Tiền', 'Bán hàng', 'Mua hàng', 'Kho', 'Thuế', 'Báo cáo'].map((t, i) => <span key={t} className={i === 0 ? 'on' : ''}>{t}</span>)}
                </div>
                <div className="ktf-mo-chinh">
                  <div className="ktf-mo-tren"><i className="ktf-so">2</i><span className="chip">Tất cả chi nhánh</span><span className="grow" /><span className="ktf-mo-tron" /></div>
                  <div className="ktf-mo-kpi"><i className="ktf-so">3</i>{['Doanh thu', 'Lợi nhuận', 'Tiền'].map(t => <div key={t}><small>{t}</small><b /></div>)}</div>
                  <div className="ktf-mo-bang"><i className="ktf-so">4</i>{[0, 1, 2, 3].map(i => <div key={i}><span /><span /><span /></div>)}</div>
                </div>
              </div>
              <ol className="ktf-gt-ds">
                <li><b>Thanh phân hệ</b><span>Tiền, bán hàng, mua hàng, kho, thuế, báo cáo. Mỗi phân hệ có sơ đồ quy trình để bấm vào đúng việc.</span></li>
                <li><b>Chọn chi nhánh</b><span>Xem gộp cả chuỗi hoặc từng cửa hàng. Mọi danh sách, báo cáo lọc theo chi nhánh đang chọn.</span></li>
                <li><b>Tổng quan</b><span>Doanh thu, lợi nhuận, tiền và chỉ số sức khoẻ tài chính, cập nhật theo số bán trên FABi.</span></li>
                <li><b>Chứng từ tự sinh</b><span>Đơn bán trên FABi thành chứng từ Xuất bán POS, không phải nhập tay. Bạn chỉ thêm thu chi, mua hàng.</span></li>
              </ol>
            </div>
            <div className="ktf-gt-hoi">
              <b>Bạn có muốn dùng thử không?</b>
              <span className="grow" />
              <button className="btn lg" onClick={() => sua({ b: -2 })}>Quay lại</button>
              <button className="btn ghost lg" onClick={() => setVeFabi(true)}>Để sau</button>
              <button className="btn pri lg" onClick={() => sua({ b: 0 })}>Dùng thử<Icon n="arrow" className="ic sm" /></button>
            </div>
          </div>
        )}

        {!veFabi && n.b >= 0 && n.b < XONG && (
          <>
            <div className="steps">{BUOC.map((t, i) => <div key={t} className={i <= n.b ? 'on' : ''}><i /><span>{i + 1}. {t}</span></div>)}</div>
            <div className="ktf-luoi">
              <div className="card" style={{ padding: '24px 26px' }}>
                {n.b === 0 && (
                  <>
                    <h2 className="ktf-h">Đơn vị thuộc loại hình nào?</h2>
                    <p className="muted ktf-p">Loại hình quyết định chế độ kế toán và gói gợi ý.</p>
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
                  </>
                )}

                {n.b === 1 && (
                  <>
                    <h2 className="ktf-h">Chọn gói</h2>
                    <p className="muted ktf-p">{n.loai === 'hkd'
                      ? `Hộ kinh doanh nhóm ${n.nhom}, thuế TNCN ${PP_HKD[n.ppHkd].toLowerCase()}. Gói gợi ý: ${GOI[goiY].ten}.`
                      : `Doanh nghiệp chọn được cả 4 gói. Gói gợi ý theo ${CHI_NHANH.length} chi nhánh trên FABi: ${GOI[goiY].ten}.`}</p>
                    <div className="grid g2 ktf-goi">
                      {goiChon.map(g => (
                        <button key={g} className={`opt ${n.goi === g ? 'on' : ''}`} onClick={() => chonGoi(g)}>
                          <span className="radio" />
                          <span className="grow">
                            <span className="row"><Pk g={g} logo /><span className="grow" />{g === goiY && <span className="chip info">Gợi ý</span>}</span>
                            <small>{MO_TA_GOI[n.loai][g]}</small>
                            <small className="ktf-goi-dem"><b>{demTheoGoi(g).co}</b> tính năng · {nganCheDo(n.loai, cheDoMoi(n.loai, g))}</small>
                          </span>
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
                    <TinhNangGoi g={n.goi} truoc={goiChon[goiChon.indexOf(n.goi) - 1]} />
                  </>
                )}

                {n.b === 2 && (
                  <>
                    <h2 className="ktf-h">Thông tin đơn vị</h2>
                    <p className="muted ktf-p">Mã số thuế lấy từ FABi. Tên, địa chỉ tra từ cơ sở dữ liệu thuế.</p>
                    <div className="form-grid">
                      <div className="f c2"><label>Mã số thuế <em>*</em></label>
                        <div className="row"><input className="inp" defaultValue="0319990001" />
                          <button className="btn" onClick={() => sua({ traCuu: true })}>Tra cứu</button></div>
                      </div>
                      <div className="f c2"><label>Ngày bắt đầu dùng sổ</label>
                        <Select className="inp" value={n.ngayBatDau} onChange={e => sua({ ngayBatDau: e.target.value })}>
                          <option>01/10/2026</option><option>01/09/2026</option><option>01/01/2026</option>
                        </Select>
                      </div>
                      <div className="f c4"><label>Tên đơn vị <em>*</em></label><input className="inp" value={n.traCuu ? 'Công ty TNHH Ẩm thực Phố Mây' : ''} onChange={() => {}} /></div>
                      <div className="f c4"><label>Địa chỉ</label><input className="inp" value={n.traCuu ? '86 Lê Lợi, phường Sài Gòn, TP.HCM' : ''} onChange={() => {}} /></div>
                    </div>
                  </>
                )}

                {n.b === 3 && (
                  <>
                    <h2 className="ktf-h">Chi nhánh và kho</h2>
                    <p className="muted ktf-p">Tích chi nhánh lên sổ kế toán. Chi nhánh bỏ tích vẫn bán trên FABi, chỉ không ghi sổ.</p>
                    <div className="ktf-cn">
                      {CHI_NHANH.map(c => {
                        const on = n.chon.includes(c.id)
                        return (
                          <div key={c.id} className={`ktf-cn-dong ${on ? 'on' : ''}`}>
                            <label className="row grow"><input type="checkbox" checked={on} onChange={() => doiChon(c.id)} />
                              <span><b>{c.ten}</b><small className="muted">Cửa hàng trên FABi</small></span></label>
                            {free
                              ? <Select className="inp ktf-kho" value={n.khoFree[c.id]} onChange={e => sua({ khoFree: { ...n.khoFree, [c.id]: e.target.value } })}>
                                  {c.kho.map(k => <option key={k}>{k}</option>)}
                                </Select>
                              : <span className="ktf-kho-ds">{c.kho.map(k => <span key={k} className="chip">{k}</span>)}</span>}
                          </div>
                        )
                      })}
                    </div>
                    {free && <Note icon="info">Gói Free dùng một kho cho mỗi chi nhánh. Chọn kho chính, kho còn lại gộp vào kho này.</Note>}
                    {cnChon.length === 0 && <Note kind="warn" icon="alert">Chọn ít nhất một chi nhánh để tiếp tục.</Note>}
                  </>
                )}

                {n.b === 4 && (
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

                {n.b === 5 && (
                  <>
                    <h2 className="ktf-h">Số dư đầu kỳ</h2>
                    <p className="muted ktf-p">Số dư ngày {n.ngayBatDau}. Chưa có số thì để sau, phần mềm vẫn dùng được.</p>
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
                  {n.b >= 0 && <button className="btn lg" onClick={() => sua({ b: n.b - 1 })}>Quay lại</button>}
                  {n.b === 5 && <button className="btn ghost lg" onClick={() => { sua({ soDu: 'sau', tienMat: '', tienGui: '' }); tiep() }}>Bỏ qua</button>}
                  <button className="btn pri lg" disabled={n.b === 3 && cnChon.length === 0} onClick={tiep}>
                    {n.b === XONG - 1 ? 'Hoàn tất' : 'Tiếp tục'}<Icon n="arrow" className="ic sm" />
                  </button>
                </div>
              </div>

              <aside className="card ktf-ben">
                <h3>Bạn sẽ có gì</h3>
                <div className="row" style={{ gap: 8 }}><Pk g={n.goi} logo /><span className="chip">{nganCheDo(n.loai, n.cheDo)}</span></div>
                <ul>
                  <li><Icon n={n.loai === 'hkd' ? 'store' : 'building'} className="ic sm" /><span>{n.loai === 'hkd' ? `Hộ kinh doanh nhóm ${n.nhom}, thuế TNCN ${PP_HKD[n.ppHkd].toLowerCase()}` : 'Doanh nghiệp'}</span></li>
                  <li><Icon n="book" className="ic sm" /><span>{tenCheDo(n.loai, n.cheDo)}</span></li>
                  <li><Icon n="chinhanh" className="ic sm" /><span>{cnChon.length} chi nhánh, {soKho} kho</span></li>
                  <li><Icon n="pos" className="ic sm" /><span>Bán hàng {n.dongBo === 'kenh' ? 'tổng hợp theo kênh' : 'chi tiết theo hoá đơn'}, chốt {n.gioChot}</span></li>
                  <li><Icon n="grid" className="ic sm" /><span>{dem.co}/{dem.tong} tính năng</span></li>
                </ul>
              </aside>
            </div>
          </>
        )}

        {!veFabi && n.b === XONG && (
          <div className="card ktf-chao">
            {tai < 100
              ? <>
                  <h1>Đang lấy dữ liệu từ FABi</h1>
                  <p>Doanh thu từ {n.ngayBatDau} của {cnChon.length} chi nhánh.</p>
                  <div className="ktf-tai"><i style={{ width: `${tai}%` }} /></div>
                  <p className="muted" style={{ fontSize: 12.5 }}>{tai < 40 ? 'Lấy danh mục món, kênh bán' : tai < 80 ? `Tạo ${so(soCtDaTao)} chứng từ Xuất bán POS` : 'Ghi sổ doanh thu, thuế đầu ra'}</p>
                </>
              : <>
                  <div className="ktf-chao-ic ok"><Icon n="check" className="ic lg" /></div>
                  <h1>Xong. Sổ sách đã sẵn sàng</h1>
                  <p>Đã tạo {so(soCtDaTao)} chứng từ Xuất bán POS từ {n.ngayBatDau}. Việc nên làm tiếp:</p>
                  <ul className="ktf-viec">
                    <li><Icon n="bank" className="ic sm" />Khai báo tài khoản ngân hàng</li>
                    <li><Icon n="alert" className="ic sm" />Xem đơn POS đồng bộ lỗi</li>
                    <li><Icon n="users" className="ic sm" />Mời kế toán cùng làm</li>
                  </ul>
                  <button className="btn acc lg" onClick={xong}>Vào phần mềm<Icon n="arrow" className="ic sm" /></button>
                </>}
          </div>
        )}
      </div>
    </div>
  )
}
