// Sổ, báo cáo chung: thanh lọc kỳ, trang báo cáo kiểu mẫu in, ô ký. Chi nhánh lấy trên thanh trên
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useParams } from 'react-router-dom'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { kieuGhiSo } from '../../app/plan'
import { chiNhanhHienTai, donViHienTai, useSession, cheDoHienTai } from '../../app/session'
import { canCu, type CheDo } from '../../app/che-do'
import { cauHinhBC, tenTkNh, type LoaiBC } from '../../modules/bao-cao/danh-sach'
import { dsTkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { CHI_NHANH, HANG, HOM_NAY, KHACH, NCC, NVL, TK_NGAN_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { Table } from '../Table'
import { between, k, money, pad, pick, rng } from '../format'
import { chungTu, soChiTiet } from './gen'
import { Dropdown, MenuHead, MenuItem, MenuSep, Select } from '../Dropdown'
import { ThanhLoc } from '../ThanhLoc'
import { khoangThang } from '../ChonNgay'
import { SoTrangCtx, ToGiay, NgatTrang, tachKhoi, type Kho } from '../bao-cao/ToGiay'
import { datNguonXuat, layNguonXuat, taoTenFile, xuatFile, type NguonXuat } from '../bao-cao/xuat'
import {
  useTrangThaiLoc, datLoc, datAnKhongPS, datCotNhuDangXem, datTuyChon, xoaLoc,
  datColsGoc, datDsKyMacDinh, useTuyChinhBC, bienDoiBang
} from '../bao-cao/tuyChinhBC'
import { layNguoiKy } from '../bao-cao/khoMauIn'
// @ts-ignore
import { TuyChinhBC } from '../bao-cao/TuyChinhBC.tsx'
import { useChoThanhCongCu } from '../bao-cao/choThanh'

export const KY_CHON: [string, string][] = [['9', 'Tháng 9/2026'], ['10', 'Tháng 10/2026 (đến 07/10)'], ['8', 'Tháng 8/2026']]

export function ReportToolbar({ ky, setKy }: { ky: string; setKy: (v: string) => void; children?: ReactNode }) {
  // Số liệu báo cáo mẫu tính theo tháng, nên lấy tháng của ngày bắt đầu làm kỳ.
  const [khoang, setKhoang] = useState(() => khoangThang(Number(ky), 2026))
  const [moTuyChinh, setMoTuyChinh] = useState(false)
  const { s, toast } = useSession()
  const path = useLocation().pathname
  const slug = useParams().slug?.replace(/-/g, '.')
  const tt = useTrangThaiLoc(path)

  // Tờ giấy (ToGiay) nghe sự kiện này để in đúng các trang đang xem
  const inBaoCao = () => window.dispatchEvent(new CustomEvent('bc-in'))

  useEffect(() => {
    const thang = Number(ky)
    if (thang && khoang.tu.getMonth() + 1 !== thang) {
      setKhoang(khoangThang(thang, 2026))
    }
  }, [ky])

  const xuat = async (dinhDang: 'xlsx' | 'csv' | 'html' | 'xml') => {
    const n = layNguonXuat()
    if (!n) {
      toast('Màn này chưa hỗ trợ xuất')
      return
    }
    if (dinhDang === 'xlsx') {
      toast('Đang tạo file Excel…')
      try {
        await xuatFile('xlsx', n)
        const ten = taoTenFile(n, 'xlsx')
        toast(`Đã xuất ${ten}`)
      } catch {
        toast('Lỗi xuất file Excel')
      }
      return
    }
    try {
      await xuatFile(dinhDang, n)
      const ten = taoTenFile(n, dinhDang)
      toast(`Đã xuất ${ten}`)
    } catch {
      toast('Lỗi xuất file')
    }
  }

  const inPdf = () => {
    inBaoCao()
    toast('Chọn máy in "Lưu dưới dạng PDF" để lưu file')
  }

  const dangLoc = Object.keys(tt.loc).some(k => (tt.loc[k] ?? []).length > 0)
    || tt.anKhongPS

  // Đang xem trong phân hệ Báo cáo: thanh công cụ nằm cùng hàng tên báo cáo ở thanh chọn (T55)
  // Trong phân hệ Báo cáo thì chờ có chỗ ở thanh chọn rồi mới vẽ, không vẽ tạm trong khung để khỏi nhảy chỗ
  const trongBaoCao = path.startsWith('/app/bao-cao/')
  const oPhai = useChoThanhCongCu()

  const thanh = (
      <ThanhLoc
        ngay={{
          value: khoang,
          onChange: k => {
            setKhoang(k)
            setKy(String(k.tu.getMonth() + 1))
          },
        }}
        dangLoc={dangLoc}
        onLamMoi={() => xoaLoc(path)}
        phai={
          <>
            <span className="bc-xem-cho" id="bc-xem-cho" />
            <button
              type="button"
              className="btn sm"
              title="Tuỳ chỉnh"
              onClick={() => setMoTuyChinh(true)}
            >
              <Icon n="layers" className="ic sm" />
              <span className="rpt-btn-txt">Tuỳ chỉnh</span>
            </button>
            <Dropdown
              label={
                <>
                  <Icon n="download" className="ic sm" />
                  <span className="rpt-btn-txt">Xuất</span>
                  <Icon n="chevd" className="ic sm" />
                </>
              }
              btnClass="btn sm"
              title="Xuất báo cáo"
              align="end"
              width={180}
            >
              {dong => (
                <>
                  <MenuHead>Tuỳ chọn cột</MenuHead>
                  <MenuItem on={tt.cotNhuDangXem} onClick={() => datCotNhuDangXem(path, !tt.cotNhuDangXem)}>
                    Cột như đang xem
                  </MenuItem>
                  <MenuSep />
                  <MenuHead>Xuất báo cáo</MenuHead>
                  <MenuItem icon="doc" onClick={() => { dong(); xuat('xlsx') }}>Excel (.xlsx)</MenuItem>
                  <MenuItem icon="doc" onClick={() => { dong(); xuat('csv') }}>CSV (.csv)</MenuItem>
                  <MenuItem icon="printer" onClick={() => { dong(); inPdf() }}>PDF (hộp in)</MenuItem>
                  <MenuItem icon="doc" onClick={() => { dong(); xuat('html') }}>HTML (.html)</MenuItem>
                  <MenuItem icon="doc" onClick={() => { dong(); xuat('xml') }}>XML (.xml)</MenuItem>
                </>
              )}
            </Dropdown>
            <button
              type="button"
              className="btn sm pri"
              title="In"
              onClick={inBaoCao}
            >
              <Icon n="printer" className="ic sm" />
              In
            </button>
          </>
        }
      />
  )

  return (
    <>
      {oPhai ? createPortal(thanh, oPhai) : trongBaoCao ? null : thanh}
      <TuyChinhBC
        open={moTuyChinh}
        onClose={() => setMoTuyChinh(false)}
        slug={slug}
        donVi={s.donVi}
        colsGoc={tt.colsGoc}
        dsKyMacDinh={tt.dsKyMacDinh}
      />
    </>
  )
}

export type OKy = { chucDanh: string; goiY: string; hoTen: string }

/** Tách phần dựng danh sách ô ký thành hàm dùng chung cho cả vẽ lẫn xuất (kế hoạch mục 5) */
export function dsOKy(loai: LoaiBC, cheDo: CheDo, nguoiDaiDien: string): OKy[] {
  const lap: OKy = { chucDanh: 'Người lập biểu', goiY: '(Ký, họ tên)', hoTen: 'Lê Quốc Bảo' }
  const ktt: OKy = { chucDanh: 'Kế toán trưởng', goiY: '(Ký, họ tên)', hoTen: 'Trần Thu Hà' }
  const ddpl: OKy = { chucDanh: 'Người đại diện theo pháp luật', goiY: '(Ký, họ tên, đóng dấu)', hoTen: nguoiDaiDien }
  if (cheDo === 'TT152') return [lap, { chucDanh: 'Người đại diện hộ kinh doanh', goiY: '(Ký, họ tên, đóng dấu)', hoTen: nguoiDaiDien }]
  if (loai === 'so') return [{ chucDanh: 'Người ghi sổ', goiY: '(Ký, họ tên)', hoTen: 'Lê Quốc Bảo' }, ktt, ddpl]
  if (loai === 'bctc') return cheDo === 'TT58' ? [lap, ddpl] : [lap, ktt, ddpl]
  if (loai === 'baocao') return [{ chucDanh: 'Người lập', goiY: '(Ký, họ tên)', hoTen: 'Lê Quốc Bảo' }, ktt]
  return [lap, ktt, ddpl]
}

// Không tự sinh bộ lọc cho báo cáo tài chính (10.2.2, 10.2.3, 10.2.4, 10.3.1) và tờ khai thuế (6.2.x): lọc dòng làm sai ý nghĩa số tổng
const LOAI_TRU_TU_SINH = new Set(['10.2.2', '10.2.3', '10.2.4', '10.3.1'])

interface BoLocMuc {
  k: string
  nhan: string
  kieu: 'chon' | 'chonNhieu'
  ds?: string[]
}

function LocChonNhieu({
  nhan,
  opts,
  daChon,
  onDoi,
}: {
  nhan: string
  opts: string[]
  daChon: string[]
  onDoi: (vals: string[]) => void
}) {
  const [tim, setTim] = useState('')
  const nhanNut = daChon.length === 0 ? 'Tất cả' : `${daChon.length} đã chọn`
  const canTim = opts.length > 8
  const optsLoc = useMemo(() => {
    if (!canTim || !tim.trim()) return opts
    const q = tim.toLowerCase().trim()
    return opts.filter(x => x.toLowerCase().includes(q))
  }, [opts, tim, canTim])

  return (
    <div className="bc-loc-muc">
      <div className="bc-loc-nhan">{nhan}</div>
      <Dropdown
        label={
          <>
            <span className="bc-loc-btn-txt" title={daChon.length === 1 ? daChon[0] : nhanNut}>
              {daChon.length === 1 ? daChon[0] : nhanNut}
            </span>
            <Icon n="chevd" className="ic sm" />
          </>
        }
        btnClass="inp sm bc-loc-btn"
        width={224}
      >
        {() => (
          <>
            {canTim && (
              <div className="bc-loc-tim-o">
                <Icon n="search" className="ic sm" />
                <input
                  type="text"
                  className="inp sm"
                  placeholder="Tìm..."
                  value={tim}
                  onChange={e => setTim(e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                />
              </div>
            )}
            <MenuItem on={daChon.length === 0} onClick={() => onDoi([])}>
              Tất cả
            </MenuItem>
            <MenuSep />
            <div className="bc-loc-menu-ds">
              {optsLoc.map(v => {
                const on = daChon.includes(v)
                return (
                  <MenuItem
                    key={v}
                    on={on}
                    onClick={() => {
                      const moi = on ? daChon.filter(x => x !== v) : [...daChon, v]
                      onDoi(moi)
                    }}
                  >
                    {v}
                  </MenuItem>
                )
              })}
              {optsLoc.length === 0 && <div className="bc-loc-trong">Không tìm thấy</div>}
            </div>
          </>
        )}
      </Dropdown>
    </div>
  )
}

function CotLocBaoCao({
  dsLoc,
  anKhongPS,
  path,
  tt,
}: {
  dsLoc: BoLocMuc[]
  anKhongPS: boolean
  path: string
  tt: ReturnType<typeof useTrangThaiLoc>
}) {
  const [thuGon, setThuGon] = useState(() => {
    try {
      return localStorage.getItem('bc-loc-thu') === '1'
    } catch {
      return false
    }
  })

  const doiThuGon = (v: boolean) => {
    setThuGon(v)
    try {
      if (v) localStorage.setItem('bc-loc-thu', '1')
      else localStorage.removeItem('bc-loc-thu')
    } catch {}
  }

  const soLocDangAp = useMemo(() => {
    let n = 0
    for (const l of dsLoc) {
      if ((tt.loc[l.k] ?? []).length > 0) n++
    }
    if (anKhongPS && tt.anKhongPS) n++
    return n
  }, [dsLoc, tt.loc, tt.anKhongPS, anKhongPS])

  if (thuGon) {
    return (
      <aside className="bc-loc-cot thu">
        <button
          type="button"
          className="icon-btn sm"
          title="Mở rộng bộ lọc"
          aria-label="Mở rộng"
          onClick={() => doiThuGon(false)}
        >
          <Icon n="chevr" className="ic sm" />
        </button>
        {soLocDangAp > 0 && (
          <span className="chip pri sm bc-loc-chip-thu" title={`${soLocDangAp} bộ lọc đang áp`}>
            {soLocDangAp}
          </span>
        )}
      </aside>
    )
  }

  return (
    <aside className="bc-loc-cot">
      <div className="bc-loc-dau">
        <div className="bc-loc-tieu-de">
          <span>Bộ lọc</span>
          {soLocDangAp > 0 && <span className="chip pri sm">{soLocDangAp}</span>}
        </div>
        <button
          type="button"
          className="icon-btn sm"
          title="Thu gọn bộ lọc"
          aria-label="Thu gọn"
          onClick={() => doiThuGon(true)}
        >
          <Icon n="chevl" className="ic sm" />
        </button>
      </div>

      <div className="bc-loc-ds">
        {dsLoc.map(l => {
          const opts = (tt.tuyChon[l.k] && tt.tuyChon[l.k].length > 0) ? tt.tuyChon[l.k] : (l.ds ?? [])
          if (l.kieu === 'chon') {
            const val = tt.loc[l.k]?.[0] ?? ''
            return (
              <div key={l.k} className="bc-loc-muc">
                <div className="bc-loc-nhan">{l.nhan}</div>
                <Select
                  className="inp sm"
                  value={val}
                  onChange={e => datLoc(path, l.k, e.target.value ? [e.target.value] : [])}
                >
                  <option value="">Tất cả</option>
                  {opts.map(v => <option key={v} value={v}>{v}</option>)}
                </Select>
              </div>
            )
          }
          return (
            <LocChonNhieu
              key={l.k}
              nhan={l.nhan}
              opts={opts}
              daChon={tt.loc[l.k] ?? []}
              onDoi={vals => datLoc(path, l.k, vals)}
            />
          )
        })}

        {anKhongPS && (
          <div className="bc-loc-muc">
            <label className="bc-loc-gat">
              <input
                type="checkbox"
                checked={tt.anKhongPS}
                onChange={e => datAnKhongPS(path, e.target.checked)}
              />
              <span>Ẩn dòng không phát sinh</span>
            </label>
          </div>
        )}
      </div>

      <div className="bc-loc-chan">
        <button
          type="button"
          className="btn sm"
          disabled={soLocDangAp === 0}
          onClick={() => xoaLoc(path)}
        >
          Xoá lọc
        </button>
      </div>
    </aside>
  )
}

/** Bảng ánh xạ tiêu đề cột hoặc khoá cột → tên danh mục trong src/modules/danh-muc/index.ts (T68).
 *  Các mục có màn danh mục tương ứng được giữ lại:
 *  - 1.1: Tài khoản
 *  - 1.2: Hàng hoá (Hàng hoá / Nguyên vật liệu / Món)
 *  - 1.3: Đơn vị tính
 *  - 1.5: Đối tượng (Khách hàng / Nhà cung cấp / Đối tượng)
 *  - 1.8: Kho
 *  - chi-nhanh: Chi nhánh
 *  - 1.12: Quỹ tiền (Quỹ tiền / Tài khoản ngân hàng)
 *  - 1.13: Tài sản cố định
 *
 *  Các mục KHÔNG có màn danh mục tương ứng trong danh-muc/index.ts (bỏ, không đưa vào):
 *  - Nhân viên (thuộc danh mục Đối tượng, không có màn danh mục riêng)
 *  - Nhóm hàng / Nhóm món (không có màn danh mục riêng)
 *  - Công cụ dụng cụ (không có màn danh mục riêng)
 *  - Loại chứng từ (không có màn danh mục riêng)
 */
interface AnhXaDanhMuc {
  nhom: string
  ten: string
  laMa?: boolean
  khopKhoa?: string[]
  khopTieuDe: string[]
}

const BANG_ANH_XA_DANH_MUC: AnhXaDanhMuc[] = [
  // 1.1: Tài khoản
  {
    nhom: 'tk',
    ten: 'Tài khoản',
    laMa: true,
    khopKhoa: ['tk', 'sotk', 'tkno', 'tkco', 'tkdu', 'tkdoiung', 'tkcn', 'tkdt', 'tkgv', 'tkkho', 'tkcp'],
    khopTieuDe: ['Số hiệu TK', 'Số tài khoản', 'TK', 'TK đối ứng', 'TK Nợ', 'TK Có', 'Tài khoản'],
  },
  {
    nhom: 'tk',
    ten: 'Tài khoản',
    laMa: false,
    khopKhoa: ['tentk'],
    khopTieuDe: ['Tên tài khoản'],
  },

  // Chi nhánh (slug chi-nhanh)
  {
    nhom: 'chinhanh',
    ten: 'Chi nhánh',
    laMa: false,
    khopKhoa: ['cn', 'chinhanh'],
    khopTieuDe: ['Chi nhánh', 'Tên chi nhánh'],
  },

  // 1.8: Kho
  {
    nhom: 'kho',
    ten: 'Kho',
    laMa: false,
    khopKhoa: ['kho', 'makho', 'tenkho'],
    khopTieuDe: ['Kho', 'Tên kho', 'Mã kho'],
  },

  // 1.12: Quỹ tiền (Quỹ tiền / Tài khoản ngân hàng)
  {
    nhom: 'quy',
    ten: 'Quỹ tiền',
    laMa: false,
    khopKhoa: ['quy', 'locquy', 'tknh', 'taikhoannh'],
    khopTieuDe: ['Quỹ tiền', 'Quỹ', 'Tài khoản ngân hàng', 'Sổ tài khoản'],
  },

  // 1.5: Đối tượng (Khách hàng / Nhà cung cấp / Đối tượng)
  {
    nhom: 'doituong',
    ten: 'Đối tượng',
    laMa: true,
    khopKhoa: ['makh', 'mancc', 'madoituong'],
    khopTieuDe: ['Mã khách', 'Mã NCC', 'Mã đối tượng', 'Mã khách hàng', 'Mã nhà cung cấp'],
  },
  {
    nhom: 'doituong',
    ten: 'Đối tượng',
    laMa: false,
    khopKhoa: ['doituong', 'khach', 'ncc', 'nguoiban', 'nguoimua', 'khachhang', 'nhacungcap', 'tendoituong'],
    khopTieuDe: ['Đối tượng', 'Khách hàng', 'Nhà cung cấp', 'Người mua', 'Người bán', 'Tên khách hàng', 'Tên nhà cung cấp', 'Tên người bán', 'Tên người mua', 'Tên đối tượng'],
  },

  // 1.2: Hàng hoá (Hàng hoá / Nguyên vật liệu / Món)
  {
    nhom: 'hang',
    ten: 'Hàng hoá',
    laMa: true,
    khopKhoa: ['mahang', 'manvl', 'mamon'],
    khopTieuDe: ['Mã hàng', 'Mã NVL', 'Mã món', 'Mã hàng hoá', 'Mã nguyên vật liệu'],
  },
  {
    nhom: 'hang',
    ten: 'Hàng hoá',
    laMa: false,
    khopKhoa: ['hang', 'hanghoa', 'nvl', 'mon', 'mathang', 'tenhang', 'tennvl', 'tenmon'],
    khopTieuDe: ['Hàng hoá', 'Nguyên vật liệu', 'Món', 'Mặt hàng', 'Tên hàng', 'Tên nguyên vật liệu', 'Tên món', 'Tên mặt hàng', 'Tên hàng hoá'],
  },

  // 1.3: Đơn vị tính
  {
    nhom: 'dvt',
    ten: 'Đơn vị tính',
    laMa: false,
    khopKhoa: ['dvt', 'donvitinh'],
    khopTieuDe: ['ĐVT', 'Đơn vị tính'],
  },

  // 1.13: Tài sản cố định
  {
    nhom: 'tscd',
    ten: 'Tài sản cố định',
    laMa: true,
    khopKhoa: ['mats', 'matscd'],
    khopTieuDe: ['Mã TS', 'Mã TSCĐ', 'Mã tài sản'],
  },
  {
    nhom: 'tscd',
    ten: 'Tài sản cố định',
    laMa: false,
    khopKhoa: ['tscd', 'taisan'],
    khopTieuDe: ['Tài sản cố định', 'Tài sản', 'Tên tài sản'],
  },
]

function timDanhMuc(col: Col, cols: Col[]): AnhXaDanhMuc | null {
  if (col.num) return null
  const k = col.k.toLowerCase().replace(/[^a-z0-9]/g, '')
  const t = col.t.trim()
  const tLower = t.toLowerCase()

  // Bỏ cột ngày, STT, chứng từ, phiếu, hoá đơn, diễn giải, lý do, ghi chú, nội dung
  if (k === 'stt' || tLower === 'stt') return null
  if (k === 'ngay' || /ngày/i.test(t)) return null
  if (['so', 'thu', 'chi', 'soct', 'shd', 'sophieu', 'sohoadon'].includes(k) || /^(số\s+(chứng từ|phiếu|hoá đơn)|mã\s+số\s+mẫu)/i.test(t)) return null
  if (['diengiai', 'dg', 'lydo', 'ghichu', 'gc', 'noidung', 'nd'].includes(k) || /^(diễn giải|lý do|ghi chú|nội dung)/i.test(t)) return null

  // Cột mã / tên chung chung trong bảng hàng hoá/kho hoặc tài khoản
  if ((k === 'ma' && tLower === 'mã') || (k === 'ten' && tLower === 'tên')) {
    const laMa = k === 'ma'
    if (cols.some(c => c.k === 'tk' || /tài khoản/i.test(c.t))) {
      return { nhom: 'tk', ten: 'Tài khoản', laMa, khopTieuDe: [] }
    }
    if (cols.some(c => /tài sản/i.test(c.t))) {
      return { nhom: 'tscd', ten: 'Tài sản cố định', laMa, khopTieuDe: [] }
    }
    return { nhom: 'hang', ten: 'Hàng hoá', laMa, khopTieuDe: [] }
  }

  // Khớp chính xác theo tiêu đề
  for (const m of BANG_ANH_XA_DANH_MUC) {
    if (m.khopTieuDe.some(ti => ti.toLowerCase() === tLower)) return m
  }

  // Khớp theo khoá cột
  for (const m of BANG_ANH_XA_DANH_MUC) {
    if (m.khopKhoa?.includes(k)) return m
  }

  return null
}

/** Tách chuỗi sub thành các dòng phụ và dòng kỳ hiển thị theo kiểu Ledger Studio (T71) */
export function tachSub(sub: string): { subLines: string[]; periodText?: string } {
  if (!sub) return { subLines: [] }
  const parts = sub.split(/\s*·\s*|\n+/).map(p => p.trim()).filter(Boolean)
  const isPeriod = (s: string) => /^(tháng|quý|năm|tại ngày|từ ngày|đến ngày)\b/i.test(s) || /\b(tháng|quý)\s+\d+/i.test(s)

  const subLines: string[] = []
  let periodText: string | undefined

  for (const p of parts) {
    if (!periodText && isPeriod(p)) {
      const mThang = p.match(/^Tháng\s+(\d+)\/(\d{4})$/i)
      const mQuy = p.match(/^Quý\s+(\d+)\/(\d{4})$/i)
      if (mThang) {
        periodText = `Tháng ${mThang[1]} Năm ${mThang[2]}`
      } else if (mQuy) {
        periodText = `Quý ${mQuy[1]} Năm ${mQuy[2]}`
      } else {
        periodText = p
      }
    } else {
      subLines.push(p)
    }
  }

  if (!periodText && subLines.length === 1 && isPeriod(subLines[0])) {
    periodText = subLines.pop()
  }

  return { subLines, periodText }
}

/** Trang báo cáo theo mẫu: đầu trang đơn vị, mẫu số, tiêu đề, kỳ, ô ký. Vẽ trên tờ A4 tự chia trang (ToGiay).
 *  Mẫu số, tên in, khổ, ô ký lấy theo mã báo cáo trên đường dẫn và chế độ kế toán (modules/bao-cao/danh-sach.ts); mau chỉ dùng cho màn chưa có cấu hình */
export function ReportPaper({ title, sub, mau, children, ky = true, kho }: { title: string; sub: string; mau?: string; children: ReactNode; ky?: boolean; kho?: Kho }) {
  const { s } = useSession()
  const dv = donViHienTai(s)
  const cd = cheDoHienTai(s)
  const path = useLocation().pathname
  const slug = useParams().slug?.replace(/-/g, '.')
  const cfg = cauHinhBC(slug)
  const kyHieu = cfg ? cfg.kyHieu?.[s.cheDo] : cd.ma !== 'TT152' ? mau : undefined
  const loai: LoaiBC = cfg?.loai ?? 'baocao'
  const khoMacDinh = kho ?? cfg?.kho ?? tuDoanKho(children)
  const [khoHienTai, setKhoHienTai] = useState<Kho>(khoMacDinh)
  const layHtmlRef = useRef<(() => string) | null>(null)

  const tc = useTuyChinhBC(s.donVi, slug)
  const tt = useTrangThaiLoc(path)

  const khongTuSinh = (slug && LOAI_TRU_TU_SINH.has(slug)) || loai === 'tokhai' || (slug && slug.startsWith('6.2.'))

  // Danh sách bộ lọc cho cột lọc bên trái: bộ lọc khai tay trong cfg.loc đứng trước, sau đó tự sinh theo danh mục
  const dsLocCot = useMemo(() => {
    const res: BoLocMuc[] = []
    const daCo = new Set<string>()

    // 1. Khai tay trong cfg.loc
    for (const l of cfg?.loc ?? []) {
      res.push({
        k: l.k,
        nhan: l.nhan,
        kieu: l.kieu,
        ds: l.ds ? l.ds(chiNhanhHienTai(s)?.id) : undefined,
      })
      daCo.add(l.k)
    }

    // 2. Tự sinh theo các cột của khối bảng: chỉ tự sinh cho các cột thuộc danh mục
    if (!khongTuSinh) {
      const khoi = tachKhoi(children)
      for (const kh of khoi) {
        if (kh.loai === 'bang') {
          const dongCT = kh.rows.filter(r => !r._b && !r._t)
          const nhomCols = new Map<string, { quyTac: AnhXaDanhMuc; col: Col; vals: string[] }[]>()

          for (const c of kh.cols) {
            if (daCo.has(c.k)) continue
            const q = timDanhMuc(c, kh.cols)
            if (!q) continue

            const laNgay = dongCT.some(r => typeof r[c.k] === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(r[c.k]))
            if (laNgay) continue

            const vals = [...new Set(dongCT.map(r => String(r[c.k] ?? '').trim()).filter(Boolean))].sort()
            if (vals.length < 2) continue

            const list = nhomCols.get(q.nhom) ?? []
            list.push({ quyTac: q, col: c, vals })
            nhomCols.set(q.nhom, list)
          }

          // Mỗi nhóm danh mục chỉ tạo MỘT bộ lọc
          for (const [, list] of nhomCols) {
            if (res.some(r => r.nhan === list[0].quyTac.ten)) continue

            const chon = list.find(x => x.quyTac.laMa) ?? list[0]
            if (!daCo.has(chon.col.k)) {
              res.push({ k: chon.col.k, nhan: chon.quyTac.ten, kieu: 'chonNhieu', ds: chon.vals })
              daCo.add(chon.col.k)
            }
          }
        }
      }
    }
    return res
  }, [cfg?.loc, khongTuSinh, children, s])

  const dsKy = useMemo(() => {
    if (!ky) return []
    if (tc?.ky && tc.ky.length > 0) return tc.ky
    const goc = dsOKy(loai, s.cheDo, dv.nguoiDaiDien)
    const nk = layNguoiKy(s.donVi)
    return goc.map(o => ({
      ...o,
      hoTen: nk[o.chucDanh] || o.hoTen,
    }))
  }, [ky, tc?.ky, loai, s.cheDo, dv.nguoiDaiDien, s.donVi])

  const ngayStr = `${pad(HOM_NAY.getDate())} tháng ${pad(HOM_NAY.getMonth() + 1)} năm ${HOM_NAY.getFullYear()}`
  const ngayLap = loai === 'bctc' ? `Lập, ngày ${ngayStr}` : `Ngày ${ngayStr}`
  const kyHieuCot: 'chuSo' | 'so' | undefined = cd.ma !== 'TT152' && (loai === 'so' || loai === 'bctc') ? (loai === 'so' ? 'chuSo' : 'so') : undefined

  // Ghi colsGoc, dsKyMacDinh, tuyChon vào store
  useEffect(() => {
    const khoi = tachKhoi(children)
    const bang1 = khoi.find((x): x is Extract<typeof x, { loai: 'bang' }> => x.loai === 'bang')
    if (bang1) {
      datColsGoc(path, bang1.cols)
    }
    if (ky) {
      datDsKyMacDinh(path, dsOKy(loai, s.cheDo, dv.nguoiDaiDien))
    }
    for (const kh of khoi) {
      if (kh.loai === 'bang') {
        const dongCT = kh.rows.filter(r => !r._b && !r._t)
        for (const l of cfg?.loc ?? []) {
          const vals = l.ds ? l.ds(chiNhanhHienTai(s)?.id) : [...new Set(dongCT.map(r => String(r[l.k] ?? '')).filter(Boolean))].sort()
          datTuyChon(path, l.k, vals)
        }
        if (dongCT.some(r => r.cn !== undefined)) {
          const vals = [...new Set(dongCT.map(r => String(r.cn ?? '')).filter(Boolean))].sort()
          datTuyChon(path, 'cn', vals)
        }
        for (const l of dsLocCot) {
          if (l.ds && l.ds.length > 0) {
            datTuyChon(path, l.k, l.ds)
          }
        }
      }
    }
  }, [children, path, cfg, ky, loai, s.cheDo, dv.nguoiDaiDien, dsLocCot])

  // Biến đổi các khối bảng cho thân tờ giấy và nguồn xuất
  const { thanBienDoi, bangXuat } = useMemo(() => {
    const khoi = tachKhoi(children)
    const tinhLaiTong = loai === 'baocao' || (loai === 'so' && !cfg?.congCot) || slug === '10.2.1'
    const khoa = !!cfg?.khoa
    const bx: { cols: Col[]; rows: Row[]; kyHieuCot?: KyHieuCot }[] = []

    const thanMoi = khoi.map((kh, i) => {
      if (kh.loai === 'ngat') return <NgatTrang key={i} />
      if (kh.loai === 'nguyen') return kh.el
      // Bảng đang xem: áp lọc, nhóm, cột
      const res = bienDoiBang(kh.cols, kh.rows, {
        loc: tt.loc,
        anKhongPS: tt.anKhongPS,
        nhom: tc?.nhom,
        cot: tc?.cot,
        tinhLaiTong,
        khoa,
      })
      // Nguồn xuất:
      if (tt.cotNhuDangXem) {
        bx.push({ cols: res.cols, rows: res.rows, kyHieuCot })
      } else {
        // Tắt "Cột như đang xem": xuất đủ cột (vẫn áp lọc và nhóm)
        const resDuCot = bienDoiBang(kh.cols, kh.rows, {
          loc: tt.loc,
          anKhongPS: tt.anKhongPS,
          nhom: tc?.nhom,
          cot: undefined,
          tinhLaiTong,
          khoa,
        })
        bx.push({ cols: resDuCot.cols, rows: resDuCot.rows, kyHieuCot })
      }
      return <RptTable key={i} cols={res.cols} rows={res.rows} onRow={kh.onRow} kyHieuCot={kyHieuCot} />
    })

    return { thanBienDoi: thanMoi, bangXuat: bx }
  }, [children, tt.loc, tt.anKhongPS, tt.cotNhuDangXem, tc?.nhom, tc?.cot, loai, cfg?.congCot, cfg?.khoa, kyHieuCot, slug])

  // Dựng NguonXuat cho chức năng xuất file
  useEffect(() => {
    const nx: NguonXuat = {
      ma: slug,
      tieuDe: cfg?.ten?.[s.cheDo] ?? title,
      phu: sub,
      kyHieu,
      canCu: kyHieu ? canCu(cd) : undefined,
      cheDo: s.cheDo,
      dv: { ten: dv.ten, diaChi: dv.diaChi, mst: dv.mst },
      kho: khoHienTai,
      bang: bangXuat,
      ky: dsKy,
      ngayLap,
      layHtml: () => layHtmlRef.current?.() ?? '',
    }
    datNguonXuat(nx)
    return () => datNguonXuat(null)
  }, [slug, title, sub, kyHieu, cd, s.cheDo, dv.ten, dv.diaChi, dv.mst, khoHienTai, bangXuat, kyHieuCot, dsKy, ngayLap, cfg])

  const cn = chiNhanhHienTai(s)
  const { subLines, periodText } = tachSub(sub)

  const dau = (
    <>
      <div className="paper-h">
        <div className="paper-dv-trai">
          <div className="paper-ten-dv">{dv.ten}</div>
          <div className="paper-dc-mst">{dv.diaChi}{dv.mst ? ` — MST: ${dv.mst}` : ''}</div>
          <div className="paper-dv-cs">Đơn vị: {cn ? cn.ten : dv.ten}</div>
        </div>
        {kyHieu && (
          <div className="bc-mau">
            <div className="bc-mau-so">Mẫu số {kyHieu}</div>
            <div className="bc-mau-cc">({canCu(cd)})</div>
            {cd.choDuyet && <div className="bc-cho-duyet">Ký hiệu chờ kế toán trưởng duyệt</div>}
          </div>
        )}
      </div>
      <div className="paper-tieu-de-khoi">
        <h2 className="paper-tieu-de">{cfg?.ten?.[s.cheDo] ?? title}</h2>
        {subLines.map((line, i) => (
          <div key={i} className="paper-dong-phu">{line}</div>
        ))}
        {periodText && <div className="paper-dong-ky">{periodText}</div>}
        <div className="paper-dvt">Đơn vị tính: đồng</div>
      </div>
    </>
  )
  const cuoi = ky ? <KhoiCuoi loai={loai} cheDo={s.cheDo} nguoiDaiDien={dv.nguoiDaiDien} dsKy={dsKy} /> : undefined
  const coBoLoc = dsLocCot.length > 0 || !!cfg?.anKhongPS

  return (
    <div className="bc-xem">
      {coBoLoc && (
        <CotLocBaoCao
          dsLoc={dsLocCot}
          anKhongPS={!!cfg?.anKhongPS}
          path={path}
          tt={tt}
        />
      )}
      <ToGiay dau={dau} than={thanBienDoi} cuoi={cuoi} khoMacDinh={khoMacDinh}
        kyHieuCot={kyHieuCot} congChuyen={loai === 'so' ? cfg?.congCot : undefined}
        onKho={setKhoHienTai} layHtmlRef={layHtmlRef} coChu={tc?.coChu} />
    </div>
  )
}

/** Khối cuối tờ: dòng sổ có mấy trang, ngày lập, ô ký theo loại báo cáo và chế độ (kế hoạch mục 5) */
function KhoiCuoi({ loai, cheDo, nguoiDaiDien, dsKy }: { loai: LoaiBC; cheDo: CheDo; nguoiDaiDien: string; dsKy: OKy[] }) {
  const ngayStr = `Ngày ${pad(HOM_NAY.getDate())} Tháng ${pad(HOM_NAY.getMonth() + 1)} Năm ${HOM_NAY.getFullYear()}`
  const ngay = loai === 'bctc' ? `Lập, ngày ${pad(HOM_NAY.getDate())} tháng ${pad(HOM_NAY.getMonth() + 1)} năm ${HOM_NAY.getFullYear()}` : `TP. HCM, ${ngayStr}`
  return (
    <div className="bc-cuoi">
      {loai === 'so' && <SoTrangSo />}
      <div className="paper-ky-hang-ngay" style={{ gridTemplateColumns: `repeat(${dsKy.length}, 1fr)` }}>
        {dsKy.map((_, i) => (
          <div key={i} className={i === dsKy.length - 1 ? 'paper-ky-ngay' : ''}>
            {i === dsKy.length - 1 ? ngay : ''}
          </div>
        ))}
      </div>
      <div className="sign" style={{ gridTemplateColumns: `repeat(${dsKy.length}, 1fr)` }}>
        {dsKy.map(o => (
          <div key={o.chucDanh} className="sign-col">
            <div className="sign-chuc-danh">{o.chucDanh}</div>
            <div className="sign-goi-y">{o.goiY}</div>
            {o.hoTen && <div className="sign-ten">{o.hoTen}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Hai dòng cuối sổ: số trang thật đọc từ tờ đang chia trang */
function SoTrangSo() {
  const n = useContext(SoTrangCtx)
  return (
    <div className="bc-so-ghi">
      <div>- Sổ này có {n} trang, đánh số từ trang 01 đến trang {pad(n)}</div>
      <div>- Ngày mở sổ: 01/01/2026</div>
    </div>
  )
}

// Bảng từ 7 cột trở lên in khổ ngang cho đỡ chật
const tuDoanKho = (than: ReactNode): Kho => tachKhoi(than).some(x => x.loai === 'bang' && x.cols.length >= 7) ? 'ngang' : 'doc'

const kyTen = (ky: string) => KY_CHON.find(x => x[0] === ky)?.[1].replace(' (đến 07/10)', '') || `Tháng ${ky}/2026`
const dsTongHop: Record<string, { ma: string; ten: string }[]> = {
  kh: KHACH, ncc: NCC, hang: HANG, nvl: NVL, cn: CHI_NHANH.map(c => ({ ma: c.id.toUpperCase(), ten: c.ten })),
  tk: [['1111', 'Tiền mặt'], ['1121', 'Tiền gửi ngân hàng'], ['131', 'Phải thu của khách hàng'], ['1331', 'Thuế GTGT được khấu trừ'], ['152', 'Nguyên liệu, vật liệu'],
    ['156', 'Hàng hoá'], ['211', 'Tài sản cố định'], ['242', 'Chi phí trả trước'], ['331', 'Phải trả cho người bán'], ['33311', 'Thuế GTGT đầu ra'],
    ['334', 'Phải trả người lao động'], ['411', 'Vốn đầu tư của chủ sở hữu'], ['421', 'Lợi nhuận chưa phân phối'], ['511', 'Doanh thu bán hàng'], ['632', 'Giá vốn hàng bán'], ['642', 'Chi phí quản lý kinh doanh']].map(([ma, ten]) => ({ ma, ten })),
  ts: [['TS001', 'Hệ thống bếp công nghiệp Lê Lợi'], ['TS002', 'Tủ đông 1.500 lít'], ['TS003', 'Máy pha cà phê La Marzocco'], ['TS004', 'Hệ thống điều hoà Thảo Điền'], ['TS005', 'Xe tải giao hàng 1,5 tấn']].map(([ma, ten]) => ({ ma, ten })),
  ccdc: [['CC001', 'Bộ nồi inox 50 lít'], ['CC002', 'Bàn ghế gỗ khu ngoài trời'], ['CC003', 'Máy POS cầm tay'], ['CC004', 'Máy xay sinh tố công nghiệp'], ['CC005', 'Dao thớt bếp trọn bộ']].map(([ma, ten]) => ({ ma, ten })),
}

export function ReportScreen({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const [ky, setKy] = useState('9')
  const cfg: ReportCfg = sc.report ?? { kieu: 'tonghop', doiTuong: 'tk' }
  const ten = tenMan(sc)
  const thang = Number(ky)
  const cn = cfg.theoCn ? chiNhanhHienTai(s) : undefined
  const { loc } = useTrangThaiLoc(useLocation().pathname)
  const body = useMemo(() => renderReport(cfg, sc.code ?? sc.slug, thang, s.cheDo, cn?.id, loc), [cfg, ky, sc, s.cheDo, cn, loc])
  // Dòng dưới tiêu đề ghi chi nhánh (theo thanh trên) và quỹ đang lọc (T54)
  const sub = cfg.theoCn ? `${kyTen(ky)} · ${cn ? 'Chi nhánh ' + cn.ngan : 'Tất cả chi nhánh'}${loc.locQuy?.[0] ? ' · ' + loc.locQuy[0] : ''}` : kyTen(ky)
  return (
    <div className="page page-report">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={ten} code={sc.code} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy} />
        {/* Sổ ngân hàng xem tất cả quỹ có thêm cột Quỹ tiền: mặc định khổ ngang (T54) */}
        <ReportPaper title={ten} sub={sub} kho={cfg.theoTk && !loc.locQuy?.[0] ? 'ngang' : undefined}>{body}</ReportPaper>
      </section>
    </div>
  )
}

/** Gộp sổ của nhiều chi nhánh: xếp theo ngày, thêm cột chi nhánh, tính lại số dư luỹ kế */
export function gopSo(phan: { cn: string; mo: number; rows: Row[]; tn: number; tc: number }[]) {
  const mo = phan.reduce((a, p) => a + p.mo, 0)
  const ngay = (x: Row) => Number(String(x.ngay).slice(0, 2))
  const rows = phan.flatMap(p => p.rows.map((x): Row => ({ ...x, cn: p.cn }))).sort((a, b) => ngay(a) - ngay(b))
  let du = mo
  for (const x of rows) { du += (x.no ?? 0) - (x.co ?? 0); x.du = du }
  return { mo, rows, tn: phan.reduce((a, p) => a + p.tn, 0), tc: phan.reduce((a, p) => a + p.tc, 0), cuoi: du }
}

function renderReport(cfg: ReportCfg, seed: string, thang: number, cd: CheDo, cn?: string, loc: Record<string, string[]> = {}): ReactNode {
  const r = rng(seed + thang)
  // Sổ, báo cáo theo chi nhánh: mỗi chi nhánh một hạt giống riêng, xem tất cả thì cộng các chi nhánh.
  // Bộ lọc Quỹ tiền (T54) chọn lại phần được cộng, nên tồn đầu, tồn cuối đúng với lựa chọn
  const chonQuy = loc.locQuy?.[0]
  const dsCn = cfg.theoCn ? CHI_NHANH.filter(c => !cn || c.id === cn) : []
  const dsTk = cfg.theoTk ? TK_NGAN_HANG.filter(t => !chonQuy || tenTkNh(t) === chonQuy) : []
  // Dòng mang giá trị đang lọc để khung lọc chung (bienDoiBang) giữ lại
  const gan = (x: Row): Row => ({ ...x, locQuy: chonQuy })
  if (cfg.kieu === 'so') {
    const chia = (cfg.theoCn ? 3 : 1) * (cfg.theoTk ? TK_NGAN_HANG.length : 1)
    const soMot = (hat: string) => soChiTiet(hat, k(between(rng(hat + thang), 80e6, 260e6) / chia), ['Thu tiền bán hàng ngày', 'Chi mua nguyên vật liệu', 'Chi tiền điện tháng', 'Thu tiền khách công ty',
      'Chi tạm ứng nhân viên', 'Nộp tiền vào tài khoản ngân hàng', 'Chi phí vận chuyển', 'Thu hoàn ứng'], ['5111', '331', '6422', '131', '141', '1121', '6421'], [1.5e6, 38e6], thang)
    const gop = dsCn.length > 1
    const gopTk = dsTk.length > 1
    // Sổ ngân hàng ở chế độ không dùng tài khoản (gói Free): bỏ cột TK đối ứng, ghi Thu, Chi, Tồn như Sổ quỹ (T25)
    const khongTk = Boolean(cfg.theoTk) && kieuGhiSo(cd) !== 'noco'
    const phan = cfg.theoTk
      ? dsCn.flatMap(c => dsTk.map((tk, i) => { const x = soMot(seed + c.id + (i || '')); return { cn: c.ngan, ...x, rows: x.rows.map(y => ({ ...y, quy: tenTkNh(tk) })) } }))
      : dsCn.map(c => ({ cn: c.ngan, ...soMot(seed + c.id) }))
    const so0 = cfg.theoCn ? gopSo(phan) : soMot(seed)
    const so = { ...so0, rows: so0.rows.map(gan) }
    const cols: Col[] = [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số chứng từ', cls: 'code', w: 130 }, ...(gop ? [{ k: 'cn', t: 'Chi nhánh', w: 110 } as Col] : []),
      ...(gopTk ? [{ k: 'quy', t: 'Quỹ tiền', w: 190 } as Col] : []), { k: 'dienGiai', t: 'Diễn giải' },
      ...(khongTk ? [] : [{ k: 'tk', t: 'TK đối ứng', c: true, w: 90 } as Col]),
      { k: 'no', t: khongTk ? 'Thu' : 'Phát sinh Nợ', num: true }, { k: 'co', t: khongTk ? 'Chi' : 'Phát sinh Có', num: true }, { k: 'du', t: khongTk ? 'Tồn' : 'Số dư', num: true }]
    return <RptTable cols={cols} rows={[{ dienGiai: 'Số dư đầu kỳ', du: so.mo, _b: 1 }, ...so.rows.map(x => ({ ...x, tk: dsTkTheoCheDo(x.tk, cd) })), { dienGiai: 'Cộng phát sinh', no: so.tn, co: so.tc, _t: 1 }, { dienGiai: 'Số dư cuối kỳ', du: so.cuoi, _t: 1 }]} />
  }
  if (cfg.kieu === 'dinhmuc') {
    const rows = NVL.slice(0, 10).map(n => {
      const dm = Math.round(between(r, 40, 400)), tt = Math.round(dm * between(r, 0.93, 1.12))
      return { ma: n.ma, ten: n.ten, dvt: n.dvt, dm, tt, cl: tt - dm, pct: ((tt - dm) / dm * 100).toFixed(1).replace('.', ',') + '%', gt: (tt - dm) * n.gia / (n.gia > 100000 ? 10 : 1) }
    })
    return <RptTable cols={[{ k: 'ma', t: 'Mã NVL', cls: 'code' }, { k: 'ten', t: 'Tên nguyên vật liệu' }, { k: 'dvt', t: 'ĐVT', c: true }, { k: 'dm', t: 'Theo định mức', num: true },
      { k: 'tt', t: 'Thực tế xuất', num: true }, { k: 'cl', t: 'Chênh lệch', num: true, r: x => <b style={{ color: x.cl > 0 ? 'var(--red)' : 'var(--green)' }}>{x.cl > 0 ? '+' : ''}{money(x.cl)}</b> },
      { k: 'pct', t: 'Tỷ lệ', num: true }, { k: 'gt', t: 'Giá trị chênh lệch', num: true }]} rows={rows} />
  }
  if (cfg.kieu === 'bangke') {
    if (cfg.cols && cfg.rows) return <RptTable cols={cfg.cols} rows={cfg.rows(thang, CHI_NHANH.find(c => c.id === cn)?.ten)} />
    const rows = chungTu({ prefix: 'HD', doiTuong: 'ncc', dienGiai: ['Mua hàng'], tien: [2e6, 40e6], dong: 'nvl' }, seed).filter(x => x.thang === thang || thang === 8)
    return <RptTable cols={[{ k: 'stt', t: 'STT', c: true, w: 50 }, { k: 'so', t: 'Số hoá đơn', cls: 'code' }, { k: 'ngay', t: 'Ngày' }, { k: 'doiTuong', t: 'Tên người bán' },
      { k: 'tien', t: 'Giá trị chưa thuế', num: true }, { k: 'thue', t: 'Thuế GTGT', num: true }]}
      rows={[...rows.map((x, i) => ({ ...x, stt: i + 1 })), { doiTuong: 'Tổng cộng', tien: rows.reduce((a, x) => a + x.tien, 0), thue: rows.reduce((a, x) => a + x.thue, 0), _t: 1 }]} />
  }
  const ds = dsTongHop[cfg.doiTuong ?? 'tk']
  const motBo = (r: () => number, chia: number) => ds.map(() => {
    const dau = k(between(r, 5e6, 220e6) / chia), tang = k(between(r, 2e6, 180e6) / chia), giam = k(Math.min(dau + tang, between(r, 2e6, 190e6) / chia))
    return { dau, tang, giam }
  })
  const bo = cfg.theoCn ? dsCn.map(c => motBo(rng(seed + c.id + thang), 3)) : [motBo(r, 1)]
  const rows = ds.map((d, i) => {
    const [dau, tang, giam] = (['dau', 'tang', 'giam'] as const).map(f => bo.reduce((a, b) => a + b[i][f], 0))
    return gan({ ma: d.ma, ten: d.ten, dau, tang, giam, cuoi: dau + tang - giam })
  })
  const s = (f: string) => rows.reduce((a, x) => a + (x as Row)[f], 0)
  return <RptTable cols={[{ k: 'ma', t: 'Mã', cls: 'code', w: 90 }, { k: 'ten', t: 'Tên' }, { k: 'dau', t: 'Đầu kỳ', num: true }, { k: 'tang', t: 'Phát sinh tăng', num: true },
    { k: 'giam', t: 'Phát sinh giảm', num: true }, { k: 'cuoi', t: 'Cuối kỳ', num: true }]}
    rows={[...rows, { ten: 'Tổng cộng', dau: s('dau'), tang: s('tang'), giam: s('giam'), cuoi: s('cuoi'), _t: 1 }]} />
}

/** Hàng ký hiệu cột dưới tiêu đề: 'chuSo' cột chữ A, B, C…, cột số 1, 2, 3… (sổ); 'so' mọi cột 1, 2, 3… (báo cáo tài chính) */
export type KyHieuCot = 'chuSo' | 'so'

function kyHieuCac(cols: Col[], kieu: KyHieuCot): string[] {
  let chu = 0, so = 0
  return cols.map(c => kieu === 'chuSo' && !c.num ? String.fromCharCode(65 + chu++) : String(++so))
}

/** Bảng in kiểu báo cáo: dòng _b in đậm, _t dòng tổng */
export function RptTable({ cols, rows, onRow, kyHieuCot }: { cols: Col[]; rows: Row[]; onRow?: (r: Row) => void; kyHieuCot?: KyHieuCot }) {
  return (
    <table className="rpt">
      <thead>
        <tr>{cols.map(c => <th key={c.k} style={c.w ? { width: c.w } : undefined}>{c.t}</th>)}</tr>
        {kyHieuCot && <tr className="rpt-ky-hieu">{kyHieuCac(cols, kyHieuCot).map((x, i) => <th key={cols[i].k}>{x}</th>)}</tr>}
      </thead>
      <tbody>
        {rows.map((x, i) => (
          <tr key={i} className={`${x._t ? 't' : x._b ? 'b' : ''} ${x._nhom ? 'nhom' : ''} ${onRow && x._drill ? 'drill' : ''}`} onClick={onRow && x._drill ? () => onRow(x) : undefined}>
            {cols.map(c => {
              const v = c.r ? c.r(x) : x[c.k]
              return <td key={c.k} className={[c.num ? 'num' : c.c ? 'c' : '', c.cls ?? '', c.k === cols[1]?.k && x._i ? `i${x._i}` : ''].join(' ')}>
                {typeof v === 'number' && !c.r ? (v === 0 && !x._z ? '' : money(v)) : v}
              </td>
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export { pick }
