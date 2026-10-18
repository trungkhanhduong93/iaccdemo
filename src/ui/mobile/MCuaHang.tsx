import { useMemo, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { donViHienTai, useSession, type CnThem, type Session } from '../../app/session'
import { CUA_HANG, DON_VI } from '../../data/mock'
import { MThemCuaHangFabi } from './MThemCuaHangFabi'
import { MDanhSach } from './MDanhSach'
import { Icon } from '../Icon'
import { Select } from '../Dropdown'
import { HopXacNhan } from '../LocNangCao'
import { fold } from '../format'
import { CACH_NVL, DS_CACH_NVL, cachNvlHienTai, datCachNvl, kyDauChuaKhoa, tenKy, type CachNvl } from '../../modules/home/chi-phi-nvl'
import { batDongBoThuChi, datDongBoThuChi } from '../../modules/tien/dong-bo-fabi'

export const MCuaHang: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const [moThem, setMoThem] = useState(false)
  const [xem, setXem] = useState<Row | null>(null)
  const [doiNvl, setDoiNvl] = useState<{ cn: string; ten: string; cach: CachNvl } | null>(null)
  const dv = donViHienTai(s)

  const them = s.cnThem?.[s.donVi] ?? []
  const coSan = DON_VI.some(d => d.id === s.donVi)
  const free = s.goi === 'F' || s.goi === 'S'

  const khoCua = (id: string, ten: string) =>
    CUA_HANG.find(c => c.id === id)?.kho ?? [`Kho ${ten.replace(/^Phố Mây /, '')}`]
  const kho = (id: string, ten: string) => (free ? khoCua(id, ten)[0] : khoCua(id, ten).join(', '))

  const rows: Row[] = useMemo(() => [
    ...(coSan
      ? CUA_HANG.map(c => ({
          id: c.id,
          ma: c.id.toUpperCase(),
          posId: c.posId,
          ten: c.ten,
          kv: 'TP.HCM',
          kho: kho(c.id, c.ten),
          nguon: 'FABi',
          moi: false,
        }))
      : []),
    ...them.map((c, i) => ({
      id: c.id,
      ma: c.id.toUpperCase(),
      posId: `2000${i + 1}`,
      ten: c.ten,
      kv: c.khuVuc,
      kho: kho(c.id, c.ten),
      nguon: 'FABi',
      moi: !c.banDau,
    })),
  ], [coSan, them, free]) // eslint-disable-line react-hooks/exhaustive-deps

  const lenSo = (ds: CnThem[], khaiSoDu: boolean, caiDat: Partial<Session>) => {
    set({ cnThem: { ...s.cnThem, [s.donVi]: [...them, ...ds] }, ...caiDat })   // cấu hình đồng bộ thu chi, cách tính NVL chọn lúc thêm (T264)
    setMoThem(false)
    toast(`Đã lên sổ ${ds.length} cửa hàng từ FABi`)
    if (khaiSoDu) {
      nav(s.goi === 'F' ? '/app/danh-muc/1-12' : `/app/tong-hop/10-1-3?cnMoi=${ds.map(c => c.id).join(',')}`)   // gói Free: Danh mục Quỹ tiền (T245)
    }
  }

  return (
    <>
      <MDanhSach
        rows={rows}
        timPlaceholder="Tìm tên, mã cửa hàng, POS ID..."
        timTheo={(r, q) => {
          const text = `${r.ten} ${r.ma} ${r.posId} ${r.kho}`
          return fold(text).includes(fold(q))
        }}
        hangPhu={
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              type="button"
              className="btn sm"
              onClick={() => toast(`Đã đồng bộ ${rows.length} cửa hàng theo POS`)}
            >
              <Icon n="refresh" className="ic sm" />
              <span>Đồng bộ theo POS</span>
            </button>
          </div>
        }
        tomTat={
          <span>
            Tổng <b>{rows.length}</b> cửa hàng
          </span>
        }
        onThem={() => setMoThem(true)}
        nhanThem="Thêm từ FABi"
        the={(r, i) => (
          <div
            key={`${String(r.ma)}_${i}`}
            className="m-cn-the"
            onClick={() => setXem(r)}
            role="button"
            tabIndex={0}
          >
            <div className="m-cn-trai">
              <span className="m-cn-ten">{r.ten}</span>
              <span className="m-cn-ma">
                Mã: {r.ma} · POS: {r.posId} · {r.kho}
              </span>
            </div>
            <div className="m-cn-phai">
              {r.moi ? <span className="m-cn-moi">Mới</span> : null}
              <span className="m-cn-cham" title="Đang sử dụng" />
            </div>
          </div>
        )}
      />

      {moThem && <MThemCuaHangFabi onDong={() => setMoThem(false)} onLenSo={lenSo} />}

      {xem && (
        <div className="m-form-dm m-cn-ct-hop">
          <div className="overlay" onClick={() => setXem(null)} />
          <aside className="pn-hop" role="dialog" aria-modal="true" aria-label={`Chi tiết ${xem.ten}`}>
            <div className="pn-dau">
              <div>
                <h3>Chi tiết cửa hàng</h3>
                <small className="muted">{xem.ten}</small>
              </div>
              <button
                type="button"
                className="btn ghost sm"
                title="Đóng"
                onClick={() => setXem(null)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>
            <div className="pn-than m-cn-ct-than">
              <div className="m-the-trang m-cn-the-ct">
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Mã:</span>
                  <span className="m-xp-tri code">{xem.ma}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">POS ID:</span>
                  <span className="m-xp-tri code">{xem.posId}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Tên cửa hàng:</span>
                  <span className="m-xp-tri dam">{xem.ten}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Công ty:</span>
                  <span className="m-xp-tri">{dv.ten}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Địa chỉ:</span>
                  <span className="m-xp-tri">{dv.diaChi || '—'}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Mã số thuế:</span>
                  <span className="m-xp-tri code">{dv.mst || '—'}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Khu vực:</span>
                  <span className="m-xp-tri">{xem.kv}</span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Kho:</span>
                  <span className="m-xp-tri dam">
                    {xem.kho}
                    {free && <span className="chip" style={{ marginLeft: 8 }}>Mặc định</span>}
                  </span>
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Nguồn:</span>
                  <span className="m-xp-tri">{xem.nguon}</span>
                </div>
                {s.goi === 'F' && (
                  <div className="m-xp-dong-tt m-cn-dong-nvl">
                    <span className="m-xp-nhan">Cách tính chi phí NVL:</span>
                    <span className="m-xp-tri">
                      <Select
                        className="inp dmcn-nvl"
                        value={cachNvlHienTai(s, String(xem.id))}
                        ds={DS_CACH_NVL}
                        aria-label={`Cách tính chi phí NVL ${xem.ten}`}
                        onChange={e => {
                          const cach = e.target.value as CachNvl
                          if (cach !== cachNvlHienTai(s, String(xem.id))) {
                            setDoiNvl({ cn: String(xem.id), ten: String(xem.ten), cach })
                          }
                        }}
                      />
                    </span>
                  </div>
                )}
                <div className="m-xp-dong-tt m-cn-dong-db">
                  <span className="m-xp-nhan">Đồng bộ thu chi FABi:</span>
                  <span className="m-xp-tri dmcn-db">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={batDongBoThuChi(s, String(xem.id))}
                      aria-label={`Tự động đồng bộ thu chi FABi ${xem.ten}`}
                      className={`ds-ct${batDongBoThuChi(s, String(xem.id)) ? ' on' : ''}`}
                      onClick={() => {
                        const bat = batDongBoThuChi(s, String(xem.id))
                        set(datDongBoThuChi(s, String(xem.id), !bat))
                        toast(`${bat ? 'Đã tắt' : 'Đã bật'} đồng bộ thu chi từ FABi cho ${xem.ten}`)
                      }}
                    >
                      <i />
                    </button>
                    <small>{batDongBoThuChi(s, String(xem.id)) ? 'Tự động' : 'Không đồng bộ'}</small>
                  </span>
                </div>
              </div>
            </div>
            <div className="pn-chan">
              <span className="grow" />
              <button type="button" className="btn" onClick={() => setXem(null)}>
                Đóng
              </button>
            </div>
          </aside>
        </div>
      )}

      {doiNvl && (
        <HopXacNhan
          tieuDe="Đổi cách tính chi phí NVL"
          nut="Đồng ý"
          nutDo={false}
          onDong={() => setDoiNvl(null)}
          onDongY={() => {
            set(datCachNvl(s, doiNvl.cn, doiNvl.cach))
            setDoiNvl(null)
            toast(`Đã đổi cách tính chi phí NVL của ${doiNvl.ten}`)
          }}
        >
          {doiNvl.ten} tính chi phí NVL {CACH_NVL[doiNvl.cach].theo}: {CACH_NVL[doiNvl.cach].mota[0].toLowerCase() + CACH_NVL[doiNvl.cach].mota.slice(1)}.
          Tính lại từ tháng {tenKy(kyDauChuaKhoa())}, tháng đầu chưa khoá sổ. Các tháng đã khoá sổ giữ nguyên số.
          {doiNvl.cach === 'tay' ? ' Nhập giá thành món ở màn Chi phí NVL, món chưa có giá thành tính bằng 0.' : ''}
        </HopXacNhan>
      )}
    </>
  )
}
