// Lịch sử thu chi một quỹ kiểu app ngân hàng (T230): mở khi bấm quỹ ở khối Tồn quỹ trang chủ gói Free.
// Giao dịch lấy từ Sổ quỹ tiền mặt (quỹ tiền mặt chi nhánh) hoặc Sổ ngân hàng (tài khoản), gom theo ngày, mới nhất trên cùng;
// bấm giao dịch mở chứng từ chi tiết theo số phiếu (cách dò phiếu thật của T201)
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../types'
import { CHI_NHANH, TK_NGAN_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { between, k, moneyD, pad, rng } from '../../ui/format'
import { soChiTiet } from '../../ui/generic/gen'
import { gopSo } from '../../ui/generic/ReportScreen'
import { phieuTheoSo } from '../../ui/generic/SoChungTu'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { NutXuatExcel } from '../../ui/CongCuDs'
import { xuatBangExcel } from '../../ui/xuatBangExcel'
import { useSession } from '../../app/session'
import { Select } from '../../ui/Dropdown'
import { soQuyCn } from '../tien/SoQuy'
import { tenQuyTm, tenTkNh } from '../bao-cao/danh-sach'

interface GiaoDich { ngay: string; so: string; dg: string; thu: number; chi: number; du: number }

/** Giao dịch trong tháng của một quỹ: số phiếu sổ quỹ PT10-001 đổi thành PT2610-0001 để dò được phiếu thật cùng loại, cùng tháng */
export function giaoDich(quy: string, thang: number): { mo: number; cuoi: number; ds: GiaoDich[] } | undefined {
  const cn = CHI_NHANH.find(c => tenQuyTm(c.ngan) === quy)
  if (cn) {
    const so = soQuyCn(cn.id, thang)
    const doiSo = (s: unknown) => { const m = /^([A-Z]+)\d+-(\d+)$/.exec(String(s ?? '')); return m ? `${m[1]}26${pad(thang)}-${pad(Number(m[2]), 4)}` : '' }
    return { mo: so.mo, cuoi: so.cuoi, ds: so.rows.map((r: Row) => ({ ngay: String(r.ngay), so: doiSo(r.thu ?? r.chi), dg: String(r.dg), thu: Number(r.no) || 0, chi: Number(r.co) || 0, du: Number(r.du) || 0 })) }
  }
  const iTk = TK_NGAN_HANG.findIndex(t => tenTkNh(t) === quy)
  if (iTk < 0) return undefined
  // Như Sổ ngân hàng 2.2.3: mỗi chi nhánh, mỗi tài khoản một phần, gộp các chi nhánh theo ngày
  const chia = CHI_NHANH.length * TK_NGAN_HANG.length
  const soMot = (hat: string) => soChiTiet(hat, k(between(rng(hat + thang), 80e6, 260e6) / chia), ['Thu tiền bán hàng ngày', 'Chi mua nguyên vật liệu', 'Chi tiền điện tháng', 'Thu tiền khách công ty',
    'Chi tạm ứng nhân viên', 'Nộp tiền vào tài khoản ngân hàng', 'Chi phí vận chuyển', 'Thu hoàn ứng'], ['5111', '331', '6422', '131', '141', '1121', '6421'], [1.5e6, 38e6], thang)
  const so = gopSo(CHI_NHANH.map(c => ({ cn: c.ngan, ...soMot('2.2.3' + c.id + (iTk || '')) })))
  return { mo: so.mo, cuoi: so.cuoi, ds: so.rows.map(r => ({ ngay: String(r.ngay), so: String(r.so), dg: String(r.dienGiai), thu: Number(r.no) || 0, chi: Number(r.co) || 0, du: Number(r.du) || 0 })) }
}

/** Tồn quỹ từng quỹ trong tháng theo Sổ quỹ tiền mặt, Sổ ngân hàng (cùng nguồn với Lịch sử thu chi, T230):
 *  quỹ tiền mặt của chi nhánh đang xem (cnIds) và mọi tài khoản ngân hàng */
export function tonQuyTheoSo(thang: number, cnIds: string[]) {
  const ten = [...CHI_NHANH.filter(c => cnIds.includes(c.id)).map(c => tenQuyTm(c.ngan)), ...TK_NGAN_HANG.map(tenTkNh)]
  return ten.map(quy => {
    const g = giaoDich(quy, thang)!
    return { quy, tienMat: quy.startsWith('Quỹ tiền mặt'), mo: g.mo, cuoi: g.cuoi, thu: g.ds.reduce((a, x) => a + x.thu, 0), chi: g.ds.reduce((a, x) => a + x.chi, 0) }
  })
}

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
const tenNgay = (ngay: string) => { const [d, m, y] = ngay.split('/').map(Number); return `${THU[new Date(y, m - 1, d).getDay()]}, ${ngay}` }

export function LichSuQuy(_: ScreenProps) {
  const moTuTrangChu = useMoTuTrangChu()   // liên kết trong màn mở kèm nút về Trang chủ (T232)
  const { toast } = useSession()
  const [tham] = useSearchParams()
  const quy = tham.get('quy') ?? tenQuyTm(CHI_NHANH[0].ngan)
  const thang = Math.min(10, Math.max(7, Number(tham.get('thang')) || 10))
  const gd = giaoDich(quy, thang)
  // Lọc loại giao dịch: tất cả, chỉ khoản thu, chỉ khoản chi (T246); danh sách và file Excel theo bộ lọc, số dư đầu, cuối kỳ giữ nguyên
  const [loai, setLoai] = useState<'' | 'thu' | 'chi'>('')
  const dsLoc = (gd?.ds ?? []).filter(x => !loai || (loai === 'thu' ? x.thu > 0 : x.chi > 0))
  const tienMat = CHI_NHANH.some(c => tenQuyTm(c.ngan) === quy)
  // Mới nhất trên cùng, gom theo ngày
  const nhom = new Map<string, GiaoDich[]>()
  for (const x of [...dsLoc].reverse()) nhom.set(x.ngay, [...(nhom.get(x.ngay) ?? []), x])
  const tn = (gd?.ds ?? []).reduce((a, x) => a + x.thu, 0), tc = (gd?.ds ?? []).reduce((a, x) => a + x.chi, 0)

  return (
    <div className="page cpt-trang" onClickCapture={moTuTrangChu}>   {/* phần đầu, thẻ số dư cố định; danh sách cuộn riêng (T263) */}
      <div className="cpt-dau">
        <Link to="/app/trang-chu/tong-quan" className="cpt-ve" title="Về Tổng quan" aria-label="Về Tổng quan"><Icon n="chevl" /></Link>
        <h1>Lịch sử thu chi</h1>
        <span className="grow" />
        <Select className="inp lsq-loc" value={loai} aria-label="Loại giao dịch" onChange={e => setLoai(e.target.value as '' | 'thu' | 'chi')}
          ds={[{ v: '', t: 'Tất cả thu, chi' }, { v: 'thu', t: 'Khoản thu' }, { v: 'chi', t: 'Khoản chi' }]} />
        <NutXuatExcel onXuat={() => xuatBangExcel(`Lịch sử thu chi ${quy} tháng ${thang}/2026`, `${loai === 'thu' ? 'Khoản thu · ' : loai === 'chi' ? 'Khoản chi · ' : ''}Đầu kỳ ${moneyD(gd?.mo ?? 0)} · Cuối kỳ ${moneyD(gd?.cuoi ?? 0)}`,
          [{ t: 'Ngày', rong: 12 }, { t: 'Số chứng từ', rong: 18 }, { t: 'Diễn giải', rong: 44 }, { t: 'Thu', so: true }, { t: 'Chi', so: true }, { t: 'Số dư', so: true }],
          [['', '', 'Số dư đầu kỳ', null, null, gd?.mo ?? 0], ...dsLoc.map(x => [x.ngay, phieuTheoSo(x.so)?.so ?? x.so, x.dg, x.thu || null, x.chi || null, x.du])],
          ['', '', 'Cộng', loai === 'chi' ? null : tn, loai === 'thu' ? null : tc, gd?.cuoi ?? 0]).catch(() => toast('Không xuất được file Excel'))} />
        <Link to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'thu' : 'bc'}`} className="btn"><Icon n="plus" className="ic sm" />Lập phiếu thu</Link>
        <Link to={`/app/tien/2-1-1/moi?loai=${tienMat ? 'chi' : 'unc'}`} className="btn primary"><Icon n="plus" className="ic sm" />Lập phiếu chi</Link>
      </div>
      <div className="lsq-the">
        <div className="lsq-quy"><Icon n={tienMat ? 'wallet' : 'bank'} /><span>{quy}</span></div>
        <div className="lsq-du"><small>{thang === 10 ? 'Số dư hiện tại' : `Số dư cuối tháng ${thang}/2026`}</small><b>{moneyD(gd?.cuoi ?? 0)}</b></div>
        <div className="lsq-tom">
          <span>Đầu kỳ <b>{moneyD(gd?.mo ?? 0)}</b></span>
          <span className="thu">Thu <b>+{moneyD(tn)}</b></span>
          <span className="chi">Chi <b>−{moneyD(tc)}</b></span>
        </div>
      </div>
      <div className="cpt-cuon">
      {!gd || nhom.size === 0 ? <div className="note muted">{loai ? `Quỹ không có khoản ${loai} nào trong tháng ${thang}/2026.` : `Quỹ chưa có giao dịch trong tháng ${thang}/2026.`}</div> : (
        <div className="lsq-ds">
          {[...nhom].map(([ngay, ds]) => (
            <section key={ngay}>
              <div className="lsq-ngay">{tenNgay(ngay)}</div>
              <div className="lsq-khoi">
                {ds.map((x, i) => {
                  const p = phieuTheoSo(x.so)
                  const noiDung = <>
                    <span className={`lsq-ic ${x.thu ? 'thu' : 'chi'}`}><Icon n={x.thu ? 'cashin' : 'cashout'} /></span>
                    <span className="lsq-chu"><b>{x.dg}</b><small>{p?.so ?? x.so}</small></span>
                    <span className="lsq-so"><b className={x.thu ? 'thu' : 'chi'}>{x.thu ? `+${moneyD(x.thu)}` : `−${moneyD(x.chi)}`}</b><small>Số dư {moneyD(x.du)}</small></span>
                  </>
                  return p
                    ? <Link key={i} to={p.to} className="lsq-dong" title="Xem chứng từ">{noiDung}<Icon n="chevr" className="ic sm lsq-mui" /></Link>
                    : <div key={i} className="lsq-dong">{noiDung}</div>
                })}
              </div>
            </section>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
