// Cụm nút bên phải thanh trên web (T803, QD108): Hỗ trợ, tải ứng dụng, ngôn ngữ, chuông thông báo, kèm các hộp mở từ đó
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSession } from '../session'
import { Popover } from '../../ui/Dropdown'
import { PHIM } from '../../ui/BangPhimTat'
import { CoTron, CongTac, D, DauHop, DongThongBao, HopNen, PhanDoan, QrMau, Sv } from './chung'
import {
  DS_CAI_DAT, DS_NGON_NGU, DS_THE, DS_THONG_BAO, LINK_TAI_LIEU, caiDatMacDinh, hanMaHoTro, maHoTroMoi, nhomNgay, useThongBao,
  type TheTb,
} from './data'

type Khung = '' | 'tb' | 'qr' | 'nn' | 'ht'
type Hop = '' | 'cfg' | 'gy' | 'ma' | 'pt'

export function NutThanhTren() {
  const tb = useThongBao()
  const loc = useLocation()
  const [mo, setMo] = useState<Khung>('')
  const [hop, setHop] = useState<Hop>('')
  const [tuKhung, setTuKhung] = useState(false)   // hộp Cài đặt mở từ khung thông báo: đóng hộp thì quay lại khung
  const rHt = useRef<HTMLButtonElement>(null), rQr = useRef<HTMLButtonElement>(null)
  const rNn = useRef<HTMLButtonElement>(null), rTb = useRef<HTMLButtonElement>(null)

  useEffect(() => { setMo(''); setHop('') }, [loc.pathname])

  // Phím ? mở bảng phím tắt khi không đứng trong ô nhập
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.key !== '?' || e.ctrlKey || e.metaKey || e.altKey || t?.closest('input, textarea, select, [contenteditable="true"]')) return
      setMo(''); setHop('pt')
    }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [])

  const bat = (k: Khung) => () => setMo(m => m === k ? '' : k)
  const dong = (k: Khung) => () => setMo(m => m === k ? '' : m)
  const moHop = (h: Hop) => { setTuKhung(mo === 'tb'); setMo(''); setHop(h) }
  const dongHop = useCallback(() => setHop(''), [])
  const dongCaiDat = useCallback(() => { setHop(''); if (tuKhung) setMo('tb') }, [tuKhung])

  return (
    <>
      <button ref={rHt} type="button" className={`tb-nut-ht${mo === 'ht' ? ' open' : ''}`} aria-haspopup="menu" aria-expanded={mo === 'ht'} onClick={bat('ht')}>
        <Sv d={D.hoTro} c={17} /><span>Hỗ trợ</span><Sv d={D.xuong} c={14} net={2.2} />
      </button>
      <div className="tb-sep" />
      <button ref={rQr} type="button" className={`tb-nut${mo === 'qr' ? ' open' : ''}`} title="Tải ứng dụng" aria-label="Tải ứng dụng" aria-expanded={mo === 'qr'} onClick={bat('qr')}>
        <Sv d={D.dienThoai} c={20} net={1.8} />
      </button>
      <button ref={rNn} type="button" className={`tb-nut rong${mo === 'nn' ? ' open' : ''}`} title="Ngôn ngữ" aria-label="Đổi ngôn ngữ" aria-haspopup="menu" aria-expanded={mo === 'nn'} onClick={bat('nn')}>
        <CoTron nn={tb.nn} /><Sv d={D.xuong} c={14} net={2.2} />
      </button>
      <button ref={rTb} type="button" className={`tb-nut${mo === 'tb' ? ' open' : ''}`} title="Thông báo" aria-expanded={mo === 'tb'}
        aria-label={tb.soChuaDoc ? `Thông báo, ${tb.soChuaDoc} chưa đọc` : 'Thông báo'} onClick={bat('tb')}>
        <Sv d={D.chuong} c={20} net={1.8} />
        {tb.soChuaDoc > 0 && <span className="tb-so">{tb.soChuaDoc > 99 ? '99+' : tb.soChuaDoc}</span>}
      </button>

      <Popover anchor={rHt} open={mo === 'ht'} onClose={dong('ht')} align="end" className="tb-pop tb-pop-ht" width={230}>
        <a data-mi className="tb-mi" href={LINK_TAI_LIEU} target="_blank" rel="noopener noreferrer" onClick={dong('ht')}>
          <Sv d={D.sach} /><span className="grow">Tài liệu hướng dẫn</span><Sv d={D.moNgoai} c={14} net={2} className="tb-mi-mo" />
        </a>
        <button data-mi type="button" className="tb-mi" onClick={() => moHop('gy')}><Sv d={D.gopY} /><span className="grow">Góp ý</span></button>
        <button data-mi type="button" className="tb-mi" onClick={() => moHop('ma')}><Sv d={D.khoa} /><span className="grow">Lấy mã hỗ trợ</span></button>
        <button data-mi type="button" className="tb-mi" onClick={() => moHop('pt')}><Sv d={D.banPhim} /><span className="grow">Phím tắt</span><kbd className="tb-kbd">?</kbd></button>
      </Popover>

      <Popover anchor={rQr} open={mo === 'qr'} onClose={dong('qr')} align="end" className="tb-pop tb-pop-qr" width={300} role="dialog">
        <div className="tb-qr-dau"><h2>IACC Cloud</h2><p>Quét mã QR để tải ứng dụng</p></div>
        <QrMau />
        <ol className="tb-qr-buoc">
          <li><i>1</i>Mở camera điện thoại và quét mã</li>
          <li><i>2</i>Tự động mở App Store hoặc Google Play</li>
        </ol>
      </Popover>

      <Popover anchor={rNn} open={mo === 'nn'} onClose={dong('nn')} align="end" className="tb-pop tb-pop-nn" width={200}>
        {DS_NGON_NGU.map(l => (
          <button key={l.id} data-mi type="button" role="menuitemradio" aria-checked={tb.nn === l.id} className={`tb-mi tb-mi-nn${tb.nn === l.id ? ' on' : ''}`}
            onClick={() => { tb.doiNgonNgu(l.id); setMo('') }}>
            <CoTron nn={l.id} c={26} /><span className="grow">{l.ten}</span>{tb.nn === l.id && <Sv d={D.tich} net={2.2} className="tb-mi-tich" />}
          </button>
        ))}
      </Popover>

      <Popover anchor={rTb} open={mo === 'tb'} onClose={dong('tb')} align="end" className="tb-pop tb-pop-tb" width={420} role="dialog">
        <KhungThongBao onCaiDat={() => moHop('cfg')} onDong={() => setMo('')} />
      </Popover>

      {hop === 'cfg' && <HopCaiDat onDong={dongCaiDat} />}
      {hop === 'gy' && <HopGopY onDong={dongHop} />}
      {hop === 'ma' && <HopMaHoTro onDong={dongHop} />}
      {hop === 'pt' && <HopPhimTat onDong={dongHop} />}
    </>
  )
}

