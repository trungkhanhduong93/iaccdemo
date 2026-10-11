// Khởi tạo đơn vị kế toán khi bấm từ FABi sang (T138): hỏi ít, xác nhận nhiều vì FABi đã có tài khoản, chi nhánh, món, kênh bán.
// Màn /khoi-tao giữ cho người tự đăng ký. Lưu dở ở localStorage để quay lại đúng bước.
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { GOI, demTheoGoi, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_MAC_DINH } from '../../app/che-do'
import { CHI_NHANH, DAILY, HOM_NAY } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Logo } from '../../ui/Logo'
import { Note, Pk } from '../../ui/Page'
import { Select } from '../../ui/Dropdown'

const BUOC = ['Đơn vị', 'Chi nhánh và kho', 'Đồng bộ bán hàng', 'Số dư đầu kỳ']
const KEY = 'iacc-khoi-tao-fabi'
const SO_KENH = 3   // Tại quán, Mang về, App giao đồ ăn (T113)

/** Loại hình quyết định chế độ kế toán, chế độ kéo theo gói (CHE_DO_HOP_LE). Chờ Trum duyệt câu hỏi này (T138) */
const LOAI_HINH: { g: Goi; ten: string; mota: string; icon: string }[] = [
  { g: 'F', ten: 'Hộ kinh doanh', mota: 'Hộ, cá nhân kinh doanh. Ghi sổ thu chi, không hạch toán', icon: 'store' },
  { g: 'S', ten: 'Doanh nghiệp siêu nhỏ', mota: 'Ghi sổ đơn giản, không dùng tài khoản', icon: 'building' },
  { g: 'PL', ten: 'Doanh nghiệp nhỏ và vừa', mota: 'Hạch toán Nợ/Có, báo cáo tài chính đầy đủ', icon: 'building' },
  { g: 'PR', ten: 'Doanh nghiệp lớn, chuỗi', mota: 'Trên 10 điểm bán, nhiều đồng tiền', icon: 'layers' },
]
const GOI_GOI_Y: Goi = CHI_NHANH.length > 1 ? 'PL' : 'F'

