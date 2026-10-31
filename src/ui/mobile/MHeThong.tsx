import { useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import {
  cheDoHienTai,
  donViHienTai,
  dsCuaHang,
  dsDonVi,
  loaiHinhDv,
  namTaiChinh,
  ngayDauNam,
  useSession,
  type PpGtgt,
  type PpTndn,
} from '../../app/session'
import { CHE_DO, CHE_DO_HOP_LE, type CheDo } from '../../app/che-do'
import { CUA_HANG, KHO, NGUOI_DUNG } from '../../data/mock'
import { GOI, GOIS, MODS, kieuGhiSo } from '../../app/plan'
import {
  CAU_HINH_NGUOI_DUNG,
  MAC_DINH,
  QUYEN,
  VAI_TRO,
} from '../../modules/he-thong/HeThong'
import {
  ChonKenh,
  KENH_ONLINE,
  KENH_SAN,
  NHOM_HKD,
  type LoaiHinh,
  type PpHkd,
} from '../../modules/onboarding/OnboardFabi'

import {
  HOM_NAY,
  THAO_TAC_GOI,
  doiTuongTT,
  dongTu,
  khopLocNK,
  locNKMacDinh,
  luaChonNK,
  useNhatKyDayDu,
  vietTat,
  type DongNK,
  type LocNK,
} from '../../modules/he-thong/nhatKyMau'
import { dmy, pad, pick, rng, fold } from '../format'
import { Select } from '../Dropdown'
import { Icon } from '../Icon'
import { Note } from '../Page'
import { ChonKhoangNgay, ONgay, docNgay } from '../ChonNgay'
import { MFormDm } from './MFormDm'
import { MTrong } from './MTrong'

// ── 1. Màn Người dùng ──
export const MNguoiDung: FC<ScreenProps> = ({ sc }) => {
  const { toast } = useSession()
  const [editUser, setEditUser] = useState<Row | null>(null)
  const [q, setQ] = useState('')

  const dsLoc = useMemo(() => {
    if (!q.trim()) return NGUOI_DUNG
    const fq = fold(q.trim())
    return NGUOI_DUNG.filter(u => fold(`${u.ten} ${u.email} ${u.vaiTro}`).includes(fq))
  }, [q])

  return (
    <div className="m-ht-khung">
      {/* Ô tìm kiếm */}
      <div className="m-ht-dau">
        <div className="m-ht-hang-tim">
          <div className="m-ht-tim">
            <Icon n="search" className="m-ht-tim-ic ic sm" />
            <input
              type="text"
              className="m-ht-tim-inp"
              placeholder="Tìm tên, email, vai trò..."
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm người dùng"
            />
            {q ? (
              <button
                type="button"
                className="m-ht-tim-x"
                onClick={() => setQ('')}
                aria-label="Xoá tìm kiếm"
              >
                <Icon n="x" className="ic sm" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="m-ht-tom-tat">
        <span>
          Tổng <b>{dsLoc.length}</b> / {NGUOI_DUNG.length} người dùng
        </span>
      </div>

      {dsLoc.length === 0 ? (
        <MTrong kieu="tim" tieuDe="Không tìm thấy người dùng" moTa="Thử tìm theo tên, email khác" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {dsLoc.map((u, idx) => {
            const tenVietTat = u.ten.split(' ').slice(-2).map((x: string) => x[0]).join('')
            return (
              <div
                key={`${u.email}_${idx}`}
                className="m-ht-the-user"
                onClick={() => setEditUser(u)}
                role="button"
                tabIndex={0}
              >
                <div className="m-ht-user-trai">
                  <div className="m-ht-user-av">{tenVietTat}</div>
                  <div className="m-ht-user-info">
                    <span className="m-ht-user-ten">{u.ten}</span>
                    <span className="m-ht-user-email">{u.email}</span>
                    <span className="m-ht-user-phu">
                      {u.vaiTro} · {u.pham}
                    </span>
                  </div>
                </div>
                <div className="m-ht-user-phai">
                  <span className={`chip ${u.tt === 'ok' ? 'ok' : 'warn'}`}>
                    {u.tt === 'ok' ? 'Đang dùng' : 'Chưa nhận lời'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nút thêm nổi */}
      <button
        type="button"
        className="m-nut-them-fab"
        onClick={() => setEditUser({})}
        aria-label="Mời người dùng"
      >
        <Icon n="mail" className="ic sm" />
        <span>Mời người dùng</span>
      </button>

      {/* Tấm nổi từ đáy sửa/thêm người dùng */}
      {editUser && (
        <MFormDm
          sc={sc}
          cauHinh={CAU_HINH_NGUOI_DUNG}
          edit={editUser}
          all={NGUOI_DUNG}
          ten="Người dùng"
          tenNgan="Người dùng"
          onDong={() => setEditUser(null)}
          onLuu={() => {
            const isMoi = !editUser.ten
            toast(isMoi ? 'Đã gửi lời mời tới email' : 'Đã lưu người dùng')
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}

// ── 2. Màn Vai trò và phân quyền ──
export const MPhanQuyen: FC<ScreenProps> = () => {
  const { toast } = useSession()
  const [vt, setVt] = useState(VAI_TRO[2]) // Mặc định Kế toán viên

  // Trạng thái quyền: mod -> quyen -> boolean
  const [quyens, setQuyens] = useState<Record<string, Record<string, boolean>>>(() => {
    const init: Record<string, Record<string, boolean>> = {}
    for (const m of MODS) {
      init[m] = {}
      for (const q of QUYEN) {
        init[m][q] = MAC_DINH[vt]?.includes(q) ?? false
      }
    }
    return init
  })

  const doiVaiTro = (moiVt: string) => {
    setVt(moiVt)
    const init: Record<string, Record<string, boolean>> = {}
    for (const m of MODS) {
      init[m] = {}
      for (const q of QUYEN) {
        init[m][q] = MAC_DINH[moiVt]?.includes(q) ?? false
      }
    }
    setQuyens(init)
  }

  const toggleQuyen = (m: string, q: string) => {
    setQuyens(prev => ({
      ...prev,
      [m]: {
        ...prev[m],
        [q]: !prev[m]?.[q],
      },
    }))
  }

  return (
    <div className="m-ht-khung">
      {/* Danh sách vai trò trượt ngang */}
      <div className="m-pq-vt-ds">
        {VAI_TRO.map(v => (
          <button
            key={v}
            type="button"
            className={`m-pq-vt-btn ${v === vt ? 'on' : ''}`}
            onClick={() => doiVaiTro(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <div style={{ margin: '10px 0 6px', fontSize: 13, color: 'var(--muted)' }}>
        Quyền của <b>{vt}</b> theo từng phân hệ:
      </div>

      {/* Danh sách quyền theo phân hệ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {MODS.map(m => (
          <div key={m} className="m-pq-mod-the">
            <div className="m-pq-mod-ten">{m}</div>
            <div className="m-pq-quyen-ds">
              {QUYEN.map(q => {
                const bat = quyens[m]?.[q] ?? false
                return (
                  <label key={q} className="m-pq-quyen-dong">
                    <span className="m-pq-quyen-nhan">{q}</span>
                    <input
                      type="checkbox"
                      className="bat-tat"
                      checked={bat}
                      onChange={() => toggleQuyen(m, q)}
                    />
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Nút lưu dính đáy */}
      <div className="m-form-chan-dinh">
        <button
          type="button"
          className="btn pri"
          style={{ width: '100%', height: 44, borderRadius: 12 }}
          onClick={() => toast(`Đã lưu quyền của ${vt}`)}
        >
          Lưu quyền {vt}
        </button>
      </div>
    </div>
  )
}

// ── 3. Màn Nhật ký thao tác (T689, T693) ──
export const MNhatKyThaoTac: FC<ScreenProps> = () => {
  const { s } = useSession()
  const [q, setQ] = useState('')
  const [dongChon, setDongChon] = useState<DongNK | null>(null)
  // Mở màn chưa có thẻ; bấm phễu chọn điều kiện rồi bấm Lọc mới tải (T695)
  const [ap, setAp] = useState<LocNK | null>(null)
  const [nhap, setNhap] = useState<LocNK>(locNKMacDinh)
  const [moLoc, setMoLoc] = useState(false)
  const dat = (k: keyof LocNK, v: string) => setNhap(x => ({ ...x, [k]: v }))

  const tatCa = useNhatKyDayDu(s.goi)
  const dsThaoTac = THAO_TAC_GOI[s.goi] ?? THAO_TAC_GOI.S
  const luaChon = useMemo(() => luaChonNK(tatCa), [tatCa])

  const rowsLoc = useMemo(() => {
    if (!ap) return []
    const fq = fold(q.trim())
    return tatCa.filter(d => khopLocNK(d, ap) && (!fq || fold(`${d.so || ''} ${d.ai || ''} ${d.tk || ''}`).includes(fq)))
  }, [tatCa, ap, q])

  const nhanNgay = !ap ? '' : ap.tu === ap.den ? (ap.tu === HOM_NAY ? `Hôm nay, ${ap.tu}` : ap.tu) : `${ap.tu} – ${ap.den}`
  const onLoc = () => { setAp(nhap); setMoLoc(false); setDongChon(null) }
  const chonO = (k: 'tt' | 'ch' | 'tk' | 'loai', ten: string, ds: [string, string][]) => (
    <label className='m-nk-loc-o'>
      <span className='m-nk-loc-nhan'>{ten}</span>
      <Select className='m-nk-loc-sel' value={nhap[k]} aria-label={ten} onChange={e => dat(k, e.target.value)}>
        <option value=''>Tất cả</option>
        {ds.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </Select>
    </label>
  )

  return (
    <div className='m-nk-khung'>
      {/* Ô tìm kiếm và nút phễu */}
      <div className='m-nk-hang-tim'>
        <label className='m-nk-o-tim'>
          <svg
            aria-hidden='true'
            width='17'
            height='17'
            viewBox='0 0 24 24'
            fill='none'
            stroke='var(--faint)'
            strokeWidth='2'
            strokeLinecap='round'
          >
            <circle cx='11' cy='11' r='7' />
            <path d='m20 20-3.5-3.5' />
          </svg>
          <input
            type='text'
            className='m-nk-inp'
            aria-label='Tìm nhật ký'
            placeholder='Tìm số chứng từ, tài khoản'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </label>
        <button
          type='button'
          className={`m-nk-btn-loc${ap ? ' on' : ''}`}
          aria-label='Bộ lọc nhật ký'
          onClick={() => setMoLoc(true)}
        >
          <svg
            aria-hidden='true'
            width='19'
            height='19'
            viewBox='0 0 24 24'
            fill='none'
            stroke='var(--ink)'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M3 5h18l-7 8v6l-4-2v-4z' />
          </svg>
        </button>
      </div>

      {/* Dòng chữ xám: khoảng ngày đã lọc · N thao tác */}
      {ap ? (
        <div className='m-nk-dong-dem'>
          {nhanNgay} · {rowsLoc.length} thao tác
        </div>
      ) : (
        <div className='m-nk-trong'>Bấm phễu chọn điều kiện rồi bấm Lọc để xem nhật ký.</div>
      )}
      {ap && rowsLoc.length === 0 ? <div className='m-nk-trong'>Không có thao tác nào khớp điều kiện lọc.</div> : null}

      {/* Danh sách thẻ */}
      <div className='m-nk-ds'>
        {rowsLoc.map(d => {
          const gio = d.luc.slice(11) || d.luc.split(' ')[1] || ''
          const laChon = dongChon?.ma === d.ma
          return (
            <button
              key={d.ma}
              type='button'
              className={`m-nk-the ${laChon ? 'chon' : ''}`}
              onClick={() => setDongChon(d)}
            >
              {/* Dòng 1: thao tác đậm, giờ xám bên phải */}
              <div className='m-nk-the-d1'>
                <span className='m-nk-the-tt'>{d.tt}</span>
                <span className='m-nk-the-gio'>{gio}</span>
              </div>

              {/* Dòng 2 (khi có so): tên chứng từ, số chứng từ xanh đậm, ngày chứng từ xám */}
              {d.so ? (
                <div className='m-nk-the-d2'>
                  <span>{d.loai}</span>
                  <span className='m-nk-the-so'>{d.so}</span>
                  <span className='m-nk-the-ngay'>{d.ngay}</span>
                </div>
              ) : null}

              {/* Dòng 3: <ai> · <vaiTro> xám */}
              <div className='m-nk-the-p'>{d.ai} · {d.vaiTro}</div>

              {/* Dòng 4: <cửa hàng hoặc 'Không gắn cửa hàng'> · <tb> xám */}
              <div className='m-nk-the-p'>{d.ch || 'Không gắn cửa hàng'} · {d.tb}</div>
            </button>
          )
        })}
      </div>

      {/* Bảng lọc trượt từ dưới lên (T695) */}
      {moLoc ? (
        <>
          <div className='m-nk-nen-mo' onClick={() => setMoLoc(false)} />
          <div className='m-nk-loc' role='dialog' aria-label='Bộ lọc nhật ký'>
            <div className='m-nk-keo'>
              <span />
            </div>
            <div className='m-nk-loc-dau'>Bộ lọc</div>
            <div className='m-nk-loc-than'>
              <div className='m-nk-loc-o'>
                <span className='m-nk-loc-nhan'>Ngày thao tác</span>
                <ChonKhoangNgay
                  value={{ tu: docNgay(nhap.tu), den: docNgay(nhap.den) }}
                  onChange={k => setNhap(x => ({ ...x, tu: dmy(k.tu), den: dmy(k.den) }))}
                />
              </div>
              {chonO('tt', 'Thao tác', dsThaoTac.map(t => [t, t]))}
              {chonO('ch', 'Cửa hàng', luaChon.ch.map(c => [c, c]))}
              {chonO('tk', 'Tài khoản', luaChon.tk.map(([tk, ai]) => [tk, `${ai} (${tk})`]))}
              {chonO('loai', 'Tên chứng từ', luaChon.loai.map(l => [l, l]))}
              <div className='m-nk-loc-o'>
                <span className='m-nk-loc-nhan'>Ngày chứng từ</span>
                <div className='m-nk-loc-khoang'>
                  <ONgay value={nhap.ctTu} placeholder='Từ ngày' ariaLabel='Ngày chứng từ từ' onChange={v => dat('ctTu', v)} />
                  <span>–</span>
                  <ONgay value={nhap.ctDen} placeholder='Đến ngày' ariaLabel='Ngày chứng từ đến' onChange={v => dat('ctDen', v)} />
                </div>
              </div>
            </div>
            <div className='m-nk-loc-chan'>
              <button type='button' className='m-nk-ct-nut-dong' onClick={() => setNhap(locNKMacDinh())}>
                Đặt lại
              </button>
              <button type='button' className='m-nk-loc-nut-loc' onClick={onLoc}>
                Lọc
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* Bảng trượt chi tiết từ dưới lên */}
      {dongChon ? (
        <>
          <div
            className='m-nk-nen-mo'
            onClick={() => setDongChon(null)}
          />
          <div
            className='m-nk-ct'
            role='dialog'
            aria-label='Chi tiết nhật ký'
          >
            {/* Thanh kéo xám */}
            <div className='m-nk-keo'>
              <span />
            </div>

            {/* Header: avatar tròn + câu mô tả */}
            <div className='hd'>
              <span className='av'>{vietTat(dongChon.ai)}</span>
              <div className='hd-t'>
                <b>{dongChon.ai}</b> {dongTu(dongChon)}{dongChon.so ? <> <b>{doiTuongTT(dongChon)}</b></> : null}
              </div>
            </div>

            {/* Thân cuộn */}
            <div className='m-nk-ct-than'>
              {/* Hộp cảnh báo khi có canhBao */}
              {dongChon.canhBao ? (
                <div className='cb'>
                  <svg
                    aria-hidden='true'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='var(--orange-d)'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    style={{ flex: 'none', marginTop: 2 }}
                  >
                    <path d='M12 3 2 20h20z' />
                    <path d='M12 10v4M12 17h.01' />
                  </svg>
                  <span>{dongChon.canhBao}</span>
                </div>
              ) : null}

              {/* Mục Thông tin chi tiết */}
              <div className='muc'>
                <h3 className='mt'>Thông tin chi tiết</h3>
                <div className='ds'>
                  <div className='dsr'>
                    <span className='dsn'>Tài khoản</span>
                    <span className='dsg'>
                      {dongChon.ai}{dongChon.tk ? <> <span style={{ color: 'var(--muted)' }}>({dongChon.tk})</span></> : null}
                    </span>
                  </div>
                  <div className='dsr'>
                    <span className='dsn'>Chức vụ</span>
                    <span className='dsg'>{dongChon.vaiTro || '—'}</span>
                  </div>
                  <div className='dsr'>
                    <span className='dsn'>Thao tác</span>
                    <span className='dsg'>{dongChon.tt}</span>
                  </div>
                  <div className='dsr'>
                    <span className='dsn'>Thời gian thao tác</span>
                    <span className='dsg'>{dongChon.luc}{dongChon.giay ? `:${dongChon.giay}` : ''}</span>
                  </div>
                  <div className='dsr'>
                    <span className='dsn'>Thiết bị</span>
                    <span className='dsg'>{dongChon.tb}</span>
                  </div>
                </div>
              </div>

              {/* Mục Chứng từ (khi có so) */}
              {dongChon.so ? (
                <div className='muc'>
                  <h3 className='mt'>Chứng từ</h3>
                  <div className='ds'>
                    <div className='dsr'>
                      <span className='dsn'>Tên chứng từ</span>
                      <span className='dsg'>{dongChon.loai}</span>
                    </div>
                    <div className='dsr'>
                      <span className='dsn'>Số chứng từ</span>
                      <span className='dsg'>
                        <span className='so'>{dongChon.so}</span>
                      </span>
                    </div>
                    <div className='dsr'>
                      <span className='dsn'>Ngày chứng từ</span>
                      <span className='dsg'>{dongChon.ngay}</span>
                    </div>
                    <div className='dsr'>
                      <span className='dsn'>Cửa hàng</span>
                      <span className='dsg'>{dongChon.ch || 'Không gắn cửa hàng'}</span>
                    </div>
                    {s.goi !== 'S' && dongChon.trangThai ? (
                      <div className='dsr'>
                        <span className='dsn'>Trạng thái</span>
                        <span className='dsg'>{dongChon.trangThai}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Mục Lịch sử thao tác */}
              <div className='muc'>
                <h3 className='mt'>Lịch sử thao tác</h3>
                <ol className='nd'>
                  {dongChon.noiDung && dongChon.noiDung.map((nd, idx) => (
                    <li key={idx}>{nd}</li>
                  ))}
                </ol>
                {dongChon.lyDo ? (
                  <div className='ly'>
                    <span className='nho'>Lý do người làm nhập</span>
                    <div>{dongChon.lyDo}</div>
                  </div>
                ) : null}
                <div className='nho' style={{ margin: '16px 0 12px' }}>
                  Mã nhật ký {dongChon.ma}
                </div>
              </div>
            </div>

            {/* Đáy dính: CHỈ nút Đóng */}
            <div className='m-nk-ct-chan'>
              <button
                type='button'
                onClick={() => setDongChon(null)}
                className='m-nk-ct-nut-dong'
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}



// ── 4. Màn Thông tin đơn vị ──
const PP_GTGT: Record<PpGtgt, string> = {
  tyLe: 'Theo phương pháp trực tiếp (% doanh thu)',
  khauTru: 'Theo phương pháp khấu trừ',
}
const PP_THU_NHAP: Record<PpHkd, string> = {
  doanhThu: 'Theo doanh thu',
  loiNhuan: 'Theo lợi nhuận tính thuế',
}

export const MThongTinDonVi: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const tt = s.ttDv?.[s.donVi] ?? {}
  const [dauNam, setDauNam] = useState(ngayDauNam(s))
  const [nam, setNam] = useState(namTaiChinh(s))
  const doiNam = (n: number) => {
    setNam(n)
    setDauNam(d => d.replace(/\d{4}$/, String(n)))
  }

  const dsCn = dsCuaHang(s)
  const chuaKhai = Boolean(s.choKeKhai?.[s.donVi])   // chưa khai Thông tin kê khai thuế: để trống loại hình, như bản máy tính
  const [f, setF] = useState(() => ({
    ten: dv.ten,
    mst: dv.mst,
    diaChi: dv.diaChi,
    loai: (chuaKhai ? '' : loaiHinhDv(s, dv)) as LoaiHinh | '',
    nhom: tt.nhom ?? 1,
    ppHkd: (tt.ppHkd ?? 'doanhThu') as PpHkd,
    ppGtgt: s.ppGtgt,
    ppTndn: s.ppTndn,
    cnChinh: tt.cnChinh || dsCn[0]?.id || '',
    kenhOnline: tt.kenhOnline ?? KENH_ONLINE,
    kenhSan: tt.kenhSan ?? KENH_SAN,
  }))

  const sua = (p: Partial<typeof f>) => setF(x => ({ ...x, ...p }))
  const dnCoDinh = s.goi === 'PR'
  const ppCoDinh = NHOM_HKD[f.nhom - 1]?.pp ?? null
  const tndnCoDinh = f.loai === 'dn' && dnCoDinh
  const dnStandard = s.goi === 'S'   // doanh nghiệp gói Standard: TT58 trường hợp 1, thuế theo tỷ lệ % doanh thu, không chọn (T632)
  // Gói Standard chọn được mọi cách tính thuế; ngoài phần kê khai được thì báo gói cao hơn, như bản máy tính
  const ngoaiStd = s.goi !== 'S' ? [] : f.loai === 'hkd'
    ? ((ppCoDinh ?? f.ppHkd) === 'loiNhuan' ? ['thuế TNCN theo lợi nhuận'] : [])
    : f.loai === 'dn' ? [...(f.ppGtgt === 'khauTru' ? ['thuế GTGT khấu trừ'] : []), ...(f.ppTndn === 'thuNhap' ? ['thuế TNDN theo lợi nhuận'] : [])] : []
  const bat = (ds: string[], k: string) => (ds.includes(k) ? ds.filter(x => x !== k) : [...ds, k])
  const mstGoc = Boolean(dsDonVi({ dvMoi: s.dvMoi }).find(d => d.id === s.donVi)?.mst)

  const cheDoTheoLoai = (l: LoaiHinh): CheDo =>
    l === 'hkd'
      ? CHE_DO_HOP_LE[s.goi].includes('TT152')
        ? 'TT152'
        : s.cheDo
      : s.goi === 'PL' || dnStandard
      ? 'TT58'
      : s.cheDo

  const luuDv = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dauNam)) {
      toast('Ngày đầu năm cần nhập dạng dd/mm/yyyy')
      return
    }
    if (!f.ten.trim()) {
      toast('Tên đơn vị không được để trống')
      return
    }
    const { ten, mst, diaChi, loai, nhom, ppHkd, cnChinh, kenhOnline, kenhSan } = f
    if (!loai) {
      set({ ttDv: { ...s.ttDv, [s.donVi]: { ...s.ttDv?.[s.donVi], ten, mst, diaChi } }, ngayDauNam: { ...s.ngayDauNam, [s.donVi]: dauNam }, namTaiChinh: { ...s.namTaiChinh, [s.donVi]: nam } })
      toast('Đã lưu thông tin đơn vị')
      return
    }
    set({
      choKeKhai: { ...s.choKeKhai, [s.donVi]: false },
      cheDo: cheDoTheoLoai(loai),
      ppGtgt: loai === 'hkd' || dnStandard ? 'tyLe' : dnCoDinh ? 'khauTru' : f.ppGtgt,
      ppTndn: tndnCoDinh ? 'thuNhap' : dnStandard ? 'tyLe' : f.ppTndn,
      ngayDauNam: { ...s.ngayDauNam, [s.donVi]: dauNam },
      namTaiChinh: { ...s.namTaiChinh, [s.donVi]: nam },
      ttDv: {
        ...s.ttDv,
        [s.donVi]: {
          ten,
          mst,
          diaChi,
          loai,
          nhom,
          ppHkd: ppCoDinh ?? ppHkd,
          cnChinh,
          kenhOnline,
          kenhSan: kenhSan.filter(k => kenhOnline.includes(k)),
        },
      },
    })
    toast('Đã lưu thông tin đơn vị')
  }

  const { loai } = f
  const cdDn: CheDo[] = s.goi === 'PL' || dnStandard ? ['TT58'] : CHE_DO_HOP_LE[s.goi]

  return (
    <div className="m-ht-khung">
      {/* Thẻ 1: Thông tin trên chứng từ, báo cáo */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Thông tin trên chứng từ, báo cáo</h3>
        <div className="m-form-luoi">
          <div className="m-form-dong">
            <label className="m-form-nhan">Tên đơn vị</label>
            <input
              className="inp"
              value={f.ten}
              onChange={e => sua({ ten: e.target.value })}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Mã số thuế</label>
            <input
              className="inp"
              readOnly={mstGoc}
              value={f.mst}
              placeholder="Chưa khai mã số thuế"
              onChange={e => sua({ mst: e.target.value })}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Số điểm bán</label>
            <input className="inp" readOnly value={dsCn.length} />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Địa chỉ</label>
            <input
              className="inp"
              value={f.diaChi}
              onChange={e => sua({ diaChi: e.target.value })}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Người đại diện</label>
            <input className="inp" defaultValue={dv.nguoiDaiDien} />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Kế toán trưởng</label>
            <input className="inp" defaultValue="Trần Thu Hà" />
          </div>
        </div>
      </section>

      {/* Thẻ 2: Thông tin kê khai */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Thông tin kê khai</h3>
        <div className="m-form-luoi">
          <div className="m-form-dong">
            <label className="m-form-nhan">Loại hình</label>
            <Select
              className="inp"
              value={loai}
              aria-label="Loại hình"
              onChange={e => sua({ loai: e.target.value as LoaiHinh })}
              ds={[
                ...(loai ? [] : [{ v: '', t: 'Chưa thiết lập' }]),
                { v: 'hkd', t: 'Hộ kinh doanh' },
                { v: 'dn', t: 'Doanh nghiệp' },
              ]}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Thông tư áp dụng</label>
            {!loai ? (
              <input className="inp" readOnly value="" placeholder="Chọn loại hình trước" />
            ) : loai === 'hkd' ? (
              <input
                className="inp"
                readOnly
                value={`${CHE_DO.TT152.soHieu} · ${CHE_DO.TT152.ten}`}
              />
            ) : (
              <Select
                className="inp"
                value={cdDn.includes(s.cheDo) ? s.cheDo : cdDn[0]}
                disabled={cdDn.length <= 1}
                aria-label="Thông tư áp dụng"
                onChange={e => set({ cheDo: e.target.value as CheDo })}
                ds={cdDn.map(cd => ({ v: cd, t: `${CHE_DO[cd].soHieu} · ${CHE_DO[cd].ten}` }))}
              />
            )}
          </div>

          {loai === 'hkd' && (
            <>
              <div className="m-form-dong">
                <label className="m-form-nhan">Nhóm doanh thu</label>
                <Select
                  className="inp"
                  value={String(f.nhom)}
                  aria-label="Nhóm doanh thu"
                  onChange={e => sua({ nhom: Number(e.target.value) })}
                  ds={NHOM_HKD.map(x => ({
                    v: String(x.nhom),
                    t: `Nhóm ${x.nhom} (${x.ten})`,
                  }))}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế GTGT</label>
                <Select
                  className="inp"
                  value="tyLe"
                  disabled
                  aria-label="Phương pháp thuế GTGT"
                  ds={[{ v: 'tyLe', t: PP_GTGT.tyLe }]}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế TNCN</label>
                <Select
                  className="inp"
                  value={ppCoDinh ?? f.ppHkd}
                  disabled={ppCoDinh !== null}
                  aria-label="Phương pháp thuế TNCN"
                  onChange={e => sua({ ppHkd: e.target.value as PpHkd })}
                  ds={(ppCoDinh ? [ppCoDinh] : (['doanhThu', 'loiNhuan'] as const)).map(v => ({
                    v,
                    t: PP_THU_NHAP[v],
                  }))}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Địa điểm kinh doanh chính</label>
                <Select
                  className="inp"
                  value={f.cnChinh}
                  aria-label="Địa điểm kinh doanh chính"
                  onChange={e => sua({ cnChinh: e.target.value })}
                  ds={dsCn.map(c => ({ v: c.id, t: c.ten }))}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Kênh bán online</label>
                <ChonKenh
                  ds={KENH_ONLINE}
                  chon={f.kenhOnline}
                  doi={k => sua({ kenhOnline: bat(f.kenhOnline, k) })}
                  trong="Chọn kênh bán"
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Kênh bán qua sàn khấu trừ thuế</label>
                <ChonKenh
                  ds={KENH_SAN.filter(k => f.kenhOnline.includes(k))}
                  chon={f.kenhSan.filter(k => f.kenhOnline.includes(k))}
                  doi={k => sua({ kenhSan: bat(f.kenhSan, k) })}
                  trong="Chọn sàn"
                />
              </div>
            </>
          )}

          {loai === 'dn' && (
            <>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế GTGT</label>
                <Select
                  className="inp"
                  value={dnCoDinh ? 'khauTru' : f.ppGtgt}
                  disabled={dnCoDinh}
                  aria-label="Phương pháp thuế GTGT"
                  onChange={e => sua({ ppGtgt: e.target.value as PpGtgt })}
                  ds={(dnCoDinh ? (['khauTru'] as const) : (['tyLe', 'khauTru'] as const)).map(
                    v => ({ v, t: PP_GTGT[v] }),
                  )}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế TNDN</label>
                <Select
                  className="inp"
                  value={tndnCoDinh ? 'thuNhap' : f.ppTndn}
                  disabled={tndnCoDinh}
                  aria-label="Phương pháp thuế TNDN"
                  onChange={e => sua({ ppTndn: e.target.value as PpTndn })}
                  ds={[
                    ...(tndnCoDinh ? [] : [{ v: 'tyLe', t: PP_THU_NHAP.doanhThu }]),
                    { v: 'thuNhap', t: PP_THU_NHAP.loiNhuan },
                  ]}
                />
              </div>
            </>
          )}
        </div>
        {ngoaiStd.length > 0 && (
          <Note kind="warn" icon="alert">
            Gói {GOI[s.goi].ten} chưa kê khai được {ngoaiStd.join(', ')}. Gói {GOIS.filter(g => g !== 'S').map(g => GOI[g].ten).join(', ')} mới đáp ứng, sắp ra mắt.
          </Note>
        )}
      </section>

      {/* Thẻ 3: Chế độ kế toán */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Chế độ kế toán</h3>
        <div className="m-form-luoi">
          <div className="m-form-dong">
            <label className="m-form-nhan">Ngày đầu năm</label>
            <ONgay
              value={dauNam}
              placeholder="dd/mm/yyyy"
              onChange={setDauNam}
              title="Chứng từ thêm mới phải có ngày từ ngày này trở đi"
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Năm làm việc hiện tại</label>
            <Select
              className="inp"
              value={String(nam)}
              aria-label="Năm làm việc hiện tại"
              onChange={e => doiNam(Number(e.target.value))}
              ds={[-2, -1, 0, 1].map(d => String(new Date().getFullYear() + d)).map(n => ({ v: n, t: n }))}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Tính giá xuất kho</label>
            <Select className="inp">
              <option>Bình quân gia quyền cuối kỳ</option>
              {/* gói Free chỉ bình quân cuối kỳ (T268) */}
              {s.goi !== 'S' && <><option>Bình quân tức thời</option><option>Nhập trước xuất trước</option></>}
            </Select>
          </div>
        </div>
      </section>

      {/* Nút lưu dính đáy */}
      <div className="m-form-chan-dinh">
        <button
          type="button"
          className="btn pri"
          style={{ width: '100%', height: 44, borderRadius: 12 }}
          onClick={luuDv}
        >
          Lưu thông tin đơn vị
        </button>
      </div>
    </div>
  )
}

// ── 5. Màn Cấu hình kế toán ──
export const MCauHinh: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const noco = kieuGhiSo(s.cheDo) === 'noco'

  return (
    <div className="m-ht-khung">
      {/* Thẻ 1: Bộ định khoản tự động */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Bộ định khoản tự động</h3>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
          {noco ? (
            <>
              <p>Thứ tự ưu tiên tài khoản: hàng hoá, rồi nhóm hàng, rồi mặc định của chế độ.</p>
              <Link className="btn sm ghost" to="/app/danh-muc/1-15" style={{ marginTop: 8 }}>
                Sửa bộ định khoản (1.15)
              </Link>
            </>
          ) : (
            <p className="muted">
              Chế độ {cheDoHienTai(s).ngan} không dùng tài khoản Nợ/Có nên không có bộ định khoản.
            </p>
          )}
        </div>
      </section>

      {/* Thẻ 2: Đánh số chứng từ */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Đánh số chứng từ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { loai: 'Phiếu thu', mau: 'PT{YY}{MM}-{0000}', vd: 'PT2610-0001' },
            { loai: 'Phiếu chi', mau: 'PC{YY}{MM}-{0000}', vd: 'PC2610-0241' },
            { loai: 'Xuất bán POS', mau: 'Số HĐ FABi', vd: 'YHLTJTAKD76Z' },
            { loai: 'Mua hàng', mau: 'MH{YY}{MM}-{0000}', vd: 'MH2610-0118' },
            { loai: 'Thẻ chi phí phân bổ', mau: 'TPB{YY}{MM}-{0000}', vd: 'TPB2610-0012' },   // T284
            { loai: 'Thẻ CPPB dư đầu kỳ', mau: 'TPBDK{YY}{MM}-{0000}', vd: 'TPBDK2512-0001' },
          ].map(item => (
            <div key={item.loai} className="m-ch-mau-so">
              <span style={{ fontWeight: 500 }}>{item.loai}</span>
              <span className="code" style={{ fontSize: 12 }}>
                {item.mau}
              </span>
            </div>
          ))}
        </div>
      </section>


      {/* Thẻ 4: Cửa hàng và ánh xạ POS */}
      <section className="m-form-the">
        <h3 className="m-form-the-tieu">Cửa hàng và ánh xạ POS</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dsCuaHang(s).map(c => {
            const kho = CUA_HANG.find(x => x.id === c.id)?.kho ?? [
              `Kho ${c.ten.replace(/^Phố Mây /, '')}`,
            ]
            const khoHien = s.goi === 'S' || s.goi === 'PL' ? kho[0] : `${kho.length} kho`
            return (
              <div key={c.id} className="m-ch-mau-so">
                <div>
                  <b>{c.ten}</b>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    Mã FABi: FB-{c.id.toUpperCase()}-01
                  </div>
                </div>
                <span className="chip" style={{ fontSize: 11 }}>
                  {khoHien}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Nút lưu dính đáy */}
      <div className="m-form-chan-dinh m-ch-chan-dinh">
        <button
          type="button"
          className="btn pri m-ch-btn-luu"
          style={{ width: '100%', height: 44, borderRadius: 12 }}
          onClick={() => toast('Đã lưu cấu hình')}
        >
          Lưu cấu hình
        </button>
      </div>
    </div>
  )
}
