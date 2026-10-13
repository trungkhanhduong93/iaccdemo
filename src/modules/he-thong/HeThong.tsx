// Hệ thống: người dùng, phân quyền, gói thuê bao, cấu hình, thông tin đơn vị
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Row, ScreenProps } from '../types'
import { MODULES, duongDan } from '../../app/registry'
import { donViHienTai, dsChiNhanh, dsDonVi, loaiHinhDv, useSession, cheDoHienTai, namTaiChinh, ngayDauNam, type PpGtgt, type PpTndn } from '../../app/session'
import { ChonKenh, KENH_ONLINE, KENH_SAN, NHOM_HKD, type LoaiHinh, type PpHkd } from '../onboarding/OnboardFabi'
import { FEATURES, GOI, GOIS, MODS, demTheoGoi, kieuGhiSo, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_HOP_LE, cheDoCuaGoi, type CheDo } from '../../app/che-do'
import { CHI_NHANH, KHO, NGUOI_DUNG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead, Pk } from '../../ui/Page'
import { St, Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { HopXacNhan } from '../../ui/LocNangCao'
import { ONgay } from '../../ui/ChonNgay'
import { thTT58, moTaBoSoTT58 } from '../bao-cao/tt58'
import { CatalogPanel } from '../../ui/generic/CatalogScreen'
import type { CauHinhDM } from '../danh-muc/truong-dm'

const VAI_TRO = ['Chủ doanh nghiệp', 'Kế toán trưởng', 'Kế toán viên', 'Quản lý chi nhánh', 'Thủ kho']
const PHAM_VI_DS = ['Tất cả chi nhánh', ...CHI_NHANH.map(c => c.ten)]
const KHO_DS = ['Tất cả kho', ...KHO]

const CAU_HINH_NGUOI_DUNG: CauHinhDM = {
  ten: 'Người dùng',
  khoi: [
    {
      ten: 'Thông tin chung',
      truong: [
        { k: 'username', nhan: 'Tên đăng nhập', kieu: 'chu', batBuoc: true },
        { k: 'ten', nhan: 'Họ tên', kieu: 'chu', caHang: true, batBuoc: true },
        { k: 'email', nhan: 'Email', kieu: 'chu', batBuoc: true },
        { k: 'sdt', nhan: 'Số điện thoại', kieu: 'chu' },
        { k: 'bp', nhan: 'Bộ phận', kieu: 'chu' },
        { k: 'cv', nhan: 'Chức vụ', kieu: 'chu' },
      ],
    },
    {
      ten: 'Phân quyền',
      truong: [
        { k: 'vaiTro', nhan: 'Vai trò', kieu: 'chon', ds: VAI_TRO, batBuoc: true },
        { k: 'pham', nhan: 'Chi nhánh được giao', kieu: 'chon', ds: PHAM_VI_DS },
        { k: 'kho', nhan: 'Kho được giao', kieu: 'chon', ds: KHO_DS },
        { k: 'otp2fa', nhan: 'Bắt buộc xác thực hai lớp', kieu: 'tich', caHang: false },
      ],
    },
    {
      ten: 'Trạng thái',
      truong: [
        { k: 'hieuLucTu', nhan: 'Hiệu lực từ ngày', kieu: 'ngay' },
        { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich' },
        { k: 'dongY', nhan: 'Đã đồng ý chia sẻ thông tin cá nhân', kieu: 'tich', caHang: true, batBuoc: true },
      ],
    },
  ],
  moi: () => ({ _tt: 1, dongY: false, vaiTro: 'Kế toán viên', pham: 'Tất cả chi nhánh', kho: 'Tất cả kho' }),
}

export function NguoiDung({ sc }: ScreenProps) {
  const { toast } = useSession()
  const [editUser, setEditUser] = useState<Row | null>(null)

  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!} meta={<span className="chip">{NGUOI_DUNG.length}/10 người dùng của gói</span>}>
        <button type="button" className="btn pri" onClick={() => setEditUser({})}><Icon n="mail" className="ic sm" />Mời người dùng</button>
      </PageHead>
      <section className="card">
        <Table
          cols={[
            { k: 'ten', t: 'Họ tên', r: r => <span className="row"><span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{r.ten.split(' ').slice(-2).map((x: string) => x[0]).join('')}</span><b style={{ color: 'var(--ink)' }}>{r.ten}</b></span> },
            { k: 'email', t: 'Email', cls: 'dim' },
            { k: 'vaiTro', t: 'Vai trò' },
            { k: 'pham', t: 'Phạm vi dữ liệu' },
            { k: 'lan', t: 'Đăng nhập gần nhất', cls: 'dim' },
            { k: 'tt', t: 'Trạng thái', r: r => r.tt === 'ok' ? <St k="ok">Đang dùng</St> : <St k="warn">Chưa nhận lời mời</St> },
            { k: 'x', t: '', r: (r: Row) => <button type="button" className="btn sm ghost" onClick={() => setEditUser(r)}>Sửa</button> },
          ]}
          rows={NGUOI_DUNG}
          onRow={r => setEditUser(r)}
        />
      </section>
      <Note icon="shield">Xác thực hai lớp bắt buộc với kế toán trưởng và chủ doanh nghiệp. Người dùng chỉ thấy dữ liệu chi nhánh, kho được giao.</Note>

      {editUser && (
        <CatalogPanel
          cauHinh={CAU_HINH_NGUOI_DUNG}
          edit={editUser}
          all={NGUOI_DUNG}
          ten="Người dùng"
          tenNgan="Người dùng"
          anNutThemTiep
          onDong={() => setEditUser(null)}
          onLuu={(_val) => {
            const isMoi = !editUser.ten
            toast(isMoi ? 'Đã gửi lời mời tới email' : 'Đã lưu người dùng')
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}
const QUYEN = ['Xem', 'Thêm', 'Sửa', 'Xoá', 'Ghi sổ', 'Khoá sổ']
const MAC_DINH: Record<string, string[]> = {
  'Chủ doanh nghiệp': ['Xem'], 'Kế toán trưởng': QUYEN, 'Kế toán viên': ['Xem', 'Thêm', 'Sửa', 'Ghi sổ'], 'Quản lý chi nhánh': ['Xem', 'Thêm'], 'Thủ kho': ['Xem', 'Thêm', 'Sửa'],
}

export function PhanQuyen({ sc }: ScreenProps) {
  const { toast } = useSession()
  const [vt, setVt] = useState('Kế toán viên')
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}>
        <button className="btn"><Icon n="plus" className="ic sm" />Thêm mới</button>
        <button className="btn pri" onClick={() => toast(`Đã lưu quyền của ${vt}`)}>Lưu</button>
      </PageHead>
      <div className="grid" style={{ gridTemplateColumns: '240px minmax(0,1fr)', alignItems: 'start' }}>
        <Card title="Vai trò" pad={false}>
          <div className="panel-list" style={{ padding: 8 }}>
            {VAI_TRO.map(v => <a key={v} className={v === vt ? 'on' : ''} onClick={() => setVt(v)} style={{ cursor: 'pointer' }}><span>{v}</span></a>)}
          </div>
        </Card>
        <section className="card">
          <div className="card-h"><h3>Quyền của {vt}</h3><span className="sub">Theo phân hệ · phạm vi dữ liệu đặt ở Người dùng</span></div>
          <table className="tbl matrix">
            <thead><tr><th>Phân hệ</th>{QUYEN.map(q => <th key={q} className="c">{q}</th>)}</tr></thead>
            <tbody>
              {MODS.map(m => (
                <tr key={m}><td>{m}</td>{QUYEN.map(q => <td key={q} className="c"><input type="checkbox" defaultChecked={MAC_DINH[vt].includes(q)} key={vt + q} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

export { GoiThueBao } from './GoiThueBao'

export function CauHinh({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const noco = kieuGhiSo(s.cheDo) === 'noco'
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" onClick={() => toast('Đã lưu cấu hình')}>Lưu</button></PageHead>
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <Card title="Bộ định khoản tự động" act={noco ? <Link className="btn sm ghost" to="/app/danh-muc/1-15">Sửa bộ định khoản</Link> : undefined}>
          {noco ? <Note icon="book">Thứ tự ưu tiên tài khoản: hàng hoá, rồi nhóm hàng, rồi mặc định của chế độ. Bộ mặc định ngành F&B đã nạp sẵn 7 bút toán.</Note>
            : <Note kind="gray">Chế độ {cheDoHienTai(s).ngan} không dùng tài khoản Nợ/Có nên không có bộ định khoản.</Note>}
        </Card>
        <Card title="Đánh số chứng từ">
          <Table cols={[{ k: 'loai', t: 'Loại chứng từ' }, { k: 'mau', t: 'Mẫu số', cls: 'code' }, { k: 'vd', t: 'Ví dụ', cls: 'dim' }]} rows={[
            { loai: 'Phiếu thu', mau: 'PT{YY}{MM}-{0000}', vd: 'PT2610-0001' }, { loai: 'Phiếu chi', mau: 'PC{YY}{MM}-{0000}', vd: 'PC2610-0241' },
            { loai: 'Xuất bán POS', mau: 'Số hoá đơn FABi', vd: 'YHLTJTAKD76Z' }, { loai: 'Mua hàng', mau: 'MH{YY}{MM}-{0000}', vd: 'MH2610-0118' }]} />
        </Card>
        {/* Cách đồng bộ bán hàng FABi thành chứng từ Xuất bán POS (T113) */}
        <Card title="Đồng bộ bán hàng từ FABi">
          <div className="stack" style={{ gap: 10 }}>
            {([
              ['chiTiet', 'Chi tiết theo hoá đơn', 'Mỗi hoá đơn trên FABi là một chứng từ Xuất bán POS, số chứng từ là số hoá đơn FABi. Xem được từng đơn, giờ bán, kênh, cách thanh toán.'],
              ['kenh', 'Tổng hợp theo kênh', 'Mỗi ngày, mỗi chi nhánh, mỗi kênh bán (Tại quán, Mang về, App giao đồ ăn) là một chứng từ. Ít chứng từ, sổ gọn.'],
            ] as const).map(([k, ten, mota]) => (
              <label key={k} className="row" style={{ gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="radio" name="dongBoFabi" style={{ marginTop: 3 }} checked={(s.dongBoFabi ?? 'kenh') === k}
                  onChange={() => { set({ dongBoFabi: k }); toast(`Đồng bộ FABi: ${ten.toLowerCase()}`) }} />
                <span><b style={{ fontSize: 13 }}>{ten}</b><br /><small className="muted">{mota}</small></span>
              </label>
            ))}
            <Note kind="gray">Đổi cách đồng bộ áp cho dữ liệu đồng bộ từ lúc đổi; tổng doanh thu, thuế mỗi ngày không đổi.</Note>
          </div>
        </Card>
        <Card title="Chi nhánh và ánh xạ POS">
          <Table cols={[{ k: 'ten', t: 'Chi nhánh' }, { k: 'fabi', t: 'Mã trên FABi', cls: 'code' }, { k: 'kho', t: 'Kho' }]} rows={dsChiNhanh(s).map(c => {
            // gói Free, Standard: dữ liệu mẫu một kho mỗi chi nhánh, ghi tên kho; gói khác ghi số kho (T145)
            const kho = CHI_NHANH.find(x => x.id === c.id)?.kho ?? [`Kho ${c.ten.replace(/^Phố Mây /, '')}`]
            return { ten: c.ten, fabi: `FB-${c.id.toUpperCase()}-01`, kho: s.goi === 'F' || s.goi === 'S' ? kho[0] : kho.length }
          })} />
        </Card>
      </div>
    </div>
  )
}

/** Nhãn phương pháp thuế ở Thông tin đơn vị */
const PP_GTGT: Record<PpGtgt, string> = { tyLe: 'Theo phương pháp trực tiếp (% doanh thu)', khauTru: 'Theo phương pháp khấu trừ' }
const PP_THU_NHAP: Record<PpHkd, string> = { doanhThu: 'Theo doanh thu', loiNhuan: 'Theo lợi nhuận tính thuế' }

export function ThongTinDonVi({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const tt = s.ttDv?.[s.donVi] ?? {}
  // Ngày đầu năm: chứng từ thêm mới phải có ngày từ ngày này trở đi, trừ màn khai số dư
  const [dauNam, setDauNam] = useState(ngayDauNam(s))
  // Năm làm việc hiện tại: các kỳ số liệu là 12 tháng tính từ ngày đầu năm; đổi năm thì ngày đầu năm đổi năm theo
  const [nam, setNam] = useState(namTaiChinh(s))
  const doiNam = (n: number) => { setNam(n); setDauNam(d => d.replace(/\d{4}$/, String(n))) }
  // Thông tin kê khai khai lúc khởi tạo, sửa lại ở đây (T145); chưa khai thì đơn vị tên "Hộ kinh doanh..." coi là hộ kinh doanh
  const dsCn = dsChiNhanh(s)
  const [f, setF] = useState(() => ({
    ten: dv.ten, mst: dv.mst, diaChi: dv.diaChi,
    loai: loaiHinhDv(s, dv) as LoaiHinh,
    nhom: tt.nhom ?? 1, ppHkd: tt.ppHkd ?? 'doanhThu' as PpHkd, ppGtgt: s.ppGtgt, ppTndn: s.ppTndn,
    cnChinh: tt.cnChinh || dsCn[0]?.id || '', kenhOnline: tt.kenhOnline ?? KENH_ONLINE, kenhSan: tt.kenhSan ?? KENH_SAN,
  }))
  const sua = (p: Partial<typeof f>) => setF(x => ({ ...x, ...p }))
  const dnCoDinh = s.goi === 'PL' || s.goi === 'PR'   // doanh nghiệp gói Plus, Pro: GTGT khấu trừ, TNDN theo lợi nhuận, không chọn
  // Doanh nghiệp nộp GTGT khấu trừ thì TNDN chỉ theo lợi nhuận tính thuế
  const ppCoDinh = NHOM_HKD[f.nhom - 1]?.pp ?? null
  const tndnCoDinh = f.loai === 'dn' && (dnCoDinh || f.ppGtgt === 'khauTru')   // nhóm 1, 3, 4 cách tính thuế cố định; nhóm 2 được chọn
  const bat = (ds: string[], k: string) => ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k]
  const mstGoc = Boolean(dsDonVi({ dvMoi: s.dvMoi }).find(d => d.id === s.donVi)?.mst)   // MST đã khai lúc khởi tạo thì không sửa; chưa khai thì nhập ở đây
  const luuDv = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dauNam)) { toast('Ngày đầu năm cần nhập dạng dd/mm/yyyy'); return }
    if (!f.ten.trim()) { toast('Tên đơn vị không được để trống'); return }
    const { ten, mst, diaChi, loai, nhom, ppHkd, cnChinh, kenhOnline, kenhSan } = f
    set({
      // Doanh nghiệp chọn thuế GTGT, TNDN (gói Plus, Pro cố định khấu trừ, theo lợi nhuận); hộ kinh doanh luôn GTGT trực tiếp trên doanh thu
      ppGtgt: loai === 'hkd' ? 'tyLe' : dnCoDinh ? 'khauTru' : f.ppGtgt, ppTndn: tndnCoDinh ? 'thuNhap' : f.ppTndn,
      ngayDauNam: { ...s.ngayDauNam, [s.donVi]: dauNam }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: nam },
      ttDv: { ...s.ttDv, [s.donVi]: { ten, mst, diaChi, loai, nhom, ppHkd: ppCoDinh ?? ppHkd, cnChinh, kenhOnline, kenhSan: kenhSan.filter(k => kenhOnline.includes(k)) } },
    })
    toast('Đã lưu thông tin đơn vị')
  }
  const { loai } = f
  const [choDoi, setChoDoi] = useState<CheDo | null>(null)   // đổi chế độ kế toán, hỏi lại trước khi đổi
  const doiLoai = loai !== loaiHinhDv(s, dv)
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" onClick={luuDv}>Lưu</button></PageHead>
      <div className="stack">
        <Card title="Thông tin trên chứng từ, báo cáo">
          <div className="form-grid">
            <div className="f c2"><label>Tên đơn vị</label><input className="inp" value={f.ten} onChange={e => sua({ ten: e.target.value })} /></div>
            <div className="f"><label>Mã số thuế</label>
              <input className="inp" readOnly={mstGoc} value={f.mst} placeholder="Chưa khai mã số thuế" onChange={e => sua({ mst: e.target.value })}
                title={mstGoc ? 'Mã số thuế đã khai, không sửa' : 'Đơn vị chưa khai mã số thuế'} /></div>
            <div className="f"><label>Số điểm bán</label><input className="inp" readOnly value={dsCn.length} /></div>
            <div className="f c4"><label>Địa chỉ</label><input className="inp" value={f.diaChi} onChange={e => sua({ diaChi: e.target.value })} /></div>
            <div className="f c2"><label>Người đại diện theo pháp luật</label><input className="inp" defaultValue={dv.nguoiDaiDien} /></div>
            <div className="f c2"><label>Kế toán trưởng</label><input className="inp" defaultValue="Trần Thu Hà" /></div>
          </div>
        </Card>
        <Card title="Thông tin kê khai">
          <div className="form-grid">
            <div className="f c2"><label>Loại hình</label>
              <Select className="inp" value={loai} aria-label="Loại hình" onChange={e => sua({ loai: e.target.value as LoaiHinh })}
                ds={[{ v: 'hkd', t: 'Hộ kinh doanh' }, { v: 'dn', t: 'Doanh nghiệp' }]} /></div>
            {/* Thông tư áp dụng đứng cạnh Loại hình (T174) */}
            <div className="f c2"><label>Thông tư áp dụng</label>
              {loai === 'hkd'
                ? <input className="inp" readOnly value={`${CHE_DO.TT152.soHieu} · ${CHE_DO.TT152.ten}`} />
                : s.goi === 'F'
                ? <input className="inp" readOnly value="Quản lý lãi lỗ, không theo thông tư" />
                : <Select className="inp" value={s.cheDo} disabled={CHE_DO_HOP_LE[s.goi].length <= 1} aria-label="Thông tư áp dụng"
                    onChange={e => { const moi = e.target.value as CheDo; if (moi !== s.cheDo) setChoDoi(moi) }}
                    ds={CHE_DO_HOP_LE[s.goi].map(cd => ({ v: cd, t: `${CHE_DO[cd].soHieu} · ${CHE_DO[cd].ten}` }))} />}
              {loai === 'dn' && s.goi !== 'F' && CHE_DO_HOP_LE[s.goi].length <= 1 && <small className="muted" style={{ display: 'block', marginTop: 4 }}>Gói {GOI[s.goi].ten} chỉ dùng {cheDoHienTai(s).ngan}</small>}
            </div>
            {loai === 'hkd' && <>
              <div className="f c2"><label>Nhóm doanh thu</label>
                <Select className="inp" value={String(f.nhom)} aria-label="Nhóm doanh thu" onChange={e => sua({ nhom: Number(e.target.value) })}
                  ds={NHOM_HKD.map(x => ({ v: String(x.nhom), t: `Nhóm ${x.nhom} (${x.ten})` }))} /></div>
              {/* Hộ kinh doanh: thuế GTGT chỉ trực tiếp trên doanh thu; thuế TNCN nhóm 1 theo doanh thu, nhóm 2 chọn, nhóm 3, 4 theo lợi nhuận */}
              <div className="f c2"><label>Phương pháp thuế GTGT</label>
                <Select className="inp" value="tyLe" disabled aria-label="Phương pháp thuế GTGT" ds={[{ v: 'tyLe', t: PP_GTGT.tyLe }]} /></div>
              <div className="f c2"><label>Phương pháp thuế TNCN</label>
                <Select className="inp" value={ppCoDinh ?? f.ppHkd} disabled={ppCoDinh !== null} aria-label="Phương pháp thuế TNCN"
                  onChange={e => sua({ ppHkd: e.target.value as PpHkd })}
                  ds={(ppCoDinh ? [ppCoDinh] : (['doanhThu', 'loiNhuan'] as const)).map(v => ({ v, t: PP_THU_NHAP[v] }))} /></div>
              <div className="f c2"><label>Địa điểm kinh doanh chính</label>
                <Select className="inp" value={f.cnChinh} aria-label="Địa điểm kinh doanh chính" onChange={e => sua({ cnChinh: e.target.value })}
                  ds={dsCn.map(c => ({ v: c.id, t: c.ten }))} /></div>
              <div className="f c2"><label>Kênh bán online</label>
                <ChonKenh ds={KENH_ONLINE} chon={f.kenhOnline} doi={k => sua({ kenhOnline: bat(f.kenhOnline, k) })} trong="Chọn kênh bán" /></div>
              <div className="f c2"><label>Kênh bán qua sàn đã khấu trừ thuế</label>
                <ChonKenh ds={KENH_SAN.filter(k => f.kenhOnline.includes(k))} chon={f.kenhSan.filter(k => f.kenhOnline.includes(k))} doi={k => sua({ kenhSan: bat(f.kenhSan, k) })} trong="Chọn sàn" /></div>
            </>}
            {/* Doanh nghiệp: chọn thuế GTGT trực tiếp hoặc khấu trừ; thuế TNDN theo doanh thu hoặc theo lợi nhuận tính thuế */}
            {loai === 'dn' && <>
              <div className="f c2"><label>Phương pháp thuế GTGT</label>
                <Select className="inp" value={dnCoDinh ? 'khauTru' : f.ppGtgt} disabled={dnCoDinh} aria-label="Phương pháp thuế GTGT" onChange={e => sua({ ppGtgt: e.target.value as PpGtgt })}
                  ds={(dnCoDinh ? (['khauTru'] as const) : (['tyLe', 'khauTru'] as const)).map(v => ({ v, t: PP_GTGT[v] }))} /></div>
              <div className="f c2"><label>Phương pháp thuế TNDN</label>
                <Select className="inp" value={tndnCoDinh ? 'thuNhap' : f.ppTndn} disabled={tndnCoDinh} aria-label="Phương pháp thuế TNDN" onChange={e => sua({ ppTndn: e.target.value as PpTndn })}
                  ds={[...(tndnCoDinh ? [] : [{ v: 'tyLe', t: PP_THU_NHAP.doanhThu }]), { v: 'thuNhap', t: PP_THU_NHAP.loiNhuan }]} /></div>
            </>}
          </div>
          {doiLoai && <Note kind="warn" icon="alert">Đổi loại hình không tự đổi gói, chế độ kế toán. Xem lại ở <Link to="/app/he-thong/goi-thue-bao">Gói thuê bao</Link> và Cấu hình kế toán.</Note>}
        </Card>
        <Card title="Chế độ kế toán">
          <div className="form-grid">
            <div className="f">
              <label>Ngày đầu năm</label>
              <ONgay value={dauNam} placeholder="dd/mm/yyyy" onChange={setDauNam}
                title="Chứng từ thêm mới phải có ngày từ ngày này trở đi, trừ các màn khai số dư đầu kỳ" />
            </div>
            <div className="f">
              <label>Năm làm việc hiện tại</label>
              <Select className="inp" value={String(nam)} aria-label="Năm làm việc hiện tại" onChange={e => doiNam(Number(e.target.value))}
                ds={[-2, -1, 0, 1].map(d => String(new Date().getFullYear() + d)).map(n => ({ v: n, t: n }))} />
            </div>
            <div className="f c2"><label>Phương pháp tính giá xuất kho</label><Select className="inp"><option>Bình quân gia quyền cuối kỳ</option><option>Bình quân tức thời</option><option>Nhập trước xuất trước</option></Select></div>
            {s.cheDo === 'TT58' && loai === 'dn' && (
              <div className="f c4">
                <small className="muted">{moTaBoSoTT58(thTT58(f.ppGtgt, tndnCoDinh ? 'thuNhap' : f.ppTndn))}</small>
              </div>
            )}
          </div>
        </Card>
      </div>
      {choDoi && (
        <HopXacNhan tieuDe="Đổi chế độ kế toán" nut="Đồng ý" onDong={() => setChoDoi(null)} onDongY={() => {
          const cdDef = CHE_DO[choDoi]
          set({ cheDo: choDoi })
          setChoDoi(null)
          toast('Đã đổi chế độ kế toán sang ' + cdDef.ngan)
        }}>
          Đổi sang {CHE_DO[choDoi].soHieu}? Danh mục tài khoản, mẫu chứng từ, mẫu in, sổ và báo cáo sẽ đổi theo chế độ mới. Bản thật chỉ cho đổi từ đầu năm tài chính và phải kết chuyển số dư (10.1.9).
        </HopXacNhan>
      )}
    </div>
  )
}
