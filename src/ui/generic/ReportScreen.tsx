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
import { LocO, ThanhLoc } from '../ThanhLoc'
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

export function ReportToolbar({ ky, setKy, children }: { ky: string; setKy: (v: string) => void; children?: ReactNode }) {
  // Số liệu báo cáo mẫu tính theo tháng, nên lấy tháng của ngày bắt đầu làm kỳ.
  const [khoang, setKhoang] = useState(() => khoangThang(Number(ky), 2026))
  const [moTuyChinh, setMoTuyChinh] = useState(false)
  const { s, toast } = useSession()
  const path = useLocation().pathname
  const slug = useParams().slug?.replace(/-/g, '.')
  const cfg = cauHinhBC(slug)
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

  const dangLoc = Object.keys(tt.loc).some(k => (tt.loc[k] ?? []).length > 0) || tt.anKhongPS
  const dsLoc = cfg?.loc ?? []

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
        boLoc={
          <>
            {dsLoc.map(l => {
              const opts = tt.tuyChon[l.k] ?? []
              if (l.kieu === 'chon') {
                const val = tt.loc[l.k]?.[0] ?? ''
                return (
                  <LocO key={l.k} nhan={l.nhan}>
                    <Select
                      className="inp"
                      value={val}
                      onChange={e => datLoc(path, l.k, e.target.value ? [e.target.value] : [])}
                    >
                      <option value="">Tất cả</option>
                      {opts.map(v => <option key={v} value={v}>{v}</option>)}
                    </Select>
                  </LocO>
                )
              }
              const daChon = tt.loc[l.k] ?? []
              const nhanNut = daChon.length === 0 ? 'Tất cả' : `${daChon.length} đã chọn`
              return (
                <LocO key={l.k} nhan={l.nhan}>
                  <Dropdown label={nhanNut} btnClass="inp" width={220}>
                    {() => (
                      <>
                        <MenuItem on={daChon.length === 0} onClick={() => datLoc(path, l.k, [])}>
                          Tất cả
                        </MenuItem>
                        <MenuSep />
                        {opts.map(v => {
                          const on = daChon.includes(v)
                          return (
                            <MenuItem
                              key={v}
                              on={on}
                              onClick={() => {
                                const moi = on ? daChon.filter(x => x !== v) : [...daChon, v]
                                datLoc(path, l.k, moi)
                              }}
                            >
                              {v}
                            </MenuItem>
                          )
                        })}
                      </>
                    )}
                  </Dropdown>
                </LocO>
              )
            })}
            {cfg?.anKhongPS && (
              <LocO nhan="Dòng số liệu">
                <label className="bc-loc-gat" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, height: 34 }}>
                  <input
                    type="checkbox"
                    checked={tt.anKhongPS}
                    onChange={e => datAnKhongPS(path, e.target.checked)}
                  />
                  Ẩn dòng không phát sinh
                </label>
              </LocO>
            )}
            {children}
          </>
        }
        phai={
          <>
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
      }
    }
  }, [children, path, cfg, ky, loai, s.cheDo, dv.nguoiDaiDien])

  // Biến đổi các khối bảng cho thân tờ giấy và nguồn xuất
  const { thanBienDoi, bangXuat } = useMemo(() => {
    const khoi = tachKhoi(children)
    const tinhLaiTong = loai === 'baocao' || (loai === 'so' && !cfg?.congCot)
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
  }, [children, tt.loc, tt.anKhongPS, tt.cotNhuDangXem, tc?.nhom, tc?.cot, loai, cfg?.congCot, cfg?.khoa, kyHieuCot])

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

  const dau = (
    <>
      <div className="paper-h">
        <div><b>Đơn vị: {dv.ten}</b><br />Địa chỉ: {dv.diaChi}<br />MST: {dv.mst}</div>
        {kyHieu && (
          <div className="bc-mau">
            <b>Mẫu số {kyHieu}</b><br /><i>({canCu(cd)})</i>
            {cd.choDuyet && <><br /><span className="bc-cho-duyet">Ký hiệu chờ kế toán trưởng duyệt</span></>}
          </div>
        )}
      </div>
      <h2>{cfg?.ten?.[s.cheDo] ?? title}</h2>
      <div className="sub">{sub}</div>
      <div className="unit">Đơn vị tính: đồng</div>
    </>
  )
  const cuoi = ky ? <KhoiCuoi loai={loai} cheDo={s.cheDo} nguoiDaiDien={dv.nguoiDaiDien} dsKy={dsKy} /> : undefined
  return (
    <ToGiay dau={dau} than={thanBienDoi} cuoi={cuoi} khoMacDinh={khoMacDinh}
      kyHieuCot={kyHieuCot} congChuyen={loai === 'so' ? cfg?.congCot : undefined}
      onKho={setKhoHienTai} layHtmlRef={layHtmlRef} coChu={tc?.coChu} />
  )
}

/** Khối cuối tờ: dòng sổ có mấy trang, ngày lập, ô ký theo loại báo cáo và chế độ (kế hoạch mục 5) */
function KhoiCuoi({ loai, cheDo, nguoiDaiDien, dsKy }: { loai: LoaiBC; cheDo: CheDo; nguoiDaiDien: string; dsKy: OKy[] }) {
  const ngay = `${pad(HOM_NAY.getDate())} tháng ${pad(HOM_NAY.getMonth() + 1)} năm ${HOM_NAY.getFullYear()}`
  return (
    <div className="bc-cuoi">
      {loai === 'so' && <SoTrangSo />}
      <div className="bc-ngay-lap">{loai === 'bctc' ? `Lập, ngày ${ngay}` : `Ngày ${ngay}`}</div>
      <div className="sign" style={{ gridTemplateColumns: `repeat(${dsKy.length}, 1fr)` }}>
        {dsKy.map(o => <div key={o.chucDanh}><b>{o.chucDanh}</b><i>{o.goiY}</i>{o.hoTen}</div>)}
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
          <tr key={i} className={`${x._t ? 't' : x._b ? 'b' : ''} ${onRow && x._drill ? 'drill' : ''}`} onClick={onRow && x._drill ? () => onRow(x) : undefined}>
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
