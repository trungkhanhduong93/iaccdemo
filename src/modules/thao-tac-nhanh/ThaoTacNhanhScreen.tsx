import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { useSession } from '../../app/session'
import { useThaoTacNhanh } from '../../app/thaoTacNhanh'
import { Empty, PageHead, Pk } from '../../ui/Page'
import { ONen } from '../../ui/Icon'
import { GOI, minGoi } from '../../app/plan'
import { TuyChinhThaoTac } from '../../app/TuyChinhThaoTac'

export function ThaoTacNhanhScreen(_props?: Partial<ScreenProps>) {
  const { s } = useSession()
  const { ds } = useThaoTacNhanh(s)
  const [moTuyChinh, setMoTuyChinh] = useState(false)

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
        <TuyChinhThaoTac onClose={() => setMoTuyChinh(false)} />
      )}
    </div>
  )
}
