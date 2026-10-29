// Màn mở từ FABi (T138), bước 1: giới thiệu gói Standard miễn phí, 3 giá trị chính, nút kết nối dữ liệu. Bỏ màn chào, bước chọn cửa hàng, câu hỏi dùng thử (28/10/2026).
// Dùng thử thì vào phần mềm gói Free; các bước khởi tạo mở thành popup trong phần mềm (OnboardFabi). Màn /khoi-tao giữ cho người tự đăng ký.
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { batDauDungThu, useSession } from '../../app/session'
import { CUA_HANG, type DonVi } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Logo } from '../../ui/Logo'
import { useLaMobile } from '../../ui/mobile/useLaMobile'
import { KEY, MAC_DINH, TEN_FABI, luuNhap, type Nhap } from './OnboardFabi'

/** 4 việc chủ quán quan tâm mỗi ngày, gói Standard (T138) */
const GIA_TRI: [string, string, string][] = [
  ['pos', 'Đồng bộ theo thời gian thực từ máy POS', 'Mọi đơn hàng, doanh thu bán mang về hay tại bàn tự cập nhật vào sổ sách, không cần gõ lại.'],
  ['wallet', 'Kiểm soát dòng tiền và quỹ tiền', 'Theo dõi tiền mặt thu vào két, tiền khách chuyển khoản QR, thẻ; ghi nhanh chi phí vận hành quán.'],
  ['truck', 'Mua hàng, công nợ và hao hụt kiểm kê', 'Ghi hàng mua, theo dõi tiền còn nợ từng nhà cung cấp. Kiểm kê hàng bán thẳng, biết ngay món thiếu, thừa.'],
  // gói Standard kê khai được: hộ kinh doanh nhóm 1, 2 và doanh nghiệp tính thuế theo % doanh thu (KE_KHAI trong OnboardFabi, T663)
  ['percent', 'Kê khai thuế và sổ sách', 'Lập tờ khai thuế theo % doanh thu từ số bán FABi. Sổ sách đúng mẫu cho hộ kinh doanh (TT152) và doanh nghiệp siêu nhỏ (TT58).'],
]
const CAM_KET = ['Không phát sinh chi phí', 'Không yêu cầu thẻ thanh toán', 'Dữ liệu an toàn tuyệt đối']
const KET_NOI = 'ket-noi'   // tham số đường dẫn vào thẳng phần mềm

