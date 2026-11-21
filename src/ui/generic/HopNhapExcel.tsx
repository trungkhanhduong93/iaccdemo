import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { ScreenProps, Row, CatalogCfg } from '../../modules/types'
import { useSession } from '../../app/session'
import { taiMauNhapDm, taiDuLieuDm, kiemFileNhapDm, taiFileLoi, nhapDm } from './mauNhapDm'
import type { DongKiem, KetQuaKiem, KetQuaNhap, PhamViTai, BaoTienDo } from './nhapDmKieu'
import { NhapXlKiemTra } from './NhapXlKiemTra'
import { NhapXlDangNhap, NhapXlKetQua } from './NhapXlKetQua'
import { Select } from '../Dropdown'

export interface BoHamNhap {
  tieuDe?: string
  tenNgan?: string
  tenThuong?: string
  taiMau: () => void | Promise<void>
  taiDuLieu?: (phamVi: PhamViTai) => void | Promise<void>
  kiemFile: (file: File) => Promise<KetQuaKiem>
  ghi: (kq: KetQuaKiem, baoTienDo: BaoTienDo) => Promise<KetQuaNhap>
  taiLoi: (kq: KetQuaKiem) => void | Promise<void>
  noiDungThemB1?: ReactNode
  lyDoChan?: string | null
  thongBaoXong?: (kq: KetQuaNhap) => string
  khoKey?: string
}

export interface HopNhapExcelProps {
  sc?: ScreenProps['sc']
  cfg?: CatalogCfg
  all?: Row[]
  rowsLoc?: Row[]     // danh sách theo bộ lọc đang áp (T892)
  rowsTrang?: Row[]   // các dòng ở trang đang xem (T892)
  onDong: () => void
  boHam?: BoHamNhap
}

type Buoc = 'chon' | 'kiem' | 'nhap' | 'xong'

const IconTai = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14" /></svg>
)
const IconTich = () => (
  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
)

