import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../types'
import { duongDan } from '../../app/registry'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Select } from '../../ui/Dropdown'
import { ChonDanhMuc } from '../../ui/ChonDanhMuc'
import { ONgay } from '../../ui/ChonNgay'
import { useDong } from '../../ui/FormToanMan'
import { ThemHangLoat } from '../../ui/generic/ThemHangLoat'
import { HopXacNhan } from '../../ui/LocNangCao'
import { suaPhieu, themPhieu } from '../../ui/generic/daXoa'
import { ChonNhieu, quyDoiTuDanhMuc } from '../danh-muc/QuyDoiDvt'
import { maDvt } from '../danh-muc/data'
import { fold } from '../../ui/format'
import {
  hangCua,
  type CongThucCb,
  type NvlCongThuc,
  type TtCongThuc,
} from './san-xuat'
import { DS_NVL, DS_SP, KENH, MAN, mucHang, nvlCua, OSo } from './CongThuc'

// Đơn vị tính hiện cả mã và tên, đơn vị chưa có trong danh mục thì chỉ hiện tên
const nhanDvt = (dvt: string) => (maDvt(dvt) ? `${maDvt(dvt)} - ${dvt}` : dvt)
const dvtCuaNvl = (ma: string) => {
  const h = hangCua(ma)
  return h ? [h.dvt, ...quyDoiTuDanhMuc(h.ten, h.dvt).map(q => q.dv)] : []
}
const dvtHienNvl = (n: NvlCongThuc) => (n.dvt && dvtCuaNvl(n.ma).includes(n.dvt) ? n.dvt : hangCua(n.ma)?.dvt ?? '')

