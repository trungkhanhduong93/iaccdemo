// Chi phí hoạt động trong tháng theo lý do chi (T230, T945): mở từ thẻ Chi phí hoạt động ở trang chủ gói Standard.
// Cộng từ phiếu chi thật (T483): phiếu chi tiền mặt, chi ngân hàng có lý do là chi phí, theo tháng, cửa hàng (chiPhiPhieu.ts),
// mỗi lý do một dòng trong bảng; bấm dòng mở hộp phiếu chi tiền mặt, ngân hàng của lý do đó (T953), không sang phân hệ Thu chi
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Col, ScreenProps } from '../types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG, tongKy } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { moneyD, pct } from '../../ui/format'
import { Table } from '../../ui/Table'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { chiPhiThangTuPhieu, type PhieuChiPhi, usePhieuChiPhi } from './chiPhiPhieu'
import { NutLapPhieuQuy } from './LichSuQuy'
import { type OCachTinh, TheTongChiPhi } from './TheTongChiPhi'
import { HopChiTietChiPhi } from './HopChiTietChiPhi'

/** Số liệu thẻ tổng Chi phí hoạt động dùng chung cho cả máy tính và điện thoại (T945) */
export function duLieuTongChiPhi(phieu: PhieuChiPhi[], thang: number, cns: string[]) {
  const { tong: cpThang, ds } = chiPhiThangTuPhieu(phieu, thang, cns)
  const soPhieu = ds.reduce((a, x) => a + x.so, 0)
  const tm = ds.reduce((a, x) => a + x.tm, 0)
  const nh = ds.reduce((a, x) => a + x.nh, 0)
  const dt = cns.reduce((a, id) => a + tongKy(thang, 2026, id).dt, 0)
  const cachTinh: OCachTinh[] = [
    { nhan: 'Chi tiền mặt', so: tm, phu: <Link to="/app/tien/2-1-1?loai=chi">Xem phiếu chi tiền mặt</Link> },
    { dau: '+', nhan: 'Chi ngân hàng', so: nh, phu: <Link to="/app/tien/2-1-1?loai=unc">Xem phiếu chi ngân hàng</Link> },
    { nhan: 'Số lý do chi', so: `${ds.length} lý do`, phu: 'Chi tiết ở bảng bên dưới', vien: true, anDt: true },
  ]
  return { cpThang, ds, soPhieu, dt, tyLe: dt ? cpThang / dt : 0, cachTinh }
}

