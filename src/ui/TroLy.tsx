import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as SuKienTro } from 'react'
import { useNavigate } from 'react-router-dom'
import { heSoZoom } from './zoom'

export interface DongHang {
  tenHang: string
  soLuong: number
  dvt: string
  donGia: number
  thanhTien: number
}

export interface TinNhan {
  id: string
  loai: 'bot' | 'user'
  noiDung: string
  thoiGian: number
  laAnh?: boolean
  tenAnh?: string
  dongHang?: DongHang[]
  tongTien?: number
  khongDocDuoc?: boolean
  laTinChao?: boolean
  cauGoc?: string
}

const KHOA_STORAGE = 'iacc.troLy.v1'

const GOI_Y_MAU = [
  '12 kg thịt bò giá 250k',
  '3 thùng nước suối giá 120000',
  '30 cái móc dán giá 12k',
]

const DONG_MAU_ANH: DongHang[] = [
  { tenHang: 'Gạo ST25', soLuong: 10, dvt: 'kg', donGia: 28000, thanhTien: 280000 },
  { tenHang: 'Dầu ăn', soLuong: 5, dvt: 'lít', donGia: 52000, thanhTien: 260000 },
  { tenHang: 'Đường', soLuong: 4, dvt: 'kg', donGia: 24000, thanhTien: 96000 },
]

function taoTinChao(): TinNhan {
  return {
    id: 'chao-mung',
    loai: 'bot',
    noiDung: 'Chào bạn. Gõ hàng vừa mua, tôi lập sẵn phiếu mua hàng. Vd: 12 kg thịt bò giá 250k.',
    thoiGian: Date.now(),
    laTinChao: true,
  }
}

/** Nút nổi kéo được (T678): nhấn giữ rồi kéo sang chỗ khác, nhớ vị trí ở máy này. Toạ độ là left, top theo px CSS;
 *  trang có zoom ở thẻ html thì toạ độ chuột phải chia zoom (xem docs/BAY.md) */
const KHOA_VI_TRI = 'iacc.troLy.viTri'
const CO_NUT = 52, LE = 8
interface ViTri { x: number; y: number }
const manCss = () => { const z = heSoZoom(); return { W: window.innerWidth / z, H: window.innerHeight / z } }
const kep = (p: ViTri): ViTri => {
  const { W, H } = manCss()
  return { x: Math.min(Math.max(LE, p.x), W - CO_NUT - LE), y: Math.min(Math.max(LE, p.y), H - CO_NUT - LE) }
}
function docViTri(): ViTri | null {
  try {
    const v = JSON.parse(localStorage.getItem(KHOA_VI_TRI) || 'null')
    return v && typeof v.x === 'number' && typeof v.y === 'number' ? kep(v) : null
  } catch { return null }
}
/** Khung chat mở cạnh nút đã kéo: nút nửa phải thì canh mép phải, nửa dưới thì mở lên trên, không tràn ra ngoài màn */
function viTriKhung(v: ViTri, rong: number): CSSProperties {
  const { W, H } = manCss()
  const ngang: CSSProperties = v.x + CO_NUT / 2 > W / 2
    ? { right: Math.max(LE, Math.min(W - v.x - CO_NUT, W - rong - LE)), left: 'auto' }
    : { left: Math.max(LE, Math.min(v.x, W - rong - LE)), right: 'auto' }
  const doc: CSSProperties = v.y + CO_NUT / 2 > H / 2
    ? { bottom: H - v.y + LE, top: 'auto', maxHeight: v.y - LE * 2 }
    : { top: v.y + CO_NUT + LE, bottom: 'auto', maxHeight: H - v.y - CO_NUT - LE * 2 }
  return { ...ngang, ...doc }
}

function docLichSu(): TinNhan[] {
  try {
    const raw = localStorage.getItem(KHOA_STORAGE)
    if (!raw) return [taoTinChao()]
    const parsed = JSON.parse(raw) as TinNhan[]
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return [taoTinChao()]
  } catch {
    return [taoTinChao()]
  }
}

function ghiLichSu(ds: TinNhan[]) {
  try {
    localStorage.setItem(KHOA_STORAGE, JSON.stringify(ds))
  } catch {
    // Bỏ qua lỗi lưu bộ nhớ cục bộ
  }
}