export function KhoiTaoFabi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const laMobile = useLaMobile()
  // Bản mẫu: mỗi lần mở từ FABi coi như đơn vị mới chưa dùng kế toán, xoá tiến độ khởi tạo cũ, bắt đầu từ màn chào
  const [n] = useState<Nhap>(() => {
    try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
    return MAC_DINH
  })
  const [veFabi, setVeFabi] = useState(false)   // bấm Để sau: quay lại FABi, tiến độ vẫn lưu
  // Điện thoại chia 3 trang cho đỡ dài: tiêu đề, ảnh; thẻ giá trị; cam kết, gợi ý gói, nút kết nối. Vuốt hoặc bấm chấm để chuyển (PhuongXT 29/10/2026)
  const [trang, setTrang] = useState(0)
  const [vuotTu, setVuotTu] = useState<number | null>(null)
  const xem = (t: number) => !laMobile || trang === t
  const chon = CUA_HANG.map(c => c.id)   // bỏ bước chọn cửa hàng dùng thử: kết nối mọi cửa hàng FABi, sửa ở bước Cửa hàng của popup
  const vaoApp = () => {
    // đơn vị mới từ FABi, không đụng 3 đơn vị mẫu: tên theo FABi, chưa có mã số thuế, địa chỉ (FABi không có)
    const dvMoi: DonVi = { id: 'fabi', ten: TEN_FABI, viettat: 'PM', mst: '', goi: 'S', diaChi: '', diem: chon.length, nguoiDaiDien: '' }
    // cửa hàng của đơn vị mới là các cửa hàng chọn dùng thử; khởi tạo xong popup ghi lại theo bước Cửa hàng
    const cnThem = CUA_HANG.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM', tuNgay: '', banDau: true }))
    set({ loggedIn: true, goi: 'S', cheDo: 'TT152', donVi: dvMoi.id, dvMoi, khoiTao: true, cuaHang: 'all', cnThem: { ...s.cnThem, [dvMoi.id]: cnThem }, dungThu: { ...s.dungThu, [dvMoi.id]: batDauDungThu() } })   // dùng thử 30 ngày tính từ hôm nay (T158)
    nav('/app')
  }
  // cửa hàng chọn dùng thử điền sẵn vào bước Cửa hàng của popup
  const dungThu = () => { luuNhap({ ...n, b: 0, mo: true, chon }); vaoApp() }
  // Đường dẫn /khoi-tao-fabi?ket-noi vào thẳng phần mềm, bỏ qua màn giới thiệu (mở từ FABi khi đã xem). Nút Kết nối mở ngay trong tab này (PhuongXT 29/10/2026)
  const ketNoi = new URLSearchParams(useLocation().search).has(KET_NOI)
  useEffect(() => { if (ketNoi) dungThu() }, [ketNoi])   // eslint-disable-line react-hooks/exhaustive-deps
  if (ketNoi) return null

  return (
    <div className="ktf">
      <div className="ktf-in">
        <div className="row ktf-dau">
          <div className="brand" style={{ color: 'var(--ink)' }}><Logo cao={36} /></div>
          <span className="chip info"><Icon n="link" className="ic sm" />Mở từ FABi</span>
          <span className="grow" />
          {!veFabi && <button className="btn ghost" title="Quay lại FABi, tiến độ đã lưu" onClick={() => setVeFabi(true)}>Để sau</button>}
        </div>

        {veFabi && (
          <div className="card ktf-chao">
            <div className="ktf-chao-ic"><Icon n="pos" className="ic lg" /></div>
            <h1>Đang quay lại FABi</h1>
            <p>Bạn có thể sang iPOS Accounting từ FABi bất cứ lúc nào để bắt đầu sổ sách.</p>
            <p className="muted" style={{ fontSize: 12.5 }}>Bản mẫu chưa nối FABi thật.</p>
            <button className="btn lg" onClick={() => setVeFabi(false)}>Mở lại khởi tạo</button>
          </div>
        )}

        {!veFabi && n.b === -1 && (
          // Nội dung theo khung PhuongXT gửi 28/10/2026: đọc lướt 10 giây là bấm kết nối
          <div className="card ktf-gt ktf-b1"
            onTouchStart={e => setVuotTu(e.touches[0].clientX)}
            onTouchEnd={e => { if (vuotTu === null) return; const dx = e.changedTouches[0].clientX - vuotTu; if (Math.abs(dx) > 50) setTrang(t => Math.max(0, Math.min(2, t + (dx < 0 ? 1 : -1)))); setVuotTu(null) }}>
            {xem(0) && <div className="ktf-b1-hero">
              <div className="ktf-b1-chu">
                <span className="ktf-b1-huy"><Icon n="shield" className="ic sm" />Gói Standard: Miễn phí trọn đời cho khách hàng FABi POS</span>
                <h1>Kế toán tự động dành riêng cho quán của bạn</h1>
                <p>Gạt bỏ sổ tay thu chi. Tự động đồng bộ doanh thu bán hàng từ FABi POS chỉ với 1 chạm.</p>
              </div>
              <div className="ktf-anh ktf-b1-anh">
                <img src={`${import.meta.env.BASE_URL}${laMobile ? 'trang-chu-app.jpg' : 'trang-chu-standard.jpg'}`} alt="Trang chủ iPOS Accounting gói Standard" />
              </div>
            </div>}
            {laMobile && trang === 1 && <h2 className="ktf-h ktf-b1-tieu">Phần mềm làm gì cho quán của bạn</h2>}
            {xem(1) && <div className="ktf-b1-the">
              {GIA_TRI.map(([ic, t, m]) => (
                <div key={t}>
                  <span className="ktf-chao-ic"><Icon n={ic} className="ic" /></span>
                  <b>{t}</b>
                  <p>{m}</p>
                </div>
              ))}
            </div>}
            {laMobile && trang === 2 && (
              <div className="ktf-b1-cam">
                <h2 className="ktf-h ktf-b1-tieu">Bắt đầu miễn phí</h2>
                {CAM_KET.map(t => <div key={t}><Icon n="check" className="ic sm" />{t}</div>)}
              </div>
            )}
            {laMobile && (
              <div className="ktf-b1-cham" role="tablist" aria-label="Trang giới thiệu">
                {[0, 1, 2].map(t => <button key={t} role="tab" aria-selected={trang === t} aria-label={`Trang ${t + 1}`} className={trang === t ? 'on' : ''} onClick={() => setTrang(t)} />)}
              </div>
            )}
            <div className="ktf-b1-cta">
              <div className="ktf-gt-nut">   {/* điện thoại: ghim đáy (T668) */}
                {laMobile && trang < 2
                  ? <button className="btn pri lg" onClick={() => setTrang(trang + 1)}>Tiếp<Icon n="arrow" className="ic sm" /></button>
                  : <button className="btn pri lg" onClick={dungThu}>Bắt đầu kết nối dữ liệu (chỉ mất 30 giây)<Icon n="arrow" className="ic sm" /></button>}
              </div>
              {!laMobile && <small className="muted">{CAM_KET.join(' · ')}</small>}
            </div>
            {xem(2) && <p className="ktf-b1-goi"><Icon n="sparkle" className="ic sm" />Hộ kinh doanh tính thuế TNCN theo lợi nhuận, doanh nghiệp siêu nhỏ tính GTGT theo khấu trừ, TNDN theo lợi nhuận: chọn gói Plus. Doanh nghiệp hạch toán theo TT133 hay TT99: chọn gói Pro. Nâng cấp bất kỳ lúc nào ngay trên phần mềm.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