interface Nhap {
  b: number            // bước đang làm; -1 là màn chào, 4 là hoàn tất
  goi: Goi
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
  b: -1, goi: GOI_GOI_Y, traCuu: true, ngayBatDau: '01/10/2026', chon: CHI_NHANH.map(c => c.id),
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
  const sua = (p: Partial<Nhap>) => setN(x => ({ ...x, ...p }))

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* trình duyệt chặn lưu thì thôi */ }
  }, [n])

  useEffect(() => {
    if (n.b !== 4 || tai >= 100) return
    const t = setTimeout(() => setTai(x => Math.min(100, x + 7)), 120)
    return () => clearTimeout(t)
  }, [n.b, tai])

  const cheDo = CHE_DO[CHE_DO_MAC_DINH[n.goi]]
  const free = n.goi === 'F'
  const cnChon = CHI_NHANH.filter(c => n.chon.includes(c.id))
  const soKho = free ? cnChon.length : cnChon.reduce((t, c) => t + c.kho.length, 0)
  const soCt = demCt(n.chon, n.dongBo, +HOM_NAY - 29 * 86400000)   // ước một tháng, hiện ở bước đồng bộ
  const soCtDaTao = demCt(n.chon, n.dongBo, ngay(n.ngayBatDau))
  const dem = demTheoGoi(n.goi)
  const tenNguoi = s.ten.split(' ').slice(-2).join(' ')

  const doiChon = (id: string) => sua({ chon: n.chon.includes(id) ? n.chon.filter(x => x !== id) : [...n.chon, id] })
  const xong = () => {
    set({ loggedIn: true, goi: n.goi, cheDo: CHE_DO_MAC_DINH[n.goi], donVi: 'pm', khoiTao: true, dongBoFabi: n.dongBo })
    try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
    nav('/app')
  }
  const tiep = () => { sua({ b: n.b + 1 }); if (n.b === 3) setTai(0) }

  return (
    <div className="ktf">
      <div className="ktf-in">
        <div className="row ktf-dau">
          <div className="brand" style={{ color: 'var(--ink)' }}><Logo cao={36} /></div>
          <span className="chip info"><Icon n="link" className="ic sm" />Mở từ FABi</span>
          <span className="grow" />
          {n.b >= 0 && n.b < 4 && <span className="muted ktf-luu"><Icon n="check" className="ic sm" />Đã lưu, quay lại sau vẫn tiếp được</span>}
          <button className="btn ghost" onClick={() => nav('/chon-don-vi')}>Để sau</button>
        </div>

        {n.b === -1 && (
          <div className="card ktf-chao">
            <div className="ktf-chao-ic"><Icon n="pos" className="ic lg" /></div>
            <h1>Chào {tenNguoi}</h1>
            <p>Bắt đầu sổ sách cho <b>Phố Mây</b> trong 4 bước, khoảng 3 phút.</p>
            <div className="ktf-nhan">
              <span className="muted">Đã nhận từ FABi</span>
              <div><b>{CHI_NHANH.length}</b> chi nhánh</div>
              <div><b>86</b> món</div>
              <div><b>{SO_KENH}</b> kênh bán</div>
              <div><b>{CHI_NHANH.reduce((t, c) => t + c.kho.length, 0)}</b> kho</div>
            </div>
            <p className="muted" style={{ fontSize: 12.5 }}>Thông tin trên được điền sẵn, bạn chỉ cần xác nhận. Không phải nhập lại món, chi nhánh.</p>
            <button className="btn pri lg" onClick={() => sua({ b: 0 })}>Bắt đầu<Icon n="arrow" className="ic sm" /></button>
          </div>
        )}

        {n.b >= 0 && n.b < 4 && (
          <>
            <div className="steps">{BUOC.map((t, i) => <div key={t} className={i <= n.b ? 'on' : ''}><i /><span>{i + 1}. {t}</span></div>)}</div>
            <div className="ktf-luoi">
              <div className="card" style={{ padding: '24px 26px' }}>
                {n.b === 0 && (
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
                    <h3 className="ktf-h3">Đơn vị thuộc loại hình nào?</h3>
                    <div className="grid g2">
                      {LOAI_HINH.map(l => (
                        <button key={l.g} className={`opt ${n.goi === l.g ? 'on' : ''}`} onClick={() => sua({ goi: l.g })}>
                          <span className="radio" />
                          <span className="grow">
                            <span className="row"><b>{l.ten}</b><span className="grow" />{l.g === GOI_GOI_Y && <span className="chip info">Gợi ý</span>}</span>
                            <small>{l.mota}. {CHE_DO[CHE_DO_MAC_DINH[l.g]].ngan}, gói {GOI[l.g].ten}.</small>
                          </span>
                        </button>
                      ))}
                    </div>
                    <Note icon="sparkle">Gợi ý theo dữ liệu FABi: {CHI_NHANH.length} chi nhánh, doanh thu 12 tháng khoảng 29 tỷ. Đổi gói sau ở Hệ thống, Gói thuê bao.</Note>
                  </>
                )}

                {n.b === 1 && (
                  <>
                    <h2 className="ktf-h">Chi nhánh và kho</h2>
                    <p className="muted ktf-p">Tích chi nhánh lên sổ kế toán. Chi nhánh bỏ tích vẫn bán trên FABi, chỉ không ghi sổ.</p>
                    <div className="ktf-cn">
                      {CHI_NHANH.map(c => {
                        const on = n.chon.includes(c.id)
                        return (
                          <div key={c.id} className={`ktf-cn-dong ${on ? 'on' : ''}`}>
                            <label className="row grow"><input type="checkbox" checked={on} onChange={() => doiChon(c.id)} />
                              <span><b>{c.ten}</b><small className="muted">Chi nhánh FABi</small></span></label>
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

                {n.b === 2 && (
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

                {n.b === 3 && (
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
                  {n.b > 0 && <button className="btn lg" onClick={() => sua({ b: n.b - 1 })}>Quay lại</button>}
                  {n.b === 3 && <button className="btn ghost lg" onClick={() => { sua({ soDu: 'sau', tienMat: '', tienGui: '' }); tiep() }}>Bỏ qua</button>}
                  <button className="btn pri lg" disabled={n.b === 1 && cnChon.length === 0} onClick={tiep}>
                    {n.b === 3 ? 'Hoàn tất' : 'Tiếp tục'}<Icon n="arrow" className="ic sm" />
                  </button>
                </div>
              </div>

              <aside className="card ktf-ben">
                <h3>Bạn sẽ có gì</h3>
                <div className="row" style={{ gap: 8 }}><Pk g={n.goi} logo /><span className="chip">{cheDo.ngan}</span></div>
                <ul>
                  <li><Icon n="book" className="ic sm" /><span>{cheDo.ten}</span></li>
                  <li><Icon n="chinhanh" className="ic sm" /><span>{cnChon.length} chi nhánh, {soKho} kho</span></li>
                  <li><Icon n="pos" className="ic sm" /><span>Bán hàng {n.dongBo === 'kenh' ? 'tổng hợp theo kênh' : 'chi tiết theo hoá đơn'}, chốt {n.gioChot}</span></li>
                  <li><Icon n="grid" className="ic sm" /><span>{dem.co}/{dem.tong} tính năng</span></li>
                </ul>
                <small className="muted">{GOI[n.goi].mota}.</small>
              </aside>
            </div>
          </>
        )}

        {n.b === 4 && (
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