export function ChiPhiThang(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { s, toast } = useSession()
  const [tham] = useSearchParams()
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const cn = cuaHangHienTai(s)
  const phieu = usePhieuChiPhi(s)
  const cns = cn ? [cn.id] : CUA_HANG.map(c => c.id)
  const { cpThang, ds, soPhieu, dt, tyLe, cachTinh } = duLieuTongChiPhi(phieu, thang, cns)
  const [mo, setMo] = useState<string | null>(null)   // lý do đang mở hộp phiếu chi (T953)
  const chon = ds.find(x => x.ly === mo)

  const cols: Col[] = [
    { k: 'ly', t: 'Lý do chi', r: r => r.id ? <button type="button" className="ds-link-so nvl-ten-cn" title={`Xem phiếu chi ${String(r.ly).toLowerCase()}`}>{r.ly}</button> : r.ly },
    { k: 'so', t: 'Số phiếu chi', num: true },
    { k: 'v', t: 'Số tiền', num: true },
    { k: 'tlCp', t: 'Tỷ lệ trên tổng chi phí', num: true, r: r => pct(Number(r.tlCp)) },
    { k: 'tlDt', t: 'Tỷ lệ trên doanh thu', num: true, r: r => dt ? pct(Number(r.tlDt)) : '–' },
  ]

  // Hộp phiếu chi theo lý do (T953): cột Cửa hàng ẩn khi đang xem một cửa hàng
  const tenLoai = (nhom: PhieuChiPhi['nhom']) => nhom === 'cn' ? 'Hoá đơn mua hàng' : nhom === 'nh' ? 'Chi ngân hàng' : 'Chi tiền mặt'
  const cotPhieu: Col[] = [
    { k: 'ngay', t: 'Ngày' },
    { k: 'so', t: 'Số phiếu', cls: 'code', r: r => <Link className="ds-link-so" to={`/app/${r.man ?? 'tien/2-1-1'}/${r.ma}`} title="Mở chứng từ">{String(r.so)}</Link> },
    { k: 'loai', t: 'Loại' },
    ...(cn ? [] : [{ k: 'cn', t: 'Cửa hàng' }]),
    { k: 'doiTuong', t: 'Đối tượng' },
    { k: 'dienGiai', t: 'Diễn giải' },
    { k: 'tien', t: 'Số tiền', num: true },
  ]

  const rows = ds.map(x => ({
    id: x.ly,
    ly: x.ly,
    so: x.so,
    v: x.v,
    tlCp: cpThang ? x.v / cpThang : 0,
    tlDt: dt ? x.v / dt : 0,
  }))

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ tổng cố định; danh sách cuộn riêng (T263) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>
        <h1>Chi phí hoạt động tháng {thang}/2026</h1>
        <span className="grow" />
        <NutXuatExcel onXuat={() => xuatBangExcel(`Chi phí hoạt động tháng ${thang}/2026`, cn ? cn.ten : 'Tất cả cửa hàng',
          [{ t: 'Lý do chi', rong: 32 }, { t: 'Số phiếu', so: true }, { t: 'Tiền mặt', so: true }, { t: 'Ngân hàng', so: true }, { t: 'Số tiền', so: true }, { t: 'Tỷ lệ trên tổng chi phí', rong: 18 }],
          ds.map(x => [x.ly, x.so, x.tm, x.nh, x.v, pct(cpThang ? x.v / cpThang : 0)]), ['Cộng', soPhieu, '', '', cpThang, cpThang ? '100%' : '']).catch(() => toast('Không xuất được file Excel'))} />
        {/* Chọn chi tiền mặt hay chi ngân hàng như Lịch sử quỹ (T447), không mặc định tiền mặt (T483) */}
        <NutLapPhieuQuy chieu="chi" tatCa tienMat className="btn primary"><Icon n="plus" className="ic sm" />Lập phiếu chi</NutLapPhieuQuy>
      </div>
      <TheTongChiPhi
        nhan="Tổng chi phí hoạt động"
        tien={cpThang}
        phu={`Cộng phiếu chi tiền mặt, ngân hàng có lý do là chi phí · ${soPhieu} phiếu chi`}
        tyLe={tyLe}
        dt={dt}
        cachTinh={cachTinh}
      />
      <div className="cpt-cuon">
        <section className="card nvl-bang">
          <div className="nvl-cach">
            <span>Cách tính chi phí hoạt động: <b>Theo phiếu chi</b> · Cộng phiếu chi tiền mặt, ngân hàng có lý do nghiệp vụ là chi phí</span>
            <Link to="/app/danh-muc/1-16">Lý do nghiệp vụ</Link>
          </div>
          {ds.length ? (
            <>
              <Table
                cols={cols}
                rows={rows}
                sum={{ ly: 'Cộng', so: soPhieu, v: cpThang, tlCp: cpThang ? 1 : 0, tlDt: tyLe }}
                onRow={r => setMo(String(r.ly))}
              />
              <div className="nvl-chan">Bấm lý do chi để xem các phiếu chi của lý do đó.</div>
            </>
          ) : (
            <p className="muted cpt-trong">Tháng {thang}/2026 chưa có phiếu chi nào có lý do là chi phí.</p>
          )}
        </section>
      </div>
      {chon && (
        <HopChiTietChiPhi
          tieuDe={`Chi phí hoạt động tháng ${String(thang).padStart(2, '0')}/2026 · Lý do chi`}
          phu={chon.ly}
          o={[
            { nhan: 'Số phiếu chi', so: chon.so },
            { nhan: 'Chi tiền mặt', so: moneyD(chon.tm) },
            { nhan: 'Chi ngân hàng', so: moneyD(chon.nh) },
            { nhan: 'Tổng số tiền', so: moneyD(chon.v) },
          ]}
          ghiChu="Bấm số phiếu để mở phiếu chi."
          cols={cotPhieu}
          rows={chon.phieu.map(p => ({ id: `${p.man ?? ''}${p.id}`, ma: p.id, man: p.man, ngay: p.ngay, so: p.so, loai: tenLoai(p.nhom), cn: p.cn, doiTuong: p.doiTuong, dienGiai: p.dienGiai, tien: p.tien }))}
          onXuat={ds => xuatBangExcel(`Phiếu chi ${chon.ly} tháng ${thang}/2026`, cn ? cn.ten : 'Tất cả cửa hàng',
            [{ t: '#', so: true }, { t: 'Ngày', rong: 12 }, { t: 'Số phiếu', rong: 14 }, { t: 'Loại', rong: 18 }, ...(cn ? [] : [{ t: 'Cửa hàng', rong: 22 }]), { t: 'Đối tượng', rong: 24 }, { t: 'Diễn giải', rong: 36 }, { t: 'Số tiền', so: true }],
            ds.map((r, i) => [i + 1, String(r.ngay), String(r.so), String(r.loai), ...(cn ? [] : [String(r.cn)]), String(r.doiTuong), String(r.dienGiai), Number(r.tien)])).catch(() => toast('Không xuất được file Excel'))}
          onDong={() => setMo(null)}
        />
      )}
    </div>
  )
}
