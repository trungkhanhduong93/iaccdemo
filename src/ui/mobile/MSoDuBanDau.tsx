import { useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { kieuGhiSo } from '../../app/plan'
import { useSession } from '../../app/session'
import { money } from '../format'
import { Icon } from '../Icon'
import { MTrong } from './MTrong'
import { DON_VI } from '../../data/mock'
import { TEN_TK } from '../../modules/tong-hop/so-cai'
import {
  soDuRows,
  QUY,
  quyCua,
  loaiTheo,
  THES,
  type TabKey,
} from '../../modules/tong-hop/SoDuBanDau'

export const MSoDuBanDau: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const noCo = kieuGhiSo(s.cheDo) === 'noco'
  const loai = loaiTheo(s.goi, noCo)

  const [tab, setTab] = useState<TabKey>(loai[0] ?? 'tien')

  // Dữ liệu số dư ban đầu
  const coSan = DON_VI.some(d => d.id === s.donVi)
  const cnThem = s.cnThem?.[s.donVi] ?? []

  const [all, setAll] = useState<Row[]>(() => {
    const ds = soDuRows()
    const mau = coSan ? ds.filter(r => r.loai === 'tien') : []
    const quy: Row[] = [
      ...cnThem
        .filter(c => !mau.some(r => r.ma === quyCua(c).ma))
        .map(c => ({ loai: 'tien', ...quyCua(c), ten: TEN_TK['1111'], no: 0, co: 0, du: 0 })),
      ...(coSan
        ? []
        : QUY.filter(q => q.kieu === 'Ngân hàng').map(q => ({
            loai: 'tien',
            ...q,
            ten: TEN_TK[q.tk],
            no: 0,
            co: 0,
            du: 0,
          }))),
    ]
    const luu = s.soDuQuy?.[s.donVi] ?? {}
    const tien = [...mau, ...quy].map(r =>
      luu[r.ma] ? { ...r, ...luu[r.ma], du: luu[r.ma].no - luu[r.ma].co } : r
    )
    return [...ds.filter(r => r.loai !== 'tien'), ...tien].map((r, i) => ({ ...r, id: i + 1 }))
  })

  // Hàm lưu số dư ban đầu theo chuẩn máy tính
  const luuSoDu = (dsMoi = all) => {
    const quy = Object.fromEntries(
      dsMoi
        .filter(r => r.loai === 'tien')
        .map(r => [r.ma, { no: Number(r.no) || 0, co: Number(r.co) || 0 }])
    )
    set({ soDuQuy: { ...s.soDuQuy, [s.donVi]: quy } })
    toast('Đã lưu số dư ban đầu')
  }

  // Tấm nổi từ đáy sửa số dư
  const [dangSua, setDangSua] = useState<Row | null>(null)
  const [formNo, setFormNo] = useState(0)
  const [formCo, setFormCo] = useState(0)
  const [formDu, setFormDu] = useState(0)
  const [formSl, setFormSl] = useState(0)

  const batDauSua = (r: Row) => {
    setDangSua(r)
    setFormNo(Number(r.no) || 0)
    setFormCo(Number(r.co) || 0)
    setFormDu(Number(r.du) || (Number(r.no) || 0) - (Number(r.co) || 0))
    setFormSl(Number(r.sl) || 0)
  }

  const dongSheet = () => {
    setDangSua(null)
  }

  const luuSheet = () => {
    if (!dangSua) return
    const id = dangSua.id
    const nextAll = all.map(r => {
      if (r.id !== id) return r
      if (tab === 'kho') {
        const no = formDu >= 0 ? formDu : 0
        const co = formDu < 0 ? -formDu : 0
        return { ...r, sl: formSl, du: formDu, no, co }
      }
      if (noCo) {
        return { ...r, no: formNo, co: formCo, du: formNo - formCo }
      }
      const no = formDu >= 0 ? formDu : 0
      const co = formDu < 0 ? -formDu : 0
      return { ...r, du: formDu, no, co }
    })

    setAll(nextAll)
    luuSoDu(nextAll)
    dongSheet()
  }

  // Danh sách dòng cho tab đang chọn
  const cardRows = useMemo(() => {
    return all.filter(r => r.loai === tab)
  }, [all, tab])

  // Tổng cuối tab
  const tongNo = cardRows.reduce((a, r) => a + (Number(r.no) || 0), 0)
  const tongCo = cardRows.reduce((a, r) => a + (Number(r.co) || 0), 0)
  const tongDu = cardRows.reduce((a, r) => a + (Number(r.du) || 0), 0)

  // Danh sách các tab hiển thị
  const dsThe = useMemo(() => {
    return THES.filter(t => loai.includes(t.k))
  }, [loai])

  return (
    <div className="m-sdb-khung">
      {/* Header và Tab nhóm */}
      <div className="m-sdb-dau">
        <div className="m-sdb-tabs">
          {dsThe.map(t => {
            const isChon = t.k === tab
            return (
              <button
                key={t.k}
                type="button"
                className={`m-sdb-tab-btn${isChon ? ' on' : ''}`}
                onClick={() => setTab(t.k)}
              >
                <span>{t.ten}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className="m-sdb-btn-luu btn pri sm"
          onClick={() => luuSoDu()}
          title="Lưu số dư ban đầu"
        >
          <Icon n="check" className="ic sm" />
          <span>Lưu</span>
        </button>
      </div>

      {/* Danh sách thẻ số dư */}
      {cardRows.length === 0 ? (
        <MTrong tieuDe="Chưa có số dư" moTa="Không có dòng số dư nào cho nhóm này" />
      ) : (
        <div className="m-sdb-ds">
          {cardRows.map(r => {
            const tieuDe = r.ct || r.ten || r.ma
            const ma = r.ma || r.tk
            const duVal = Number(r.du) || (Number(r.no) || 0) - (Number(r.co) || 0)

            return (
              <div
                key={r.id}
                className="m-sdb-the"
                onClick={() => batDauSua(r)}
                role="button"
                tabIndex={0}
              >
                <div className="m-sdb-the-dau">
                  <span className="m-sdb-ten">{tieuDe}</span>
                  <span className="m-sdb-ma code">{ma}</span>
                </div>

                <div className="m-sdb-the-than">
                  {r.kieu && <span className="m-sdb-phu">{r.kieu} ({r.cn})</span>}
                  {r.sl !== undefined && (
                    <span className="m-sdb-phu">
                      SL: <b>{money(r.sl)}</b> {r.dvt || ''}
                    </span>
                  )}

                  {noCo ? (
                    <div className="m-sdb-no-co">
                      <span>Nợ: <b>{money(r.no || 0)}</b> đ</span>
                      <span>Có: <b>{money(r.co || 0)}</b> đ</span>
                    </div>
                  ) : (
                    <div className="m-sdb-du">
                      <span>Số dư: <b>{money(duVal)} đ</b></span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tổng cuối tab */}
      <div className="m-sdb-tong">
        <span className="m-sdb-tong-txt">
          {noCo ? (
            <>
              Tổng Nợ: <b>{money(tongNo)} đ</b> · Tổng Có: <b>{money(tongCo)} đ</b>
            </>
          ) : (
            <>
              Tổng số dư: <b>{money(tongDu)} đ</b>
            </>
          )}
        </span>
      </div>

      {/* Tấm nổi từ đáy: Sửa số dư */}
      {dangSua && (
        <div className="m-form-dm m-sdb-form-hop">
          <div className="overlay" onClick={dongSheet} />
          <aside className="pn-hop">
            <div className="pn-dau">
              <div>
                <h3>Sửa số dư {dangSua.ct || dangSua.ten || dangSua.ma}</h3>
                <small className="muted">{dangSua.ma || dangSua.tk}</small>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={dongSheet}
                aria-label="Đóng"
              >
                <Icon n="x" />
              </button>
            </div>

            <div className="pn-than">
              <div className="pn-luoi">
                {tab === 'kho' && (
                  <div className="f">
                    <label>Số lượng ({dangSua.dvt || 'đơn vị'})</label>
                    <input
                      type="number"
                      className="inp num"
                      value={formSl}
                      onChange={e => setFormSl(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}

                {noCo ? (
                  <>
                    <div className="f">
                      <label>Dư Nợ (đ)</label>
                      <input
                        type="number"
                        className="inp num"
                        value={formNo}
                        onChange={e => setFormNo(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="f">
                      <label>Dư Có (đ)</label>
                      <input
                        type="number"
                        className="inp num"
                        value={formCo}
                        onChange={e => setFormCo(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="f">
                    <label>Số dư (đ)</label>
                    <input
                      type="number"
                      className="inp num"
                      value={formDu}
                      onChange={e => setFormDu(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pn-chan">
              <button type="button" className="btn" onClick={dongSheet}>
                Huỷ
              </button>
              <button type="button" className="btn pri" onClick={luuSheet}>
                Lưu
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
