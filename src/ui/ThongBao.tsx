import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useDongEsc } from './LocNangCao'

// Hộp thông báo dùng chung cho cả 3 gói, máy tính và điện thoại (T889, QD113).
// Loại quyết định biểu tượng, màu, nhãn, màu nút chính. Chỉ loai 'xoa' có nút đỏ.
export type LoaiThongBao = 'chan' | 'xoa' | 'canhBao' | 'hoi' | 'xong' | 'thongTin'

export interface NutThongBao { ten: string; onClick: () => void; tat?: boolean }
export interface DuKienThongBao { nhan: string; gt: ReactNode; di?: () => void; chip?: string }
export interface AnhHuongThongBao { nhan: string; gt: ReactNode; mau?: 'do' | 'xanh' | 'vang' }

export interface ThongBaoProps {
  loai: LoaiThongBao
  nhan?: string
  /** Biểu tượng riêng thay biểu tượng của loại, vd ổ khoá ở khoá sổ. */
  hinh?: keyof typeof HINH
  tieuDe: string
  moTa?: ReactNode
  duKien?: DuKienThongBao[]
  anhHuong?: AnhHuongThongBao[]
  buoc?: ReactNode[]
  /** Bỏ trống: hộp chỉ có nút phụ, vd chọn cửa hàng chỉ có Huỷ. */
  nut?: NutThongBao
  /** Mặc định "Huỷ" khi hỏi (xoa, canhBao, hoi), "Đóng" khi báo. null: chỉ một nút. Chuỗi: nút phụ gọi onDong. */
  nutPhu?: string | NutThongBao | null
  /** Nằm trái nút phụ. do: chữ đỏ, vd "Bỏ thay đổi". */
  nutThem?: NutThongBao & { do?: boolean }
  children?: ReactNode
  onDong: () => void
}

const NHAN: Record<LoaiThongBao, string> = {
  chan: 'Không sửa được', xoa: 'Xoá chứng từ', canhBao: 'Cần xem lại',
  hoi: 'Xác nhận', xong: 'Đã lưu', thongTin: 'Thông tin',
}

// Biểu tượng nét theo bản vẽ, màu lấy từ currentColor của ô biểu tượng.
const BIEU_TUONG: Record<LoaiThongBao, ReactNode> = {
  chan: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  xoa: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  canhBao: <><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></>,
  hoi: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" /></>,
  xong: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
  thongTin: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
}

// Biểu tượng riêng theo bản vẽ (SoSach, LuuDong, Toast).
const HINH = {
  khoa: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  moKhoa: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.5-2" /></>,
  luu: <><path d="M5 4h11l3 3v13H5z" /><path d="M8 4v5h7V4M8 20v-6h8v6" /></>,
  cuaHang: <><path d="M4 9.5 5.5 4h13L20 9.5" /><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5 11v9h14v-9M10 20v-5h4v5" /></>,
}

const LA_HOI: LoaiThongBao[] = ['xoa', 'canhBao', 'hoi']

export function ThongBao({ loai, nhan, hinh, tieuDe, moTa, duKien, anhHuong, buoc, nut, nutPhu, nutThem, children, onDong }: ThongBaoProps) {
  useDongEsc(onDong)
  const phu = nutPhu === undefined ? (LA_HOI.includes(loai) ? 'Huỷ' : 'Đóng') : nutPhu
  const phuNut: NutThongBao | null = phu === null ? null : typeof phu === 'string' ? { ten: phu, onClick: onDong } : phu
  return createPortal(
    <div className="overlay tb-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className={`tb tb-${loai}`} role="alertdialog" aria-modal="true" aria-label={tieuDe}>
        <div className="tb-keo" aria-hidden="true" />
        <div className="tb-dau">
          <span className="tb-ic" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{hinh ? HINH[hinh] : BIEU_TUONG[loai]}</svg>
          </span>
          <div className="tb-chu">
            <div className="tb-nhan">{nhan ?? NHAN[loai]}</div>
            <h2 className="tb-tieu">{tieuDe}</h2>
            {moTa && <div className="tb-mota">{moTa}</div>}
          </div>
          <button type="button" className="tb-x" aria-label="Đóng" onClick={onDong}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        {(duKien?.length || anhHuong?.length || buoc?.length || children) ? (
          <div className="tb-than">
            {duKien && duKien.length > 0 && (
              <dl className="tb-dk">
                {duKien.map((d, i) => (
                  <div className="tb-dk-dong" key={i}>
                    <dt>{d.nhan}</dt>
                    <dd>
                      {d.di ? <button type="button" className="tb-link" onClick={d.di}>{d.gt}</button> : d.gt}
                      {d.chip && <span className="tb-chip">{d.chip}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {anhHuong && anhHuong.length > 0 && (
              <div className="tb-ah">
                {anhHuong.map((a, i) => (
                  <div className={`tb-ah-o${a.mau ? ` tb-ah-${a.mau}` : ''}`} key={i}><span>{a.nhan}</span><b>{a.gt}</b></div>
                ))}
              </div>
            )}
            {buoc && buoc.length > 0 && (
              <div className="tb-buoc">
                <div className="tb-buoc-dau">Muốn sửa thì</div>
                <ol>{buoc.map((b, i) => <li key={i}><span className="tb-buoc-so">{i + 1}</span><span>{b}</span></li>)}</ol>
              </div>
            )}
            {children}
          </div>
        ) : null}
        <div className="tb-chan">
          {nutThem && <button type="button" className={`btn tb-nut-them${nutThem.do ? ' tb-nut-do' : ''}`} onClick={nutThem.onClick}>{nutThem.ten}</button>}
          <span className="grow" />
          {phuNut && <button type="button" className="btn tb-nut-phu" onClick={phuNut.onClick}>{phuNut.ten}</button>}
          {nut && <button type="button" className={`btn pri tb-nut-chinh${loai === 'xoa' ? ' tb-nut-xoa' : ''}`} autoFocus disabled={nut.tat} onClick={nut.onClick}>{nut.ten}</button>}
        </div>
      </div>
    </div>,
    document.body,
  )
}
