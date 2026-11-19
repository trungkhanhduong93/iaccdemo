// Modal của màn Tồn kho ban đầu mẫu C (T881): Thiết lập hàng loạt (kèm popup Thay thế hàng loạt), Chép sang kho khác, Xoá hàng loạt, thông báo khoá.
// Mẫu: artifact "Tồn kho ban đầu – gợi ý", bản chép ở backup/mau-T879/M*.dc.html
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KHO } from '../../data/mock'
import { useSession } from '../../app/session'
import { Select } from '../../ui/Dropdown'
import { Icon } from '../../ui/Icon'
import { ThongBao } from '../../ui/ThongBao'
import { fold, money, nhapSoQT, soQT } from '../../ui/format'
import { MAN_KK } from './dieu-chinh'
import { NGAY_SO_DU, chepTonDau, dsTonDau, dvtCuaHang, giaNhapGanNhat, khoaTonDau, luuTonDau, xoaTonDau, type LyDoKhoa } from './ton-dau'

const IconThay = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h13l-3-3M20 16H7l3 3" /></svg>
const IconPheu = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M4 5h16l-6 7v6l-4 2v-8L4 5z" /></svg>
const IconCanh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h0" /></svg>

const NutDong = ({ onDong, nho }: { onDong: () => void; nho?: boolean }) => (
  <button type="button" className={`td-nut-dong${nho ? ' nho' : ''}`} aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
)
const so = (t: string) => (t === '' ? null : Number(t))
const maTen = (ma: string, ten: string) => <><span className="td-ma">{ma ? `${ma} - ` : ''}</span><span className="td-ten">{ten}</span></>

interface DongTl { ma: string; ten: string; nhom: string; nhomMa: string; dvt: string; sl: string; gia: string }
const COT_LOC: { k: keyof DongTl; t: string }[] = [
  { k: 'ma', t: 'Mã hàng hoá' }, { k: 'ten', t: 'Tên hàng hoá' }, { k: 'dvt', t: 'ĐVT' }, { k: 'nhom', t: 'Nhóm hàng hoá' }, { k: 'sl', t: 'Số lượng' }, { k: 'gia', t: 'Đơn giá' },
]

