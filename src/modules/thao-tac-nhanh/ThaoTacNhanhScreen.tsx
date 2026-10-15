import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { useSession } from '../../app/session'
import { useThaoTacNhanh, type ThaoTacMuc } from '../../app/thaoTacNhanh'
import { Empty, PageHead, Pk } from '../../ui/Page'
import { Icon, ONen } from '../../ui/Icon'
import { GOI, minGoi } from '../../app/plan'
import { useDongEsc } from '../../ui/LocNangCao'

interface HangTuyChinh extends ThaoTacMuc {
  tich: boolean
}

export function ThaoTacNhanhScreen(_props?: Partial<ScreenProps>) {
  const { s } = useSession()
  const { ds, ids, tatCa, luu, veMacDinh, macDinhIds } = useThaoTacNhanh(s)
  const [moTuyChinh, setMoTuyChinh] = useState(false)
  const [hangs, setHangs] = useState<HangTuyChinh[]>([])

  useDongEsc(() => {
    if (moTuyChinh) setMoTuyChinh(false)
  })

  // Khi mở hộp tuỳ chỉnh: sắp xếp các mục đã chọn lên trước theo thứ tự ids, các mục còn lại theo sau
  useEffect(() => {
    if (!moTuyChinh) return
    const idSet = new Set(ids)
    const map = new Map(tatCa.map(m => [m.id, m]))
    const dsDau: HangTuyChinh[] = []
    for (const id of ids) {
      const item = map.get(id)
      if (item) {
        dsDau.push({ ...item, tich: true })
      }
    }
    const dsCon: HangTuyChinh[] = []
    for (const item of tatCa) {
      if (!idSet.has(item.id)) {
        dsCon.push({ ...item, tich: false })
      }
    }
    setHangs([...dsDau, ...dsCon])
  }, [moTuyChinh, ids, tatCa])

  const handleToggle = (id: string) => {
    setHangs(prev => prev.map(h => (h.id === id ? { ...h, tich: !h.tich } : h)))
  }

  const handleLen = (idx: number) => {
    if (idx <= 0) return
    setHangs(prev => {
      const next = [...prev]
      const tam = next[idx - 1]
      next[idx - 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleXuong = (idx: number) => {
    setHangs(prev => {
      if (idx >= prev.length - 1) return prev
      const next = [...prev]
      const tam = next[idx + 1]
      next[idx + 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleVeMacDinh = () => {
    veMacDinh()
    const defSet = new Set(macDinhIds)
    const map = new Map(tatCa.map(m => [m.id, m]))
    const dsDau: HangTuyChinh[] = []
    for (const id of macDinhIds) {
      const item = map.get(id)
      if (item) {
        dsDau.push({ ...item, tich: true })
      }
    }
    const dsCon: HangTuyChinh[] = []
    for (const item of tatCa) {
      if (!defSet.has(item.id)) {
        dsCon.push({ ...item, tich: false })
      }
    }
    setHangs([...dsDau, ...dsCon])
  }

  const handleLuu = () => {
    const nextIds = hangs.filter(h => h.tich).map(h => h.id)
    luu(nextIds)
    setMoTuyChinh(false)
  }

  return (
    <div className="page ttn-man">
      <PageHead title="Thao tác nhanh">
        <button
          type="button"
          className="btn pri"
          onClick={() => setMoTuyChinh(true)}
        >
          Tuỳ chỉnh
        </button>
      </PageHead>

      {ds.length === 0 ? (
        <Empty
          title="Chưa có thao tác nhanh nào"
          sub="Bấm Tuỳ chỉnh để chọn các thao tác thường dùng."
        >
          <button
            type="button"
            className="btn pri"
            onClick={() => setMoTuyChinh(true)}
          >
            Tuỳ chỉnh
          </button>
        </Empty>
      ) : (
        <div className="ttn-luoi">
          {ds.map(item => (
            <Link
              key={item.id}
              to={item.to}
              className={`ttn-o${item.khoa ? ' khoa' : ''}`}
              title={
                item.khoa && item.ma
                  ? `${item.ten}: chưa có trong gói ${GOI[s.goi].ten}`
                  : item.ten
              }
            >
              <div className="ttn-ic-tron">
                <ONen n={item.icon} kieu="nhat" co="sm" />
                {item.khoa && item.ma && (
                  <span className="ttn-lk">
                    <Pk g={minGoi(item.ma)} o />
                  </span>
                )}
              </div>
              <span className="ttn-ten">{item.ten}</span>
            </Link>
          ))}
        </div>
      )}

      {moTuyChinh && (
        <div
          className="overlay ds-hop-nen"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setMoTuyChinh(false)
          }}
        >
          <div
            className="ds-hop ds-hop-ttn"
            role="dialog"
            aria-modal="true"
            aria-label="Tuỳ chỉnh thao tác nhanh"
          >
            <div className="ds-hop-dau">
              <b>Tuỳ chỉnh thao tác nhanh</b>
              <span className="grow" />
              <button
                type="button"
                className="pheu-dong"
                title="Đóng"
                aria-label="Đóng"
                onClick={() => setMoTuyChinh(false)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="ds-hop-huong-dan">
              Chọn các thao tác hiển thị và đổi thứ tự bằng nút mũi tên.
            </div>

            <div className="ds-hop-ds ttn-hop-ds">
              {hangs.map((h, i) => (
                <div key={h.id} className={`ttn-dong${h.tich ? ' on' : ''}`}>
                  <label className="ttn-dong-lbl">
                    <input
                      type="checkbox"
                      checked={h.tich}
                      onChange={() => handleToggle(h.id)}
                    />
                    <span className="ttn-dong-ic">
                      <Icon n={h.icon} className="ic sm" />
                    </span>
                    <span className="ttn-dong-ten">{h.ten}</span>
                    {h.khoa && h.ma && (
                      <span className="ttn-dong-pk">
                        <Pk g={minGoi(h.ma)} o />
                      </span>
                    )}
                  </label>
                  <div className="ttn-dong-dieu-khien">
                    <button
                      type="button"
                      className="ttn-btn-mui-ten"
                      title="Lên trên"
                      aria-label={`Chuyển ${h.ten} lên trên`}
                      disabled={i === 0}
                      onClick={() => handleLen(i)}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="ttn-btn-mui-ten"
                      title="Xuống dưới"
                      aria-label={`Chuyển ${h.ten} xuống dưới`}
                      disabled={i === hangs.length - 1}
                      onClick={() => handleXuong(i)}
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ds-chan">
              <button
                type="button"
                className="btn"
                onClick={handleVeMacDinh}
              >
                Về mặc định
              </button>
              <span className="grow" />
              <button
                type="button"
                className="btn"
                onClick={() => setMoTuyChinh(false)}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="btn pri"
                onClick={handleLuu}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
