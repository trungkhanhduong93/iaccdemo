// Hộp thoại của danh sách Xuất kho định lượng (T935): popup món chưa tạo xuất kho định lượng, Tạo xuất kho định lượng (xuất bổ sung / tạo lại toàn bộ).
// Mẫu: artifact "Xuất kho định lượng" bản mẫu tương tác.
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { dmy } from '../../ui/format'
import { HANG } from '../../data/mock'
import { ChonHaiCot } from '../../ui/ChonHaiCot'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { ChonKhoangNgay, docNgay, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { monThieuXdl, phieuTaoLaiXdl, taoLaiXdl, xuatBoSungXdl, type LyDoXdl, type MonThieuXdl, type PhieuXdl } from './xuat-dinh-luong'

/** Chỗ sửa theo lý do, cùng bảng với tab Lỗi của chi tiết phiếu; mở ở tab mới để không mất danh sách */
const NUT: Record<LyDoXdl['loai'], string> = { 1: 'Tạo công thức', 2: 'Khớp mã hàng', 3: 'Thêm ĐVT', 4: 'Mở công thức', 5: 'Tính giá vốn' }
const diSua = (goi: string): Record<LyDoXdl['loai'], string> => {
  const congThuc = goi === 'PL' ? '/app/danh-muc/cong-thuc-che-bien' : '/app/kho/9-1-3'
  return { 1: congThuc, 2: '/app/danh-muc/1-2', 3: '/app/danh-muc/1-4', 4: congThuc, 5: '/app/kho/5-1-7' }
}

const nhomCua = (ma: string) => HANG.find(h => h.ma === ma)?.nhom ?? 'Khác'

function Khung({ tieuDe, onDong, rong, children, chan }: { tieuDe: string; onDong?: () => void; rong?: number; children: React.ReactNode; chan?: React.ReactNode }) {
  return createPortal(
    <div className="xdl-phu" onMouseDown={e => { if (e.target === e.currentTarget) onDong?.() }}>
      <div className="xdl-hop" style={{ maxWidth: rong ?? 620 }} role="dialog" aria-modal="true" aria-label={tieuDe}>
        <div className="xdl-hop-d"><b>{tieuDe}</b>{onDong && <button type="button" className="icon-btn" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>}</div>
        <div className="xdl-hop-t">{children}</div>
        {chan && <div className="xdl-hop-c">{chan}</div>}
      </div>
    </div>,
    document.body,
  )
}

/** Popup dải cảnh báo: món chưa có xuất kho định lượng, cửa hàng liên quan, nút xử lý */
export function HopMonThieu({ ds, goi, onDong }: { ds: MonThieuXdl[]; goi: string; onDong: () => void }) {
  const sua = diSua(goi)
  return (
    <Khung tieuDe="Món chưa tạo xuất kho định lượng" rong={820} onDong={onDong}>
      {ds.length === 0
        ? <div className="empty"><b>Không còn món thiếu</b>Tất cả món đã tạo xuất kho định lượng.</div>
        : (
          <div className="xdl-hop-bang">
            <table className="tbl">
              <thead><tr><th>Mã món</th><th>Tên món</th><th>Đơn vị tính</th><th>Cửa hàng</th><th>Lý do</th><th>Xử lý</th></tr></thead>
              <tbody>
                {ds.map(m => (
                  <tr key={m.ma}>
                    <td className="code">{m.ma}</td>
                    <td>{m.ten}</td>
                    <td>{m.dvt}</td>
                    <td>{m.cn.join(', ')}</td>
                    <td className="xdl-loi">{m.lyDo}</td>
                    <td>{m.coCongThuc
                      ? <span className="chip ok">Đã có công thức</span>
                      : <a className="ds-link-so" href={`${location.href.split('#')[0]}#${sua[m.loai]}`} target="_blank" rel="noopener noreferrer">{NUT[m.loai]}</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </Khung>
  )
}

/** Hộp thoại Tạo xuất kho định lượng. rows: toàn bộ phiếu của người dùng (đã lọc cửa hàng đang chọn). */
/** Việc tạo chạy nền sau khi xác nhận: màn danh sách hiện thanh tiến trình, chạy xong mới ghi thay đổi (T935) */
export interface ViecTaoXdl { ten: string; so: number; dieuKien: [string, string][]; mon: string[]; chay: () => string }

export function HopTaoXdl({ rows, dsCn, cnCoDinh, khoangMd, onDong, onTao }: { rows: PhieuXdl[]; dsCn: string[]; cnCoDinh?: string; khoangMd: KhoangNgay; onDong: () => void; onTao: (v: ViecTaoXdl) => void }) {
  const [che, setChe] = useState<'bs' | 'lai'>('bs')
  const [cn, setCn] = useState(cnCoDinh ?? '')
  const [khoang, setKhoang] = useState<KhoangNgay>(khoangMd)
  const [mo, setMo] = useState(false)
  const [chon, setChon] = useState<Set<string> | null>(null)   // null: dùng mặc định theo chế độ
  const [buoc, setBuoc] = useState<1 | 2>(1)
  const [nhom, setNhom] = useState<Set<string>>(new Set())   // nhóm món, rỗng là tất cả nhóm

  const trong = useMemo(() => rows.filter(r => (!cn || r.cn === cn) && trongKhoang(docNgay(r.ngay), khoang)), [rows, cn, khoang])
  // Món chọn được: món thiếu đã có công thức (bổ sung) hoặc mọi món có công thức trong phạm vi (tạo lại)
  const dsMonGoc = useMemo(() => {
    if (che === 'bs') return monThieuXdl(trong).map(m => ({ ma: m.ma, ten: m.ten, coCt: m.coCongThuc }))
    const mp = new Map<string, string>()
    trong.forEach(p => p.dong.forEach(m => { if (m.coCongThuc || m.choBoSung) mp.set(m.ma, m.ten) }))
    return [...mp].map(([ma, ten]) => ({ ma, ten, coCt: true })).sort((a, b) => a.ma.localeCompare(b.ma))
  }, [che, trong])
  const dsNhom = useMemo(() => [...new Set(dsMonGoc.map(m => nhomCua(m.ma)))].sort(), [dsMonGoc])
  // Nhóm món chỉ dùng khi tạo lại toàn bộ
  const nhomHieu = useMemo(() => new Set(che === 'lai' ? [...nhom].filter(n => dsNhom.includes(n)) : []), [che, nhom, dsNhom])
  const dsMon = useMemo(() => (nhomHieu.size ? dsMonGoc.filter(m => nhomHieu.has(nhomCua(m.ma))) : dsMonGoc), [dsMonGoc, nhomHieu])
  // Bổ sung: tích sẵn các món thiếu đã bổ sung công thức. Tạo lại: để trống
  const dangChon = useMemo(() => new Set([...(chon ?? (che === 'bs' ? new Set(dsMon.filter(m => m.coCt).map(m => m.ma)) : new Set<string>()))].filter(ma => dsMon.some(m => m.ma === ma))), [chon, che, dsMon])
  // Không chọn món nào nghĩa là tất cả món trong phạm vi
  const maChon = dangChon.size ? [...dangChon] : dsMon.map(m => m.ma)
  const setChon2 = new Set(maChon)
  const tatCaMon = dangChon.size === 0 && nhomHieu.size === 0   // không chọn món: tạo lại mọi phiếu trong phạm vi
  const nXoa = che === 'lai' ? phieuTaoLaiXdl(trong, maChon, tatCaMon).length : 0
  const nBoSung = che === 'bs' ? trong.filter(p => p.dong.some(m => (m.choBoSung || (m.lyDo && m.lyDo.loai <= 4)) && setChon2.has(m.ma))).length : 0
    const duocLam = maChon.length > 0 && (che === 'bs' ? nBoSung > 0 : nXoa > 0)

  const lam = () => {
    const dieuKien: [string, string][] = [
      ['Chế độ', che === 'bs' ? 'Xuất bổ sung món còn thiếu' : 'Tạo lại toàn bộ'],
      ['Cửa hàng', cn || 'Tất cả cửa hàng'],
      ['Thời gian', `${dmy(khoang.tu)} - ${dmy(khoang.den)}`],
      ...(che === 'lai' ? [['Nhóm món', nhomHieu.size ? [...nhomHieu].join(', ') : 'Tất cả nhóm'] as [string, string]] : []),
      ['Món', dangChon.size ? `${dangChon.size} món` : 'Tất cả món'],
    ]
    const mon = maChon.map(ma => `${ma} - ${dsMon.find(m => m.ma === ma)?.ten ?? ''}`)
    onTao(che === 'bs'
      ? { ten: 'Đang tạo bổ sung xuất kho định lượng', so: nBoSung, dieuKien, mon, chay: () => { xuatBoSungXdl(trong, maChon); return `Đã xuất bổ sung ${maChon.length} món.` } }
      : { ten: 'Đang tạo lại toàn bộ xuất kho định lượng', so: nXoa, dieuKien, mon, chay: () => { taoLaiXdl(trong, maChon, tatCaMon); return `Đã tạo lại ${maChon.length} món.` } })
    onDong()
  }

  if (buoc === 2) {
    const tenChe = che === 'bs' ? 'tạo bổ sung' : 'tạo lại toàn bộ'
    return (
      <Khung tieuDe={`Xác nhận ${tenChe}`} chan={<>
        <button type="button" className="btn" onClick={() => setBuoc(1)}>Quay lại</button>
        <button type="button" className={`btn ${che === 'lai' ? 'xdl-nut-xoa' : 'pri'}`} onClick={lam}>Tạo xuất kho định lượng</button>
      </>}>
        <div className={che === 'lai' ? 'xdl-xoa' : 'xdl-hoi'}>
          <Icon n="alert" className="ic sm" />
          <div>
            <p>Bạn có chắc chắn muốn {tenChe} xuất kho định lượng từ ngày <b>{dmy(khoang.tu)}</b> đến ngày <b>{dmy(khoang.den)}</b> cho {cn ? <>cửa hàng <b>{cn}</b></> : <b>tất cả cửa hàng</b>}, <b>{tatCaMon ? 'toàn bộ các món ăn' : dangChon.size ? `${maChon.length} món` : `nhóm ${[...nhomHieu].join(', ')}`}</b>?</p>
          </div>
        </div>
      </Khung>
    )
  }

  return (
    <Khung tieuDe="Tạo xuất kho định lượng" onDong={onDong} chan={<>
      <button type="button" className="btn" onClick={onDong}>Huỷ</button>
      <button type="button" className="btn pri" disabled={!duocLam} onClick={() => setBuoc(2)}>Xác nhận</button>
    </>}>
      <div className="xdl-che">
        <label className={che === 'bs' ? 'on' : ''}><input type="radio" name="xdl-che" checked={che === 'bs'} onChange={() => { setChe('bs'); setChon(null) }} />Xuất bổ sung món còn thiếu</label>
        <label className={che === 'lai' ? 'on' : ''}><input type="radio" name="xdl-che" checked={che === 'lai'} onChange={() => { setChe('lai'); setChon(null) }} />Tạo lại toàn bộ</label>
      </div>
      <div className="xdl-luoi3">
        <label className="xdl-o"><span>Cửa hàng</span>
          <Select className="ds-o-sel" value={cn} disabled={Boolean(cnCoDinh)} aria-label="Cửa hàng" onChange={e => { setCn(e.target.value); setChon(null) }}>
            <option value="">Tất cả cửa hàng</option>
            {dsCn.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </label>
        <div className="xdl-o"><span>Thời gian</span><ChonKhoangNgay value={khoang} onChange={k => { setKhoang(k); setChon(null) }} /></div>
      </div>
      {che === 'lai' && (
        <div className="xdl-o"><span>Nhóm món</span>
          <ChonHaiCot chip ds={dsNhom.map(n => ({ v: n }))} value={[...nhomHieu]} onChange={v => { setNhom(new Set(v)); setChon(null) }} nhan="Nhóm món" goiY="Chọn nhóm món" btnClass="ds-o-sel" />
        </div>
      )}
      <div className="xdl-o"><span>Món</span>
        <ChonHaiCot chip ds={dsMon.map(m => ({ v: m.ma, t: m.ten, ma: m.ma }))} value={[...dangChon]} onChange={v => setChon(new Set(v))} nhan="Món" goiY="Chọn món" btnClass="ds-o-sel" />
      </div>
    </Khung>
  )
}
