// Thanh trên: đơn vị kế toán, cửa hàng làm việc, nút "Trải nghiệm gói" đổi gói, tài khoản. Vai trò lấy theo tài khoản đăng nhập.
// Tìm nhanh nằm ở sidebar; kỳ chọn ở bộ lọc từng màn.
import { useNavigate } from 'react-router-dom'
import { donViHienTai, dsCuaHang, dsDonVi, dungThuDv, loaiHinhDv, useSession, cheDoHienTai } from './session'
import { cheDoCuaGoi } from './che-do'
import { GOI, GOIS, demTheoGoi } from './plan'
import { ROLE } from '../data/mock'
import { Icon } from '../ui/Icon'
import { Pk } from '../ui/Page'
import { Dropdown, MenuHead, MenuItem, MenuSep } from '../ui/Dropdown'
import { useThemDonVi } from '../modules/onboarding/OnboardFabi'


export function Topbar({ onSearch }: { onSearch?: () => void }) {
  const { s, set } = useSession()
  const nav = useNavigate()
  const dv = donViHienTai(s)
  const dt = dungThuDv(s)
  const themDv = useThemDonVi()
  const dsCn = dsCuaHang(s)
  const cn = dsCn.find(c => c.id === s.cuaHang)
  const ten = s.ten.split(' ').slice(-2).map(x => x[0]).join('')

  return (
    <header className="topbar">
      <Dropdown btnClass="dv-btn" title="Đổi đơn vị kế toán" width={410} label={<>
        <span className="dv-av">{dv.viettat}</span>
        <span style={{ minWidth: 0 }}><small>{dv.mst ? `${loaiHinhDv(s, dv) === 'hkd' ? 'Hộ kinh doanh' : 'Công ty'} · MST ${dv.mst}` : 'Chưa khai mã số thuế'} · {cheDoHienTai(s).ngan}</small><b>{dv.ten}</b></span>
        <Icon n="chevd" className="ic sm" />
      </>}>
        {dong => <>
          <MenuHead right={<small className="mh-n">{dsDonVi(s).length} đơn vị</small>}>Đơn vị kế toán</MenuHead>
          {dsDonVi(s).map(d => (
            <MenuItem key={d.id} on={d.id === s.donVi} icon={<span className="dv-av">{d.viettat}</span>}
              desc={<>{d.mst ? `MST ${d.mst}` : 'Chưa khai MST'} · {cheDoCuaGoi(d.goi).ngan} · {d.diem} điểm bán</>} right={<Pk g={d.goi} />}
              onClick={() => { set({ donVi: d.id, goi: d.goi, cuaHang: 'all' }); dong(); nav('/app') }}>{d.ten}</MenuItem>
          ))}
          <MenuSep />
          <MenuItem icon="plus" onClick={() => { dong(); themDv() }} desc="Khởi tạo 4 bước từ cửa hàng FABi chưa dùng kế toán">Thêm đơn vị kế toán</MenuItem>
          <MenuItem icon="swap" to="/chon-don-vi">Xem tất cả đơn vị</MenuItem>
        </>}
      </Dropdown>

      <span className="grow" />

      {onSearch && (
        <button
          type="button"
          className="topbar-tim-btn"
          onClick={onSearch}
          title="Tìm màn hình, chứng từ, báo cáo (Ctrl K)"
        >
          <Icon n="search" className="ic sm" />
          <span>Tìm kiếm…</span>
          <span className="kbd">Ctrl K</span>
        </button>
      )}

      <Dropdown btnClass="cn-btn" align="end" width={300} title="Chọn cửa hàng làm việc. Chứng từ thêm mới lập cho cửa hàng này"
        label={<><Icon n="cuahang" className="ic sm" /><span className="cn-t"><small>Cửa hàng</small><b>{cn ? cn.ten : 'Tất cả cửa hàng'}</b></span><Icon n="chevd" className="ic sm" /></>}>
        {dong => <>
          <MenuHead right={<small className="mh-n">{dsCn.length} cửa hàng</small>}>Cửa hàng làm việc</MenuHead>
          <MenuItem on={!cn} icon="layers" desc="Chỉ xem gộp, chưa lập chứng từ" onClick={() => { set({ cuaHang: 'all' }); dong() }}>Tất cả cửa hàng</MenuItem>
          <MenuSep />
          {dsCn.map(c => (
            <MenuItem key={c.id} on={c.id === s.cuaHang} icon="cuahang" onClick={() => { set({ cuaHang: c.id }); dong() }}>{c.ten}</MenuItem>
          ))}
          <MenuSep />
          <MenuItem icon="edit" to="/app/danh-muc/cua-hang">Danh mục cửa hàng</MenuItem>
        </>}
      </Dropdown>

      {/* đơn vị đang dùng thử: còn bao nhiêu ngày, bấm mở Gói thuê bao để mua (T158) */}
      {dt && <button type="button" className={`tb-dung-thu${dt.con <= 7 ? ' gan-het' : ''}`} title={`Dùng thử đến ${dt.den}. Bấm để chọn gói`} onClick={() => nav('/app/he-thong/goi-thue-bao')}>
        <Icon n="clock" className="ic sm" /><span>Dùng thử · còn <b>{dt.con}</b> ngày</span></button>}
      <Dropdown btnClass="demo" align="end" width={330} title="Bấm để trải nghiệm giao diện các gói khác"
        label={<><Icon n="sparkle" className="ic sm" /><span>Trải nghiệm gói</span><Pk g={s.goi} /><Icon n="chevd" className="ic sm" /></>}>
        {dong => <>
          <MenuHead right={<span className="chip warn">Bản mẫu</span>}>Trải nghiệm gói</MenuHead>
          {GOIS.map(g => {
            const n = demTheoGoi(g)
            return (
              <MenuItem key={g} on={s.goi === g} icon={<span className={`mi-goi ${GOI[g].cls}`}>{g}</span>}
                desc={<>{cheDoCuaGoi(g).ngan} · {n.co}/{n.tong} tính năng</>} onClick={() => { set({ goi: g }); dong() }}>{GOI[g].ten}</MenuItem>
            )
          })}
        </>}
      </Dropdown>

      <button className="icon-btn" title="Thông báo" onClick={() => nav('/app/tien-ich/11-6')}><Icon n="bell" /><span className="dot" /></button>
      <Dropdown btnClass="avatar" align="end" width={290} title={s.ten} label={ten}>
        {dong => <>
          <div className="mi-user">
            <span className="avatar">{ten}</span>
            <span className="mi-t"><b>{s.ten}</b><small>{s.email}</small></span>
          </div>
          <div className="mi-user-goi"><span className="chip">{ROLE[s.role]}</span><Pk g={s.goi} /><span className="muted">{dv.viettat} · {cheDoHienTai(s).ngan}</span></div>
          <MenuSep />
          <MenuItem icon="layers" to="/app/he-thong/goi-thue-bao">Gói thuê bao</MenuItem>
          <MenuItem icon="swap" to="/chon-don-vi">Đổi đơn vị kế toán</MenuItem>
          <MenuItem icon="users" to="/app/he-thong/nguoi-dung">Người dùng</MenuItem>
          <MenuItem icon="cog" to="/app/he-thong/cau-hinh">Cấu hình kế toán</MenuItem>
          <MenuSep />
          <MenuItem icon="logout" danger onClick={() => { dong(); set({ loggedIn: false }); nav('/dang-nhap') }}>Đăng xuất</MenuItem>
        </>}
      </Dropdown>
    </header>
  )
}
