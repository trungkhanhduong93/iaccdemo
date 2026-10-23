// Báo cáo xuất nhập tồn: đầu kỳ, nhập, xuất, cuối kỳ theo số lượng và giá trị. Bấm mã hàng mở thẻ kho cùng hàng, kho, kỳ (T157, T412)
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../types'
import { apDung, moDuoc, tenMan, timMan } from '../../app/registry'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { PageHead } from '../../ui/Page'
import { ReportPaper, ReportToolbar, RptTable } from '../../ui/generic/ReportScreen'
import { xnt } from './data'
import { useTrangThaiLoc } from '../../ui/bao-cao/tuyChinhBC'
import { docLocNguon, ganLocNguon, nhomCuaMa } from '../bao-cao/loc-nguon'

export function XuatNhapTon({ sc, mod }: ScreenProps) {
  const [ky, setKy] = useState('9')
  const { s } = useSession()
  const cn = cuaHangHienTai(s)
  // Gói Free mỗi cửa hàng một kho: lọc Kho đi theo cửa hàng đang chọn như các báo cáo khác (T412)
  const dsKhoCuaHang = useMemo(() => cn ? cn.kho : CUA_HANG.flatMap(c => c.kho), [cn])

  // Hàng hoá, nhóm hàng hoá, kho chọn ở bộ lọc (T207, T412)
  const daLoc = useTrangThaiLoc(useLocation().pathname).loc
  const f = useMemo(() => docLocNguon(daLoc), [daLoc])

  const rows = useMemo(() => {
    const dsKho = f.kho.length > 0 ? f.kho : dsKhoCuaHang
    const raw = xnt(Number(ky), dsKho, dsKhoCuaHang).filter(x =>
      (f.hang.length === 0 || f.hang.includes(x.ten)) &&
      (f.nhom.length === 0 || f.nhom.includes(nhomCuaMa(x.ma)))
    )
    return ganLocNguon(raw, daLoc)
  }, [ky, f, daLoc, dsKhoCuaHang])

  const sum = (k: string) => rows.reduce((a, x) => a + (x as Record<string, any>)[k], 0)

  // Kho hiển thị trên tiêu đề phụ
  const tenKho = useMemo(() => {
    if (f.kho.length === 1) return f.kho[0]
    if (f.kho.length > 1) return f.kho.join(', ')
    return cn ? `${cn.ngan ?? cn.ten} (Tất cả kho)` : 'Tất cả kho'
  }, [f.kho, cn])

  // Kho truyền sang thẻ kho: kho đang lọc hoặc kho đầu tiên của phạm vi cửa hàng
  const khoMoThe = f.kho.length > 0 ? f.kho[0] : (dsKhoCuaHang[0] || 'Kho bếp Lê Lợi')

  // Mã hàng thành liên kết khi gói, thông tư đang dùng mở được thẻ kho
  const the = timMan('bao-cao', '5-2-1').sc
  const coThe = Boolean(the && moDuoc(the, s.goi) && apDung(the, s.cheDo, s))

  // Bấm mã hoặc tên hàng mở thẻ kho của hàng đó cùng kỳ và kho đang lọc (T211, T412)
  const moThe = (ma: string, chu: string) => coThe
    ? <Link className="nxt-link-hang ds-link-so" style={{ fontSize: 'inherit' }} title="Xem thẻ kho" to={`/app/bao-cao/5-2-1?ma=${ma}&kho=${encodeURIComponent(khoMoThe)}&ky=${ky}`}>{chu}</Link>
    : chu

  const isFree = s.goi === 'S'

  const cols: Col[] = [
    { k: 'ma', t: 'Mã', cls: 'code', w: 90, r: x => x._t ? '' : moThe(String(x.ma), String(x.ma)) },
    { k: 'ten', t: 'Tên nguyên vật liệu, hàng hoá', r: x => x._t ? String(x.ten) : moThe(String(x.ma), String(x.ten)) },
    { k: 'dvt', t: 'ĐVT', c: true, w: 60 },
    { k: 'sl0', t: 'SL', num: true, nhom: 'Đầu kỳ' },
    ...(isFree ? [] : [{ k: 'gt0', t: 'Giá trị', num: true, nhom: 'Đầu kỳ' } as Col]),
    { k: 'sln', t: 'SL', num: true, nhom: 'Nhập trong kỳ' },
    ...(isFree ? [] : [{ k: 'gtn', t: 'Giá trị', num: true, nhom: 'Nhập trong kỳ' } as Col]),
    { k: 'slx', t: 'SL', num: true, nhom: 'Xuất trong kỳ' },
    ...(isFree ? [] : [{ k: 'gtx', t: 'Giá trị', num: true, nhom: 'Xuất trong kỳ' } as Col]),
    { k: 'sl1', t: 'SL', num: true, nhom: 'Cuối kỳ' },
    ...(isFree ? [] : [{ k: 'gt1', t: 'Giá trị', num: true, nhom: 'Cuối kỳ' } as Col]),
  ]

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code} meta={<span className="chip">IACC Cloud tự tính từ phiếu kho đồng bộ</span>} />
      <section className="report">
        <ReportToolbar ky={ky} setKy={setKy} />
        <ReportPaper title="Báo cáo xuất nhập tồn" sub={`${tenKho} · Tháng ${ky}/2026`}>
          {/* Bảng dữ liệu RptTable (tiêu đề 2 tầng theo nhom) để màn chính hiện dạng bảng như các báo cáo khác, không phải tờ in (T308) */}
          <RptTable cols={cols} rows={isFree ? (rows as Row[]) : [...rows as Row[], { ten: 'Tổng cộng', gt0: sum('gt0'), gtn: sum('gtn'), gtx: sum('gtx'), gt1: sum('gt1'), _t: 1 }]} />
        </ReportPaper>
      </section>
    </div>
  )
}