function parseDonGia(raw: string): number | null {
  if (!raw) return null
  const s = raw.trim().replace(/\s*\/\s*[\p{L}\w]+$/u, '').trim()

  const matchTrieu = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:tr(?:iệu|ieu)?)$/i) || s.match(/^(\d+(?:[.,]\d+)?)\s+(?:tr(?:iệu|ieu)?)$/i)
  if (matchTrieu) {
    const n = parseFloat(matchTrieu[1].replace(',', '.'))
    return isNaN(n) ? null : Math.round(n * 1000000)
  }

  const matchK = s.match(/^(\d+(?:[.,]\d+)?)\s*(?:k|nghìn|nghin|ngàn|ngan)$/i) || s.match(/^(\d+(?:[.,]\d+)?)\s+(?:k|nghìn|nghin|ngàn|ngan)$/i)
  if (matchK) {
    const n = parseFloat(matchK[1].replace(',', '.'))
    return isNaN(n) ? null : Math.round(n * 1000)
  }

  const cleanDots = s.replace(/\./g, '')
  if (/^\d+$/.test(cleanDots)) {
    const n = parseInt(cleanDots, 10)
    return isNaN(n) ? null : n
  }

  const cleanCommas = s.replace(/,/g, '')
  if (/^\d+$/.test(cleanCommas)) {
    const n = parseInt(cleanCommas, 10)
    return isNaN(n) ? null : n
  }

  return null
}

