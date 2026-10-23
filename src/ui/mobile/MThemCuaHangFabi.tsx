import { useState, useMemo, type FC } from 'react'
import { useSession, ngayDauNam, type CnThem, type Session } from '../../app/session'
import { cuaHangChuaDung, type CuaHangFabi } from '../../modules/onboarding/cua-hang-fabi'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { DS_CACH_NVL, cachNvlHienTai, datCachNvl, type CachNvl } from '../../modules/home/chi-phi-nvl'
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
  const [chon, setChon] = useState<string[]>([])
  const [cauHinh, setCauHinh] = useState<Record<string, { dongBo: boolean; cach: CachNvl }>>({})
  const [khaiSoDu, setKhaiSoDu] = useState(true)

  const chCua = (id: string) => cauHinh[id] ?? { dongBo: true, cach: cachNvlHienTai(s, id) }
  const doiCh = (id: string, p: Partial<{ dongBo: boolean; cach: CachNvl }>) =>
    setCauHinh(x => ({ ...x, [id]: { ...chCua(id), ...p } }))

  const batChon = (id: string) => {
    setChon(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const caiDat = () =>
    chon.reduce<Partial<Session>>((p, id) => {
      const ch = chCua(id)
      const p2 = { ...p, ...datDongBoThuChi({ ...s, ...p }, id, ch.dongBo) }
      return s.goi === 'S' ? { ...p2, ...datCachNvl({ ...s, ...p2 }, id, ch.cach) } : p2
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
                        {s.goi === 'S' && (
                          <div className="m-ch-dong-opt">
                            <span className="m-ch-opt-nhan">Cách tính chi phí NVL:</span>
                            <Select
                              className="inp m-ch-sel"
                              value={ch.cach}
                              ds={DS_CACH_NVL}
                              aria-label={`Cách tính chi phí NVL ${c.ten}`}
                              onChange={e => doiCh(c.id, { cach: e.target.value as CachNvl })}
                            />
                          </div>
                        )}
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

            <label className="m-ch-khai-so-du">
              <input
                type="checkbox"
                className="bat-tat"
                checked={khaiSoDu}
                onChange={e => setKhaiSoDu(e.target.checked)}
              />
              <span>Khai số dư ban đầu cho cửa hàng mới ngay sau khi lên sổ</span>
            </label>
          </>
        )}
      </main>

      <footer className="m-them-ch-chan">
        <button
          type="button"
          className="btn pri m-btn-day-full"
          disabled={!ok}
          onClick={() =>
            onLenSo(
              ds.filter(c => chon.includes(c.id)).map(c => ({ id: c.id, ten: c.ten, khuVuc: c.khuVuc, tuNgay })),
              khaiSoDu,
              caiDat()
            )
          }
        >
          {chon.length > 0 ? `Thêm ${chon.length} cửa hàng` : 'Thêm cửa hàng'}
        </button>
      </footer>
    </div>
  )
}
