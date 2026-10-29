// Hệ thống: người dùng, phân quyền, gói thuê bao, cấu hình, thông tin đơn vị
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Row, ScreenDef, ScreenProps } from '../types'
import { MODULES, duongDan, hienMan, laBaoCao } from '../../app/registry'
import { donViHienTai, dsCuaHang, dsDonVi, loaiHinhDv, useSession, cheDoHienTai, namTaiChinh, ngayDauNam, type PpGtgt, type PpTndn } from '../../app/session'
import { ChonKenh, KENH_ONLINE, KENH_SAN, NHOM_HKD, type LoaiHinh, type PpHkd } from '../onboarding/OnboardFabi'
import { FEATURE, FEATURES, GOI, GOIS, MODS, demTheoGoi, kieuGhiSo, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_HOP_LE, cheDoCuaGoi, type CheDo } from '../../app/che-do'
import { CUA_HANG, KHO, NGUOI_DUNG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead, Pk } from '../../ui/Page'
import { St, Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { HopXacNhan } from '../../ui/LocNangCao'
import { ONgay } from '../../ui/ChonNgay'
import { thTT58, moTaBoSoTT58 } from '../bao-cao/tt58'
import { CatalogPanel } from '../../ui/generic/CatalogScreen'
import type { CauHinhDM } from '../danh-muc/truong-dm'

export const VAI_TRO = ['Chủ doanh nghiệp', 'Kế toán trưởng', 'Kế toán viên', 'Quản lý cửa hàng', 'Thủ kho']
const PHAM_VI_DS = ['Tất cả cửa hàng', ...CUA_HANG.map(c => c.ten)]
const KHO_DS = ['Tất cả kho', ...KHO]

export const CAU_HINH_NGUOI_DUNG: CauHinhDM = {
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
        { k: 'pham', nhan: 'Cửa hàng được giao', kieu: 'chon', ds: PHAM_VI_DS },
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
  moi: () => ({ _tt: 1, dongY: false, vaiTro: 'Kế toán viên', pham: 'Tất cả cửa hàng', kho: 'Tất cả kho' }),
}

export function NguoiDung({ sc }: ScreenProps) {
  const { toast } = useSession()
  const [editUser, setEditUser] = useState<Row | null>(null)

  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!} meta={<span className="chip" data-hd="tong">{NGUOI_DUNG.length}/10 người dùng của gói</span>}>
        <button type="button" className="btn pri" data-hd="them" onClick={() => setEditUser({})}><Icon n="mail" className="ic sm" />Mời người dùng</button>
      </PageHead>
      <section className="card" data-hd="bang">
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
      <Note icon="shield">Xác thực hai lớp bắt buộc với kế toán trưởng và chủ doanh nghiệp. Người dùng chỉ thấy dữ liệu cửa hàng, kho được giao.</Note>

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
export const QUYEN = ['Xem', 'Thêm', 'Sửa', 'Xoá', 'Ghi sổ', 'Khoá sổ']
export const MAC_DINH: Record<string, string[]> = {
  'Chủ doanh nghiệp': ['Xem'], 'Kế toán trưởng': QUYEN, 'Kế toán viên': ['Xem', 'Thêm', 'Sửa', 'Ghi sổ'], 'Quản lý cửa hàng': ['Xem', 'Thêm'], 'Thủ kho': ['Xem', 'Thêm', 'Sửa'],
}

const MOD_KEYS: Record<string, string> = {
  'Danh mục': 'danh-muc',
  'Kế toán tiền': 'tien',
  'Kế toán bán hàng': 'ban-hang',
  'Kế toán mua hàng': 'mua-hang',
  'Kho hàng': 'kho',
  'Thuế GTGT': 'thue',
  'Tài sản cố định': 'tscd',
  'Công cụ dụng cụ': 'ccdc',
  'Chi phí, giá thành': 'gia-thanh',
  'Kế toán tổng hợp': 'tong-hop',
  'Tiện ích bổ sung': 'tien-ich',
}

function laManKhoaSo(sc: ScreenDef): boolean {
  return sc.slug === 'khoa-so' || sc.slug === '10-1-6' || /khoá sổ/i.test(sc.ten ?? '') || /khoá sổ/i.test(sc.slug)
}

function laBaoCaoHoacSo(sc: ScreenDef): boolean {
  return sc.kind === 'report' || sc.kind === 'baocao' || sc.kind === 'quytrinh' || laBaoCao(sc) || /báo cáo|sổ/i.test(sc.nhom ?? '')
}

function laDanhMuc(sc: ScreenDef): boolean {
  return sc.kind === 'catalog' || /danh mục/i.test(sc.nhom ?? '')
}

export function apDungQuyen(sc: ScreenDef, q: string): boolean {
  if (laBaoCaoHoacSo(sc)) {
    return q === 'Xem'
  }
  if (laDanhMuc(sc)) {
    return q !== 'Ghi sổ' && q !== 'Khoá sổ'
  }
  if (laManKhoaSo(sc)) {
    return true
  }
  if (sc.kind === 'voucher' || /chứng từ/i.test(sc.nhom ?? '')) {
    return q !== 'Khoá sổ'
  }
  return true
}

function tenHienThiMan(sc: ScreenDef): string {
  return sc.ten ?? sc.ngan ?? (sc.code ? FEATURE[sc.code]?.n : undefined) ?? sc.slug
}

function CongTacCha({
  checked,
  mixed,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  mixed: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = mixed
    }
  }, [mixed])

  return (
    <input
      ref={ref}
      type="checkbox"
      className={`bat-tat${mixed ? ' bat-tat-nua' : ''}`}
      checked={checked}
      disabled={disabled}
      aria-label={label}
      aria-checked={mixed ? 'mixed' : checked}
      onChange={onChange}
    />
  )
}