function parseSoLuong(raw: string): number | null {
  if (!raw) return null
  const s = raw.trim().replace(',', '.')
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function tachMotDong(doan: string): DongHang | null {
  const m = doan.match(/^(\d+(?:[.,]\d+)?)\s+([\p{L}\w]+)\s+(.+?)\s+giá\s+(.+)$/iu)
  if (!m) return null

  const soLuong = parseSoLuong(m[1])
  const dvt = m[2].trim()
  const tenHang = m[3].trim()
  const donGia = parseDonGia(m[4])

  if (soLuong === null || donGia === null || !tenHang || !dvt) {
    return null
  }

  return {
    tenHang,
    soLuong,
    dvt,
    donGia,
    thanhTien: Math.round(soLuong * donGia),
  }
}

export function tachDongHang(cau: string): DongHang[] {
  if (!cau || typeof cau !== 'string') return []
  const baoVe = cau.replace(/(\d+),(\d+)/g, '$1___PHAY___$2')
  const phan = baoVe.split(/\s*(?:,|;|\n|\svà\s)\s*/i)

  const ketQua: DongHang[] = []
  for (const p of phan) {
    const doan = p.replace(/___PHAY___/g, ',').trim()
    if (!doan) continue
    const dong = tachMotDong(doan)
    if (dong) {
      ketQua.push(dong)
    }
  }
  return ketQua
}

function cungNgay(t1: number, t2: number): boolean {
  const d1 = new Date(t1)
  const d2 = new Date(t2)
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

function dinhDangNgayGio(ts: number): string {
  const d = new Date(ts)
  const ngay = String(d.getDate()).padStart(2, '0')
  const thang = String(d.getMonth() + 1).padStart(2, '0')
  const nam = d.getFullYear()
  const gio = String(d.getHours()).padStart(2, '0')
  const phut = String(d.getMinutes()).padStart(2, '0')
  return `${ngay}/${thang}/${nam} ${gio}:${phut}`
}

function dinhDangGio(ts: number): string {
  const d = new Date(ts)
  const gio = String(d.getHours()).padStart(2, '0')
  const phut = String(d.getMinutes()).padStart(2, '0')
  return `${gio}:${phut}`
}

function dinhDangTien(n: number): string {
  return n.toLocaleString('vi-VN')
}

export function TroLy() {
  const [mo, setMo] = useState(false)
  const [phongTo, setPhongTo] = useState(false)
  const [danhSachTin, setDanhSachTin] = useState<TinNhan[]>(() => docLichSu())
  const [noiDungNhap, setNoiDungNhap] = useState('')
  const [dangGo, setDangGo] = useState(false)

  const dayChatRef = useRef<HTMLDivElement>(null)
  const oNhapRef = useRef<HTMLTextAreaElement>(null)
  const nav = useNavigate()

  // kéo nút nổi (T678): di chuyển quá 5px mới tính là kéo, thả ra thì không mở khung
  const [viTri, setViTri] = useState<ViTri | null>(docViTri)
  const [dangKeo, setDangKeo] = useState(false)
  const keoRef = useRef<{ x0: number; y0: number; trai: number; tren: number; keo: boolean; moi?: ViTri } | null>(null)
  const vuaKeo = useRef(false)
  const coViTri = viTri !== null
  useEffect(() => {
    if (!coViTri) return
    const on = () => setViTri(v => v && kep(v))
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [coViTri])
  const batDauKeo = (e: SuKienTro<HTMLButtonElement>) => {
    if (e.button !== 0) return
    e.preventDefault()   // không bôi đen chữ trên trang khi kéo
    const r = e.currentTarget.getBoundingClientRect(), z = heSoZoom()
    keoRef.current = { x0: e.clientX, y0: e.clientY, trai: r.left / z, tren: r.top / z, keo: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const keoNut = (e: SuKienTro<HTMLButtonElement>) => {
    const k = keoRef.current
    if (!k) return
    const dx = e.clientX - k.x0, dy = e.clientY - k.y0
    if (!k.keo && Math.hypot(dx, dy) < 5) return
    if (!k.keo) { k.keo = true; setDangKeo(true) }
    const z = heSoZoom()
    k.moi = kep({ x: k.trai + dx / z, y: k.tren + dy / z })
    setViTri(k.moi)
  }
  const thaNut = () => {
    const k = keoRef.current
    keoRef.current = null
    if (!k?.keo) return
    setDangKeo(false)
    vuaKeo.current = true   // lần click ngay sau khi thả không mở, không đóng khung
    window.setTimeout(() => { vuaKeo.current = false }, 0)
    if (k.moi) try { localStorage.setItem(KHOA_VI_TRI, JSON.stringify(k.moi)) } catch { /* trình duyệt chặn lưu thì thôi */ }
  }

  useEffect(() => {
    dayChatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [danhSachTin, dangGo, mo])

  useEffect(() => {
    const batEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mo) {
        setMo(false)
      }
    }
    window.addEventListener('keydown', batEsc)
    return () => window.removeEventListener('keydown', batEsc)
  }, [mo])

  const guiTinNhan = (vanBan: string) => {
    const cau = vanBan.trim()
    if (!cau || dangGo) return

    const tinUser: TinNhan = {
      id: String(Date.now()) + '-u',
      loai: 'user',
      noiDung: cau,
      thoiGian: Date.now(),
    }

    const dsMoi = [...danhSachTin, tinUser]
    setDanhSachTin(dsMoi)
    ghiLichSu(dsMoi)
    setNoiDungNhap('')
    setDangGo(true)

    setTimeout(() => {
      const dongHang = tachDongHang(cau)
      let tinBot: TinNhan

      if (dongHang.length > 0) {
        const tongTien = dongHang.reduce((s, d) => s + d.thanhTien, 0)
        tinBot = {
          id: String(Date.now()) + '-b',
          loai: 'bot',
          noiDung: `Đã đọc được ${dongHang.length} dòng hàng:`,
          thoiGian: Date.now(),
          dongHang,
          tongTien,
          cauGoc: cau,
        }
      } else {
        tinBot = {
          id: String(Date.now()) + '-b',
          loai: 'bot',
          noiDung: 'Tôi chưa đọc được câu này. Thử gõ theo mẫu: 12 kg thịt bò giá 250k.',
          thoiGian: Date.now(),
          khongDocDuoc: true,
          cauGoc: cau,
        }
      }

      setDanhSachTin(prev => {
        const capNhat = [...prev, tinBot]
        ghiLichSu(capNhat)
        return capNhat
      })
      setDangGo(false)
    }, 900)
  }

  const guiAnh = () => {
    if (dangGo) return
    const tinUser: TinNhan = {
      id: String(Date.now()) + '-u-img',
      loai: 'user',
      noiDung: 'Gửi ảnh hoá đơn mua hàng',
      thoiGian: Date.now(),
      laAnh: true,
      tenAnh: 'hoa-don-mua.jpg',
    }

    const dsMoi = [...danhSachTin, tinUser]
    setDanhSachTin(dsMoi)
    ghiLichSu(dsMoi)
    setDangGo(true)

    setTimeout(() => {
      const tongTien = DONG_MAU_ANH.reduce((s, d) => s + d.thanhTien, 0)
      const tinBot: TinNhan = {
        id: String(Date.now()) + '-b-img',
        loai: 'bot',
        noiDung: 'Đã đọc được 3 dòng hàng từ ảnh:',
        thoiGian: Date.now(),
        dongHang: DONG_MAU_ANH,
        tongTien,
        cauGoc: '10 kg Gạo ST25 giá 28k, 5 lít Dầu ăn giá 52k, 4 kg Đường giá 24k',
      }
      setDanhSachTin(prev => {
        const capNhat = [...prev, tinBot]
        ghiLichSu(capNhat)
        return capNhat
      })
      setDangGo(false)
    }, 900)
  }

  const guiDinhKem = () => {
    if (dangGo) return
    setDangGo(true)
    setTimeout(() => {
      const tinBot: TinNhan = {
        id: String(Date.now()) + '-b-file',
        loai: 'bot',
        noiDung: 'Bản mẫu chưa nhận file. Bản chính sẽ đọc PDF, Excel hoá đơn.',
        thoiGian: Date.now(),
      }
      setDanhSachTin(prev => {
        const capNhat = [...prev, tinBot]
        ghiLichSu(capNhat)
        return capNhat
      })
      setDangGo(false)
    }, 600)
  }

  const xoaLichSu = () => {
    const banDau = [taoTinChao()]
    setDanhSachTin(banDau)
    ghiLichSu(banDau)
  }

  const suaLai = (cau: string | undefined) => {
    if (!cau) return
    setNoiDungNhap(cau)
    oNhapRef.current?.focus()
  }

  const lapPhieuMua = () => {
    nav('/app/mua-hang/4-1-1/moi')
  }

  return (
    <>
      {mo && (
        <aside
          aria-label="Trợ lý IACC"
          className={`tl-khung ${phongTo ? 'tl-phong-to' : ''}`}
          style={viTri ? viTriKhung(viTri, phongTo ? 720 : 400) : undefined}
        >
          {/* Đầu khung */}
          <div className="tl-dau">
            <div className="tl-dau-trai">
              <span className="tl-avatar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
              </span>
              <strong className="tl-tieu-de">Trợ lý IACC</strong>
              <span className="tl-badge">Bản mẫu</span>
            </div>
            <div className="tl-dau-phai">
              <button
                type="button"
                className="tl-btn-icon"
                onClick={() => setPhongTo(v => !v)}
                title={phongTo ? 'Thu nhỏ' : 'Phóng to'}
                aria-label={phongTo ? 'Thu nhỏ' : 'Phóng to'}
              >
                {phongTo ? (
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="10" y1="14" x2="3" y2="21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="tl-btn-icon"
                onClick={xoaLichSu}
                title="Xoá cuộc trò chuyện"
                aria-label="Xoá cuộc trò chuyện"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
                </svg>
              </button>
              <button
                type="button"
                className="tl-btn-icon"
                onClick={() => setMo(false)}
                title="Đóng"
                aria-label="Đóng"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Thân khung cuộn dọc */}
          <div className="tl-than">
            {danhSachTin.map((tin, idx) => {
              const hienMocNgay = idx === 0 || !cungNgay(danhSachTin[idx - 1].thoiGian, tin.thoiGian)
              const laUser = tin.loai === 'user'

              return (
                <div key={tin.id} className="tl-nhom-tin">
                  {hienMocNgay && (
                    <div className="tl-moc-ngay">{dinhDangNgayGio(tin.thoiGian)}</div>
                  )}

                  <div className={`tl-hang-tin ${laUser ? 'tl-tin-user' : 'tl-tin-bot'}`}>
                    {!laUser && (
                      <span className="tl-avatar-bot">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                        </svg>
                      </span>
                    )}

                    <div className="tl-bong-bong">
                      {!laUser && <div className="tl-ten-bot">Trợ lý IACC</div>}

                      {tin.laAnh && (
                        <div className="tl-the-anh">
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>{tin.tenAnh || 'hoa-don-mua.jpg'}</span>
                        </div>
                      )}

                      <div className="tl-noi-dung">{tin.noiDung}</div>

                      {/* Bảng kết quả nếu có dòng hàng */}
                      {tin.dongHang && tin.dongHang.length > 0 && (
                        <div className="tl-the-kq">
                          <table className="tl-bang-kq">
                            <thead>
                              <tr>
                                <th>Tên hàng</th>
                                <th className="tl-num">SL</th>
                                <th>ĐVT</th>
                                <th className="tl-num">Đơn giá</th>
                                <th className="tl-num">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tin.dongHang.map((d, dIdx) => (
                                <tr key={dIdx}>
                                  <td>{d.tenHang}</td>
                                  <td className="tl-num">{d.soLuong}</td>
                                  <td>{d.dvt}</td>
                                  <td className="tl-num">{dinhDangTien(d.donGia)} đ</td>
                                  <td className="tl-num">{dinhDangTien(d.thanhTien)} đ</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="tl-tong-kq">
                            <span>Tổng cộng:</span>
                            <span>{dinhDangTien(tin.tongTien || 0)} đ</span>
                          </div>
                          <div className="tl-hanh-dong">
                            <button
                              type="button"
                              className="tl-btn-chinh"
                              onClick={lapPhieuMua}
                            >
                              Lập phiếu mua
                            </button>
                            <button
                              type="button"
                              className="tl-btn-phu"
                              onClick={() => suaLai(tin.cauGoc)}
                            >
                              Sửa lại
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Chip gợi ý khi chào hoặc không đọc được */}
                      {(tin.laTinChao || tin.khongDocDuoc) && (
                        <div className="tl-chip-ds">
                          {GOI_Y_MAU.map((goiY, gIdx) => (
                            <button
                              key={gIdx}
                              type="button"
                              className="tl-chip"
                              onClick={() => guiTinNhan(goiY)}
                            >
                              {goiY}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="tl-gio">{dinhDangGio(tin.thoiGian)}</div>
                    </div>
                  </div>
                </div>
              )
            })}

            {dangGo && (
              <div className="tl-hang-tin tl-tin-bot">
                <span className="tl-avatar-bot">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                  </svg>
                </span>
                <div className="tl-dang-go">
                  <span className="tl-cham" />
                  <span className="tl-cham" />
                  <span className="tl-cham" />
                </div>
              </div>
            )}

            <div ref={dayChatRef} />
          </div>

          {/* Chân khung */}
          <div className="tl-chan">
            <button
              type="button"
              className="tl-btn-kem"
              onClick={guiDinhKem}
              title="Đính kèm tệp"
              aria-label="Đính kèm tệp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44,11.05l-9.19,9.19a6,6,0,0,1-8.49-8.49l9.19-9.19a4,4,0,0,1,5.66,5.66l-9.2,9.19a2,2,0,0,1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button
              type="button"
              className="tl-btn-kem"
              onClick={guiAnh}
              title="Gửi ảnh"
              aria-label="Gửi ảnh"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <textarea
              ref={oNhapRef}
              className="tl-o-nhap"
              rows={1}
              value={noiDungNhap}
              placeholder="Nhập tin nhắn..."
              onChange={e => setNoiDungNhap(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  guiTinNhan(noiDungNhap)
                }
              }}
            />
            <button
              type="button"
              className="tl-btn-gui"
              disabled={!noiDungNhap.trim() || dangGo}
              onClick={() => guiTinNhan(noiDungNhap)}
              title="Gửi tin nhắn"
              aria-label="Gửi tin nhắn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </aside>
      )}

      {/* Nút nổi góc dưới phải, nhấn giữ kéo được sang chỗ khác (T678) */}
      <button
        type="button"
        className={`tl-float-btn${dangKeo ? ' keo' : ''}`}
        style={viTri ? { left: viTri.x, top: viTri.y, right: 'auto', bottom: 'auto' } : undefined}
        onClick={() => { if (!vuaKeo.current) setMo(v => !v) }}
        onPointerDown={batDauKeo}
        onPointerMove={keoNut}
        onPointerUp={thaNut}
        onPointerCancel={thaNut}
        title="Trợ lý IACC. Nhấn giữ rồi kéo để đổi chỗ"
        aria-label="Trợ lý IACC"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
      </button>
    </>
  )
}
