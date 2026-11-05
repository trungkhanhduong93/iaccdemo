// Hệ thống: người dùng, phân quyền, gói thuê bao, cấu hình, thông tin đơn vị
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, ScreenDef, ScreenProps } from '../types'
import { MODULES, duongDan, hienMan, laBaoCao } from '../../app/registry'
import { donViHienTai, dsCuaHang, dsDonVi, loaiHinhDv, useSession, cheDoHienTai, namTaiChinh, ngayDauNam, type PpGtgt, type PpTndn, type Session } from '../../app/session'
import { ChonKenh, KENH_ONLINE, KENH_SAN, NHOM_HKD, type LoaiHinh, type PpHkd } from '../onboarding/OnboardFabi'
import { FEATURE, FEATURES, GOI, GOIS, MODS, demTheoGoi, kieuGhiSo, type Goi } from '../../app/plan'
import { CHE_DO, CHE_DO_HOP_LE, cheDoCuaGoi, type CheDo } from '../../app/che-do'
import { CUA_HANG, KHO, NGUOI_DUNG, type Role } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead, Pk } from '../../ui/Page'
import { St, Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'
import { BoLoc, HopXacNhan, NutTuyChinhCot, useCauHinhLoc, useCotDs, useLocNhap, type OLocDef } from '../../ui/LocNangCao'
import { IconFigmaSearch } from '../../ui/IconFigma'
import { fold } from '../../ui/format'
import { ONgay } from '../../ui/ChonNgay'
import { thTT58, moTaBoSoTT58 } from '../bao-cao/tt58'
import { CatalogPanel } from '../../ui/generic/CatalogScreen'
import type { CauHinhDM } from '../danh-muc/truong-dm'
import type { KieuSo } from '../../ui/format'

export const VAI_TRO = ['Chủ doanh nghiệp', 'Kế toán trưởng', 'Kế toán viên', 'Quản lý cửa hàng', 'Thủ kho']
const PHAM_VI_DS = ['Tất cả cửa hàng', ...CUA_HANG.map(c => c.ten)]
const KHO_DS = ['Tất cả kho', ...KHO]

export const CAU_HINH_NGUOI_DUNG: CauHinhDM = {
  ten: 'Người sử dụng',
  haiCot: true,
  khoi: [
    {
      ten: 'Thông tin chung',
      truong: [
        { k: 'ten', nhan: 'Họ tên', kieu: 'chu', caHang: true, batBuoc: true },
        { k: 'email', nhan: 'Email', kieu: 'chu', batBuoc: true },
        { k: 'sdt', nhan: 'Số điện thoại', kieu: 'chu' },
      ],
    },
    {
      ten: 'Phân quyền',
      truong: [
        { k: 'vaiTro', nhan: 'Chức vụ', kieu: 'chon', ds: VAI_TRO, batBuoc: true },
        {
          k: 'pham',
          nhan: 'Cửa hàng',
          kieu: 'chonHaiCot',
          ds: CUA_HANG.map(c => c.ten),
          maDs: (t: string) => CUA_HANG.find(c => c.ten === t)?.posId ?? '',
          goiY: 'Tất cả cửa hàng',
          caHang: true,
        },
        {
          k: 'kho',
          nhan: 'Kho',
          kieu: 'chonHaiCot',
          ds: KHO,
          goiY: 'Tất cả kho',
          caHang: true,
        },
      ],
    },
    {
      ten: 'Trạng thái',
      truong: [
        { k: '_tt', nhan: 'Đang sử dụng', kieu: 'tich' },
        { k: 'xacThuc', nhan: 'Xác thực', kieu: 'tich' },
        { k: 'lan', nhan: 'Đăng nhập gần nhất', kieu: 'chu', chiDoc: true },
      ],
    },
    {
      ten: 'Thông tin hệ thống',
      truong: [
        { k: 'nguoiTao', nhan: 'Người tạo', kieu: 'chu', chiDoc: true },
        { k: 'ngayTao', nhan: 'Ngày tạo', kieu: 'chu', chiDoc: true },
        { k: 'nguoiCapNhat', nhan: 'Người cập nhật', kieu: 'chu', chiDoc: true },
        { k: 'ngayCapNhat', nhan: 'Ngày cập nhật', kieu: 'chu', chiDoc: true },
      ],
    },
    {
      ten: 'Đồng ý',
      anDau: true,
      truong: [
        {
          k: 'dongY',
          nhan: 'Đồng ý chia sẻ thông tin cá nhân',
          kieu: 'tich',
          oVuong: true,
          caHang: true,
          batBuoc: true,
        },
      ],
    },
  ],
  moi: () => ({
    _tt: 1,
    xacThuc: false,
    lan: 'Chưa đăng nhập',
    vaiTro: 'Kế toán viên',
    pham: '',
    kho: '',
    dongY: false,
    nguoiTao: 'Tự ghi khi lưu',
    ngayTao: 'Tự ghi khi lưu',
    nguoiCapNhat: 'Tự ghi khi lưu',
    ngayCapNhat: 'Tự ghi khi lưu',
  }),
}

function gioHienTai(): string {
  const d = new Date()
  const ngay = String(d.getDate()).padStart(2, '0')
  const thang = String(d.getMonth() + 1).padStart(2, '0')
  const nam = d.getFullYear()
  const gio = String(d.getHours()).padStart(2, '0')
  const phut = String(d.getMinutes()).padStart(2, '0')
  return `${ngay}/${thang}/${nam} ${gio}:${phut}`
}

const COT_CO_DINH = new Set(['x'])

export function NguoiDung({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const [rows, setRows] = useState<Row[]>(() => [...NGUOI_DUNG])
  const [editUser, setEditUser] = useState<Row | null>(null)

  const colsGoc: Col[] = useMemo(() => [
    {
      k: 'ten',
      t: 'Họ tên',
      r: r => (
        <span className="row">
          <span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
            {r.ten.split(' ').slice(-2).map((x: string) => x[0]).join('')}
          </span>
          <b style={{ color: 'var(--ink)' }}>{r.ten}</b>
        </span>
      ),
    },
    { k: 'email', t: 'Email', cls: 'dim' },
    { k: 'vaiTro', t: 'Chức vụ' },
    {
      k: 'pham',
      t: 'Cửa hàng',
      r: r => {
        const raw = (r.pham ?? '').trim()
        if (!raw) return 'Tất cả cửa hàng'
        const parts = raw.split(',').map((s: string) => s.trim()).filter(Boolean)
        if (parts.length <= 1) return raw
        return <span title={raw}>{parts[0]} +{parts.length - 1}</span>
      },
    },
    { k: 'lan', t: 'Đăng nhập gần nhất', cls: 'dim' },
    {
      k: '_tt',
      t: 'Trạng thái',
      r: r => (r._tt ? <St k="ok">Đang sử dụng</St> : <St k="dim">Không hoạt động</St>),
    },
    {
      k: 'xacThuc',
      t: 'Xác thực',
      an: true,
      r: r => (r.xacThuc ? 'Đã xác thực' : 'Chưa xác thực'),
    },
    { k: 'nguoiTao', t: 'Người tạo', an: true },
    { k: 'ngayTao', t: 'Ngày tạo', an: true },
    { k: 'nguoiCapNhat', t: 'Người cập nhật', an: true },
    { k: 'ngayCapNhat', t: 'Ngày cập nhật', an: true },
    {
      k: 'x',
      t: 'Hành động',
      c: true,
      dinh: 'phai',
      w: 60,
      r: (r: Row) => (
        <button
          type="button"
          className="icon-btn sm"
          style={{ margin: '0 auto' }}
          title="Sửa"
          aria-label={`Sửa ${r.ten}`}
          onClick={() => setEditUser(r)}
        >
          <Icon n="edit" className="ic sm" />
        </button>
      ),
    },
  ], [])

  const cot = useCotDs('/he-thong/nguoi-dung', colsGoc, COT_CO_DINH)

  const loc0 = useLocNhap(() => ({
    tim: '',
    vaiTro: '',
    trangThai: '',
    xacThuc: '',
  }))
  const { nhap, ap, dat } = loc0
  const apLoc = () => loc0.loc()

  const oLoc: OLocDef[] = useMemo(() => [
    {
      k: 'tim',
      ten: 'Tìm kiếm',
      coGiaTri: Boolean(nhap.tim.trim()),
      o: (
        <input
          className="ds-o-inp"
          value={nhap.tim}
          placeholder="Tên, email"
          onChange={e => dat('tim', e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') apLoc()
          }}
        />
      ),
    },
    {
      k: 'vaiTro',
      ten: 'Chức vụ',
      coGiaTri: Boolean(nhap.vaiTro),
      o: (
        <Select
          className="ds-o-sel"
          value={nhap.vaiTro}
          aria-label="Chức vụ"
          ds={[{ v: '', t: 'Tất cả' }, ...VAI_TRO.map(v => ({ v, t: v }))]}
          onChange={e => dat('vaiTro', e.target.value)}
        />
      ),
    },
    {
      k: 'trangThai',
      ten: 'Trạng thái',
      coGiaTri: nhap.trangThai !== '',
      o: (
        <Select
          className="ds-o-sel"
          value={nhap.trangThai}
          aria-label="Trạng thái"
          ds={[
            { v: '', t: 'Tất cả' },
            { v: '1', t: 'Đang sử dụng' },
            { v: '0', t: 'Không hoạt động' },
          ]}
          onChange={e => dat('trangThai', e.target.value)}
        />
      ),
    },
    {
      k: 'xacThuc',
      ten: 'Xác thực',
      coGiaTri: nhap.xacThuc !== '',
      o: (
        <Select
          className="ds-o-sel"
          value={nhap.xacThuc}
          aria-label="Xác thực"
          ds={[
            { v: '', t: 'Tất cả' },
            { v: '1', t: 'Đã xác thực' },
            { v: '0', t: 'Chưa xác thực' },
          ]}
          onChange={e => dat('xacThuc', e.target.value)}
        />
      ),
    },
  ], [nhap, dat])

  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(
    '/he-thong/nguoi-dung',
    ['tim', 'vaiTro', 'trangThai', 'xacThuc'],
    ['tim']
  )

  const rowsLoc = useMemo(() => {
    return rows.filter(r => {
      if (ap.tim.trim()) {
        const q = fold(ap.tim.trim())
        const ten = fold(r.ten ?? '')
        const email = fold(r.email ?? '')
        if (!ten.includes(q) && !email.includes(q)) return false
      }
      if (ap.vaiTro && r.vaiTro !== ap.vaiTro) return false
      if (ap.trangThai !== '') {
        const bat = r._tt !== 0 && r._tt !== false
        if (ap.trangThai === '1' && !bat) return false
        if (ap.trangThai === '0' && bat) return false
      }
      if (ap.xacThuc !== '') {
        const xt = Boolean(r.xacThuc)
        if (ap.xacThuc === '1' && !xt) return false
        if (ap.xacThuc === '0' && xt) return false
      }
      return true
    })
  }, [rows, ap])

  return (
    <div className="page">
      <PageHead
        crumb={['Hệ thống']}
        title={sc.ten!}
        meta={<span className="chip" data-hd="tong">{rows.length}/10 người sử dụng của gói</span>}
      />
      <section className="card nd-bang" data-hd="bang">
        <div className="ds-toolbar-figma">
          <BoLoc
            ds={oLoc}
            cauHinh={cauHinhLoc}
            datCauHinh={datCauHinhLoc}
            dangLoc={loc0.dangLoc}
            khacNhap={loc0.khacNhap}
            onLoc={apLoc}
            onXoaHet={loc0.xoaNhap}
            chiNutPheu
            ngoaiRieng={{
              tim: (
                <div key="tim" className="ds-tim-figma">
                  <IconFigmaSearch size={16} />
                  <input
                    value={nhap.tim}
                    placeholder="Tên, email"
                    title="Tìm theo tên hoặc email"
                    aria-label="Tìm kiếm"
                    onChange={e => dat('tim', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') apLoc()
                    }}
                  />
                </div>
              ),
            }}
          />
          <div className="ds-toolbar-phai">
            <NutTuyChinhCot
              cols={cot.colsDu}
              an={cot.an}
              coDinh={COT_CO_DINH}
              macDinh={cot.macDinh}
              dongBang={cot.dongBang}
              onLuu={cot.luu}
              onDoRongTuDong={cot.datDoRongTuDong}
            />
            <button
              type="button"
              className="btn pri"
              data-hd="them"
              onClick={() => setEditUser({})}
            >
              <Icon n="plus" className="ic sm" />
              Thêm mới
            </button>
          </div>
        </div>

        {rowsLoc.length > 0 ? (
          <Table cols={cot.colsHien} rows={rowsLoc} />
        ) : (
          <div className="empty" style={{ padding: '40px 0' }}>
            <b>Không có người sử dụng khớp điều kiện lọc.</b>
          </div>
        )}
      </section>
      <Note icon="shield">
        Người sử dụng chỉ thấy dữ liệu của cửa hàng, kho được chọn. Để trống là được xem tất cả.
      </Note>

      {editUser && (
        <CatalogPanel
          rong={780}
          cauHinh={CAU_HINH_NGUOI_DUNG}
          edit={editUser}
          all={rows}
          ten="Người sử dụng"
          tenNgan="Người sử dụng"
          anNutThemTiep
          onDong={() => setEditUser(null)}
          onLuu={val => {
            const isMoi = !editUser.ten && !editUser.email
            const now = gioHienTai()
            const nguoiHienTai = s?.ten || 'Nguyễn Minh Anh'

            if (isMoi) {
              const dongMoi: Row = {
                ...val,
                ten: val.ten,
                email: val.email,
                username: val.username || (val.email ? String(val.email).split('@')[0] : 'user_' + Date.now()),
                vaiTro: val.vaiTro || 'Kế toán viên',
                role: (val.vaiTro === 'Chủ doanh nghiệp' ? 'owner' : val.vaiTro === 'Kế toán trưởng' ? 'ktt' : 'ktv') as Role,
                pham: val.pham || '',
                kho: val.kho || '',
                _tt: 1,
                xacThuc: false,
                lan: 'Chưa đăng nhập',
                dongY: Boolean(val.dongY),
                nguoiTao: nguoiHienTai,
                ngayTao: now,
                nguoiCapNhat: nguoiHienTai,
                ngayCapNhat: now,
              }
              setRows(prev => [dongMoi, ...prev])
              toast('Đã thêm người sử dụng')
            } else {
              setRows(prev =>
                prev.map(r => {
                  if (r.email === editUser.email || (editUser.username && r.username === editUser.username)) {
                    return {
                      ...r,
                      ...val,
                      nguoiCapNhat: nguoiHienTai,
                      ngayCapNhat: now,
                    }
                  }
                  return r
                })
              )
              toast('Đã lưu người sử dụng')
            }
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
  // Màn có bộ thao tác riêng, Trum chốt ở T742
  if (sc.nhom === 'Tiện ích') return q === 'Xem' || q === 'Sửa'
  if (sc.slug === 'to-khai') return q !== 'Ghi sổ' && q !== 'Khoá sổ'
  if (sc.slug === 'so-du-ban-dau' || sc.code === '10.1.3') return q === 'Xem' || q === 'Sửa' || q === 'Ghi sổ'
  if (sc.code === '5.1.7') return q === 'Xem' || q === 'Ghi sổ'
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

/** Các màn đang mở của từng phân hệ theo gói, chế độ; web và điện thoại dùng chung */
export function dsManPhanHe(s: Session): Record<string, ScreenDef[]> {
  const res: Record<string, ScreenDef[]> = {}
  for (const mName of MODS) {
    const key = MOD_KEYS[mName]
    const mod = MODULES.find(m => m.key === key) || MODULES.find(m => m.ten === mName || m.ngan === mName)
    res[mName] = mod ? mod.screens.filter(item => hienMan(item, s.goi, s.cheDo, s)) : []
  }
  return res
}

/** Gom màn theo nhóm, tab Báo cáo xếp chung nhóm Sổ sách, báo cáo */
function nhomMan(scs: ScreenDef[]): [string, ScreenDef[]][] {
  const coSo = scs.some(x => x.nhom === 'Sổ sách, báo cáo')
  const kq = new Map<string, ScreenDef[]>()
  for (const sc of scs) {
    const ten = sc.kind === 'baocao' && coSo ? 'Sổ sách, báo cáo' : sc.nhom ?? ''
    kq.set(ten, [...(kq.get(ten) ?? []), sc])
  }
  return [...kq]
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
  const [modChon, setModChon] = useState(MODS[0])
  const [quyenMap, setQuyenMap] = useState<Record<string, Record<string, boolean>>>({})

  const layDanhSachMan = useMemo(() => dsManPhanHe(s), [s])

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

  const demQuyen = (mName: string) => {
    let bat = 0, tong = 0
    for (const item of layDanhSachMan[mName] ?? []) {
      for (const q of QUYEN) {
        if (!apDungQuyen(item, q)) continue
        tong++
        if (layQuyen(mName, item.slug, q)) bat++
      }
    }
    return `${bat}/${tong} quyền bật`
  }

  const scsChon = layDanhSachMan[modChon] ?? []

  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}>
        <button className="btn" data-hd="them"><Icon n="plus" className="ic sm" />Thêm mới</button>
        <button className="btn pri" data-hd="luuQuyen" onClick={() => toast(`Đã lưu quyền của ${vt}`)}>Lưu</button>
      </PageHead>
      <div className="grid" style={{ gridTemplateColumns: '240px minmax(0,1fr)', alignItems: 'start' }}>
        <Card title="Chức vụ" pad={false}>
          <div className="panel-list" data-hd="vaiTro" style={{ padding: 8 }}>
            {VAI_TRO.map(v => <a key={v} className={v === vt ? 'on' : ''} onClick={() => setVt(v)} style={{ cursor: 'pointer' }}><span>{v}</span></a>)}
          </div>
        </Card>
        <section className="card" data-hd="bang">
          <div className="card-h"><h3>Quyền của {vt}</h3><span className="sub">Cửa hàng, kho đặt ở Người sử dụng</span></div>
          <div className="pq-thanh">
            <div className="pq-chon" data-hd="phanHe">
              <b>Phân hệ</b>
              <Select
                className="pq-chon-sel"
                aria-label="Phân hệ"
                value={modChon}
                ds={MODS.map(m => ({ v: m, t: `${m} (${demQuyen(m)})` }))}
                onChange={e => setModChon(e.target.value)}
              />
            </div>
            <div className="pq-chu-giai" aria-hidden="true">
              <label><input type="checkbox" className="bat-tat" checked readOnly tabIndex={-1} />Bật</label>
              <label><input type="checkbox" className="bat-tat" checked={false} readOnly tabIndex={-1} />Tắt</label>
              <label><input type="checkbox" className="bat-tat" disabled tabIndex={-1} />Không có thao tác này</label>
            </div>
          </div>
          <div className="pq-khung">
            <table className="tbl matrix">
              <thead>
                <tr><th>Tính năng</th>{QUYEN.map(q => <th key={q} className="c">{q}</th>)}</tr>
                <tr className="pq-tat-ca">
                  <td>Tất cả tính năng</td>
                  {QUYEN.map(q => {
                    const scsApDung = scsChon.filter(item => apDungQuyen(item, q))
                    const batCount = scsApDung.filter(item => layQuyen(modChon, item.slug, q)).length
                    const isAllChecked = scsApDung.length > 0 && batCount === scsApDung.length
                    const isMixed = scsApDung.length > 0 && batCount > 0 && batCount < scsApDung.length
                    return (
                      <td key={q} className="c" title={scsApDung.length === 0 ? `Phân hệ này không có thao tác ${q}` : undefined}>
                        <CongTacCha
                          checked={isAllChecked}
                          mixed={isMixed}
                          disabled={scsApDung.length === 0}
                          label={`Tất cả tính năng - ${q}`}
                          onChange={() => toggleCha(modChon, q)}
                        />
                      </td>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {nhomMan(scsChon).map(([nhom, ds]) => (
                  <Fragment key={nhom}>
                    {nhom && <tr className="pq-nhom"><td colSpan={QUYEN.length + 1}>{nhom}</td></tr>}
                    {ds.map(item => {
                      const tenMan = tenHienThiMan(item)
                      return (
                        <tr key={item.slug} className="pq-man">
                          <td>{tenMan}</td>
                          {QUYEN.map(q => {
                            if (!apDungQuyen(item, q)) {
                              return (
                                <td key={q} className="c" title={`${tenMan} không có thao tác ${q}`}>
                                  <input type="checkbox" className="bat-tat" disabled aria-label={`${tenMan} - ${q}`} />
                                </td>
                              )
                            }
                            const isChecked = layQuyen(modChon, item.slug, q)
                            return (
                              <td key={q} className="c">
                                <input
                                  type="checkbox"
                                  className="bat-tat"
                                  checked={isChecked}
                                  aria-label={`${tenMan} - ${q}`}
                                  onChange={() => datQuyen(modChon, item.slug, q, !isChecked)}
                                />
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

export { GoiThueBao } from './GoiThueBao'

/** Quy định chữ số và dấu phân cách (T710): nhãn, dấu ngăn nghìn, dấu thập phân, số ví dụ */
export const KIEU_SO: Record<KieuSo, { ten: string; ngan: string; thap: string; tien: string; le: string }> = {
  vn: { ten: 'Việt Nam', ngan: 'Dấu chấm (.)', thap: 'Dấu phẩy (,)', tien: '1.234.567.890', le: '1.234,56' },
  qt: { ten: 'Quốc tế', ngan: 'Dấu phẩy (,)', thap: 'Dấu chấm (.)', tien: '1,234,567,890', le: '1,234.56' },
}

export function CauHinh({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const noco = kieuGhiSo(s.cheDo) === 'noco'
  const [kieu, setKieu] = useState<KieuSo>(s.kieuSo?.[s.donVi] ?? 'vn')
  const ks = KIEU_SO[kieu]
  // Lưu thì chứng từ, danh sách, báo cáo, ô nhập số của đơn vị đổi theo kiểu đã chọn
  const luu = () => { set({ kieuSo: { ...s.kieuSo, [s.donVi]: kieu } }); toast('Đã lưu cấu hình') }
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" data-hd="luuCh" onClick={luu}>Lưu</button></PageHead>
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <Card title="Quy định chữ số và dấu phân cách">
          <div className="form-grid ch-so" data-hd="kieuSo">
            <div className="f c2"><label>Tiêu chuẩn định dạng số</label>
              <Select className="inp" value={kieu} aria-label="Tiêu chuẩn định dạng số" onChange={e => setKieu(e.target.value as KieuSo)}
                ds={(['vn', 'qt'] as const).map(v => ({ v, t: KIEU_SO[v].ten }))} /></div>
            <div className="f"><label>Ngăn hàng nghìn</label><input className="inp" readOnly value={ks.ngan} /></div>
            <div className="f"><label>Ngăn phần thập phân</label><input className="inp" readOnly value={ks.thap} /></div>
            <div className="f c2"><label>Ví dụ số tiền</label><input className="inp num" readOnly value={ks.tien} /></div>
            <div className="f c2"><label>Ví dụ số lượng, đơn giá</label><input className="inp num" readOnly value={ks.le} /></div>
          </div>
          <Note kind="gray">Áp dụng cho số hiện trên chứng từ, danh sách, báo cáo và cách gõ số ở mọi ô nhập của đơn vị này.</Note>
        </Card>
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
  const chuaKhai = Boolean(s.choKeKhai?.[s.donVi])   // đơn vị từ FABi chưa khai Thông tin kê khai thuế: để trống loại hình (PhuongXT 31/10/2026)
  const [f, setF] = useState(() => ({
    ten: dv.ten, mst: dv.mst, diaChi: dv.diaChi,
    loai: (chuaKhai ? '' : loaiHinhDv(s, dv)) as LoaiHinh | '',
    nhom: tt.nhom ?? 1, ppHkd: tt.ppHkd ?? 'doanhThu' as PpHkd, ppGtgt: s.ppGtgt, ppTndn: s.ppTndn,
    cnChinh: tt.cnChinh || dsCn[0]?.id || '', kenhOnline: tt.kenhOnline ?? KENH_ONLINE, kenhSan: tt.kenhSan ?? KENH_SAN,
  }))
  const sua = (p: Partial<typeof f>) => setF(x => ({ ...x, ...p }))
  const dnCoDinh = s.goi === 'PR'   // doanh nghiệp gói Pro: GTGT khấu trừ, TNDN theo lợi nhuận, không chọn
  const ppCoDinh = NHOM_HKD[f.nhom - 1]?.pp ?? null
  const tndnCoDinh = f.loai === 'dn' && dnCoDinh   // doanh nghiệp gói Standard chọn TNDN kể cả khi GTGT khấu trừ (T174)
  const dnStandard = s.goi === 'S'   // doanh nghiệp gói Standard: TT58 trường hợp 1, thuế GTGT, TNDN theo tỷ lệ % doanh thu, không chọn (T632)
  // Gói Standard vẫn chọn được mọi nhóm, cách tính thuế; ngoài phần kê khai được thì báo gói cao hơn (PhuongXT 31/10/2026)
  const ngoaiStd = s.goi !== 'S' ? [] : f.loai === 'hkd'
    ? ((ppCoDinh ?? f.ppHkd) === 'loiNhuan' ? ['thuế TNCN theo lợi nhuận'] : [])
    : [...(f.ppGtgt === 'khauTru' ? ['thuế GTGT khấu trừ'] : []), ...(f.ppTndn === 'thuNhap' ? ['thuế TNDN theo lợi nhuận'] : [])]
  const bat = (ds: string[], k: string) => ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k]
  const mstGoc = Boolean(dsDonVi({ dvMoi: s.dvMoi }).find(d => d.id === s.donVi)?.mst)   // MST đã khai lúc khởi tạo thì không sửa; chưa khai thì nhập ở đây
  // Chế độ kế toán đổi theo loại hình khi lưu (T179): hộ kinh doanh dùng TT152, doanh nghiệp gói Free, Standard dùng TT58 (T632); gói Plus, Pro giữ chế độ đang chọn
  const cheDoTheoLoai = (l: LoaiHinh): CheDo =>
    l === 'hkd' ? (CHE_DO_HOP_LE[s.goi].includes('TT152') ? 'TT152' : s.cheDo) : s.goi === 'PL' || dnStandard ? 'TT58' : s.cheDo
  const luuDv = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dauNam)) { toast('Ngày đầu năm cần nhập dạng dd/mm/yyyy'); return }
    if (!f.ten.trim()) { toast('Tên đơn vị không được để trống'); return }
    const { ten, mst, diaChi, loai, nhom, ppHkd, cnChinh, kenhOnline, kenhSan } = f
    if (!loai) {   // chưa chọn loại hình: chỉ lưu thông tin chung, Kê khai thuế vẫn hỏi Thông tin kê khai thuế
      set({ ttDv: { ...s.ttDv, [s.donVi]: { ...s.ttDv?.[s.donVi], ten, mst, diaChi } }, ngayDauNam: { ...s.ngayDauNam, [s.donVi]: dauNam }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: nam } })
      toast('Đã lưu thông tin đơn vị')
      return
    }
    set({
      choKeKhai: { ...s.choKeKhai, [s.donVi]: false },
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
                ds={[...(loai ? [] : [{ v: '', t: 'Chưa thiết lập' }]), { v: 'hkd', t: 'Hộ kinh doanh' }, { v: 'dn', t: 'Doanh nghiệp' }]} /></div>
            {/* Thông tư áp dụng đứng cạnh Loại hình (T174) */}
            <div className="f c2"><label>Thông tư áp dụng</label>
              {!loai
                ? <input className="inp" readOnly value="" placeholder="Chọn loại hình trước" />
                : loai === 'hkd'
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
                <Select className="inp" value={dnCoDinh ? 'khauTru' : f.ppGtgt} disabled={dnCoDinh} aria-label="Phương pháp thuế GTGT" onChange={e => sua({ ppGtgt: e.target.value as PpGtgt })}
                  ds={(dnCoDinh ? (['khauTru'] as const) : (['tyLe', 'khauTru'] as const)).map(v => ({ v, t: PP_GTGT[v] }))} /></div>
              <div className="f c2"><label>Phương pháp thuế TNDN</label>
                <Select className="inp" value={tndnCoDinh ? 'thuNhap' : f.ppTndn} disabled={tndnCoDinh} aria-label="Phương pháp thuế TNDN" onChange={e => sua({ ppTndn: e.target.value as PpTndn })}
                  ds={[...(tndnCoDinh ? [] : [{ v: 'tyLe', t: PP_THU_NHAP.doanhThu }]), { v: 'thuNhap', t: PP_THU_NHAP.loiNhuan }]} /></div>
              {/* Bộ sổ TT58 theo cách tính thuế, ngay dưới hai ô phương pháp thuế (T174) */}
              {cheDoTheoLoai(loai) === 'TT58' && (
                <div className="f c4">
                  <small className="muted">{moTaBoSoTT58(dnStandard ? 1 : thTT58(f.ppGtgt, tndnCoDinh ? 'thuNhap' : f.ppTndn))}</small>
                </div>
              )}
            </>}
          </div>
          {ngoaiStd.length > 0 && <Note kind="warn" icon="alert">
            Tính năng kê khai thuế chưa hỗ trợ cho cách tính thuế này tại gói Accounting {GOI[s.goi].ten}. Vui lòng nâng cấp lên {(f.loai === 'dn' ? GOIS.filter(g => g !== 'S') : ['PL' as const]).map(g => `Accounting ${GOI[g].ten}`).join(' hoặc ')} để trải nghiệm.
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
            {/* Gói Standard ẩn ô này, mặc định bình quân cuối kỳ (T268) */}
            {s.goi !== 'S' && <div className="f c2"><label>Phương pháp tính giá xuất kho</label><Select className="inp"><option>Bình quân gia quyền cuối kỳ</option><option>Bình quân tức thời</option><option>Nhập trước xuất trước</option></Select></div>}
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
