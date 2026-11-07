import { useState, useMemo, type FC } from 'react'
import { useSession, ngayDauNam, type CnThem, type Session } from '../../app/session'
import { cuaHangChuaDung, type CuaHangFabi } from '../../modules/onboarding/cua-hang-fabi'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { datDongBoThuChi } from '../../modules/tien/dong-bo-fabi'

export interface MThemCuaHangFabiProps {
  onDong: () => void
  onLenSo: (ds: CnThem[], khaiSoDu: boolean, caiDat: Partial<Session>) => void
}

const DIA_CHI_CH: Record<string, string> = {
  q7: '320 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM',
  gv: '68 Quang Trung, Phường 10, Gò Vấp, TP.HCM',
  hk: '15 Hàng Bài, Tràng Tiền, Hoàn Kiếm, Hà Nội',
  cg: '88 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
  gn1: '5 Hẻm 42 Trần Quang Khải, Tân Định, Quận 1, TP.HCM',
}

export const MThemCuaHangFabi: FC<MThemCuaHangFabiProps> = ({ onDong, onLenSo }) => {
  const { s } = useSession()
  const ds = useMemo(() => cuaHangChuaDung(s), [s])
  const [chon, setChon] = useState<string[]>(() => ds.map(c => c.id))   // như web: tích sẵn mọi cửa hàng FABi chưa dùng (T749)
  const [cauHinh, setCauHinh] = useState<Record<string, { dongBo: boolean }>>({})

  const chCua = (id: string) => cauHinh[id] ?? { dongBo: true }
  const doiCh = (id: string, p: Partial<{ dongBo: boolean }>) =>
    setCauHinh(x => ({ ...x, [id]: { ...chCua(id), ...p } }))

  const batChon = (id: string) => {
    setChon(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const caiDat = () =>
    chon.reduce<Partial<Session>>((p, id) => {
      const ch = chCua(id)
      return { ...p, ...datDongBoThuChi({ ...s, ...p }, id, ch.dongBo) }
    }, {})

  const tuNgay = ngayDauNam(s)
  const ok = chon.length > 0

  return (
    <div className="m-toan-man m-them-ch-fabi">
      <header className="m-thanh-tieu-de">
        <button type="button" className="m-btn-back" onClick={onDong} aria-label="Quay lại">
          <Icon n="chevl" className="ic" />
        </button>
        <h2 className="m-tieu-de-chu">Thêm cửa hàng từ FABi</h2>
      </header>

      <main className="m-them-ch-than">
        {ds.length === 0 ? (
          <div className="m-the-trang m-ch-trong">
            <Icon n="check" className="ic ok" />
            <p>Mọi cửa hàng trên FABi đã lên sổ kế toán.</p>
          </div>
        ) : (
          <>
            <p className="m-them-ch-hd">
              Chỉ hiện cửa hàng FABi chưa dùng kế toán ở đơn vị nào. Tích cửa hàng muốn lên sổ.
            </p>

            <div className="m-them-ch-ds">
              {ds.map(c => {
                const isChon = chon.includes(c.id)
                const ch = chCua(c.id)
                const diaChi = DIA_CHI_CH[c.id] ?? `${c.khuVuc || 'TP.HCM'}`
                return (
                  <div key={c.id} className={`m-the-trang m-ch-the${isChon ? ' on' : ''}`}>
                    <label className="m-ch-hang-dau">
                      <input
                        type="checkbox"
                        checked={isChon}
                        onChange={() => batChon(c.id)}
                        className="m-ch-tich"
                      />
                      <div className="m-ch-thong-tin">
                        <span className="m-ch-ten">{c.ten}</span>
                        <span className="m-ch-dia-chi">{diaChi}</span>
                      </div>
                    </label>

                    {isChon && (
                      <div className="m-ch-cau-hinh">
                        <div className="m-ch-dong-opt">
                          <span className="m-ch-opt-nhan">Đồng bộ thu chi FABi:</span>
                          <span className="m-ch-switch-box">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={ch.dongBo}
                              aria-label={`Tự động đồng bộ thu chi FABi ${c.ten}`}
                              className={`ds-ct${ch.dongBo ? ' on' : ''}`}
                              onClick={() => doiCh(c.id, { dongBo: !ch.dongBo })}
                            >
                              <i />
                            </button>
                            <small>{ch.dongBo ? 'Tự động' : 'Không đồng bộ'}</small>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>

      <footer className="m-them-ch-chan">
        {ds.length > 0 && <button
          type="button"
          className="btn pri m-btn-day-full"
          disabled={!ok}
          onClick={() =>
            onLenSo(
              ds.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay })),
              false,   // app bỏ tuỳ chọn khai số dư ban đầu ngay sau khi lên sổ (T749)
              caiDat()
            )
          }
        >
          Lên sổ {chon.length} cửa hàng
        </button>}
      </footer>
    </div>
  )
}