/** Hộp nhập danh mục từ Excel 3 bước theo luồng IVT, bản vẽ backup/mau-T892 (T892, T896) */
export function HopNhapExcel({ sc, cfg, all, rowsLoc, rowsTrang, onDong, boHam }: HopNhapExcelProps) {
  const { s, set, toast } = useSession()
  const catKey = sc?.code ?? sc?.slug ?? ''
  const tenNgan = (boHam?.tenNgan ?? sc?.ngan ?? 'danh mục').trim()
  const tenThuong = boHam?.tenThuong ?? (tenNgan.charAt(0).toLowerCase() + tenNgan.slice(1))
  const tieuDeHop = boHam?.tieuDe ?? `Nhập ${tenThuong} từ Excel`

  const [buoc, setBuoc] = useState<Buoc>('chon')
  const [file, setFile] = useState<File | null>(null)
  const [loiChung, setLoiChung] = useState('')
  const [dangDoc, setDangDoc] = useState(false)
  const [keo, setKeo] = useState(false)
  const [phamVi, setPhamVi] = useState<PhamViTai>('tat')
  const [kq, setKq] = useState<KetQuaKiem | null>(null)
  const [tienDo, setTienDo] = useState<{ xong: number; tong: number; dangGhi?: DongKiem }>({ xong: 0, tong: 0 })
  const [kqNhap, setKqNhap] = useState<KetQuaNhap | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const khoCu = useRef(boHam?.khoKey)
  useEffect(() => {
    if (khoCu.current !== boHam?.khoKey) {
      khoCu.current = boHam?.khoKey
      setFile(null); setKq(null); setKqNhap(null); setLoiChung(''); setBuoc('chon')
    }
  }, [boHam?.khoKey])

  const dongDuoc = buoc !== 'nhap'
  useEffect(() => {
    const phim = (e: KeyboardEvent) => { if (e.key === 'Escape' && dongDuoc) onDong() }
    window.addEventListener('keydown', phim)
    return () => window.removeEventListener('keydown', phim)
  }, [dongDuoc, onDong])

  const chonFile = (f?: File | null) => {
    if (!f) return
    setFile(f)
    setLoiChung('')
  }
  const doiFile = () => {
    setFile(null); setKq(null); setKqNhap(null); setLoiChung(''); setBuoc('chon')
  }

  const kiemTra = async () => {
    if (!file || boHam?.lyDoChan) return
    setDangDoc(true)
    try {
      if (boHam) {
        const k = await boHam.kiemFile(file)
        if (k.loiChung) { setLoiChung(k.loiChung); return }
        setKq(k)
        setBuoc('kiem')
      } else {
        const k = await kiemFileNhapDm(file, catKey, s, all ?? [])
        if (k.loiChung) { setLoiChung(k.loiChung); return }
        setKq(k)
        setBuoc('kiem')
      }
    } finally {
      setDangDoc(false)
    }
  }

  const soNhap = kq ? kq.dem.moi + kq.dem.sua : 0
  const nhap = async () => {
    if (!kq || soNhap <= 0) return
    setTienDo({ xong: 0, tong: soNhap })
    setBuoc('nhap')
    if (boHam) {
      const k = await boHam.ghi(kq, (xong, tong, dangGhi) => setTienDo({ xong, tong, dangGhi }))
      setKqNhap(k)
      setBuoc('xong')
      toast(boHam.thongBaoXong ? boHam.thongBaoXong(k) : `Đã nhập ${k.moi.length + k.sua.length} ${tenThuong}`)
    } else {
      const k = await nhapDm(catKey, kq, s, set, cfg?.phien, (xong, tong, dangGhi) => setTienDo({ xong, tong, dangGhi }))
      setKqNhap(k)
      setBuoc('xong')
      toast(`Đã nhập ${k.moi.length + k.sua.length} ${tenThuong}`)
    }
  }

  const taiLoi = () => {
    if (!kq) return
    if (boHam) void boHam.taiLoi(kq)
    else void taiFileLoi(catKey, tenNgan, s, kq)
  }
  const rowsTai = phamVi === 'loc' ? (rowsLoc ?? []) : phamVi === 'trang' ? (rowsTrang ?? []) : (all ?? [])
  const taiMau = () => {
    if (boHam) void boHam.taiMau()
    else void taiMauNhapDm(catKey, tenNgan, s, (all ?? []).slice(0, 2))
  }
  const taiDuLieu = () => {
    if (boHam) void boHam.taiDuLieu?.(phamVi)
    else void taiDuLieuDm(catKey, tenNgan, s, rowsTai)
  }

  const phanTram = buoc === 'chon' ? 33.3 : buoc === 'kiem' ? 66.6
    : buoc === 'nhap' ? 66.6 + 33.4 * (tienDo.tong ? tienDo.xong / tienDo.tong : 0) : 100
  const nut = buoc === 'chon' ? { ten: dangDoc ? 'Đang kiểm tra…' : 'Kiểm tra dữ liệu', tat: !file || dangDoc || Boolean(boHam?.lyDoChan), bam: kiemTra }
    : buoc === 'kiem' ? { ten: `Nhập ${soNhap} dòng`, tat: soNhap <= 0, bam: nhap }
    : buoc === 'nhap' ? { ten: 'Đang nhập…', tat: true, bam: () => {} }
    : { ten: 'Xong', tat: false, bam: onDong }

  // Bước 3 có 2 màn: Đang nhập, Kết quả; xong thì bước 3 thành 'het' (vòng xanh lá, Hoàn tất)
  const viTri = { chon: 0, kiem: 1, nhap: 2, xong: 2 }[buoc]
  const cacBuoc = ['Chọn file', 'Kiểm tra dữ liệu', 'Nhập vào danh mục'].map((ten, i) => {
    const tt = i < viTri ? 'xong' : i > viTri ? 'cho' : buoc === 'xong' ? 'het' : 'dang'
    const phu = { xong: 'Xong', het: 'Hoàn tất', dang: buoc === 'nhap' ? 'Đang ghi' : 'Đang làm', cho: '' }[tt]
    return { ten, tt, phu }
  })

  return (
    <div className="nxh-nen">
      <div className="nxh-hop" role="dialog" aria-modal="true" aria-labelledby="nxh-td">
        <div className="nxh-dau">
          <button type="button" className="nxh-dong" aria-label="Đóng" disabled={!dongDuoc} onClick={onDong}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <h1 id="nxh-td" className="nxh-td">{tieuDeHop}</h1>
          <div className="nxh-dau-phai">
            <button type="button" className="nxh-b p hd" disabled={nut.tat} onClick={nut.bam}>{nut.ten}</button>
          </div>
        </div>
        <div className={`nxh-vach${buoc === 'xong' ? ' het' : ''}`} role="progressbar" aria-label="Tiến trình nhập"
          aria-valuenow={Math.round(phanTram)} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${phanTram}%` }} />
        </div>

        <div className="nxh-than">
          <nav className="nxh-buoc" aria-label="Các bước">
            <ol>
              {cacBuoc.map((b, i) => (
                <li key={b.ten} className={`nxh-bc ${b.tt}`} aria-current={b.tt === 'dang' || b.tt === 'het' ? 'step' : undefined}>
                  <div className="nxh-bc-cot">
                    <div className="nxh-bc-so">{b.tt === 'xong' || b.tt === 'het' ? <IconTich /> : i + 1}</div>
                    {i < 2 && <div className="nxh-bc-noi" />}
                  </div>
                  <div className="nxh-bc-chu">
                    <div className="nxh-bc-ten">{b.ten}</div>
                    {b.phu && <div className="nxh-bc-phu">{b.phu}</div>}
                  </div>
                </li>
              ))}
            </ol>
            {buoc === 'kiem' && kq && (
              <div className="nxh-tep">
                <div className="nxh-tep-ten" title={kq.tenFile}>{kq.tenFile}</div>
                {kq.dem.tat} dòng · <button type="button" className="nxh-lk" onClick={doiFile}>Đổi file</button>
              </div>
            )}
          </nav>

          {buoc === 'chon' && (
            <div className="nxh-b1">
              {boHam?.noiDungThemB1}
              {boHam?.lyDoChan && <div className="nxh-loi" role="alert">{boHam.lyDoChan}</div>}
              <label className={`nxh-tha${keo ? ' keo' : ''}`}
                onDragOver={e => { e.preventDefault(); setKeo(true) }}
                onDragLeave={() => setKeo(false)}
                onDrop={e => { e.preventDefault(); setKeo(false); chonFile(e.dataTransfer.files?.[0]) }}>
                <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7b97b3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.5a3.75 3.75 0 0 1 .5 7.47" /><path d="M12 12v8M9 15l3-3 3 3" /></svg>
                {file ? (
                  <>
                    <div className="nxh-tha-td">{file.name}</div>
                    <div className="nxh-tha-phu">{Math.max(1, Math.round(file.size / 1024))} KB · <button type="button" className="nxh-lk" onClick={e => { e.preventDefault(); doiFile() }}>Đổi file</button></div>
                  </>
                ) : (
                  <>
                    <div className="nxh-tha-td">Kéo thả file vào đây</div>
                    <div className="nxh-tha-phu">File .xlsx, tối đa 3.000 dòng</div>
                    <span className="nxh-b p hd nxh-tha-nut">Chọn file</span>
                  </>
                )}
                <input ref={inputRef} type="file" accept=".xlsx" hidden
                  onChange={e => { chonFile(e.target.files?.[0]); e.target.value = '' }} />
              </label>
              {loiChung && <div className="nxh-loi" role="alert">{loiChung}</div>}

              <div>
                <div className="nxh-chua-co">Chưa có file để nhập?</div>
                <div className="nxh-the">
                  <div className="nxh-the-dong">
                    <svg aria-hidden="true" width="44" height="44" viewBox="0 0 40 40" className="nxh-the-ic">
                      <path d="M10 3.5h14.5l8 8V34a2.5 2.5 0 0 1-2.5 2.5H10A2.5 2.5 0 0 1 7.5 34V6A2.5 2.5 0 0 1 10 3.5z" fill="#eaf6ef" stroke="#138a52" strokeWidth="1.4" />
                      <path d="M24.5 3.5V9a2.5 2.5 0 0 0 2.5 2.5h5.5" fill="#c9ead6" stroke="#138a52" strokeWidth="1.4" strokeLinejoin="round" />
                      <rect x="11.5" y="16" width="15" height="11" rx="1.5" fill="#fff" stroke="#138a52" strokeWidth="1.2" />
                      <path d="M11.5 19.7h15M11.5 23.3h15M16.5 16v11" stroke="#138a52" strokeWidth="1" />
                      <circle cx="30" cy="30" r="7.5" fill="#138a52" stroke="#fff" strokeWidth="1.5" />
                      <path d="M30 26.3v7.4M26.3 30h7.4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <div className="nxh-the-chu">
                      <div className="nxh-the-td">File mẫu để thêm {tenThuong} mới</div>
                      <div className="nxh-the-phu">Cột theo form Thêm mới, ghi chú cách điền ở tiêu đề cột. Dòng ví dụ để ở sheet riêng.</div>
                    </div>
                    <div className="nxh-the-nut">
                      <button type="button" className="nxh-b nxh-b-tai" onClick={taiMau}><IconTai />Tải file mẫu</button>
                    </div>
                  </div>
                  <div className="nxh-the-dong">
                    <svg aria-hidden="true" width="44" height="44" viewBox="0 0 40 40" className="nxh-the-ic">
                      <path d="M10 3.5h14.5l8 8V34a2.5 2.5 0 0 1-2.5 2.5H10A2.5 2.5 0 0 1 7.5 34V6A2.5 2.5 0 0 1 10 3.5z" fill="#fff5ea" stroke="#d0650a" strokeWidth="1.4" />
                      <path d="M24.5 3.5V9a2.5 2.5 0 0 0 2.5 2.5h5.5" fill="#f9d6ad" stroke="#d0650a" strokeWidth="1.4" strokeLinejoin="round" />
                      <path d="M12 17h13M12 21h13M12 25h8" stroke="#d0650a" strokeWidth="1.4" strokeLinecap="round" />
                      <circle cx="30" cy="30" r="7.5" fill="#d0650a" stroke="#fff" strokeWidth="1.5" />
                      <path d="M27.2 32.8l.6-2.4 4-4 1.8 1.8-4 4z" fill="#fff" />
                    </svg>
                    <div className="nxh-the-chu">
                      <div className="nxh-the-td">Dữ liệu đang có để sửa hàng loạt</div>
                      <div className="nxh-the-phu">Sửa trong Excel rồi nhập lại. Dòng trùng mã được cập nhật. Ô bắt buộc hoặc đã khoá mà để trống thì giữ giá trị cũ.</div>
                    </div>
                    <div className="nxh-the-nut">
                      {!boHam && (
                        <Select className="inp nxh-chon" aria-label={`Lấy ${tenThuong} nào`} value={phamVi} onChange={e => setPhamVi(e.target.value as PhamViTai)}>
                          <option value="tat">Tất cả {all?.length ?? 0} {tenThuong}</option>
                          <option value="loc">{rowsLoc?.length ?? 0} {tenThuong} theo bộ lọc</option>
                          <option value="trang">{rowsTrang?.length ?? 0} {tenThuong} ở trang đang xem</option>
                        </Select>
                      )}
                      <button type="button" className="nxh-b nxh-b-tai" onClick={taiDuLieu}><IconTai />Tải xuống</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {buoc === 'kiem' && kq && (
            <div className="nxh-phai"><NhapXlKiemTra kq={kq} onTaiLoi={taiLoi} /></div>
          )}
          {buoc === 'nhap' && kq && (
            <div className="nxh-phai">
              <NhapXlDangNhap tenDm={tenNgan} xong={tienDo.xong} tong={tienDo.tong} dangGhi={tienDo.dangGhi} cot={kq.cot} />
            </div>
          )}
          {buoc === 'xong' && kq && kqNhap && (
            <div className="nxh-phai">
              <NhapXlKetQua kq={kqNhap} tenDm={tenNgan} tenFile={kq.tenFile} cot={kq.cot}
                onTaiLoi={taiLoi} onNhapKhac={doiFile} onMoDs={onDong} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