/** Khung thông báo thả từ chuông: 3 thẻ, lọc chưa đọc, đọc hết */
function KhungThongBao({ onCaiDat, onDong }: { onCaiDat: () => void; onDong: () => void }) {
  const tb = useThongBao()
  const [the, setThe] = useState<TheTb>('vh')
  const [chiMoi, setChiMoi] = useState(false)
  const ganDay = DS_THONG_BAO.filter(n => n.ago < 7)
  const ds = ganDay.filter(n => n.the === the && (!chiMoi || tb.chuaDoc(n)))
  const nhom = [...new Set(ds.map(nhomNgay))]

  return (
    <>
      <div className="tb-k-dau">
        <h2>Thông báo</h2>
        <button type="button" className="tb-nut-ic nho" title="Cài đặt thông báo" aria-label="Cài đặt thông báo" onClick={onCaiDat}><Sv d={D.banhRang} net={1.8} /></button>
        <span className="grow" />
        <button type="button" className="tb-k-doc-het" onClick={tb.docHet}><Sv d={D.docHet} c={16} net={2} />Đọc hết</button>
      </div>
      <PhanDoan deu nhan="Thẻ thông báo" chon={the} onChon={setThe} ds={DS_THE.map(t => {
        const so = ganDay.filter(n => n.the === t.id && tb.chuaDoc(n)).length
        return { id: t.id, ten: <>{t.ten}{so > 0 && <em>{so}</em>}</> }
      })} />
      <div className="tb-k-loc">
        <CongTac bat={chiMoi} onDoi={() => setChiMoi(v => !v)} nhan="Chỉ hiện chưa đọc" truoc="Chỉ hiện chưa đọc" />
      </div>
      <div className="tb-k-ds">
        {nhom.map(g => (
          <div key={g}>
            <div className="tb-k-nhom">{g}</div>
            {ds.filter(n => nhomNgay(n) === g).map(n => (
              <DongThongBao key={n.id} n={n} chuaDoc={tb.chuaDoc(n)} onDoc={() => tb.danhDau([n.id])} onDi={onDong} />
            ))}
          </div>
        ))}
        {!ds.length && <div className="tb-trong">{chiMoi ? 'Đã đọc hết thông báo ở mục này.' : 'Chưa có thông báo ở mục này.'}</div>}
      </div>
      <Link className="tb-k-tat-ca" to="/app/thong-bao" onClick={onDong}>Xem tất cả thông báo</Link>
    </>
  )
}

