// Khoá sổ bản gói Free (T315): không ghi sổ, không kết chuyển, chỉ chốt số liệu theo tháng.
// Khoá xong thì phiếu trong tháng chỉ xem (không sửa, không xoá), ô Tháng hạch toán lãi lỗ không chọn được tháng đã khoá.
// Mở khoá bắt buộc ghi lý do. Tháng đã khoá, lịch sử lưu ở trình duyệt (datKhoaSoDen, data/mock.ts)
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG, KHOA_SO_DEN, KY_MO, LICH_SU_KHOA_SO, datKhoaSoDen } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { moneyD } from '../../ui/format'
import { soLieuKiemKe } from '../home/khoFree'
import { tonQuyTheoSo } from '../home/LichSuQuy'
import { useChoGhiTang } from '../ccdc/GhiTangHangLoat'
import { tinhToanTongQuan } from '../home/chiSo'

const sau = (t: number, n: number) => (t === 12 ? { thang: 1, nam: n + 1 } : { thang: t + 1, nam: n })

export function KhoaSoFree({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const [, veLai] = useState(0)
  const [moKhoa, setMoKhoa] = useState(false)
  const [lyDo, setLyDo] = useState('')
  useEffect(() => {
    const on = () => veLai(x => x + 1)
    window.addEventListener('iacc-khoa-so', on)
    return () => window.removeEventListener('iacc-khoa-so', on)
  }, [])

  const daKhoa = { ...KHOA_SO_DEN }
  const canKhoa = sau(daKhoa.thang, daKhoa.nam)
  // Tháng đang mở (chưa hết tháng) chưa khoá được
  const khoaDuoc = canKhoa.nam < KY_MO.nam || (canKhoa.nam === KY_MO.nam && canKhoa.thang < KY_MO.thang)
  const nhan = `${canKhoa.thang}/${canKhoa.nam}`

  // Các bước kiểm tra kiểu gói Free cho tháng cần khoá, theo cửa hàng đang chọn trên thanh trên (tất cả thì mọi cửa hàng)
  const cns = CUA_HANG.filter(c => !s.cuaHang || s.cuaHang === 'all' || c.id === s.cuaHang)
  const kk = soLieuKiemKe(canKhoa.thang, new Set(cns.map(c => c.ten)))
  const tonQuy = tonQuyTheoSo(canKhoa.thang, cns.map(c => c.id)).reduce((a, r) => a + r.cuoi, 0)
  const cho = useChoGhiTang(canKhoa.nam * 100 + canKhoa.thang)   // khoản chờ phân bổ chưa ghi tăng thẻ tới hết tháng cần khoá
  // Chi phí phân bổ trong tháng (khấu hao, CCDC, chi phí trả trước) như dòng Chi phí phân bổ hàng tháng ở trang chủ
  const pbThang = tinhToanTongQuan(canKhoa.thang === KY_MO.thang ? 'thang-nay' : 'thang-truoc', cns.map(c => c.id), s.cheDo, canKhoa.thang).cpPhanBo
  const soNgay = new Date(canKhoa.nam, canKhoa.thang, 0).getDate()
  const buoc: { xong: boolean; ten: string; phu: string; to: string }[] = [
    { xong: true, ten: 'Đồng bộ đủ doanh thu FABi', phu: `${soNgay}/${soNgay} ngày đã có doanh thu`, to: '/app/ban-hang/3-1-1' },
    { xong: kk.chuaKiem.length === 0, ten: 'Kiểm kê cuối tháng', phu: kk.chuaKiem.length ? `Chưa kiểm kê: ${kk.chuaKiem.join(', ')}` : cns.length > 1 ? `Đủ ${cns.length} cửa hàng, lệch ${kk.thieu + kk.thua} mặt hàng` : `${cns[0]?.ten} đã kiểm kê, lệch ${kk.thieu + kk.thua} mặt hàng`, to: '/app/kho/5-1-10' },
    // Chi phí chờ phân bổ: hai chỉ tiêu, đã phân bổ trong tháng và khoản chờ chưa ghi tăng thẻ
    { xong: true, ten: 'Phân bổ chi phí trong tháng', phu: `Đã phân bổ ${moneyD(pbThang)}`, to: '/app/ccdc/8-1-1' },
    { xong: cho.so === 0, ten: 'Chi phí chờ phân bổ chưa ghi tăng thẻ', phu: cho.so ? `Còn ${cho.so} khoản · ${moneyD(cho.tong)}` : 'Không còn khoản nào', to: '/app/ccdc/8-1-1' },
    { xong: true, ten: 'Đối chiếu tồn quỹ cuối tháng', phu: `Tồn quỹ ${moneyD(tonQuy)}`, to: `/app/trang-chu/lich-su-quy?quy=tat-ca&thang=${canKhoa.thang}` },
    { xong: true, ten: 'Phiếu thu, chi FABi chờ xử lý', phu: 'Không còn phiếu chờ map phương thức thanh toán', to: '/app/tien/2-1-1' },
  ]
  const soXong = buoc.filter(b => b.xong).length

  const khoa = () => {
    datKhoaSoDen(canKhoa.thang, canKhoa.nam, 'Khoá sổ', s.ten)
    toast(`Đã khoá sổ tháng ${nhan}. Phiếu trong tháng chỉ xem, không sửa, không xoá được`)
  }
  const xacNhanMo = () => {
    if (!lyDo.trim()) { toast('Nhập lý do mở khoá'); return }
    const truoc = daKhoa.thang === 1 ? { thang: 12, nam: daKhoa.nam - 1 } : { thang: daKhoa.thang - 1, nam: daKhoa.nam }
    datKhoaSoDen(truoc.thang, truoc.nam, `Mở khoá, lý do: ${lyDo.trim()}`, s.ten)
    toast(`Đã mở khoá tháng ${daKhoa.thang}/${daKhoa.nam}`)
    setMoKhoa(false); setLyDo('')
  }

  return (
    <div className="page">
      <PageHead crumb={[mod.ten, sc.nhom ?? '']} title={tenMan(sc)} code={sc.code}>
        <button className="btn" onClick={() => setMoKhoa(v => !v)}><Icon n="lock" className="ic sm" />Mở khoá tháng {daKhoa.thang}/{daKhoa.nam}</button>
        {khoaDuoc && <button className="btn acc" onClick={khoa}><Icon n="lock" className="ic sm" />Khoá sổ tháng {nhan}</button>}
      </PageHead>
      {/* Hai cột bằng nhau (T315): trái là trạng thái, kiểm tra, mở khoá; phải là lịch sử đủ rộng không phải cuộn ngang */}
      <div className="ks-luoi">
        <div className="stack">
          <Note kind="ok" icon="lock">Đã khoá sổ đến hết tháng {daKhoa.thang}/{daKhoa.nam}. Phiếu trong các tháng này chỉ xem, không sửa, không xoá; ô Tháng hạch toán lãi lỗ không chọn được các tháng này.</Note>
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
          {moKhoa && (
            <Card title={`Mở khoá tháng ${daKhoa.thang}/${daKhoa.nam}`}>
              <textarea className="inp ks-ly-do" rows={3} placeholder="Lý do mở khoá, vd bổ sung hoá đơn điện tháng 8" value={lyDo} onChange={e => setLyDo(e.target.value)} />
              <div className="ks-nut">
                <button className="btn" onClick={() => { setMoKhoa(false); setLyDo('') }}>Huỷ</button>
                <button className="btn pri" onClick={xacNhanMo}>Mở khoá</button>
              </div>
            </Card>
          )}
        </div>
        <Card title="Lịch sử khoá sổ" pad={false}>
          <Table cols={[{ k: 'ky', t: 'Tháng', w: 90 }, { k: 'viec', t: 'Thao tác' }, { k: 'ai', t: 'Người làm', w: 140 }, { k: 'luc', t: 'Lúc', w: 170 }]} rows={LICH_SU_KHOA_SO.map(x => ({ ...x }))} />
        </Card>
      </div>
    </div>
  )
}