export function HopThietLapTonDau({ kho, ma, tichSan, onDong }: { kho: string; ma: string[]; tichSan: boolean; onDong: () => void }) {
  const { toast } = useSession()
  const [dong, setDong] = useState<DongTl[]>(() => dsTonDau(kho).filter(d => ma.includes(d.ma))
    .map(d => ({ ma: d.ma, ten: d.ten, nhom: d.nhom, nhomMa: d.nhomMa, dvt: d.dvt, sl: d.sl == null ? '' : String(d.sl), gia: d.gia == null ? '' : String(d.gia) })))
  const [tich, setTich] = useState<Set<string>>(() => new Set(tichSan ? ma : []))
  const [loc, setLoc] = useState<Record<string, string>>({})
  const [thay, setThay] = useState<'' | 'sl' | 'gia'>('')
  const [cachGia, setCachGia] = useState<'gan' | 'tu'>('gan')
  const [giaTri, setGiaTri] = useState('')

  const hien = useMemo(() => dong.filter(d => COT_LOC.every(c => !loc[c.k]?.trim() || fold(c.k === 'nhom' ? `${d.nhomMa} ${d.nhom}` : d[c.k]).includes(fold(loc[c.k].trim())))), [dong, loc])
  const sua = (m: string, p: Partial<DongTl>) => setDong(ds => ds.map(d => d.ma === m ? { ...d, ...p } : d))
  const doiTich = (m: string) => setTich(t => { const n = new Set(t); if (n.has(m)) n.delete(m); else n.add(m); return n })
  const tichHet = hien.length > 0 && hien.every(d => tich.has(d.ma))
  const thieuGia = dong.filter(d => d.sl !== '' && d.gia === '').length
  const tien = (d: DongTl) => (d.sl !== '' && d.gia !== '' ? Number(d.sl) * Number(d.gia) : null)

  const xacNhanThay = () => {
    if (!tich.size) { toast('Tích chọn dòng trước', { loai: 'loi' }); return }
    if (thay === 'gia' && cachGia === 'gan') setDong(ds => ds.map(d => tich.has(d.ma) ? { ...d, gia: String(giaNhapGanNhat(d.ma, kho) ?? '') } : d))
    else setDong(ds => ds.map(d => tich.has(d.ma) ? { ...d, [thay]: giaTri } : d))
    setThay(''); setGiaTri('')
  }
  const luu = () => {
    luuTonDau(kho, dong.map(d => ({ ma: d.ma, dvt: d.dvt, sl: so(d.sl), gia: so(d.gia) })))
    toast(`Đã lưu tồn đầu ${dong.filter(d => d.sl !== '' || d.gia !== '').length} mặt hàng`)
    onDong()
  }

  return (
    <div className="td-phu td-phu-tl">
      <div className="td-hop-tl" role="dialog" aria-modal="true" aria-label="Thiết lập hàng loạt tồn đầu">
        <div className="td-dau">
          <div className="td-dau-chu"><b className="td-tieu-de lon">Thiết lập hàng loạt tồn đầu</b><span>{kho} · Số dư tại ngày {NGAY_SO_DU} · {dong.length} mặt hàng</span></div>
          <NutDong onDong={onDong} />
        </div>
        <div className="td-tl-hd"><span className="td-tl-hd-ic"><IconThay /></span>Tích dòng cần đổi, bấm biểu tượng này ở tiêu đề cột để thay thế cả cột một lần. Gõ thẳng vào ô để sửa từng dòng.</div>
        <div className="td-tl-cuon">
          <table className="td-tl-bang">
            <colgroup><col style={{ width: 44 }} /><col style={{ width: 40 }} /><col style={{ width: 110 }} /><col /><col style={{ width: 170 }} /><col style={{ width: 210 }} /><col style={{ width: 150 }} /><col style={{ width: 160 }} /><col style={{ width: 150 }} /></colgroup>
            <thead>
              <tr>
                <th className="c"><input type="checkbox" aria-label="Chọn tất cả" checked={tichHet} onChange={() => setTich(tichHet ? new Set() : new Set(hien.map(d => d.ma)))} /></th>
                <th className="c">#</th>
                <th>Mã hàng hoá</th><th>Tên hàng hoá</th><th>ĐVT</th><th>Nhóm hàng hoá</th>
                {(['sl', 'gia'] as const).map(k => (
                  <th key={k}><span className="td-th-thay">
                    <button type="button" className={`td-nut-thay${thay === k ? ' on' : ''}`} title="Thay thế hàng loạt" aria-label={`Thay thế hàng loạt ${k === 'sl' ? 'Số lượng' : 'Đơn giá'}`} onClick={() => setThay(k)}><IconThay /></button>
                    {k === 'sl' ? 'Số lượng' : 'Đơn giá'}
                  </span></th>
                ))}
                <th>Thành tiền</th>
              </tr>
              <tr className="td-tl-loc">
                <th /><th />
                {COT_LOC.map(c => <th key={c.k}><label><input aria-label={`Lọc ${c.t}`} value={loc[c.k] ?? ''} onChange={e => setLoc(l => ({ ...l, [c.k]: e.target.value }))} /><IconPheu /></label></th>)}
                <th />
              </tr>
            </thead>
            <tbody>
              {hien.map((d, i) => {
                const dsDvt = dvtCuaHang(d.ma)
                return (
                  <tr key={d.ma} className={d.sl !== '' && d.gia === '' ? 'thieu' : undefined}>
                    <td className="c"><input type="checkbox" aria-label={`Chọn ${d.ten}`} checked={tich.has(d.ma)} onChange={() => doiTich(d.ma)} /></td>
                    <td className="c muted">{i + 1}</td>
                    <td className="td-mau-body">{d.ma}</td>
                    <td className="td-ten-hang">{d.ten}</td>
                    <td><Select className="inp sm" value={d.dvt} onChange={e => sua(d.ma, { dvt: e.target.value })} aria-label="Đơn vị tính" ds={dsDvt.map(x => ({ v: x.ten, t: `${x.ma} - ${x.ten}` }))} /></td>
                    <td className="td-mot-dong">{maTen(d.nhomMa, d.nhom)}</td>
                    <td><input className="inp sm td-o-so" inputMode="decimal" aria-label="Số lượng" value={soQT(d.sl)} onChange={e => sua(d.ma, { sl: nhapSoQT(e.target.value) })} /></td>
                    <td><input className={`inp sm td-o-so${d.sl !== '' && d.gia === '' ? ' thieu' : ''}`} inputMode="decimal" aria-label="Đơn giá" placeholder={d.sl !== '' && d.gia === '' ? 'Thiếu đơn giá' : ''} value={soQT(d.gia)} onChange={e => sua(d.ma, { gia: nhapSoQT(e.target.value) })} /></td>
                    <td className="num b">{tien(d) == null ? '' : money(tien(d)!)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td /><td />
                <td colSpan={4}>Tổng: {hien.length} dòng</td>
                <td className="num">{soQT(hien.reduce((a, d) => a + (Number(d.sl) || 0), 0))}</td>
                <td />
                <td className="num">{money(hien.reduce((a, d) => a + (tien(d) ?? 0), 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="td-chan">
          <span>Đã chọn <b>{tich.size}/{dong.length}</b> dòng{thieuGia > 0 && <> · <span className="td-chu-cam">{thieuGia} dòng thiếu đơn giá</span></>}</span>
          <div className="td-chan-nut">
            <button type="button" className="btn td-nut" onClick={onDong}>Đóng</button>
            <button type="button" className="btn pri td-nut" onClick={luu}>Lưu thay đổi</button>
          </div>
        </div>

        {thay && (
          <div className="td-phu-thay">
            <div className="td-hop-nho td-hop-thay" role="dialog" aria-modal="true" aria-label="Thay thế hàng loạt">
              <div className="td-dau nho">
                <div className="td-dau-chu"><b className="td-tieu-de">Thay thế hàng loạt</b><span>Cột {thay === 'sl' ? 'Số lượng' : 'Đơn giá'} · {tich.size} dòng đã chọn</span></div>
                <NutDong onDong={() => setThay('')} nho />
              </div>
              <div className="td-thay-than">
                {thay === 'gia' ? <>
                  <label className={`td-chon-gia${cachGia === 'gan' ? ' on' : ''}`}><input type="radio" name="td-gia" checked={cachGia === 'gan'} onChange={() => setCachGia('gan')} />
                    <span><b>Giá nhập gần nhất</b><small>Lấy từ phiếu nhập mua gần nhất trước ngày {NGAY_SO_DU}</small></span></label>
                  <label className={`td-chon-gia${cachGia === 'tu' ? ' on' : ''}`}><input type="radio" name="td-gia" checked={cachGia === 'tu'} onChange={() => setCachGia('tu')} />
                    <span><b>Tự nhập giá</b><input className="inp td-o-so" inputMode="decimal" placeholder="Nhập đơn giá" aria-label="Đơn giá" value={soQT(giaTri)}
                      onFocus={() => setCachGia('tu')} onChange={e => setGiaTri(nhapSoQT(e.target.value))} /></span></label>
                </> : <>
                  <span>Nhập số lượng cho các dòng đã chọn, rồi bấm Xác nhận.</span>
                  <input className="inp td-o-so td-o-lon" inputMode="decimal" aria-label="Số lượng" autoFocus value={soQT(giaTri)} onChange={e => setGiaTri(nhapSoQT(e.target.value))} />
                </>}
              </div>
              <div className="td-chan-nut td-thay-chan">
                <button type="button" className="btn td-nut" onClick={() => setThay('')}>Quay lại</button>
                <button type="button" className="btn pri td-nut" onClick={xacNhanThay}>Xác nhận</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function HopChepTonDau({ kho, ma, onDong }: { kho: string; ma: string[]; onDong: () => void }) {
  const { toast } = useSession()
  const [chon, setChon] = useState<string[]>([])
  const [mo, setMo] = useState(false)
  const dsKho = KHO.filter(k => k !== kho).map(k => ({ k, khoa: khoaTonDau(k) !== null }))
  const chep = () => {
    chepTonDau(kho, chon, ma)
    toast(`Đã chép tồn đầu ${ma.length} mã hàng sang ${chon.join(', ')}`)
    onDong()
  }
  return (
    <div className="td-phu td-phu-nho">
      <div className="td-hop-nho td-hop-chep" role="dialog" aria-modal="true" aria-label="Chép sang kho khác">
        <div className="td-dau">
          <div className="td-dau-chu"><b className="td-tieu-de">Chép sang kho khác</b><span>{ma.length} mã hàng đã chọn · từ {kho}</span></div>
          <NutDong onDong={onDong} />
        </div>
        <div className="td-chep-than">
          <b>Kho nhận</b>
          <button type="button" className={`td-chep-o${mo ? ' mo' : ''}`} aria-expanded={mo} onClick={() => setMo(m => !m)}>
            {chon.map(k => <span key={k} className="td-the">{k}</span>)}
            <span className="td-chep-goi-y">{chon.length ? 'Chọn thêm kho' : 'Chọn kho nhận'}</span>
            <Icon n="chevd" className="ic sm" />
          </button>
          {mo && (
            <div className="td-chep-ds">
              {dsKho.map(({ k, khoa }) => (
                <label key={k} className={khoa ? 'khoa' : undefined}>
                  <input type="checkbox" disabled={khoa} checked={chon.includes(k)} onChange={() => setChon(c => c.includes(k) ? c.filter(x => x !== k) : [...c, k])} />
                  <span>{k}</span>{khoa && <small>Đã khoá</small>}
                </label>
              ))}
            </div>
          )}
          <div className="td-canh"><IconCanh /><span>Số lượng, đơn giá của {ma.length} mã hàng sẽ ghi đè lên tồn đầu đang có ở kho nhận.</span></div>
        </div>
        <div className="td-chan td-chan-phai">
          <button type="button" className="btn td-nut" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri td-nut" disabled={!chon.length} onClick={chep}>Chép</button>
        </div>
      </div>
    </div>
  )
}

export function HopXoaTonDau({ kho, ma, onDong }: { kho: string; ma: string[]; onDong: () => void }) {
  const { toast } = useSession()
  const xoa = () => { xoaTonDau(kho, ma); toast(`Đã xoá tồn đầu ${ma.length} mã hàng`); onDong() }
  return (
    <ThongBao loai="xoa" nhan="Xoá tồn đầu" tieuDe={`Xoá tồn đầu ${ma.length} mã hàng?`}
      moTa={`${ma.length} mã chuyển sang Không có tồn đầu. Danh mục hàng hoá giữ nguyên.`}
      anhHuong={[{ nhan: 'Kho', gt: kho }]}
      nut={{ ten: `Xoá tồn đầu ${ma.length} mã`, onClick: xoa }} onDong={onDong} />
  )
}

export function HopKhoaTonDau({ lyDo, onDong }: { lyDo: LyDoKhoa; onDong: () => void }) {
  const { s } = useSession()
  const nav = useNavigate()
  const toi = (url: string) => { onDong(); nav(url) }
  if (lyDo.loai === 'kiem-ke') {
    const moKk = () => toi(`/app/${MAN_KK}/${lyDo.id}`)
    return (
      <ThongBao loai="chan" nhan="Không đổi được tồn đầu" tieuDe="Kho đã kiểm kê sau ngày số dư"
        moTa="Số kiểm kê đã tính từ tồn đầu hiện tại. Đổi tồn đầu thì chênh lệch kiểm kê sai."
        duKien={[{ nhan: 'Phiếu kiểm kê', gt: lyDo.so, di: moKk }, { nhan: 'Ngày kiểm kê', gt: lyDo.ngay }]}
        buoc={[`Xoá phiếu kiểm kê ${lyDo.so} và phiếu điều chỉnh kèm theo.`, 'Sửa tồn đầu, rồi kiểm kê lại.']}
        nut={{ ten: 'Mở phiếu kiểm kê', onClick: moKk }} onDong={onDong} />
    )
  }
  return (
    <ThongBao loai="chan" nhan="Không đổi được tồn đầu" tieuDe={`Đã khoá sổ đến tháng ${lyDo.ky}`}
      moTa={`Tồn đầu là số liệu ngày ${NGAY_SO_DU}. Tháng đó đã khoá nên tồn đầu chỉ xem.`}
      duKien={[{ nhan: 'Kỳ khoá sổ', gt: `Tháng ${lyDo.ky}` }, { nhan: 'Cửa hàng', gt: lyDo.cuaHang === 'tất cả cửa hàng' ? 'Tất cả cửa hàng' : lyDo.cuaHang }]}
      buoc={[`Mở khoá tháng ${lyDo.ky} (tháng khoá gần nhất), ghi lý do.`, 'Sửa tồn đầu, tính lại giá vốn, khoá sổ lại.']}
      nut={{ ten: 'Mở màn khoá sổ', onClick: () => toi(s.goi === 'PR' ? '/app/tong-hop/10-1-6' : '/app/he-thong/khoa-so') }} onDong={onDong} />
  )
}
