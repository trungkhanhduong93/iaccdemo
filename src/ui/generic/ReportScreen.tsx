// Sổ, báo cáo chung: thanh lọc kỳ, trang báo cáo kiểu mẫu in, ô ký. Cửa hàng lấy trên thanh trên
import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { Col, ReportCfg, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { kieuGhiSo } from '../../app/plan'
import { cuaHangHienTai, donViHienTai, dsCuaHang, useSession, cheDoHienTai, gtgtTyLe } from '../../app/session'
import { canCu, type CheDo } from '../../app/che-do'
import { cachHkd, cauHinhBC, kyHieuBC, laHkd, tenBC, tenTkNh, type LoaiBC } from '../../modules/bao-cao/danh-sach'
import * as HKD from '../../modules/bao-cao/tt152'
import { dsTkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { CUA_HANG, HANG, HOM_NAY, KHACH, NCC, NVL, TK_NGAN_HANG } from '../../data/mock'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { BaoCaoDoRongCtx, Table, type DoRong } from '../Table'
import { between, k, money, pad, pick, rng } from '../format'
import { chungTu, soChiTiet } from './gen'
import { ganMoPhieu } from './SoChungTu'
import { Dropdown, MenuHead, MenuItem, MenuSep, Popover, Select } from '../Dropdown'
import { ChonKhoangNgay, dmy, khoangThang, type KhoangNgay } from '../ChonNgay'
import { BoLoc, useCauHinhLoc, useDongEsc, type OLocDef } from '../LocNangCao'
import { SoTrangCtx, ToGiay, NgatTrang, tachKhoi, type Kho } from '../bao-cao/ToGiay'
import { datNguonXuat, layNguonXuat, taoTenFile, xuatFile, type NguonXuat } from '../bao-cao/xuat'
import { ChonHaiCot } from '../ChonHaiCot'
import {
  useTrangThaiLoc, datLoc, datAnKhongPS, datCotNhuDangXem, datTuyChon, xoaLoc,
  datColsGoc, datDsKyMacDinh, datKyNhap, datKyMacDinh, xemBaoCao, useTuyChinhBC, bienDoiBang, luuTuyChinh,
  luuRongCotBC
} from '../bao-cao/tuyChinhBC'
import { layNguoiKy } from '../bao-cao/khoMauIn'
// @ts-ignore
import { TuyChinhBC } from '../bao-cao/TuyChinhBC.tsx'
import type { Session } from '../../app/session'
import { ganLocNguon } from '../../modules/bao-cao/loc-nguon'
import {
  thTT58,
  colsS1, rowsS1,
  colsS2a, rowsS2a,
  colsS3a, rowsS3a,
  colsS2b, rowsS2b,
  colsS2c, rowsS2c,
  colsS2d, rowsS2d,
  colsS3b, rowsS3b,
  colsS4a, rowsS4a,
  colsS4b, rowsS4b,
  colsS4c, rowsS4c,
  colsS4d, rowsS4d,
} from '../../modules/bao-cao/tt58'

export const KY_CHON: [string, string][] = [['9', 'Tháng 9/2026'], ['10', 'Tháng 10/2026 (đến 07/10)'], ['8', 'Tháng 8/2026']]

// Không tự sinh bộ lọc cho báo cáo tài chính (10.2.2, 10.2.3, 10.2.4, 10.2.5, 10.3.1) và tờ khai thuế (6.2.x): lọc dòng làm sai ý nghĩa số tổng
export const LOAI_TRU_TU_SINH = new Set(['10.2.2', '10.2.3', '10.2.4', '10.2.5', '10.3.1'])

/** Bộ lọc của trang báo cáo đang xem (ReportPaper dựng, ReportToolbar vẽ trên thanh ngang, T179) */
type BoLocTrang = { ds: BoLocMuc[]; anKhongPS: boolean }
const khoBoLoc = new Map<string, BoLocTrang>()
const ngheBoLoc = new Set<() => void>()

function datBoLoc(path: string, v: BoLocTrang) {
  const cu = khoBoLoc.get(path)
  if (cu && JSON.stringify(cu) === JSON.stringify(v)) return
  khoBoLoc.set(path, v)
  ngheBoLoc.forEach(f => f())
}

/** Chữ tìm nhanh trên bảng dữ liệu của trang báo cáo (ô tìm ở thanh công cụ, T179) */
const khoTim = new Map<string, string>()
const ngheTim = new Set<() => void>()
function datTim(path: string, v: string) { khoTim.set(path, v); ngheTim.forEach(f => f()) }
function useTim(path: string) {
  return useSyncExternalStore(f => { ngheTim.add(f); return () => { ngheTim.delete(f) } }, () => khoTim.get(path) ?? '')
}

/** Báo cáo mở từ Trung tâm báo cáo (state hoiLoc) chờ chọn điều kiện ở popup, bấm Xem báo cáo mới hiện tờ báo cáo (T288) */
const khoHoiLoc = new Set<string>()
const ngheHoiLoc = new Set<() => void>()
function datHoiLoc(path: string, bat: boolean) {
  if (khoHoiLoc.has(path) === bat) return
  if (bat) khoHoiLoc.add(path); else khoHoiLoc.delete(path)
  ngheHoiLoc.forEach(f => f())
}
function useHoiLoc(path: string) {
  return useSyncExternalStore(f => { ngheHoiLoc.add(f); return () => { ngheHoiLoc.delete(f) } }, () => khoHoiLoc.has(path))
}

function useBoLoc(path: string) {
  return useSyncExternalStore(
    f => { ngheBoLoc.add(f); return () => { ngheBoLoc.delete(f) } },
    () => khoBoLoc.get(path)
  )
}

export function ReportToolbar({ ky, setKy, children }: { ky: string; setKy: (v: string) => void; children?: ReactNode }) {
  // Số liệu báo cáo mẫu tính theo tháng, nên lấy tháng của ngày bắt đầu làm kỳ.
  const [khoang, setKhoang] = useState(() => khoangThang(Number(ky), 2026))
  const [moTuyChinh, setMoTuyChinh] = useState(false)
  const { s, toast } = useSession()
  const viTri = useLocation()
  const path = viTri.pathname
  const nav = useNavigate()
  const slug = useParams().slug?.replace(/-/g, '.')
  const cfgBC = cauHinhBC(slug)
  // Mở từ Trung tâm báo cáo: bật popup lọc trước khi hiện báo cáo; mở thẳng đường dẫn, tải lại trang thì hiện ngay (T288)
  const hoiLoc = useHoiLoc(path)
  // Đang gom nhóm (Tuỳ chỉnh › Gom nhóm): chọn xem Tổng hợp hay Chi tiết ngay trên thanh, lưu cùng tuỳ chỉnh báo cáo (T289)
  const tcBC = useTuyChinhBC(s.donVi, slug)
  const coNhom = !cfgBC?.khoa && (tcBC?.nhom?.filter(Boolean).length ?? 0) > 0
  const xemNhom = tcBC?.xemNhom ?? 'chiTiet'
  const doiXemNhom = (v: 'tongHop' | 'chiTiet') => { if (slug && tcBC) luuTuyChinh(s.donVi, slug, { ...tcBC, xemNhom: v }) }
  useLayoutEffect(() => {
    if (!(viTri.state as { hoiLoc?: boolean } | null)?.hoiLoc) return
    datHoiLoc(path, true)
    return () => datHoiLoc(path, false)
  }, [viTri.key])   // eslint-disable-line react-hooks/exhaustive-deps
  const loaiBC = cfgBC?.loai ?? 'baocao'
  const tt = useTrangThaiLoc(path)
  const boLoc = useBoLoc(path)
  const tim = useTim(path)
  const [timNhap, setTimNhap] = useState(tim)

  useEffect(() => { setTimNhap(tim) }, [path, tim])

  // Khởi tạo kỳ mặc định vào kho
  useEffect(() => {
    if (ky) {
      datKyMacDinh(path, ky)
    }
  }, [ky, path])

  // Tờ giấy (ToGiay) nghe sự kiện này để in đúng các trang đang xem
  const inBaoCao = () => window.dispatchEvent(new CustomEvent('bc-in'))
  // Nút In mở bản xem trước khi in (khổ, zoom, In thật nằm trong đó, T179)
  const xemTruocIn = () => window.dispatchEvent(new CustomEvent('bc-xem-in'))

  // Đồng bộ kỳ khi đã xem thay đổi (từ nút Lọc hoặc Enter)
  useEffect(() => {
    if (tt.daXem.ky && tt.daXem.ky !== ky) {
      setKy(tt.daXem.ky)
    }
  }, [tt.daXem.ky, ky, setKy])

  useEffect(() => {
    const thang = Number(tt.daXem.ky || ky)
    if (thang && khoang.tu.getMonth() + 1 !== thang) {
      setKhoang(khoangThang(thang, 2026))
    }
  }, [tt.daXem.ky, ky])

  const doiKhoang = (k: KhoangNgay) => {
    setKhoang(k)
    datKyNhap(path, String(k.tu.getMonth() + 1))
  }

  const apDungXem = () => {
    datTim(path, timNhap)
    xemBaoCao(path)
    setKy(tt.nhap.ky)
  }

  const xoaNhap = () => {
    xoaLoc(path)
    setTimNhap('')
  }

  // Báo cáo tài chính, tờ khai chỉ có Khoảng ngày; 6.2.x có `cfg.loc` khai tay thì vẫn giữ ô lọc
  const khongCoLocDong = Boolean((slug && LOAI_TRU_TU_SINH.has(slug)) || loaiBC === 'tokhai' || (slug && slug.startsWith('6.2.'))) && !boLoc?.ds.length && !boLoc?.anKhongPS

  // Xây dựng các ô lọc theo kiểu danh sách chứng từ (T237)
  const oLoc: OLocDef[] = useMemo(() => {
    const res: OLocDef[] = [
      {
        k: 'khoangNgay',
        ten: 'Khoảng ngày',
        o: <ChonKhoangNgay value={khoang} onChange={doiKhoang} />,
      },
    ]

    // Bỏ ô Tìm trong báo cáo (T508)
    if (khongCoLocDong) return res

    for (const l of boLoc?.ds ?? []) {
      const opts = (tt.tuyChon[l.k] && tt.tuyChon[l.k].length > 0) ? tt.tuyChon[l.k] : (l.ds ?? [])
      if (l.kieu === 'chon') {
        res.push({
          k: l.k,
          ten: l.nhan,
          o: (
            <Select
              className="ds-o-sel"
              value={tt.nhap.loc[l.k]?.[0] ?? ''}
              aria-label={l.nhan}
              onChange={e => datLoc(path, l.k, e.target.value ? [e.target.value] : [])}
            >
              <option value="">Tất cả</option>
              {opts.map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
          ),
        })
      } else {
        res.push({
          k: l.k,
          ten: l.nhan,
          o: (
            <DropdownChonNhieu
              nhan={l.nhan}
              opts={opts}
              daChon={tt.nhap.loc[l.k] ?? []}
              onDoi={vals => datLoc(path, l.k, vals)}
            />
          ),
        })
      }
    }

    if (boLoc?.anKhongPS) {
      res.push({
        k: 'anKhongPS',
        ten: 'Ẩn dòng không phát sinh',
        o: (
          <Select
            className="ds-o-sel"
            value={tt.nhap.anKhongPS ? 'an' : ''}
            aria-label="Ẩn dòng không phát sinh"
            onChange={e => datAnKhongPS(path, e.target.value === 'an')}
          >
            <option value="">Tất cả</option>
            <option value="an">Ẩn không phát sinh</option>
          </Select>
        ),
      })
    }

    return res
  }, [khoang, timNhap, khongCoLocDong, boLoc, tt.nhap, tt.tuyChon, path])

  const oDauTienKhaiTay = cfgBC?.loc?.find(l => !l.cheDo || l.cheDo.includes(s.cheDo))
  const macDinhNgoai = useMemo(() => {
    if (khongCoLocDong) return ['khoangNgay']
    return ['khoangNgay', ...(oDauTienKhaiTay ? [oDauTienKhaiTay.k] : [])]
  }, [khongCoLocDong, oDauTienKhaiTay])

  const dsKhoa = useMemo(() => oLoc.map(o => o.k), [oLoc])
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, dsKhoa, macDinhNgoai)

  const soLoc = (boLoc?.ds ?? []).filter(l => (tt.loc[l.k] ?? []).length > 0).length + (boLoc?.anKhongPS && tt.anKhongPS ? 1 : 0)
  const dangLoc = soLoc > 0 || Boolean(tim.trim())
  const khacNhap = tt.coThayDoi || timNhap !== tim

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

  // Thanh lọc báo cáo kiểu danh sách chứng từ (T237)
  const thanh = (
    <div className="thanh-loc bc-thanh-cong-cu">
      {coNhom && (
        <div className="seg bc-xem-nhom" role="tablist" aria-label="Kiểu xem nhóm">
          {([['tongHop', 'Tổng hợp'], ['chiTiet', 'Chi tiết']] as const).map(([k, ten]) => (
            <button key={k} type="button" role="tab" aria-selected={xemNhom === k} className={xemNhom === k ? 'on' : ''}
              title={k === 'tongHop' ? 'Mỗi nhóm một dòng, cộng các cột số' : 'Đủ dòng chi tiết trong từng nhóm'} onClick={() => doiXemNhom(k)}>{ten}</button>
          ))}
        </div>
      )}
      <BoLoc
        ds={oLoc}
        cauHinh={cauHinhLoc}
        datCauHinh={datCauHinhLoc}
        dangLoc={dangLoc}
        khacNhap={khacNhap}
        onLoc={apDungXem}
        onXoaHet={xoaNhap}
        anNangCao={khongCoLocDong}
        nhanXoa="Xoá lọc"
        truocNutLoc={children}
      />
      <div className="ds-thanh-phai thanh-loc-phai">
        <button
          type="button"
          className="btn sm"
          title="Tuỳ chỉnh"
          onClick={() => setMoTuyChinh(true)}
        >
          <Icon n="cog" kieu="net" className="ic sm" />
          <span className="rpt-btn-txt">Tuỳ chỉnh</span>
        </button>
        <Dropdown
          btnClass="nut-vuong ds-nut-excel"
          align="end"
          width={180}
          title="Xuất báo cáo"
          label={<Icon n="download" className="ic sm" />}
        >
          {dong => (
            <>
              <MenuHead>Tuỳ chọn cột</MenuHead>
              <MenuItem on={tt.cotNhuDangXem} onClick={() => datCotNhuDangXem(path, !tt.cotNhuDangXem)}>
                Cột như đang xem
              </MenuItem>
              <MenuSep />
              <MenuHead>Xuất báo cáo</MenuHead>
              <MenuItem icon="tep-bang" onClick={() => { dong(); xuat('xlsx') }}>Excel (.xlsx)</MenuItem>
              <MenuItem icon="tep-chu" onClick={() => { dong(); xuat('csv') }}>CSV (.csv)</MenuItem>
              <MenuItem icon="in-gon" onClick={() => { dong(); inPdf() }}>PDF (hộp in)</MenuItem>
              <MenuItem icon="tep-ma" onClick={() => { dong(); xuat('html') }}>HTML (.html)</MenuItem>
              <MenuItem icon="tep-ma" onClick={() => { dong(); xuat('xml') }}>XML (.xml)</MenuItem>
            </>
          )}
        </Dropdown>
        <button
          type="button"
          className="btn sm"
          title="Xem trước khi in"
          onClick={xemTruocIn}
        >
          <Icon n="in-gon" className="ic sm" />
          In
        </button>
      </div>
    </div>
  )

  // Bấm Xem báo cáo: áp dụng lọc, bỏ cờ trên lịch sử để quay lại, tải lại trang không hỏi lại (T288)
  const xemTuPopup = () => {
    apDungXem()
    datHoiLoc(path, false)
    nav(path + viTri.search, { replace: true, state: { ...(viTri.state as object | null), hoiLoc: false } })
  }

  return (
    <>
      {thanh}
      {hoiLoc && <HopHoiLoc ten={(slug && tenBC(slug, s.cheDo)) || ''} ds={oLoc} onXem={xemTuPopup} onHuy={() => nav(-1)} />}
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

/** Popup điều kiện lọc trước khi xem báo cáo (T288): đủ các ô lọc của báo cáo, không chia ngoài thanh, nâng cao */
function HopHoiLoc({ ten, ds, onXem, onHuy }: { ten: string; ds: OLocDef[]; onXem: () => void; onHuy: () => void }) {
  useDongEsc(onHuy)
  return createPortal(
    <div className="overlay ds-hop-nen">
      <div className="ds-hop bc-hoi-loc" role="dialog" aria-modal="true" aria-label="Điều kiện xem báo cáo">
        <div className="ds-hop-dau"><b>Điều kiện xem báo cáo</b><span className="grow" />
          <button type="button" className="btn ghost sm" title="Đóng" onClick={onHuy}><Icon n="x" className="ic sm" /></button></div>
        {ten && <div className="bc-hoi-loc-ten">{ten}</div>}
        <div className="bc-hoi-loc-than">
          {ds.map(o => <div key={o.k} className="bc-hoi-loc-o"><span>{o.ten}</span><div className="ds-o">{o.o}</div></div>)}
        </div>
        <div className="ds-chan">
          <button type="button" className="btn" onClick={onHuy}>Huỷ</button>
          <button type="button" className="btn pri" onClick={onXem}>Xem báo cáo</button>
        </div>
      </div>
    </div>,
    document.body,
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
  if (loai === 'bctc') return [lap, ktt, ddpl]
  if (loai === 'baocao') return [{ chucDanh: 'Người lập', goiY: '(Ký, họ tên)', hoTen: 'Lê Quốc Bảo' }, ktt]
  return [lap, ktt, ddpl]
}

interface BoLocMuc {
  k: string
  nhan: string
  kieu: 'chon' | 'chonNhieu'
  ds?: string[]
}

function DropdownChonNhieu({
  nhan,
  opts,
  daChon,
  onDoi,
}: {
  nhan?: string
  opts: string[]
  daChon: string[]
  onDoi: (vals: string[]) => void
}) {
  return (
    <ChonHaiCot
      ds={opts}
      value={daChon}
      onChange={onDoi}
      nhan={nhan ?? 'Bộ lọc'}
      goiY="Tất cả"
      btnClass="sel ds-o-sel bc-chc-btn"
    />
  )
}

/** Bảng ánh xạ tiêu đề cột hoặc khoá cột → tên danh mục trong src/modules/danh-muc/index.ts (T68).
 *  Các mục có màn danh mục tương ứng được giữ lại:
 *  - 1.1: Tài khoản
 *  - 1.2: Hàng hoá (Hàng hoá / Nguyên vật liệu / Món)
 *  - 1.3: Đơn vị tính
 *  - 1.5: Đối tượng (Khách hàng / Nhà cung cấp / Đối tượng)
 *  - 1.8: Kho
 *  - cua-hang: Cửa hàng
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

  // Cửa hàng (slug cua-hang)
  {
    nhom: 'cuahang',
    ten: 'Cửa hàng',
    laMa: false,
    khopKhoa: ['cn', 'cuahang', 'chinhanh'],
    khopTieuDe: ['Cửa hàng', 'Tên cửa hàng'],
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

  // 1.3 Đơn vị tính không tự sinh bộ lọc (T508)

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
  const kyHieu = cfg ? kyHieuBC(slug, s.cheDo, s) : cd.ma !== 'TT152' ? mau : undefined
  const loai: LoaiBC = cfg?.loai ?? 'baocao'
  const khoMacDinh = kho ?? cfg?.kho ?? tuDoanKho(children)
  const [khoHienTai, setKhoHienTai] = useState<Kho>(khoMacDinh)
  const layHtmlRef = useRef<(() => string) | null>(null)

  const tc = useTuyChinhBC(s.donVi, slug)
  const tt = useTrangThaiLoc(path)
  const hoiLoc = useHoiLoc(path)

  const [tamRong, setTamRong] = useState<Record<string, number>>({})

  useEffect(() => {
    setTamRong({})
  }, [slug])

  const doRongLuu = useMemo(() => {
    const res: Record<string, number> = {}
    if (tc?.cot) {
      for (const c of tc.cot) {
        if (typeof c.rong === 'number') res[c.k] = c.rong
      }
    }
    return res
  }, [tc?.cot])

  const doRongGt = useMemo(() => ({ ...doRongLuu, ...tamRong }), [doRongLuu, tamRong])

  const doRongBC: DoRong = useMemo(() => ({
    gt: doRongGt,
    dat: (k: string, w: number) => {
      setTamRong(prev => ({ ...prev, [k]: w }))
    },
    xong: (k: string, w: number) => {
      setTamRong(prev => {
        const moi = { ...prev }
        delete moi[k]
        return moi
      })
      if (slug) {
        const khoi = tachKhoi(children)
        const bang1 = khoi.find((x): x is Extract<typeof x, { loai: 'bang' }> => x.loai === 'bang')
        luuRongCotBC(s.donVi, slug, k, w, bang1?.cols)
      }
    },
  }), [doRongGt, slug, s.donVi, children])

  const khongTuSinh = (slug && LOAI_TRU_TU_SINH.has(slug)) || loai === 'tokhai' || (slug && slug.startsWith('6.2.'))

  // Danh sách bộ lọc cho cột lọc bên trái: bộ lọc khai tay trong cfg.loc đứng trước, sau đó tự sinh theo danh mục
  const dsLocCot = useMemo(() => {
    const res: BoLocMuc[] = []
    const daCo = new Set<string>()

    // 1. Khai tay trong cfg.loc
    for (const l of cfg?.loc ?? []) {
      if (l.cheDo && !l.cheDo.includes(s.cheDo)) continue   // bộ lọc chỉ có ở một số chế độ, vd Kênh bán của sổ doanh thu TT152 (T179)
      res.push({
        k: l.k,
        nhan: l.nhan,
        kieu: l.kieu,
        ds: l.ds ? l.ds(cuaHangHienTai(s)?.id) : undefined,
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

          // Mỗi nhóm danh mục chỉ tạo MỘT bộ lọc; bỏ bộ lọc cấu hình báo cáo khai trong boTuSinh (T214)
          for (const [, list] of nhomCols) {
            if (res.some(r => r.nhan === list[0].quyTac.ten) || cfg?.boTuSinh?.includes(list[0].quyTac.ten)) continue

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
  }, [cfg?.loc, cfg?.boTuSinh, khongTuSinh, children, s])

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
          const vals = l.ds ? l.ds(cuaHangHienTai(s)?.id) : [...new Set(dongCT.map(r => String(r[l.k] ?? '')).filter(Boolean))].sort()
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
        anKhongPS: !!cfg?.anKhongPS && tt.anKhongPS,   // mặc định ẩn, chỉ áp cho báo cáo có tuỳ chọn này (T508)
        nhom: tc?.nhom,
        tongHop: tc?.xemNhom === 'tongHop',
        cot: tc?.cot,
        tinhLaiTong,
        khoa,
      })
      // Nguồn xuất: bỏ cột chỉ dành cho màn hình (T304)
      if (tt.cotNhuDangXem) {
        bx.push({ cols: res.cols.filter(c => !c.chiManHinh), rows: res.rows, kyHieuCot })
      } else {
        // Tắt "Cột như đang xem": xuất đủ cột (vẫn áp lọc và nhóm)
        const resDuCot = bienDoiBang(kh.cols, kh.rows, {
          loc: tt.loc,
          anKhongPS: !!cfg?.anKhongPS && tt.anKhongPS,
          nhom: tc?.nhom,
          tongHop: tc?.xemNhom === 'tongHop',
          cot: undefined,
          tinhLaiTong,
          khoa,
        })
        bx.push({ cols: resDuCot.cols.filter(c => !c.chiManHinh), rows: resDuCot.rows, kyHieuCot })
      }
      return <RptTable key={i} cols={ganMoPhieu(res.cols)} rows={res.rows} onRow={kh.onRow} kyHieuCot={kyHieuCot} />   // số chứng từ bấm mở phiếu (T201)
    })

    return { thanBienDoi: thanMoi, bangXuat: bx }
  }, [children, tt.loc, tt.anKhongPS, tt.cotNhuDangXem, tc?.nhom, tc?.xemNhom, tc?.cot, loai, cfg?.congCot, cfg?.khoa, kyHieuCot, slug])

  // Dựng NguonXuat cho chức năng xuất file
  useEffect(() => {
    const nx: NguonXuat = {
      ma: slug,
      tieuDe: tenBC(slug, s.cheDo, s) ?? title,
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

  const cn = cuaHangHienTai(s)
  const { subLines, periodText } = tachSub(sub)
  // Đầu bảng dữ liệu: tên báo cáo, một dòng phụ (cửa hàng hoặc địa điểm kinh doanh, kỳ) căn giữa (T179)
  const timBang = useTim(path)
  const coDiaDiem = subLines.some(l => /địa điểm|cửa hàng/i.test(l))   // dòng phụ đã ghi cửa hàng, địa điểm thì không thêm
  const dongPhuBang = [coDiaDiem ? '' : `Cửa hàng: ${cn ? cn.ten : 'Tất cả cửa hàng'}`, ...subLines, (periodText ?? '').replace(/ Năm /, ' năm ')].filter(Boolean).join(', ')
  const dauBang = (
    <>
      <div className="bc-bang-tieu-de">{tenBC(slug, s.cheDo, s) ?? title}</div>
      {dongPhuBang && <div className="bc-bang-phu">{dongPhuBang}</div>}
    </>
  )
  // Điều kiện lọc đang áp in trên tờ dưới dòng kỳ, để tờ in, file xuất biết sổ đang bị lọc (T179)
  const dongLoc = [
    ...dsLocCot.filter(l => (tt.loc[l.k] ?? []).length > 0).map(l => `${l.nhan}: ${tt.loc[l.k].join(', ')}`),
    ...(cfg?.anKhongPS && tt.anKhongPS ? ['Ẩn dòng không phát sinh'] : []),
  ].join('; ')

  const dau = (
    <>
      <div className="paper-h">
        <div className="paper-dv-trai">
          <div className="paper-ten-dv">{dv.ten}</div>
          <div className="paper-dc-mst">{dv.diaChi}{dv.mst ? ` — MST: ${dv.mst}` : ''}</div>
          <div className="paper-dv-cs">Cửa hàng: {cn ? cn.ten : 'Tất cả cửa hàng'}</div>
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
        <h2 className="paper-tieu-de">{tenBC(slug, s.cheDo, s) ?? title}</h2>
        {subLines.map((line, i) => (
          <div key={i} className="paper-dong-phu">{line}</div>
        ))}
        {periodText && <div className="paper-dong-ky">{periodText}</div>}
        {dongLoc && <div className="paper-dong-phu paper-dong-loc">{dongLoc}</div>}
      </div>
      {/* Đơn vị tính sát trên bảng, căn phải như sổ in (T179) */}
      <div className="paper-dvt paper-dvt-bang">Đơn vị tính: đồng</div>
    </>
  )
  const cuoi = ky ? <KhoiCuoi loai={loai} cheDo={s.cheDo} nguoiDaiDien={dv.nguoiDaiDien} dsKy={dsKy} /> : undefined
  useLayoutEffect(() => {
    datBoLoc(path, { ds: dsLocCot, anKhongPS: !!cfg?.anKhongPS })
  }, [path, dsLocCot, cfg?.anKhongPS])

  // Đang chờ chọn điều kiện ở popup: chưa vẽ tờ báo cáo; bộ lọc vẫn dựng ở trên để popup có lựa chọn (T288)
  if (hoiLoc) return <div className="bc-xem bc-cho-loc"><Icon n="filter" className="ic" /><span>Chọn điều kiện lọc rồi bấm Xem báo cáo</span></div>

  return (
    <BaoCaoDoRongCtx.Provider value={doRongBC}>
      <div className="bc-xem">
        <ToGiay dau={dau} than={thanBienDoi} cuoi={cuoi} khoMacDinh={khoMacDinh} dieuKienLoc={dongLoc || undefined} dauBang={dauBang} tim={timBang}
          kyHieuCot={kyHieuCot} congChuyen={loai === 'so' ? cfg?.congCot : undefined}
          onKho={setKhoHienTai} layHtmlRef={layHtmlRef} coChu={tc?.coChu} xemTrang={cfg?.phanTrang} />
      </div>
    </BaoCaoDoRongCtx.Provider>
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
  kh: KHACH, ncc: NCC, hang: HANG, nvl: NVL, cn: CUA_HANG.map(c => ({ ma: c.id.toUpperCase(), ten: c.ten })),
  tk: [['1111', 'Tiền mặt'], ['1121', 'Tiền gửi ngân hàng'], ['131', 'Phải thu của khách hàng'], ['1331', 'Thuế GTGT được khấu trừ'], ['152', 'Nguyên liệu, vật liệu'],
    ['156', 'Hàng hoá'], ['211', 'Tài sản cố định'], ['242', 'Chi phí trả trước'], ['331', 'Phải trả cho người bán'], ['33311', 'Thuế GTGT đầu ra'],
    ['334', 'Phải trả người lao động'], ['411', 'Vốn đầu tư của chủ sở hữu'], ['421', 'Lợi nhuận chưa phân phối'], ['511', 'Doanh thu bán hàng'], ['632', 'Giá vốn hàng bán'], ['642', 'Chi phí quản lý kinh doanh']].map(([ma, ten]) => ({ ma, ten })),
  ts: [['TS001', 'Hệ thống bếp công nghiệp Lê Lợi'], ['TS002', 'Tủ đông 1.500 lít'], ['TS003', 'Máy pha cà phê La Marzocco'], ['TS004', 'Hệ thống điều hoà Thảo Điền'], ['TS005', 'Xe tải giao hàng 1,5 tấn']].map(([ma, ten]) => ({ ma, ten })),
  ccdc: [['CCDC0001', 'Bộ nồi inox 50 lít'], ['CCDC0002', 'Bàn ghế gỗ khu ngoài trời'], ['CCDC0003', 'Máy POS cầm tay'], ['CCDC0004', 'Máy xay sinh tố công nghiệp'], ['CCDC0005', 'Dao thớt bếp trọn bộ']].map(([ma, ten]) => ({ ma, ten })),
}

export function ReportScreen({ sc, mod }: ScreenProps) {
  const { s } = useSession()
  const [ky, setKy] = useState('9')
  const cfg: ReportCfg = sc.report ?? { kieu: 'tonghop', doiTuong: 'tk' }
  const ten = tenMan(sc)
  const path = useLocation().pathname
  const { loc, daXem } = useTrangThaiLoc(path)
  const kyDaXem = daXem?.ky ?? ky
  const thang = Number(kyDaXem)
  const cn = cfg.theoCn ? cuaHangHienTai(s) : undefined
  const body = useMemo(() => renderReport(cfg, sc.code ?? sc.slug, thang, s.cheDo, cn?.id, loc, s), [cfg, kyDaXem, sc, s.cheDo, cn, loc, s])
  // Dòng dưới tiêu đề ghi cửa hàng (theo thanh trên) và quỹ đang lọc (T54)
  // Sổ hộ kinh doanh TT152 ghi địa điểm kinh doanh như iFaster; S2d thêm tên mặt hàng (T179)
  const ma = sc.code ?? sc.slug
  const soHkd = s.cheDo === 'TT152' && laHkd(s) && ['3.2.5', '10.4.1', '5.2.8'].includes(ma)
  const matHangSo = HKD.matHangS2d(loc.hang, loc.nhomHang)   // S2d ghi tên mặt hàng đang xem dưới tiêu đề
  const diaDiem = cn?.ten ?? dsCuaHang(s).find(c => c.id === s.ttDv?.[s.donVi]?.cnChinh)?.ten ?? donViHienTai(s).ten
  const sub = soHkd
    ? `Địa điểm kinh doanh: ${diaDiem}${ma === '5.2.8' ? ` · Tên vật liệu, dụng cụ, sản phẩm, hàng hoá: ${matHangSo.ten}` : ''} · ${kyTen(kyDaXem)}`
    : (ma === '5.2.8' && s.cheDo === 'TT58')
    ? `${kyTen(kyDaXem)} · Tên vật liệu, dụng cụ, sản phẩm, hàng hoá: ${NVL[0].ten} · Kho: ${cn ? cn.ten : CUA_HANG[0].ten}`
    : (cfg.theoCn ? `${kyTen(kyDaXem)} · ${cn ? 'Cửa hàng ' + cn.ngan : 'Tất cả cửa hàng'}${loc.locQuy?.[0] ? ' · ' + loc.locQuy[0] : ''}` : kyTen(kyDaXem))
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

/** Gộp sổ của nhiều cửa hàng: xếp theo ngày, thêm cột cửa hàng, tính lại số dư luỹ kế */
export function gopSo(phan: { cn: string; mo: number; rows: Row[]; tn: number; tc: number }[]) {
  const mo = phan.reduce((a, p) => a + p.mo, 0)
  const ngay = (x: Row) => Number(String(x.ngay).slice(0, 2))
  const rows = phan.flatMap(p => p.rows.map((x): Row => ({ ...x, cn: p.cn }))).sort((a, b) => ngay(a) - ngay(b))
  let du = mo
  for (const x of rows) { du += (x.no ?? 0) - (x.co ?? 0); x.du = du }
  return { mo, rows, tn: phan.reduce((a, p) => a + p.tn, 0), tc: phan.reduce((a, p) => a + p.tc, 0), cuoi: du }
}

export function renderReport(cfg: ReportCfg, seed: string, thang: number, cd: CheDo, cn?: string, loc: Record<string, string[]> = {}, session?: Session): ReactNode {
  if (cd === 'TT58') {
    const th = thTT58(session?.ppGtgt, session?.ppTndn)
    if (seed === '3.2.5') {
      if (th === 1) return <RptTable cols={colsS1} rows={rowsS1(thang)} kyHieuCot="chuSo" />
      if (th === 2) return <RptTable cols={colsS2a} rows={rowsS2a(thang)} kyHieuCot="chuSo" />
      if (th === 3) return <RptTable cols={colsS3a} rows={rowsS3a(thang)} kyHieuCot="chuSo" />
      return <div className="note muted">Phương pháp nộp thuế hiện tại không mở sổ 3.2.5.</div>
    }
    if (seed === '10.4.1') return <RptTable cols={colsS2b} rows={rowsS2b(thang)} kyHieuCot="chuSo" />
    if (seed === '5.2.8') return <RptTable cols={colsS2c} rows={rowsS2c(thang)} kyHieuCot="chuSo" />
    if (seed === '2.2.7') return <RptTable cols={colsS2d} rows={rowsS2d(thang)} kyHieuCot="chuSo" />
    if (seed === '6.2.4') return <RptTable cols={colsS3b} rows={rowsS3b(thang)} kyHieuCot="chuSo" />
    if (seed === '2.2.5') return <RptTable cols={colsS4a} rows={rowsS4a(thang)} kyHieuCot="chuSo" />
    if (seed === '7.2.1') return <RptTable cols={colsS4b} rows={rowsS4b(thang)} kyHieuCot="chuSo" />
    if (seed === '6.2.5') return <RptTable cols={colsS4c} rows={rowsS4c(thang)} kyHieuCot="chuSo" />
    if (seed === '10.4.2') return <RptTable cols={colsS4d} rows={rowsS4d(thang)} kyHieuCot="chuSo" />
  }
  // Bộ sổ hộ kinh doanh TT152 theo mẫu iFaster (T179)
  if (cd === 'TT152' && laHkd(session)) {
    const c = cachHkd(session)
    if (seed === '3.2.5') {
      const kenh = loc.kenh ?? []   // bộ lọc Kênh bán
      if (c === 'n1') return <RptTable cols={HKD.colsS1a} rows={HKD.rowsS1a(thang, kenh)} />
      if (c === 'doanhThu') return <RptTable cols={HKD.colsS2a} rows={HKD.rowsS2a(thang, kenh)} />
      return <RptTable cols={HKD.colsS2b} rows={HKD.rowsS2b(thang, kenh)} />
    }
    if (seed === '10.4.1') return <RptTable cols={HKD.colsS2c} rows={HKD.rowsS2c(thang, session?.ttDv?.[session.donVi]?.nhom)} />
    if (seed === '5.2.8') return <RptTable cols={HKD.colsS2d} rows={HKD.rowsS2d(thang, loc.hang, loc.nhomHang)} />
    if (seed === '2.2.7') return <RptTable cols={HKD.colsS2e} rows={HKD.rowsS2e(thang, loc.quy)} />
  }
  const r = rng(seed + thang)
  // Sổ, báo cáo theo cửa hàng: mỗi cửa hàng một hạt giống riêng, xem tất cả thì cộng các cửa hàng.
  // Bộ lọc Quỹ tiền (T54) chọn lại phần được cộng, nên tồn đầu, tồn cuối đúng với lựa chọn
  const chonQuy = loc.locQuy?.[0]
  const dsCn = cfg.theoCn ? CUA_HANG.filter(c => !cn || c.id === cn) : []
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
    const cols: Col[] = [{ k: 'ngay', t: 'Ngày', w: 92 }, { k: 'so', t: 'Số chứng từ', cls: 'code', w: 130 }, ...(gop ? [{ k: 'cn', t: 'Cửa hàng', w: 110 } as Col] : []),
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
    if (cfg.cols && cfg.rows) {
      // Báo cáo bán hàng (T450): GTGT theo % doanh thu bỏ cột thuế GTGT, hiện Giảm thuế GTGT; khấu trừ thì ngược lại
      const tyLe = Boolean(cfg.theoGtgt && session && gtgtTyLe(session))
      const cols = (cfg.theoGtgt ? cfg.cols.filter(c => tyLe ? c.k !== 'thue' && c.k !== 'vat' : c.k !== 'giamThue') : cfg.cols)
        .filter(c => !c.goi || !session || c.goi.includes(session.goi))   // cột theo gói (T502)
      return <RptTable cols={cols} rows={ganLocNguon(cfg.rows(thang, CUA_HANG.find(c => c.id === cn)?.ten, loc, tyLe), loc)} />
    }
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
  return cols.map(c => c.kyHieu ? c.kyHieu : (kieu === 'chuSo' && !c.num ? String.fromCharCode(65 + chu++) : String(++so)))
}

/** Bảng in kiểu báo cáo: dòng _b in đậm, _t dòng tổng */
export function RptTable({ cols, rows, onRow, kyHieuCot, colWidths }: { cols: Col[]; rows: Row[]; onRow?: (r: Row) => void; kyHieuCot?: KyHieuCot; colWidths?: number[] }) {
  const coNhom = cols.some(c => c.nhom)

  const hangNhom1 = useMemo(() => {
    if (!coNhom) return null
    const res: { key: string; t: string; colSpan?: number; rowSpan?: number; w?: number | string }[] = []
    let i = 0
    while (i < cols.length) {
      const c = cols[i]
      if (!c.nhom) {
        res.push({
          key: c.k,
          t: c.t,
          rowSpan: 2,
          w: colWidths ? `${colWidths[i]}%` : c.w,
        })
        i++
      } else {
        const nhom = c.nhom
        let j = i + 1
        while (j < cols.length && cols[j].nhom === nhom) {
          j++
        }
        res.push({
          key: `nhom-${i}`,
          t: nhom,
          colSpan: j - i,
        })
        i = j
      }
    }
    return res
  }, [cols, coNhom, colWidths])

  const hangNhom2 = useMemo(() => {
    if (!coNhom) return null
    return cols.map((c, i) => ({ c, i })).filter(x => x.c.nhom)
  }, [cols, coNhom])

  return (
    <table className="rpt">
      {colWidths && (
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={cols[i]?.k ?? i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
      )}
      <thead>
        {coNhom && hangNhom1 ? (
          <>
            <tr>
              {hangNhom1.map(o => (
                <th
                  key={o.key}
                  colSpan={o.colSpan}
                  rowSpan={o.rowSpan}
                  style={o.w ? { width: o.w } : undefined}
                >
                  {o.t}
                </th>
              ))}
            </tr>
            <tr>
              {hangNhom2?.map(({ c, i }) => (
                <th
                  key={c.k}
                  style={colWidths ? { width: `${colWidths[i]}%` } : c.w ? { width: c.w } : undefined}
                >
                  {c.t}
                </th>
              ))}
            </tr>
          </>
        ) : (
          <tr>
            {cols.map((c, i) => (
              <th
                key={c.k}
                style={colWidths ? { width: `${colWidths[i]}%` } : c.w ? { width: c.w } : undefined}
              >
                {c.t}
              </th>
            ))}
          </tr>
        )}
        {kyHieuCot && (
          <tr className="rpt-ky-hieu">
            {kyHieuCac(cols, kyHieuCot).map((x, i) => (
              <th key={cols[i].k}>{x}</th>
            ))}
          </tr>
        )}
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