/** Hộp Cài đặt thông báo: bật tắt từng loại, dùng chung cho web và ứng dụng điện thoại */
export function HopCaiDat({ onDong }: { onDong: () => void }) {
  const tb = useThongBao()
  const { toast } = useSession()
  const [cd, setCd] = useState(tb.caiDat)
  const [q, setQ] = useState('')
  const tu = q.trim().toLowerCase()
  const ids = DS_CAI_DAT.flatMap(g => g.ds.map(r => r.id))
  const batHet = ids.every(id => cd[id])
  const nhom = DS_CAI_DAT.map(g => ({ ...g, ds: g.ds.filter(r => !tu || r.ten.toLowerCase().includes(tu)) })).filter(g => g.ds.length)

  return (
    <HopNen nhan="Cài đặt thông báo" rong={520} onDong={onDong}>
      <DauHop ten="Cài đặt thông báo" phu="Dùng chung cho web và ứng dụng điện thoại." onDong={onDong} />
      <div className="tb-cd-tim">
        <label className="tb-o-tim"><Sv d={D.tim} c={16} net={2} />
          <input type="search" placeholder="Tìm loại thông báo" aria-label="Tìm loại thông báo" value={q} onChange={e => setQ(e.target.value)} />
        </label>
      </div>
      <div className="tb-cd-dau">
        <span className="grow">Loại thông báo</span><span>Bật tất cả</span>
        <CongTac bat={batHet} nhan="Bật tất cả" onDoi={() => setCd(Object.fromEntries(ids.map(id => [id, !batHet])))} />
      </div>
      <div className="tb-cd-ds">
        {nhom.map(g => (
          <div key={g.ten}>
            <div className="tb-cd-nhom">{g.ten}</div>
            {g.ds.map(r => (
              <div key={r.id} className="tb-cd-dong">
                <span className="grow">{r.ten}</span>
                <CongTac bat={!!cd[r.id]} nhan={r.ten} onDoi={() => setCd(c => ({ ...c, [r.id]: !c[r.id] }))} />
              </div>
            ))}
          </div>
        ))}
        {!nhom.length && <div className="tb-trong">Không có loại thông báo khớp từ tìm.</div>}
      </div>
      <div className="tb-hop-chan">
        <button type="button" className="tb-btn chu" onClick={() => setCd(caiDatMacDinh())}>Khôi phục mặc định</button>
        <span className="grow" />
        <button type="button" className="tb-btn" onClick={onDong}>Hủy</button>
        <button type="button" className="tb-btn chinh" onClick={() => { tb.luuCaiDat(cd); toast('Đã lưu cài đặt thông báo'); onDong() }}>Lưu</button>
      </div>
    </HopNen>
  )
}

const LOAI_GOP_Y = [{ id: 'loi', ten: 'Báo lỗi' }, { id: 'dx', ten: 'Đề xuất tính năng' }, { id: 'khac', ten: 'Khác' }] as const