export function FormCongThucPlus({ sc, mod, ct, soCt }: ScreenProps & { ct?: Row; soCt: number }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const viTri = useLocation()
  const path = duongDan(mod, sc)

  const moi = !ct
  const goc = ct ?? (viTri.state as { saoChep?: Row } | null)?.saoChep
  const maMoi = `CTCB${String(soCt + 1).padStart(3, '0')}`
  const [ma] = useState(String(ct?.ma ?? maMoi))

  const [tt, setTt] = useState<TtCongThuc>((ct?.tt as TtCongThuc | undefined) ?? 'on')
  const [sp, setSp] = useState(String(goc?.spMa ?? ''))
  const [dvt, setDvt] = useState(String(goc?.dvt ?? ''))
  const [ngay, setNgay] = useState(String(goc?.ngay ?? '07/10/2026'))
  const [cuaHang, setCuaHang] = useState<string[]>((goc?.cuaHang as string[] | undefined) ?? [])
  const [kenh, setKenh] = useState<string[]>((goc?.kenh as string[] | undefined) ?? [])
  const [moTa, setMoTa] = useState(String(goc?.moTa ?? ''))
  const [nvl, setNvl] = useState<NvlCongThuc[]>(() => (goc ? nvlCua(goc).map(n => ({ ...n })) : []))

  const [moHangLoat, setMoHangLoat] = useState(false)
  const [hienCanhBao, setHienCanhBao] = useState(false)

  const [locMa, setLocMa] = useState('')
  const [locTen, setLocTen] = useState('')
  const [locDvt, setLocDvt] = useState('')
  const [locSl, setLocSl] = useState('')

  const hSp = hangCua(sp)
  const dsDvt = hSp ? [hSp.dvt, ...quyDoiTuDanhMuc(hSp.ten, hSp.dvt).map(q => q.dv)] : []
  const dvtHien = dvt && dsDvt.includes(dvt) ? dvt : hSp?.dvt ?? ''

  const hienTai = JSON.stringify({
    tt,
    sp,
    dvt: dvtHien,
    ngay,
    cuaHang,
    kenh,
    moTa,
    nvl,
  })
  // Lấy mốc từ lần vẽ đầu, cùng cách tính với hienTai nên mở rồi đóng không báo đã đổi
  const gocBanDau = useRef(hienTai).current
  const daDoi = hienTai !== gocBanDau

  const dong = useDong(path)

  const yeuCauDong = () => {
    if (daDoi) {
      setHienCanhBao(true)
    } else {
      dong()
    }
  }

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Menu tab Khác luôn nằm sẵn trong DOM ở dạng ẩn, nên chỉ tính lớp đang hiện
        const dangMoLop = [...document.querySelectorAll('.overlay, .pop')].some(e => getComputedStyle(e).display !== 'none')
        if (!dangMoLop) {
          yeuCauDong()
        }
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  })

  const doiNvl = (idxGoc: number, p: Partial<NvlCongThuc>) => {
    setNvl(ds => ds.map((n, j) => (j === idxGoc ? { ...n, ...p } : n)))
  }

  const xoaDong = (idxGoc: number) => {
    setNvl(ds => ds.filter((_, j) => j !== idxGoc))
  }

  function luu() {
    const thieu = !sp
      ? 'Chọn sản phẩm'
      : !ngay
        ? 'Nhập ngày áp dụng'
        : !nvl.some(n => n.ma)
          ? 'Thêm nguyên vật liệu thành phần'
          : ''
    if (thieu) {
      toast(thieu)
      return
    }

    const nd: Row = {
      ma: moi ? maMoi : ma,
      spMa: sp,
      dvt: dvtHien,
      ngay,
      kenh,
      cuaHang,
      moTa,
      tt,
      nvl: nvl.filter(n => n.ma),
    } satisfies Omit<CongThucCb, 'id'>

    if (moi) themPhieu(MAN.cb, { id: `moi-${Date.now()}`, ...nd }, s.ten)
    else suaPhieu(MAN.cb, String(ct.id), nd)

    toast(`Đã lưu công thức ${hSp?.ten ?? ''}`)
    nav(path, { replace: true })
  }

  function saoChep() {
    nav(`${path}/moi`, {
      state: {
        saoChep: {
          ...ct,
          dvt: dvtHien,
          cuaHang,
          kenh,
          moTa,
          ngay,
          nvl: nvl.filter(n => n.ma),
        },
      },
    })
  }

  const dsNvlGoc = useMemo(() => nvl.map((item, index) => ({ item, index })), [nvl])

  const dsNvlHien = useMemo(() => {
    const qMa = fold(locMa.trim())
    const qTen = fold(locTen.trim())
    const qDvt = fold(locDvt.trim())
    const qSl = fold(locSl.trim())

    return dsNvlGoc.filter(({ item }) => {
      const h = hangCua(item.ma)
      const ten = h?.ten ?? ''
      const dvtHang = nhanDvt(dvtHienNvl(item))
      const slStr = String(item.sl)

      if (qMa && !fold(item.ma).includes(qMa)) return false
      if (qTen && !fold(ten).includes(qTen)) return false
      if (qDvt && !fold(dvtHang).includes(qDvt)) return false
      if (qSl && !fold(slStr).includes(qSl)) return false
      return true
    })
  }, [dsNvlGoc, locMa, locTen, locDvt, locSl])

  return (
    <div
      className="ctpl-form"
      role="dialog"
      aria-modal="true"
      aria-label={moi ? 'Thêm mới công thức chế biến' : 'Chi tiết công thức chế biến'}
    >
      <div className="ctpl-dau">
        <h3>{moi ? 'Thêm mới công thức chế biến' : 'Chi tiết công thức chế biến'}</h3>
        <button
          type="button"
          className="ctpl-dong"
          title="Đóng (Esc)"
          aria-label="Đóng"
          onClick={yeuCauDong}
        >
          <Icon n="x" className="ic sm" />
        </button>
      </div>

      <div className="ctpl-than">
        <div className="ctpl-cot">
          {/* Khối 1: Thông tin chung, mẫu B hai khối, mỗi khối 3 dòng (T760) */}
          <div className="ctpl-tieu-khoi">
            <span>Thông tin chung</span>
          </div>

          <div className="ctpl-hai-khoi">
            <div className="ctpl-khoi ctpl-khoi-trai">
              <div className="ctpl-nhan">Mã công thức</div>
              <div className="ctpl-o khoa" data-o="ma" aria-disabled="true">
                <input
                  type="text"
                  disabled
                  readOnly
                  value={moi ? '' : ma}
                  placeholder={moi ? 'Mã sinh tự động' : undefined}
                />
              </div>
              <div className="ctpl-nhan">Trạng thái</div>
              <div className="ctpl-o-tt" data-o="tt">
                <input
                  type="checkbox"
                  className="bat-tat"
                  checked={tt === 'on'}
                  onChange={e => setTt(e.target.checked ? 'on' : 'off')}
                  aria-label="Trạng thái"
                />
                <span>{tt === 'on' ? 'Đang hoạt động' : 'Không hoạt động'}</span>
              </div>

              <div className="ctpl-nhan">Cửa hàng áp dụng</div>
              <div className="ctpl-o ctpl-o-rong" data-o="cuaHang">
                <ChonNhieu
                  nhan="Cửa hàng áp dụng"
                  tenDm="cửa hàng"
                  goiY="Để trống nếu áp dụng cho mọi cửa hàng"
                  value={cuaHang}
                  onChange={setCuaHang}
                  ds={CUA_HANG.map(c => ({
                    v: c.ten,
                    t: c.ten,
                    phu: `Mã: ${c.id.toUpperCase()}`,
                  }))}
                />
              </div>

              <div className="ctpl-nhan">Kênh áp dụng</div>
              <div className="ctpl-o ctpl-o-rong" data-o="kenh">
                <ChonNhieu
                  nhan="Kênh áp dụng"
                  tenDm="kênh bán"
                  goiY="Để trống nếu áp dụng cho mọi kênh"
                  value={kenh}
                  onChange={setKenh}
                  ds={KENH.map(k => ({ v: k, t: k }))}
                />
              </div>
            </div>

            <div className="ctpl-khoi ctpl-khoi-phai">
              <div className="ctpl-nhan">
                Sản phẩm <em>*</em>
              </div>
              <div className="ctpl-o ctpl-o-rong" data-o="sp">
                <ChonDanhMuc
                  dm="hang"
                  nhan="sản phẩm"
                  coMa
                  trong="Chọn"
                  value={sp}
                  onChange={v => {
                    setSp(v)
                    const h = hangCua(v)
                    if (h) setDvt(h.dvt)
                  }}
                  ds={mucHang(DS_SP)}
                />
              </div>
              <div className="ctpl-nhan">
                Đơn vị tính <em>*</em>
              </div>
              <div className={`ctpl-o${dsDvt.length ? '' : ' khoa'}`} data-o="dvt" aria-disabled={dsDvt.length ? undefined : 'true'}>
                {dsDvt.length > 0 ? (
                  <Select
                    className="inp"
                    aria-label="Đơn vị tính"
                    value={dvtHien}
                    onChange={e => setDvt(e.target.value)}
                    ds={dsDvt.map(d => ({ v: d, t: nhanDvt(d) }))}
                  />
                ) : (
                  <input
                    type="text"
                    disabled
                    readOnly
                    value=""
                    placeholder="Theo hàng đã chọn"
                  />
                )}
              </div>

              <div className="ctpl-nhan">Ngày áp dụng</div>
              <div className="ctpl-o" data-o="ngay">
                <ONgay
                  value={ngay}
                  onChange={setNgay}
                  title="Công thức dùng cho phiếu từ ngày này"
                />
              </div>

              <div className="ctpl-nhan">Mô tả</div>
              <div className="ctpl-o ctpl-o-rong" data-o="moTa">
                <textarea
                  rows={1}
                  value={moTa}
                  onChange={e => setMoTa(e.target.value)}
                  placeholder="Nhập mô tả"
                  aria-label="Mô tả"
                />
              </div>
            </div>
          </div>

          {/* Khối 3: Nguyên vật liệu thành phần */}
          <div className="ctpl-tieu-khoi">
            <span>Nguyên vật liệu thành phần</span>
            <div className="ctpl-nut-nvl">
              <button
                type="button"
                className="ctpl-them"
                onClick={() => setNvl(ds => [...ds, { ma: '', sl: 0 }])}
              >
                <Icon n="plus" className="ic sm" />
                <span>Thêm dòng</span>
              </button>
              <button
                type="button"
                className="ctpl-them"
                onClick={() => setMoHangLoat(true)}
              >
                <Icon n="plus" className="ic sm" />
                <span>Thêm hàng loạt</span>
              </button>
            </div>
          </div>

          <div className="ctpl-nvl-wrap">
            <table className="ctpl-nvl">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Mã nguyên vật liệu</th>
                  <th>Tên nguyên vật liệu</th>
                  <th style={{ width: 170 }}>Đơn vị tính</th>
                  <th className="num" style={{ width: 110 }}>Số lượng</th>
                  <th className="c" style={{ width: 44 }} />
                </tr>
                <tr className="ctpl-loc-hang">
                  <th>
                    <div className="ctpl-loc">
                      <Icon n="filter" className="ic sm" />
                      <input
                        type="text"
                        value={locMa}
                        onChange={e => setLocMa(e.target.value)}
                        aria-label="Lọc theo mã nguyên vật liệu"
                      />
                    </div>
                  </th>
                  <th>
                    <div className="ctpl-loc">
                      <Icon n="filter" className="ic sm" />
                      <input
                        type="text"
                        value={locTen}
                        onChange={e => setLocTen(e.target.value)}
                        aria-label="Lọc theo tên nguyên vật liệu"
                      />
                    </div>
                  </th>
                  <th>
                    <div className="ctpl-loc">
                      <Icon n="filter" className="ic sm" />
                      <input
                        type="text"
                        value={locDvt}
                        onChange={e => setLocDvt(e.target.value)}
                        aria-label="Lọc theo đơn vị tính"
                      />
                    </div>
                  </th>
                  <th>
                    <div className="ctpl-loc">
                      <Icon n="filter" className="ic sm" />
                      <input
                        type="text"
                        value={locSl}
                        onChange={e => setLocSl(e.target.value)}
                        aria-label="Lọc theo số lượng"
                      />
                    </div>
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dsNvlHien.length > 0 ? (
                  dsNvlHien.map(({ item, index }) => {
                    const h = hangCua(item.ma)
                    const dsDvtNvl = dvtCuaNvl(item.ma)
                    // Dòng mới: cả ô mã và ô tên đều chọn được, tìm theo mã hoặc tên
                    const oChonHang = (
                      <ChonDanhMuc
                        dm="nvl"
                        nhan="nguyên vật liệu"
                        goiYTim="Tìm mã, tên nguyên vật liệu"
                        coMa
                        className="inp sm"
                        trong="Chọn"
                        value={item.ma}
                        ds={mucHang(DS_NVL.filter(x => x.ma !== sp && !nvl.some(n => n.ma === x.ma)))}
                        onChange={v => doiNvl(index, { ma: v, dvt: undefined })}
                      />
                    )
                    return (
                      <tr key={index}>
                        <td className="ctpl-nvl-ma">
                          {item.ma || oChonHang}
                        </td>
                        <td className="ctpl-nvl-ten">{item.ma ? h?.ten ?? '' : oChonHang}</td>
                        <td className="ctpl-nvl-dvt">
                          {dsDvtNvl.length > 0 && (
                            <Select
                              className="inp sm"
                              aria-label={`Đơn vị tính ${h?.ten ?? ''}`}
                              value={dvtHienNvl(item)}
                              // Đổi đơn vị giữ nguyên số lượng, người dùng tự nhập lại (QD100)
                              onChange={e => doiNvl(index, { dvt: e.target.value === h?.dvt ? undefined : e.target.value })}
                              ds={dsDvtNvl.map(d => ({ v: d, t: nhanDvt(d) }))}
                            />
                          )}
                        </td>
                        <td className="num ctpl-nvl-sl">
                          <OSo val={item.sl} onChange={v => doiNvl(index, { sl: v })} />
                        </td>
                        <td className="c ctpl-nvl-thao-tac">
                          <button
                            type="button"
                            className="ctpl-xoa"
                            title="Xoá dòng"
                            aria-label={`Xoá dòng ${index + 1}`}
                            onClick={() => xoaDong(index)}
                          >
                            <Icon n="x" className="ic sm" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="c" style={{ padding: '32px 0', color: 'var(--muted)', textAlign: 'center' }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="ctpl-chan">
        {!moi && (
          <button type="button" className="btn" onClick={saoChep}>
            <Icon n="copy" className="ic sm" />Sao chép
          </button>
        )}
        <button type="button" className="btn pri" onClick={luu}>
          Lưu lại
        </button>
      </div>

      {moHangLoat && (
        <ThemHangLoat
          ds={DS_NVL.filter(h => h.ma !== sp).map(h => ({
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            nhom: h.nhom,
            loai: 'Nguyên vật liệu',
          }))}
          daCo={nvl.map(n => n.ma)}
          onDong={() => setMoHangLoat(false)}
          onXacNhan={dsChon => {
            setNvl(cu => [...cu.filter(n => n.ma), ...dsChon.map(h => ({ ma: h.ma, sl: 1 }))])
            setMoHangLoat(false)
          }}
        />
      )}

      {hienCanhBao && (
        <HopXacNhan
          tieuDe="Cảnh báo"
          nut="Xác nhận"
          nutHuy="Huỷ"
          nutDo={false}
          onDong={() => setHienCanhBao(false)}
          onDongY={() => {
            setHienCanhBao(false)
            dong()
          }}
        >
          Dữ liệu đã thay đổi, bạn có chắc chắn muốn đóng?
        </HopXacNhan>
      )}
    </div>
  )
}
