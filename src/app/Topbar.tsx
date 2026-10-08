// Thanh trên: đơn vị kế toán, chi nhánh làm việc, nút "Xem thử" đổi gói và vai trò, tài khoản.
// Tìm nhanh nằm ở sidebar; kỳ chọn ở bộ lọc từng màn.
import { useNavigate } from 'react-router-dom'
import { chiNhanhHienTai, donViHienTai, useSession } from './session'
import { GOI, GOIS, demTheoGoi } from './plan'
import { CHI_NHANH, DON_VI, ROLE, type Role } from '../data/mock'
import { Icon } from '../ui/Icon'
import { Pk } from '../ui/Page'
import { Dropdown, MenuHead, MenuItem, MenuSep } from '../ui/Dropdown'

const ROLE_ICON: Record<Role, [string, string]> = {
  owner: ['store', 'Vào Tổng quan'], ktt: ['shield', 'Vào Bàn làm việc, duyệt, khoá sổ'], ktv: ['user', 'Vào Bàn làm việc, nhập chứng từ'],
}

export function Topbar() {
  const { s, set } = useSession()
  const nav = useNavigate()
  const dv = donViHienTai(s)
  const cn = chiNhanhHienTai(s)
  const ten = s.ten.split(' ').slice(-2).map(x => x[0]).join('')

  return (
    <header className="topbar">
      <Dropdown btnClass="dv-btn" title="Đổi đơn vị kế toán" width={410} label={<>
        <span className="dv-av">{dv.viettat}</span>
        <span style={{ minWidth: 0 }}><b>{dv.ten}</b><small>MST {dv.mst} · {GOI[s.goi].cheDoNgan}</small></span>
        <Icon n="chevd" className="ic sm" />
      </>}>
        {dong => <>
          <MenuHead right={<small className="mh-n">{DON_VI.length} đơn vị</small>}>Đơn vị kế toán</MenuHead>
          {DON_VI.map(d => (
            <MenuItem key={d.id} on={d.id === s.donVi} icon={<span className="dv-av">{d.viettat}</span>}
              desc={<>MST {d.mst} · {GOI[d.goi].cheDoNgan} · {d.diem} điểm bán</>} right={<Pk g={d.goi} />}
              onClick={() => { set({ donVi: d.id, goi: d.goi, chiNhanh: 'all' }); dong(); nav('/app') }}>{d.ten}</MenuItem>
          ))}
          <MenuSep />
          <MenuItem icon="plus" to="/khoi-tao" desc="Khởi tạo theo mã số thuế, nối FABi">Thêm đơn vị kế toán</MenuItem>
          <MenuItem icon="swap" to="/chon-don-vi">Xem tất cả đơn vị</MenuItem>
        </>}
      </Dropdown>

      <span className="grow" />

      <Dropdown btnClass="cn-btn" align="end" width={300} title="Chọn chi nhánh làm việc. Chứng từ thêm mới lập cho chi nhánh này"
        label={<><Icon n="store" className="ic sm" /><span>{cn ? cn.ten : 'Tất cả chi nhánh'}</span><Icon n="chevd" className="ic sm" /></>}>
        {dong => <>
          <MenuHead right={<small className="mh-n">{CHI_NHANH.length} chi nhánh</small>}>Chi nhánh làm việc</MenuHead>
          <MenuItem on={!cn} icon="layers" desc="Chỉ xem gộp, chưa lập chứng từ" onClick={() => { set({ chiNhanh: 'all' }); dong() }}>Tất cả chi nhánh</MenuItem>
          <MenuSep />
          {CHI_NHANH.map(c => (
            <MenuItem key={c.id} on={c.id === s.chiNhanh} icon="store" onClick={() => { set({ chiNhanh: c.id }); dong() }}>{c.ten}</MenuItem>
          ))}
          <MenuSep />
          <MenuItem icon="edit" to="/app/danh-muc/chi-nhanh">Danh mục chi nhánh</MenuItem>
        </>}
      </Dropdown>

      <Dropdown btnClass="demo" align="end" width={330} title="Chỉ có ở bản mẫu: đổi gói và vai trò để xem giao diện thay đổi"
        label={<><span>Xem thử</span><Pk g={s.goi} /><b>{ROLE[s.role]}</b><Icon n="chevd" className="ic sm" /></>}>
        {dong => <>
          <MenuHead right={<span className="chip warn">Bản mẫu</span>}>Xem theo gói</MenuHead>
          {GOIS.map(g => {
            const n = demTheoGoi(g)
            return (
              <MenuItem key={g} on={s.goi === g} icon={<span className={`mi-goi ${GOI[g].cls}`}>{GOI[g].ten[0]}</span>}
                desc={<>{GOI[g].cheDoNgan} · {n.co}/{n.tong} tính năng</>} onClick={() => { set({ goi: g }); dong() }}>{GOI[g].ten}</MenuItem>
            )
          })}
          <MenuSep />
          <MenuHead>Xem theo vai trò</MenuHead>
          {(Object.keys(ROLE) as Role[]).map(r => (
            <MenuItem key={r} on={s.role === r} icon={ROLE_ICON[r][0]} desc={ROLE_ICON[r][1]}
              onClick={() => { set({ role: r }); dong(); nav('/app') }}>{ROLE[r]}</MenuItem>
          ))}
        </>}
      </Dropdown>

      <button className="icon-btn" title="Thông báo" onClick={() => nav('/app/tien-ich/11-6')}><Icon n="bell" /><span className="dot" /></button>
      <Dropdown btnClass="avatar" align="end" width={290} title={s.ten} label={ten}>
        {dong => <>
          <div className="mi-user">
            <span className="avatar">{ten}</span>
            <span className="mi-t"><b>{s.ten}</b><small>{s.email}</small></span>
          </div>
          <div className="mi-user-goi"><span className="chip">{ROLE[s.role]}</span><Pk g={s.goi} /><span className="muted">{dv.viettat} · {GOI[s.goi].cheDoNgan}</span></div>
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