/** Ô có nhãn và dấu sao bắt buộc */
function O({ nhan, sao, phu, children }: { nhan: string; sao?: boolean; phu?: string; children: ReactNode }) {
  return (
    <label className="tb-o">
      <span>{nhan}{sao && <b className="tb-sao"> *</b>}{phu && <small> {phu}</small>}</span>
      {children}
    </label>
  )
}

/** Hộp Góp ý: báo lỗi, đề xuất tính năng gửi bộ phận hỗ trợ */
export function HopGopY({ onDong }: { onDong: () => void }) {
  const { s, toast } = useSession()
  const [ten, setTen] = useState(s.ten)
  const [sdt, setSdt] = useState('')
  const [loai, setLoai] = useState<typeof LOAI_GOP_Y[number]['id']>('loi')
  const [tieuDe, setTieuDe] = useState('')
  const [nd, setNd] = useState('')
  const [anh, setAnh] = useState<string[]>([])
  const [hienQr, setHienQr] = useState(false)
  const chonAnh = useRef<HTMLInputElement>(null)
  const du = ten.trim() && sdt.trim() && tieuDe.trim().length >= 10 && nd.trim().length >= 50

  // Ảnh xem trước giữ bằng địa chỉ tạm: đóng hộp thì trả bộ nhớ
  const anhRef = useRef(anh); anhRef.current = anh
  useEffect(() => () => anhRef.current.forEach(URL.revokeObjectURL), [])

  return (
    <HopNen nhan="Góp ý" rong={640} onDong={onDong}>
      <DauHop d={D.gopY} ten="Góp ý" phu="Bộ phận hỗ trợ phản hồi trong 1–2 ngày làm việc." onDong={onDong} />
      <div className="tb-hop-than">
        <div className="tb-gy-qr">
          <Sv d={D.dienThoai} />
          <span className="grow">Muốn gõ trên điện thoại? Quét mã QR để mở form góp ý trên máy của bạn.</span>
          <button type="button" aria-expanded={hienQr} onClick={() => setHienQr(v => !v)}>{hienQr ? 'Ẩn mã QR' : 'Hiện mã QR'}</button>
        </div>
        {hienQr && <div className="tb-gy-qr-ma"><QrMau /></div>}
        <div className="tb-luoi-2">
          <O nhan="Tên liên hệ" sao><input value={ten} onChange={e => setTen(e.target.value)} /></O>
          <O nhan="Số điện thoại" sao><input type="tel" inputMode="tel" placeholder="Số để bộ phận hỗ trợ gọi lại" value={sdt} onChange={e => setSdt(e.target.value)} /></O>
        </div>
        <div className="tb-o">
          <span>Loại góp ý<b className="tb-sao"> *</b></span>
          <PhanDoan nhan="Loại góp ý" chon={loai} onChon={setLoai} ds={[...LOAI_GOP_Y]} />
        </div>
        <O nhan="Tiêu đề" sao>
          <span className="tb-o-dem">
            <input placeholder="Tóm tắt vấn đề, 10–50 ký tự" maxLength={50} value={tieuDe} onChange={e => setTieuDe(e.target.value)} />
            <i>{tieuDe.length}/50</i>
          </span>
        </O>
        <O nhan="Nội dung" sao>
          <span className="tb-o-dem cao">
            <textarea placeholder="Mô tả chi tiết: đang làm ở màn nào, bấm gì, thấy gì. Tối thiểu 50 ký tự." maxLength={2000} value={nd} onChange={e => setNd(e.target.value)} />
            <i>{nd.length}/2000</i>
          </span>
        </O>
        <div className="tb-o">
          <span>Hình ảnh <small>(tối đa 5 ảnh)</small></span>
          <div className="tb-gy-anh">
            {anh.map(u => (
              <span key={u} className="tb-gy-anh-o">
                <img src={u} alt="Ảnh đính kèm" />
                <button type="button" aria-label="Bỏ ảnh" onClick={() => { URL.revokeObjectURL(u); setAnh(a => a.filter(x => x !== u)) }}><Sv d={D.x} c={12} net={2.4} /></button>
              </span>
            ))}
            {anh.length < 5 && <button type="button" className="tb-gy-chon" onClick={() => chonAnh.current?.click()}><Sv d={D.mayAnh} c={22} net={1.8} />Chọn ảnh</button>}
            <input ref={chonAnh} type="file" accept="image/*" multiple hidden onChange={e => {
              const moi = [...(e.target.files ?? [])].slice(0, 5 - anh.length).map(f => URL.createObjectURL(f))
              setAnh(a => [...a, ...moi]); e.target.value = ''
            }} />
          </div>
        </div>
      </div>
      <div className="tb-hop-chan">
        <span className="grow" />
        <button type="button" className="tb-btn" onClick={onDong}>Hủy</button>
        <button type="button" className="tb-btn chinh" disabled={!du} title={du ? undefined : 'Điền đủ các ô có dấu sao. Tiêu đề từ 10 ký tự, nội dung từ 50 ký tự'}
          onClick={() => { toast('Đã gửi góp ý. Bộ phận hỗ trợ phản hồi trong 1–2 ngày làm việc'); onDong() }}>Gửi góp ý</button>
      </div>
    </HopNen>
  )
}

