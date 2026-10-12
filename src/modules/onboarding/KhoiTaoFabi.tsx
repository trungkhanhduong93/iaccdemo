// Màn mở từ FABi (T138): chào kèm thông tin lấy từ FABi, giới thiệu giao diện kế toán, hỏi dùng thử.
// Dùng thử thì vào phần mềm gói Free; các bước khởi tạo mở thành popup trong phần mềm (OnboardFabi). Màn /khoi-tao giữ cho người tự đăng ký.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SO_NGAY_DUNG_THU, batDauDungThu, useSession } from '../../app/session'
import { CHI_NHANH, type DonVi } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Logo } from '../../ui/Logo'
import { DsChiNhanh, KEY, MAC_DINH, SO_KENH, TEN_FABI, luuNhap, type Nhap } from './OnboardFabi'

export function KhoiTaoFabi() {
  const { s, set } = useSession()
  const nav = useNavigate()
  // Bản mẫu: mỗi lần mở từ FABi coi như đơn vị mới chưa dùng kế toán, xoá tiến độ khởi tạo cũ, bắt đầu từ màn chào
  const [n, setN] = useState<Nhap>(() => {
    try { localStorage.removeItem(KEY) } catch { /* bỏ qua */ }
    return MAC_DINH
  })
  const [veFabi, setVeFabi] = useState(false)   // bấm Để sau: quay lại FABi, tiến độ vẫn lưu
  const [chon, setChon] = useState<string[]>(() => CHI_NHANH.map(c => c.id))   // cửa hàng dùng thử, mặc định tất cả
  const sua = (p: Partial<Nhap>) => setN(x => ({ ...x, ...p }))
  const tenNguoi = s.ten.split(' ').slice(-2).join(' ')
  const vaoApp = () => {
    // đơn vị mới từ FABi, không đụng 3 đơn vị mẫu: tên theo FABi, chưa có mã số thuế, địa chỉ (FABi không có)
    const dvMoi: DonVi = { id: 'fabi', ten: TEN_FABI, viettat: 'PM', mst: '', goi: 'F', diaChi: '', diem: chon.length, nguoiDaiDien: '' }
    // chi nhánh của đơn vị mới là các cửa hàng chọn dùng thử; khởi tạo xong popup ghi lại theo bước Chi nhánh
    const cnThem = CHI_NHANH.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM', tuNgay: '', banDau: true }))
    set({ loggedIn: true, goi: 'F', cheDo: 'TT152', donVi: dvMoi.id, dvMoi, khoiTao: true, chiNhanh: 'all', cnThem: { ...s.cnThem, [dvMoi.id]: cnThem }, dungThu: { ...s.dungThu, [dvMoi.id]: batDauDungThu() } })   // dùng thử 30 ngày tính từ hôm nay (T158)
    nav('/app')
  }
  // cửa hàng chọn dùng thử điền sẵn vào bước Chi nhánh của popup
  const dungThu = () => { luuNhap({ ...n, b: 0, mo: true, chon }); vaoApp() }

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
            <p>Bạn có thể sang IACC từ FABi bất cứ lúc nào để bắt đầu sổ sách.</p>
            <p className="muted" style={{ fontSize: 12.5 }}>Bản mẫu chưa nối FABi thật.</p>
            <button className="btn lg" onClick={() => setVeFabi(false)}>Mở lại khởi tạo</button>
          </div>
        )}

        {!veFabi && n.b === -2 && (
          <div className="card ktf-chao">
            <div className="ktf-chao-ic"><Icon n="pos" className="ic lg" /></div>
            <h1>Chào {tenNguoi}</h1>
            <p>Bắt đầu sổ sách cho <b>Phố Mây</b>, dùng thử miễn phí {SO_NGAY_DUNG_THU} ngày trên số bán thật từ FABi.</p>
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
            <div className="ktf-gt-ch">
              <b>Chọn cửa hàng dùng thử</b>
              <DsChiNhanh ds={CHI_NHANH.map(c => ({ id: c.id, ten: c.ten, khuVuc: 'TP.HCM' }))} chon={chon} chinh="" doi={moi => setChon(moi)} coChinh={false} />
            </div>
            <div className="ktf-gt-hoi">
              <span><b>Bạn có muốn dùng thử không?</b><small className="muted ktf-gt-chu">Dùng thử miễn phí {SO_NGAY_DUNG_THU} ngày với {chon.length} cửa hàng đã chọn; chọn gói ở bước khởi tạo tiếp theo. Thêm cửa hàng sau ở Danh mục chi nhánh.</small></span>
              <span className="grow" />
              <button className="btn lg" onClick={() => sua({ b: -2 })}>Quay lại</button>
              <button className="btn ghost lg" onClick={() => setVeFabi(true)}>Để sau</button>
              <button className="btn pri lg" disabled={!chon.length} onClick={dungThu}>Dùng thử<Icon n="arrow" className="ic sm" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
