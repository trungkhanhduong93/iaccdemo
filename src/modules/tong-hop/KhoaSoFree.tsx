// Khoá sổ bản gói Free (T315): không ghi sổ, không kết chuyển, chỉ chốt số liệu theo tháng.
// Khoá xong thì phiếu trong tháng chỉ xem (không sửa, không xoá), ô Tháng ghi nhận chi phí không chọn được tháng đã khoá.
// Mở khoá bắt buộc ghi lý do. Tháng đã khoá, lịch sử lưu ở trình duyệt (khoaSoCuaHang, data/mock.ts).
// Khoá riêng từng cửa hàng hoặc tất cả theo cửa hàng chọn trên thanh trên (T19)
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG, KY_MO, LICH_SU_KHOA_SO, khoaSoCuaHang, khoaSoDenCua, kySau, type KyKhoa } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { moneyD } from '../../ui/format'
import { soLieuKiemKe } from '../home/khoFree'
import { tonQuyTheoSo } from '../home/LichSuQuy'
import { useChoGhiTang } from '../ccdc/GhiTangHangLoat'
import { tinhToanTongQuan } from '../home/chiSo'

const soKy = (k: KyKhoa) => k.nam * 100 + k.thang
export const nhanKy = (k: KyKhoa) => `${k.thang}/${k.nam}`
// Tháng đang mở (chưa hết tháng) chưa khoá được
const sanSang = (den: KyKhoa) => soKy(kySau(den)) < soKy(KY_MO)

/** Mốc khoá của các cửa hàng đang chọn trên thanh trên (T19): một cửa hàng hoặc tất cả, mỗi cửa hàng khoá, mở khoá theo mốc riêng */
export function mocKhoaSo(chon: string) {
  const cns = CUA_HANG.filter(c => !chon || chon === 'all' || c.id === chon)
  const ds = cns.map(c => ({ c, den: khoaSoDenCua(c.id) }))
  const cungMoc = ds.every(x => soKy(x.den) === soKy(ds[0].den))
  const daKhoa = ds.reduce((a, x) => (soKy(x.den) < soKy(a) ? x.den : a), ds[0].den)   // cửa hàng khoá chậm nhất
  const khoaTiep = ds.filter(x => sanSang(x.den)).map(x => x.c.id)
  // Các bước kiểm tra tính cho cửa hàng sắp khoá; không còn cửa hàng nào khoá được thì tính mọi cửa hàng đang chọn
  const cnKiem = khoaTiep.length ? cns.filter(c => khoaTiep.includes(c.id)) : cns
  return { cns, ds, cungMoc, daKhoa, canKhoa: kySau(daKhoa), khoaTiep, cnKiem, pham: cns.length > 1 ? 'Tất cả cửa hàng' : cns[0].ten }
}