/** Mã hỗ trợ và giờ hết hạn; tạo mã mới thì mã cũ hết hiệu lực */
export function useMaHoTro() {
  const [ma, setMa] = useState(maHoTroMoi)
  const [han, setHan] = useState(hanMaHoTro)
  const [daChep, setDaChep] = useState(false)
  return {
    ma, han, daChep,
    taoMoi: () => { setMa(maHoTroMoi()); setHan(hanMaHoTro()); setDaChep(false) },
    chep: () => { navigator.clipboard?.writeText(ma).catch(() => { /* trình duyệt chặn chép: người dùng đọc mã trên màn */ }); setDaChep(true) },
  }
}

/** Hộp Mã hỗ trợ: mã đọc cho nhân viên hỗ trợ, hiệu lực 2 giờ */
export function HopMaHoTro({ onDong }: { onDong: () => void }) {
  const m = useMaHoTro()
  return (
    <HopNen nhan="Mã hỗ trợ" rong={460} onDong={onDong}>
      <DauHop d={D.khoa} ten="Mã hỗ trợ" phu={`Hiệu lực 2 giờ, đến ${m.han}`} onDong={onDong} />
      <div className="tb-ma">
        <p>Đọc mã này cho nhân viên hỗ trợ để họ vào xem phiên làm việc của bạn.</p>
        <div className="tb-ma-o">
          <span className="tb-ma-so">{m.ma}</span>
          <button type="button" className="tb-btn nho" title="Chép mã" onClick={m.chep}><Sv d={m.daChep ? D.tich : D.chep} c={16} net={2} />{m.daChep ? 'Đã chép' : 'Chép'}</button>
        </div>
        <p className="mo">Tạo mã mới thì mã cũ hết hiệu lực ngay.</p>
      </div>
      <div className="tb-hop-chan giua">
        <button type="button" className="tb-btn" onClick={onDong}>Đóng</button>
        <button type="button" className="tb-btn chinh" onClick={m.taoMoi}>Tạo mã mới</button>
      </div>
    </HopNen>
  )
}

/** Hộp Phím tắt: bảng chức năng và phím của form chứng từ */
function HopPhimTat({ onDong }: { onDong: () => void }) {
  return (
    <HopNen nhan="Phím tắt" rong={560} onDong={onDong}>
      <DauHop d={D.banPhim} ten="Phím tắt" phu="Dùng khi đang mở form chứng từ" onDong={onDong} />
      <div className="tb-hop-than">
        <div className="tb-pt">
          <div className="tb-pt-dau"><span>Chức năng</span><span>Phím tắt</span></div>
          {PHIM.map(([viec, phim]) => (
            <div key={viec} className="tb-pt-dong">
              <span>{viec}</span>
              <span className="tb-pt-phim">{phim.split(' + ').map((k, i) => <span key={k}>{i > 0 && <i>+</i>}<kbd className="tb-kbd">{k}</kbd></span>)}</span>
            </div>
          ))}
        </div>
      </div>
    </HopNen>
  )
}