export function PhanQuyen({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const [vt, setVt] = useState('Kế toán viên')
  const [moMods, setMoMods] = useState<Record<string, boolean>>({})
  const [quyenMap, setQuyenMap] = useState<Record<string, Record<string, boolean>>>({})

  const layDanhSachMan = useMemo(() => {
    const res: Record<string, ScreenDef[]> = {}
    for (const mName of MODS) {
      const key = MOD_KEYS[mName]
      const mod = MODULES.find(m => m.key === key) || MODULES.find(m => m.ten === mName || m.ngan === mName)
      res[mName] = mod ? mod.screens.filter(item => hienMan(item, s.goi, s.cheDo, s)) : []
    }
    return res
  }, [s.goi, s.cheDo, s])

  const toggleMod = (mName: string) => {
    setMoMods(prev => ({ ...prev, [mName]: !prev[mName] }))
  }

  const layQuyen = (mName: string, slug: string, q: string): boolean => {
    const k = `${mName}/${slug}/${q}`
    const r = quyenMap[vt]
    if (r && k in r) return r[k]
    return MAC_DINH[vt]?.includes(q) ?? false
  }

  const datQuyen = (mName: string, slug: string, q: string, val: boolean) => {
    const k = `${mName}/${slug}/${q}`
    setQuyenMap(prev => ({
      ...prev,
      [vt]: {
        ...(prev[vt] ?? {}),
        [k]: val,
      },
    }))
  }

  const toggleCha = (mName: string, q: string) => {
    const scs = layDanhSachMan[mName] ?? []
    const scsApDung = scs.filter(item => apDungQuyen(item, q))
    if (scsApDung.length === 0) return
    const batCount = scsApDung.filter(item => layQuyen(mName, item.slug, q)).length
    const isMixed = batCount > 0 && batCount < scsApDung.length
    const batMoi = isMixed ? true : (batCount === scsApDung.length ? false : true)
    setQuyenMap(prev => {
      const cur = { ...(prev[vt] ?? {}) }
      for (const item of scsApDung) {
        cur[`${mName}/${item.slug}/${q}`] = batMoi
      }
      return { ...prev, [vt]: cur }
    })
  }

  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}>
        <button className="btn" data-hd="them"><Icon n="plus" className="ic sm" />Thêm mới</button>
        <button className="btn pri" data-hd="luuQuyen" onClick={() => toast(`Đã lưu quyền của ${vt}`)}>Lưu</button>
      </PageHead>
      <div className="grid" style={{ gridTemplateColumns: '240px minmax(0,1fr)', alignItems: 'start' }}>
        <Card title="Vai trò" pad={false}>
          <div className="panel-list" data-hd="vaiTro" style={{ padding: 8 }}>
            {VAI_TRO.map(v => <a key={v} className={v === vt ? 'on' : ''} onClick={() => setVt(v)} style={{ cursor: 'pointer' }}><span>{v}</span></a>)}
          </div>
        </Card>
        <section className="card" data-hd="bang">
          <div className="card-h"><h3>Quyền của {vt}</h3><span className="sub">Theo phân hệ · phạm vi dữ liệu đặt ở Người dùng</span></div>
          <table className="tbl matrix">
            <thead><tr><th>Phân hệ</th>{QUYEN.map(q => <th key={q} className="c">{q}</th>)}</tr></thead>
            <tbody>
              {MODS.map(mName => {
                const scs = layDanhSachMan[mName] ?? []
                const isOpen = Boolean(moMods[mName])
                return (
                  <Fragment key={mName}>
                    <tr className="tr-pq-cha">
                      <td
                        className="td-pq-cha-ten"
                        onClick={() => toggleMod(mName)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          aria-expanded={isOpen}
                          className="pq-mod-btn"
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              toggleMod(mName)
                            }
                          }}
                        >
                          <Icon n={isOpen ? 'chevd' : 'chevr'} className="ic sm pq-chevron" />
                          <span className="pq-mod-title">{mName}</span>
                        </div>
                      </td>
                      {QUYEN.map(q => {
                        const scsApDung = scs.filter(item => apDungQuyen(item, q))
                        const batCount = scsApDung.filter(item => layQuyen(mName, item.slug, q)).length
                        const isAllChecked = scsApDung.length > 0 && batCount === scsApDung.length
                        const isMixed = scsApDung.length > 0 && batCount > 0 && batCount < scsApDung.length
                        return (
                          <td key={q} className="c">
                            <CongTacCha
                              checked={isAllChecked}
                              mixed={isMixed}
                              disabled={scsApDung.length === 0}
                              label={`${mName} - ${q}`}
                              onChange={() => toggleCha(mName, q)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                    {isOpen && scs.map(item => {
                      const tenMan = tenHienThiMan(item)
                      return (
                        <tr key={`${mName}-${item.slug}`} className="tr-pq-con">
                          <td className="td-pq-con-ten">
                            <span className="pq-con-ten">{tenMan}</span>
                          </td>
                          {QUYEN.map(q => {
                            const apDung = apDungQuyen(item, q)
                            if (!apDung) {
                              return (
                                <td key={q} className="c">
                                  <span className="pq-khong-ap" aria-hidden="true">—</span>
                                </td>
                              )
                            }
                            const isChecked = layQuyen(mName, item.slug, q)
                            return (
                              <td key={q} className="c">
                                <input
                                  type="checkbox"
                                  className="bat-tat"
                                  checked={isChecked}
                                  aria-label={`${tenMan} - ${q}`}
                                  onChange={() => datQuyen(mName, item.slug, q, !isChecked)}
                                />
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </Fragment>
                )
              })}
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
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" data-hd="luuCh" onClick={() => toast('Đã lưu cấu hình')}>Lưu</button></PageHead>
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <Card title="Bộ định khoản tự động" act={noco ? <Link className="btn sm ghost" to="/app/danh-muc/1-15">Sửa bộ định khoản</Link> : undefined}>
          <div data-hd="dinhKhoan">{noco ? <Note icon="book">Thứ tự ưu tiên tài khoản: hàng hoá, rồi nhóm hàng, rồi mặc định của chế độ. Bộ mặc định ngành F&B đã nạp sẵn 7 bút toán.</Note>
            : <Note kind="gray">Chế độ {cheDoHienTai(s).ngan} không dùng tài khoản Nợ/Có nên không có bộ định khoản.</Note>}</div>
        </Card>
        <Card title="Đánh số chứng từ">
          <div data-hd="danhSo">
          <Table cols={[{ k: 'loai', t: 'Loại chứng từ' }, { k: 'mau', t: 'Mẫu số', cls: 'code' }, { k: 'vd', t: 'Ví dụ', cls: 'dim' }]} rows={[
            { loai: 'Phiếu thu', mau: 'PT{YY}{MM}-{0000}', vd: 'PT2610-0001' }, { loai: 'Phiếu chi', mau: 'PC{YY}{MM}-{0000}', vd: 'PC2610-0241' },
            { loai: 'Xuất bán POS', mau: 'Số hoá đơn FABi', vd: 'YHLTJTAKD76Z' }, { loai: 'Mua hàng', mau: 'MH{YY}{MM}-{0000}', vd: 'MH2610-0118' },
            // Thẻ chi phí phân bổ: tháng theo ngày ghi tăng; thẻ dư đầu kỳ ghi tăng trước ngày đầu năm (T284)
            { loai: 'Thẻ chi phí phân bổ', mau: 'TPB{YY}{MM}-{0000}', vd: 'TPB2610-0012' }, { loai: 'Thẻ chi phí phân bổ dư đầu kỳ', mau: 'TPBDK{YY}{MM}-{0000}', vd: 'TPBDK2512-0001' }]} />
          </div>
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
  const dsCn = dsCuaHang(s)
  const [f, setF] = useState(() => ({
    ten: dv.ten, mst: dv.mst, diaChi: dv.diaChi,
    loai: loaiHinhDv(s, dv) as LoaiHinh,
    nhom: tt.nhom ?? 1, ppHkd: tt.ppHkd ?? 'doanhThu' as PpHkd, ppGtgt: s.ppGtgt, ppTndn: s.ppTndn,
    cnChinh: tt.cnChinh || dsCn[0]?.id || '', kenhOnline: tt.kenhOnline ?? KENH_ONLINE, kenhSan: tt.kenhSan ?? KENH_SAN,
  }))
  const sua = (p: Partial<typeof f>) => setF(x => ({ ...x, ...p }))
  const dnCoDinh = s.goi === 'PR'   // doanh nghiệp gói Pro: GTGT khấu trừ, TNDN theo lợi nhuận, không chọn
  const ppCoDinh = NHOM_HKD[f.nhom - 1]?.pp ?? null
  const tndnCoDinh = f.loai === 'dn' && dnCoDinh   // doanh nghiệp gói Standard chọn TNDN kể cả khi GTGT khấu trừ (T174)
  const dnStandard = s.goi === 'S'   // doanh nghiệp gói Standard: TT58 trường hợp 1, thuế GTGT, TNDN theo tỷ lệ % doanh thu, không chọn (T632)
  const bat = (ds: string[], k: string) => ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k]
  const mstGoc = Boolean(dsDonVi({ dvMoi: s.dvMoi }).find(d => d.id === s.donVi)?.mst)   // MST đã khai lúc khởi tạo thì không sửa; chưa khai thì nhập ở đây
  // Chế độ kế toán đổi theo loại hình khi lưu (T179): hộ kinh doanh dùng TT152, doanh nghiệp gói Free, Standard dùng TT58 (T632); gói Plus, Pro giữ chế độ đang chọn
  const cheDoTheoLoai = (l: LoaiHinh): CheDo =>
    l === 'hkd' ? (CHE_DO_HOP_LE[s.goi].includes('TT152') ? 'TT152' : s.cheDo) : s.goi === 'PL' || dnStandard ? 'TT58' : s.cheDo
  const luuDv = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dauNam)) { toast('Ngày đầu năm cần nhập dạng dd/mm/yyyy'); return }
    if (!f.ten.trim()) { toast('Tên đơn vị không được để trống'); return }
    const { ten, mst, diaChi, loai, nhom, ppHkd, cnChinh, kenhOnline, kenhSan } = f
    set({
      cheDo: cheDoTheoLoai(loai),
      // Doanh nghiệp chọn thuế GTGT, TNDN (gói Plus, Pro cố định khấu trừ, theo lợi nhuận); hộ kinh doanh luôn GTGT trực tiếp trên doanh thu
      ppGtgt: loai === 'hkd' || dnStandard ? 'tyLe' : dnCoDinh ? 'khauTru' : f.ppGtgt, ppTndn: tndnCoDinh ? 'thuNhap' : dnStandard ? 'tyLe' : f.ppTndn,
      ngayDauNam: { ...s.ngayDauNam, [s.donVi]: dauNam }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: nam },
      ttDv: { ...s.ttDv, [s.donVi]: { ten, mst, diaChi, loai, nhom, ppHkd: ppCoDinh ?? ppHkd, cnChinh, kenhOnline, kenhSan: kenhSan.filter(k => kenhOnline.includes(k)) } },
    })
    toast('Đã lưu thông tin đơn vị')
  }
  const { loai } = f
  // Doanh nghiệp gói Free, Standard chỉ dùng TT58, không đổi; TT152 của gói Free, Standard chỉ dành cho hộ kinh doanh (T174, T632)
  const cdDn: CheDo[] = s.goi === 'PL' || dnStandard ? ['TT58'] : CHE_DO_HOP_LE[s.goi]
  const [choDoi, setChoDoi] = useState<CheDo | null>(null)   // đổi chế độ kế toán, hỏi lại trước khi đổi
  const doiLoai = loai !== loaiHinhDv(s, dv)
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" data-hd="luuDv" onClick={luuDv}>Lưu</button></PageHead>
      <div className="stack">
        <Card title="Thông tin trên chứng từ, báo cáo">
          <div className="form-grid" data-hd="chungTu">
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
          <div className="form-grid" data-hd="keKhai">
            <div className="f c2"><label>Loại hình</label>
              <Select className="inp" value={loai} aria-label="Loại hình" onChange={e => sua({ loai: e.target.value as LoaiHinh })}
                ds={[{ v: 'hkd', t: 'Hộ kinh doanh' }, { v: 'dn', t: 'Doanh nghiệp' }]} /></div>
            {/* Thông tư áp dụng đứng cạnh Loại hình (T174) */}
            <div className="f c2"><label>Thông tư áp dụng</label>
              {loai === 'hkd'
                ? <input className="inp" readOnly value={`${CHE_DO.TT152.soHieu} · ${CHE_DO.TT152.ten}`} />
                : <Select className="inp" value={cdDn.includes(s.cheDo) ? s.cheDo : cdDn[0]} disabled={cdDn.length <= 1} aria-label="Thông tư áp dụng"
                    onChange={e => { const moi = e.target.value as CheDo; if (moi !== s.cheDo) setChoDoi(moi) }}
                    ds={cdDn.map(cd => ({ v: cd, t: `${CHE_DO[cd].soHieu} · ${CHE_DO[cd].ten}` }))} />}
              {loai === 'dn' && cdDn.length <= 1 && <small className="muted" style={{ display: 'block', marginTop: 4 }}>Gói {GOI[s.goi].ten} chỉ dùng {CHE_DO[cdDn[0]].ngan}</small>}
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
                <Select className="inp" value={dnCoDinh ? 'khauTru' : dnStandard ? 'tyLe' : f.ppGtgt} disabled={dnCoDinh || dnStandard} aria-label="Phương pháp thuế GTGT" onChange={e => sua({ ppGtgt: e.target.value as PpGtgt })}
                  ds={(dnCoDinh ? (['khauTru'] as const) : dnStandard ? (['tyLe'] as const) : (['tyLe', 'khauTru'] as const)).map(v => ({ v, t: PP_GTGT[v] }))} /></div>
              <div className="f c2"><label>Phương pháp thuế TNDN</label>
                <Select className="inp" value={tndnCoDinh ? 'thuNhap' : dnStandard ? 'tyLe' : f.ppTndn} disabled={tndnCoDinh || dnStandard} aria-label="Phương pháp thuế TNDN" onChange={e => sua({ ppTndn: e.target.value as PpTndn })}
                  ds={[...(tndnCoDinh ? [] : [{ v: 'tyLe', t: PP_THU_NHAP.doanhThu }]), ...(dnStandard ? [] : [{ v: 'thuNhap', t: PP_THU_NHAP.loiNhuan }])]} /></div>
              {/* Bộ sổ TT58 theo cách tính thuế, ngay dưới hai ô phương pháp thuế (T174) */}
              {cheDoTheoLoai(loai) === 'TT58' && (
                <div className="f c4">
                  <small className="muted">{moTaBoSoTT58(dnStandard ? 1 : thTT58(f.ppGtgt, tndnCoDinh ? 'thuNhap' : f.ppTndn))}</small>
                </div>
              )}
            </>}
          </div>
          {doiLoai && <Note kind="warn" icon="alert">
            {cheDoTheoLoai(loai) !== s.cheDo ? `Lưu sẽ đổi chế độ kế toán sang ${CHE_DO[cheDoTheoLoai(loai)].ngan}, sổ và báo cáo đổi theo. ` : ''}Đổi loại hình không tự đổi gói, xem lại ở <Link to="/app/he-thong/goi-thue-bao">Gói thuê bao</Link>.
          </Note>}
        </Card>
        <Card title="Chế độ kế toán">
          <div className="form-grid" data-hd="cheDo">
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
            <div className="f c2"><label>Phương pháp tính giá xuất kho</label><Select className="inp"><option>Bình quân gia quyền cuối kỳ</option>{s.goi !== 'S' && <><option>Bình quân tức thời</option><option>Nhập trước xuất trước</option></>}</Select></div>   {/* gói Standard chỉ bình quân cuối kỳ (T268) */}
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