export function KhoaSoFree({ sc, mod }: ScreenProps) {
  const { s, set, toast } = useSession()
  const [, veLai] = useState(0)
  const [moKhoa, setMoKhoa] = useState(false)
  const [lyDo, setLyDo] = useState('')
  useEffect(() => {
    const on = () => veLai(x => x + 1)
    window.addEventListener('iacc-khoa-so', on)
    return () => window.removeEventListener('iacc-khoa-so', on)
  }, [])

  // Khoá theo cửa hàng đang chọn trên thanh trên (T19): tất cả thì mỗi cửa hàng khoá tiếp tháng kế của nó
  const { cns, ds, cungMoc, daKhoa, canKhoa, khoaTiep, cnKiem, pham } = mocKhoaSo(s.cuaHang)
  const khoaDuoc = khoaTiep.length > 0
  const nhan = nhanKy(canKhoa)
  const nutKhoa = cungMoc ? `Khoá sổ tháng ${nhan}` : `Khoá sổ tháng kế tiếp (${khoaTiep.length} cửa hàng)`
  const nutMo = cungMoc ? `Mở khoá tháng ${nhanKy(daKhoa)}` : 'Mở khoá tháng gần nhất'

  // Các bước kiểm tra kiểu gói Free cho tháng cần khoá, theo cửa hàng đang chọn trên thanh trên (tất cả thì mọi cửa hàng)
  const kk = soLieuKiemKe(canKhoa.thang, new Set(cnKiem.map(c => c.ten)))
  const tonQuy = tonQuyTheoSo(canKhoa.thang, cnKiem.map(c => c.id)).reduce((a, r) => a + r.cuoi, 0)
  const cho = useChoGhiTang(canKhoa.nam * 100 + canKhoa.thang)   // khoản chờ phân bổ chưa ghi tăng thẻ tới hết tháng cần khoá
  // Chi phí phân bổ trong tháng (khấu hao, CCDC, chi phí trả trước) như dòng Chi phí phân bổ hàng tháng ở trang chủ
  const pbThang = tinhToanTongQuan(canKhoa.thang === KY_MO.thang ? 'thang-nay' : 'thang-truoc', cnKiem.map(c => c.id), s.cheDo, canKhoa.thang).cpPhanBo
  // Dữ liệu mẫu (T317): mặc định còn bước chưa xong để thấy cảnh báo, link đi xử lý; bỏ bước Đồng bộ đủ doanh thu FABi (PhuongXT chốt 17/10/2026)
  const phieuCho: number = 3               // phiếu thu, chi FABi chưa map phương thức thanh toán
  const buoc: { xong: boolean; ten: string; phu: string; to: string }[] = [
    { xong: kk.chuaKiem.length === 0, ten: 'Kiểm kê cuối tháng', phu: kk.chuaKiem.length ? `Chưa kiểm kê: ${kk.chuaKiem.join(', ')}` : cnKiem.length > 1 ? `Đủ ${cnKiem.length} cửa hàng, lệch ${kk.thieu + kk.thua} mặt hàng` : `${cnKiem[0]?.ten} đã kiểm kê, lệch ${kk.thieu + kk.thua} mặt hàng`, to: '/app/kho/5-1-10' },
    // Chi phí chờ phân bổ: hai chỉ tiêu, đã phân bổ trong tháng và khoản chờ chưa ghi tăng thẻ
    { xong: true, ten: 'Phân bổ chi phí trong tháng', phu: `Đã phân bổ ${moneyD(pbThang)}`, to: '/app/ccdc/8-1-1' },
    { xong: cho.so === 0, ten: 'Chi phí chờ phân bổ chưa ghi tăng thẻ', phu: cho.so ? `Còn ${cho.so} khoản · ${moneyD(cho.tong)}` : 'Không còn khoản nào', to: '/app/ccdc/8-1-1' },
    { xong: true, ten: 'Đối chiếu tồn quỹ cuối tháng', phu: `Tồn quỹ ${moneyD(tonQuy)}`, to: `/app/trang-chu/lich-su-quy?quy=tat-ca&thang=${canKhoa.thang}` },
    { xong: phieuCho === 0, ten: 'Phiếu thu, chi FABi chờ xử lý', phu: phieuCho ? `Còn ${phieuCho} phiếu chờ gán phương thức thanh toán` : 'Không còn phiếu chờ gán phương thức thanh toán', to: '/app/danh-muc/1-12?tich=1' },   // mở Quỹ tiền lọc quỹ chưa map PTTT
  ]
  const soXong = buoc.filter(b => b.xong).length

  const khoa = () => {
    khoaSoCuaHang(khoaTiep, false, 'Khoá sổ', s.ten)
    toast(`Đã khoá sổ ${cungMoc ? `tháng ${nhan}, ${pham}` : `tháng kế tiếp của ${khoaTiep.length} cửa hàng`}. Phiếu trong tháng chỉ xem, không sửa, không xoá được`)
  }
  const xacNhanMo = () => {
    if (!lyDo.trim()) { toast('Nhập lý do mở khoá'); return }
    khoaSoCuaHang(cns.map(c => c.id), true, `Mở khoá, lý do: ${lyDo.trim()}`, s.ten)
    toast(cungMoc ? `Đã mở khoá tháng ${nhanKy(daKhoa)}, ${pham}` : `Đã mở khoá tháng gần nhất của ${cns.length} cửa hàng`)
    setMoKhoa(false); setLyDo('')
  }
  const dongMo = () => { setMoKhoa(false); setLyDo('') }

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn" onClick={() => setMoKhoa(true)}><Icon n="lock" kieu="net" className="ic sm" />{nutMo}</button>
        {khoaDuoc && <button className="btn acc" onClick={khoa}><Icon n="lock" kieu="net" className="ic sm" />{nutKhoa}</button>}
      </PageHead>
      {/* Hai cột bằng nhau (T315): trái là trạng thái, kiểm tra; phải là lịch sử đủ rộng không phải cuộn ngang */}
      <div className="ks-luoi">
        <div className="stack">
          <Note kind="ok" icon="lock">{cungMoc ? `${pham} đã khoá sổ đến hết tháng ${nhanKy(daKhoa)}` : `${pham} khoá sổ đến tháng khác nhau, xem bảng dưới`}. Phiếu trong các tháng đã khoá chỉ xem, không sửa, không xoá; ô Tháng ghi nhận chi phí không chọn được các tháng này.</Note>
          {/* Mốc khoá từng cửa hàng (T19): bấm dòng để chọn cửa hàng đó, khoá, mở khoá riêng; chọn Tất cả cửa hàng ở thanh trên để khoá cùng lúc */}
          {CUA_HANG.length > 1 && (
            <Card title="Khoá sổ từng cửa hàng" sub={cns.length > 1 ? 'Bấm một cửa hàng để khoá, mở khoá riêng' : 'Chọn Tất cả cửa hàng ở thanh trên để khoá cùng lúc'} pad={false}>
              <Table cols={[{ k: 'ten', t: 'Cửa hàng' }, { k: 'den', t: 'Đã khoá đến hết', w: 130 }, { k: 'tiep', t: 'Tháng kế tiếp', w: 150 }]}
                rows={CUA_HANG.map(c => { const den = khoaSoDenCua(c.id); return { id: c.id, ten: c.ten, den: `Tháng ${nhanKy(den)}`, tiep: `${nhanKy(kySau(den))} ${sanSang(den) ? '(khoá được)' : '(đang mở)'}` } })}
                sel={r => ds.length === 1 && r.id === ds[0].c.id}
                onRow={r => set({ cuaHang: String(r.id) })} />
            </Card>
          )}
          <Card title={khoaDuoc ? `Kiểm tra trước khi khoá sổ tháng ${nhan}` : `Tháng ${nhan} đang mở`} sub={khoaDuoc ? `${soXong}/${buoc.length} bước đã xong` : undefined}>
            {khoaDuoc ? buoc.map(b => (
              <div className={`check ${b.xong ? 'done' : 'now'}`} key={b.ten}>
                <span className="box">{b.xong && <Icon n="check" className="ic sm" />}</span>
                <b>{b.ten}</b><small className="muted">{b.phu}</small>
                <Link className="btn sm ks-xem" to={b.to}>Xem</Link>
              </div>
            )) : <p className="muted">Tháng {nhan} chưa hết nên chưa khoá được. Hết tháng, làm đủ các bước rồi khoá để chốt số liệu.</p>}
          </Card>
          {khoaDuoc && soXong < buoc.length && <Note kind="warn" icon="alert">Còn bước chưa xong, khoá lúc này thì số liệu tháng {nhan} có thể chưa đủ. Vẫn khoá được, hệ thống ghi lại người khoá và thời điểm.</Note>}
        </div>
        {/* Mở khoá là hộp thoại giữa màn, không còn thẻ nằm cuối cột trái phải cuộn xuống tìm (T317) */}
        {moKhoa && createPortal(
          <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) dongMo() }} onKeyDown={e => { if (e.key === 'Escape') dongMo() }}>
            <div className="ds-hop" role="dialog" aria-modal="true" aria-label={nutMo}>
              <div className="ds-hop-dau">
                <Icon n="lock" kieu="net" className="ic sm" /><b>{nutMo}, {pham}</b>
                <span className="grow" />
                <button type="button" className="icon-btn sm" onClick={dongMo} aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
              </div>
              <div className="ds-hop-than">
                <textarea className="inp ks-ly-do" rows={3} autoFocus placeholder="Lý do mở khoá, vd bổ sung hoá đơn điện tháng 8" value={lyDo} onChange={e => setLyDo(e.target.value)} />
                <div className="ks-nut">
                  <button className="btn" onClick={dongMo}>Huỷ</button>
                  <button className="btn pri" onClick={xacNhanMo}>Mở khoá</button>
                </div>
              </div>
            </div>
          </div>, document.body)}
        <Card title="Lịch sử khoá sổ" pad={false}>
          <Table cols={[{ k: 'ky', t: 'Tháng', w: 80 }, { k: 'ch', t: 'Cửa hàng', w: 150 }, { k: 'viec', t: 'Thao tác' }, { k: 'ai', t: 'Người làm', w: 130 }, { k: 'luc', t: 'Lúc', w: 160 }]} rows={LICH_SU_KHOA_SO.map(x => ({ ...x, ch: x.ch ?? 'Tất cả cửa hàng' }))} />
        </Card>
      </div>
    </div>
  )
}
