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
import { GOI, MODS, kieuGhiSo } from '../../app/plan'
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
import { useNhatKy } from '../generic/daXoa'
import { canChuY, useNhatKyDayDu, type DongNK } from '../../modules/he-thong/nhatKyMau'
import { pad, pick, rng, fold } from '../format'
import { Select } from '../Dropdown'
import { Icon } from '../Icon'
import { ONgay } from '../ChonNgay'
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

// ── 3. Màn Nhật ký thao tác (T689) ──
const CHIPS_NHAT_KY = [
  'Tất cả',
  'Thêm mới',
  'Sửa',
  'Xoá',
  'Ghi sổ',
  'Bỏ ghi sổ',
  'Đăng nhập',
  'Xem báo cáo',
]

interface NhomNK {
  ngay: string
  tieuDe: string
  ds: DongNK[]
}

export const MNhatKyThaoTac: FC<ScreenProps> = () => {
  const { s } = useSession()
  const laGoiS = s.goi === 'S'
  const dv = donViHienTai(s)

  const [q, setQ] = useState('')
  const [chipChon, setChipChon] = useState('Tất cả')
  const [chuY, setChuY] = useState(false)
  const [dongChon, setDongChon] = useState<DongNK | null>(null)

  const tatCa = useNhatKyDayDu()

  const rowsLoc = useMemo(() => {
    return tatCa.filter(d => {
      if (chuY && !canChuY(d)) return false
      if (chipChon !== 'Tất cả' && d.tt !== chipChon) return false
      if (q.trim()) {
        const fq = fold(q.trim())
        const tim = fold(`${d.so || ''} ${d.dg || ''} ${d.ai || ''} ${d.tk || ''}`)
        if (!tim.includes(fq)) return false
      }
      return true
    })
  }, [tatCa, chuY, chipChon, q])

  const nhomDs = useMemo(() => {
    const map = new Map<string, DongNK[]>()
    for (const d of rowsLoc) {
      const ngay = d.luc.split(' ')[0] || d.luc
      let arr = map.get(ngay)
      if (!arr) {
        arr = []
        map.set(ngay, arr)
      }
      arr.push(d)
    }
    const res: NhomNK[] = []
    map.forEach((ds, ngay) => {
      const tieuDe = ngay === '07/10/2026' ? 'Hôm nay, 07/10/2026' : ngay
      res.push({ ngay, tieuDe, ds })
    })
    return res
  }, [rowsLoc])

  // Chạm thẻ mở trang chi tiết
  if (dongChon) {
    const thoiGian = dongChon.giay ? `${dongChon.luc}:${dongChon.giay}` : dongChon.luc
    const tieuDeThan = dongChon.so
      ? `${dongChon.tt} ${dongChon.loai ? dongChon.loai.toLowerCase() + ' ' : ''}${dongChon.so}`
      : `${dongChon.tt}: ${dongChon.dg}`

    return (
      <div className="m-nk-ct">
        {/* Đầu trang: nút quay lại + tiêu đề */}
        <div className="m-nk-ct-dau">
          <button
            type="button"
            className="m-nk-ct-nut-ve"
            aria-label="Quay lại danh sách"
            onClick={() => setDongChon(null)}
          >
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <h1 className="m-nk-ct-tieu-de-dau">Chi tiết nhật ký</h1>
        </div>

        {/* Thân chi tiết */}
        <div className="m-nk-ct-than">
          <div className="m-nk-ct-tieu-de-nhom">
            <h2 className="m-nk-ct-ten">{tieuDeThan}</h2>
            <div className="m-nk-ct-phu">
              Mã nhật ký {dongChon.ma} · {thoiGian}
            </div>
          </div>

          {dongChon.canhBao ? (
            <div className="m-nk-ct-canh-bao">
              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--orange-d)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="m-nk-ic-chuy"
              >
                <path d="M12 3 2 20h20z" />
                <path d="M12 10v4M12 17h.01" />
              </svg>
              <span>{dongChon.canhBao}</span>
            </div>
          ) : null}

          {/* Thẻ: Ai làm, làm ở đâu */}
          <section className="m-nk-ct-the">
            <h3 className="m-nk-ct-muc-t">Ai làm, làm ở đâu</h3>
            <div className="m-nk-ct-dong">
              <span className="m-nk-ct-nhan">Tài khoản</span>
              <span className="m-nk-ct-gia-tri">
                {dongChon.ai}
                {dongChon.tk ? (
                  <>
                    <br />
                    <span className="m-nk-ct-tk-phu">{dongChon.tk}</span>
                  </>
                ) : null}
              </span>
            </div>
            {!laGoiS && dongChon.vaiTro ? (
              <div className="m-nk-ct-dong">
                <span className="m-nk-ct-nhan">Vai trò</span>
                <span className="m-nk-ct-gia-tri">{dongChon.vaiTro}</span>
              </div>
            ) : null}
            <div className="m-nk-ct-dong">
              <span className="m-nk-ct-nhan">Đơn vị</span>
              <span className="m-nk-ct-gia-tri">{dv.ten || 'Công ty TNHH Phố Mây'}</span>
            </div>
            <div className="m-nk-ct-dong">
              <span className="m-nk-ct-nhan">Cửa hàng</span>
              <span className="m-nk-ct-gia-tri">{dongChon.ch || 'Không gắn cửa hàng'}</span>
            </div>
            {dongChon.tb ? (
              <div className="m-nk-ct-dong">
                <span className="m-nk-ct-nhan">Thiết bị</span>
                <span className="m-nk-ct-gia-tri">{dongChon.tb}</span>
              </div>
            ) : null}
            {dongChon.phien ? (
              <div className="m-nk-ct-dong">
                <span className="m-nk-ct-nhan">Phiên đăng nhập</span>
                <span className="m-nk-ct-gia-tri">{dongChon.phien}</span>
              </div>
            ) : null}
            {dongChon.manHinh ? (
              <div className="m-nk-ct-dong">
                <span className="m-nk-ct-nhan">Màn hình</span>
                <span className="m-nk-ct-gia-tri">{dongChon.manHinh}</span>
              </div>
            ) : null}
            <div className="m-nk-ct-dong">
              <span className="m-nk-ct-nhan">Kết quả</span>
              <span className={`m-nk-ct-gia-tri ${dongChon.kqLoi ? 'loi' : ''}`}>
                {dongChon.kqLoi ? `Không thành công: ${dongChon.kqLoi}` : 'Thành công'}
              </span>
            </div>
          </section>

          {/* Thẻ: Chứng từ */}
          {dongChon.so ? (
            <section className="m-nk-ct-the">
              <h3 className="m-nk-ct-muc-t">Chứng từ</h3>
              {dongChon.loai ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Loại phiếu</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.loai}</span>
                </div>
              ) : null}
              <div className="m-nk-ct-dong">
                <span className="m-nk-ct-nhan">Số chứng từ</span>
                <span className="m-nk-ct-gia-tri m-nk-ct-so">{dongChon.so}</span>
              </div>
              {dongChon.ngay ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Ngày chứng từ</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.ngay}</span>
                </div>
              ) : null}
              {dongChon.ky ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Kỳ kế toán</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.ky}</span>
                </div>
              ) : null}
              {dongChon.doiTuong ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Đối tượng</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.doiTuong}</span>
                </div>
              ) : null}
              {dongChon.tien ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Số tiền</span>
                  <span className="m-nk-ct-gia-tri m-nk-ct-tien">{dongChon.tien}</span>
                </div>
              ) : null}
              {dongChon.trangThai ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Trạng thái</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.trangThai}</span>
                </div>
              ) : null}
              {dongChon.nguon ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Nguồn</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.nguon}</span>
                </div>
              ) : null}
              {dongChon.dg ? (
                <div className="m-nk-ct-dong">
                  <span className="m-nk-ct-nhan">Diễn giải</span>
                  <span className="m-nk-ct-gia-tri">{dongChon.dg}</span>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Thẻ: Báo cáo */}
          {dongChon.thamSo ? (
            <section className="m-nk-ct-the">
              <h3 className="m-nk-ct-muc-t">Báo cáo</h3>
              <div className="m-nk-ct-van-ban">{dongChon.thamSo}</div>
            </section>
          ) : null}

          {/* Thẻ: Lý do người làm nhập */}
          {dongChon.lyDo ? (
            <section className="m-nk-ct-the">
              <h3 className="m-nk-ct-muc-t">Lý do người làm nhập</h3>
              <div className="m-nk-ct-van-ban">{dongChon.lyDo}</div>
            </section>
          ) : null}

          {/* Thẻ: Nội dung thay đổi */}
          {dongChon.doi && dongChon.doi.length > 0 ? (
            <section className="m-nk-ct-the">
              <h3 className="m-nk-ct-muc-t">Nội dung thay đổi ({dongChon.doi.length})</h3>
              {dongChon.doi.map((d, i) => (
                <div key={i} className="m-nk-ct-doi-item">
                  <span className="m-nk-ct-doi-truong">{d.truong}</span>
                  <div className="m-nk-ct-doi-hang">
                    <span className="m-nk-ct-doi-cu">{d.cu}</span>
                    <svg
                      aria-hidden="true"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--muted)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                    <span className="m-nk-ct-doi-moi">{d.moi}</span>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {/* Thẻ: Lịch sử chứng từ */}
          {dongChon.lichSu && dongChon.lichSu.length > 0 ? (
            <section className="m-nk-ct-the">
              <h3 className="m-nk-ct-muc-t">Lịch sử chứng từ {dongChon.so}</h3>
              <div className="m-nk-ct-ls">
                {dongChon.lichSu.map((h, i) => {
                  const laCuoi = i === (dongChon.lichSu?.length ?? 0) - 1
                  return (
                    <div key={i} className="m-nk-ct-ls-item">
                      <div className="m-nk-ct-ls-truc">
                        <span className={`m-nk-ct-ls-cham ${h.dangXem ? 'dang-xem' : ''}`} />
                        {!laCuoi ? <span className="m-nk-ct-ls-day" /> : null}
                      </div>
                      <div className="m-nk-ct-ls-nd">
                        <div className={`m-nk-ct-ls-viec ${h.dangXem ? 'dang-xem' : ''}`}>{h.viec}</div>
                        <div className="m-nk-ct-ls-phu">{h.luc} · {h.ai}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ) : null}
        </div>

        {/* Đáy trang dính: Nút mở phiếu */}
        {dongChon.so && dongChon.tt !== 'Xoá' ? (
          <div className="m-nk-ct-chan">
            <button type="button" className="m-nk-ct-nut-mo" onClick={() => {}}>
              Mở phiếu {dongChon.so}
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="m-ht-khung">
      {/* Ô tìm kiếm và dãy chip */}
      <div className="m-ht-dau">
        <div className="m-ht-hang-tim">
          <div className="m-ht-tim" style={{ height: 44 }}>
            <Icon n="search" className="m-ht-tim-ic ic sm" />
            <input
              type="text"
              className="m-ht-tim-inp"
              placeholder="Số chứng từ, diễn giải"
              value={q}
              onChange={e => setQ(e.target.value)}
              aria-label="Tìm kiếm nhật ký"
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

        {/* Dãy chip trượt ngang */}
        <div className="m-nk-chips">
          <button
            type="button"
            className="m-nk-chip m-nk-chip-ky"
            aria-label="Kỳ hiển thị: 01/10 đến 07/10"
          >
            <Icon n="calendar" className="ic sm" />
            <span>01/10 – 07/10</span>
          </button>
          <button
            type="button"
            className={`m-nk-chip m-nk-chip-chuy ${chuY ? 'on' : ''}`}
            onClick={() => setChuY(prev => !prev)}
            aria-pressed={chuY}
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 2 20h20z" />
              <path d="M12 10v4M12 17h.01" />
            </svg>
            <span>Cần chú ý</span>
          </button>
          {CHIPS_NHAT_KY.map(t => (
            <button
              key={t}
              type="button"
              className={`m-nk-chip ${chipChon === t ? 'on' : ''}`}
              onClick={() => setChipChon(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách thẻ theo nhóm ngày */}
      {nhomDs.length === 0 ? (
        <div className="m-nk-trong">Không có thao tác nào khớp bộ lọc.</div>
      ) : (
        <div className="m-nk-ds">
          {nhomDs.map(g => (
            <div key={g.ngay} className="m-nk-nhom">
              <div className="m-nk-nhom-ten">{g.tieuDe}</div>
              <div className="m-nk-nhom-ds">
                {g.ds.map(d => {
                  const gio = d.luc.split(' ')[1] || ''
                  const dong3 = d.so
                    ? [d.ch, d.ngay ? `Ngày CT ${d.ngay}` : ''].filter(Boolean).join(' · ')
                    : [d.dg, d.thamSo].filter(Boolean).join(', ')
                  const cacPhan = [d.ai, laGoiS ? '' : d.vaiTro, d.tbNgan].filter(Boolean)
                  const dongCuoi = cacPhan.join(' · ')

                  return (
                    <div
                      key={d.ma}
                      className="m-nk-the"
                      onClick={() => setDongChon(d)}
                      role="button"
                      tabIndex={0}
                    >
                      {/* Dòng 1: Thao tác + tam giác cảnh báo + giờ */}
                      <div className="m-nk-dong-1">
                        <span className="m-nk-tt">{d.tt}</span>
                        {canChuY(d) ? (
                          <svg
                            role="img"
                            aria-label="Cần chú ý"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--orange-d)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="m-nk-ic-chuy"
                          >
                            <path d="M12 3 2 20h20z" />
                            <path d="M12 10v4M12 17h.01" />
                          </svg>
                        ) : null}
                        <span className="m-nk-gio">{gio}</span>
                      </div>

                      {/* Dòng 2 (khi có so) */}
                      {d.so ? (
                        <div className="m-nk-dong-2">
                          <span className="m-nk-loai-so">
                            {d.loai ? <span className="m-nk-loai">{d.loai} </span> : null}
                            <span className="m-nk-so">{d.so}</span>
                          </span>
                          {d.tien ? <span className="m-nk-tien">{d.tien}</span> : null}
                        </div>
                      ) : null}

                      {/* Dòng 3 */}
                      {dong3 ? <div className="m-nk-dong-3">{dong3}</div> : null}

                      {/* Dòng lỗi (khi có kqLoi) */}
                      {d.kqLoi ? (
                        <div className="m-nk-dong-loi">Không thành công: {d.kqLoi}</div>
                      ) : null}

                      {/* Dòng cuối */}
                      {dongCuoi ? <div className="m-nk-dong-cuoi">{dongCuoi}</div> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [f, setF] = useState(() => ({
    ten: dv.ten,
    mst: dv.mst,
    diaChi: dv.diaChi,
    loai: loaiHinhDv(s, dv) as LoaiHinh,
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
    set({
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
                { v: 'hkd', t: 'Hộ kinh doanh' },
                { v: 'dn', t: 'Doanh nghiệp' },
              ]}
            />
          </div>
          <div className="m-form-dong">
            <label className="m-form-nhan">Thông tư áp dụng</label>
            {loai === 'hkd' ? (
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
                  value={dnCoDinh ? 'khauTru' : dnStandard ? 'tyLe' : f.ppGtgt}
                  disabled={dnCoDinh || dnStandard}
                  aria-label="Phương pháp thuế GTGT"
                  onChange={e => sua({ ppGtgt: e.target.value as PpGtgt })}
                  ds={(dnCoDinh ? (['khauTru'] as const) : dnStandard ? (['tyLe'] as const) : (['tyLe', 'khauTru'] as const)).map(
                    v => ({ v, t: PP_GTGT[v] }),
                  )}
                />
              </div>
              <div className="m-form-dong">
                <label className="m-form-nhan">Phương pháp thuế TNDN</label>
                <Select
                  className="inp"
                  value={tndnCoDinh ? 'thuNhap' : dnStandard ? 'tyLe' : f.ppTndn}
                  disabled={tndnCoDinh || dnStandard}
                  aria-label="Phương pháp thuế TNDN"
                  onChange={e => sua({ ppTndn: e.target.value as PpTndn })}
                  ds={[
                    ...(tndnCoDinh ? [] : [{ v: 'tyLe', t: PP_THU_NHAP.doanhThu }]),
                    ...(dnStandard ? [] : [{ v: 'thuNhap', t: PP_THU_NHAP.loiNhuan }]),
                  ]}
                />
              </div>
            </>
          )}
        </div>
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
