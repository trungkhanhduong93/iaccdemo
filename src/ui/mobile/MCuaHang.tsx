import { useMemo, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { useSession, type CnThem, type Session } from '../../app/session'
import { CUA_HANG, DON_VI } from '../../data/mock'
import { HopThemCuaHang } from '../../modules/danh-muc/DanhMucCuaHang'
import { MDanhSach } from './MDanhSach'
import { Icon } from '../Icon'
import { fold } from '../format'

export const MCuaHang: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const [moThem, setMoThem] = useState(false)

  const them = s.cnThem?.[s.donVi] ?? []
  const coSan = DON_VI.some(d => d.id === s.donVi)
  const free = s.goi === 'F' || s.goi === 'S'

  const khoCua = (id: string, ten: string) =>
    CUA_HANG.find(c => c.id === id)?.kho ?? [`Kho ${ten.replace(/^Phố Mây /, '')}`]
  const kho = (id: string, ten: string) => (free ? khoCua(id, ten)[0] : khoCua(id, ten).join(', '))

  const rows: Row[] = useMemo(() => [
    ...(coSan
      ? CUA_HANG.map(c => ({
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
          <div key={`${String(r.ma)}_${i}`} className="m-cn-the">
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

      {moThem && <HopThemCuaHang onDong={() => setMoThem(false)} onLenSo={lenSo} />}
    </>
  )
}
