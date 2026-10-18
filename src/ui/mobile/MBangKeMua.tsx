// Báo cáo Bảng kê mua hàng theo hàng hoá trên điện thoại gom nhóm (T403)
// Theo phần 1 của backup/mock-chot-T403-T406.html (Trum đã chốt)
import React, { useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { money, soLuong } from '../format'
import { CUA_HANG, NCC, NVL } from '../../data/mock'
import { PHIEU_MUA } from '../../modules/mua-hang/bao-cao'
import { chungTu, ttNghiepVu } from '../generic/gen'
import { duongPhieu } from '../generic/SoChungTu'

export interface MBangKeMuaProps {
  rows: Row[]
  q?: string
}

function layDuongDanPhieu(so: unknown): string | undefined {
  if (!so || typeof so !== 'string') return undefined
  let to = duongPhieu(so)
  if (!to) {
    const m = /^([A-Z]+)(\d{2})-(\d+)$/.exec(so)
    if (m) {
      to = duongPhieu(`${m[1]}26${m[2]}-${m[3].padStart(4, '0')}`)
    }
  }
  return to
}

interface DongHangChuan {
  so: string
  ngay: string
  doiTuong: string
  ma: string
  ten: string
  dvt: string
  sl: number
  gia: number
  thanhTien: number
  ck: number
  truocThue: number
  thue: number
  tong: number
  ts?: number
  thueNhan: string
  soHd?: string
  kyHieuHd?: string
  kho?: string
}

interface PhieuMuaGroup {
  so: string
  ngay: string
  doiTuong: string
  soHd?: string
  kyHieuHd?: string
  kho?: string
  tongTienHang: number
  tongGiamGia: number
  tongThue: number
  tongGomThue: number
  dong: DongHangChuan[]
}

interface NccGroup {
  ten: string
  mst: string
  tongTienHang: number
  tongGiamGia: number
  tongThue: number
  tongGomThue: number
  soDong: number
  phieuList: PhieuMuaGroup[]
}

interface MatHangGroup {
  ma: string
  ten: string
  dvt: string
  tongSl: number
  tongTienHang: number
  tongGiamGia: number
  tongThue: number
  tongGomThue: number
  giaTb: number
  dongList: DongHangChuan[]
}

export const MBangKeMua: FC<MBangKeMuaProps> = ({ rows }) => {
  const [tab, setTab] = useState<'ncc' | 'hang' | 'phieu'>('ncc')
  const [phieuMo, setPhieuMo] = useState<Record<string, boolean>>({})

  // Bảng tra cứu bổ sung thông tin phiếu (kho, hoá đơn, ký hiệu)
  const mapPhieuExtra = useMemo(() => {
    const map = new Map<string, { kho: string; soHd: string; kyHieuHd: string }>()
    try {
      const dsPhieu = chungTu(PHIEU_MUA, '4.1.1')
      for (const p of dsPhieu) {
        const so = String(p.so || '')
        const nv = ttNghiepVu(p)
        const ch = CUA_HANG.find(c => c.ten === p.cn)
        const khoTen = String(p._kho || ch?.kho[0] || (p.cn ? `Kho ${p.cn}` : ''))
        map.set(so, {
          kho: khoTen ? (khoTen.startsWith('Kho') ? khoTen : `Kho ${khoTen}`) : '',
          soHd: nv.soHd,
          kyHieuHd: nv.kyHieuHd,
        })
      }
    } catch {
      // Bỏ qua lỗi tra cứu mẫu
    }
    return map
  }, [])

  // Chuẩn hoá các dòng hàng (bỏ dòng tổng cộng _t, _b)
  const dsDongChuan = useMemo<DongHangChuan[]>(() => {
    return rows
      .filter(r => !r._t && !r._b)
      .map(r => {
        const so = String(r.so || '')
        const ngay = String(r.ngay || '')
        const doiTuong = String(r.doiTuong || '')
        const ma = String(r.ma || '')
        const ten = String(r.ten || '')
        const dvt = String(r.dvt || '')
        const sl = Number(r.sl) || 0
        const gia = Number(r.gia) || 0
        const thanhTien = Number(r.thanhTien ?? sl * gia) || 0
        const ck = Number(r.ck) || 0
        const truocThue = Number(r.truocThue ?? (thanhTien - ck)) || 0
        const thue = Number(r.thue) || 0
        const tong = Number(r.tong ?? (truocThue + thue)) || 0

        // Xác định thuế suất
        let ts = typeof r.ts === 'number' ? r.ts : undefined
        if (ts === undefined && thue > 0 && truocThue > 0) {
          ts = Math.round((thue / truocThue) * 100)
        }
        if (ts === undefined) {
          const nvl = NVL.find(x => x.ma === ma)
          if (nvl) ts = nvl.ts
        }
        const thueNhan = thue > 0 ? (ts ? `Thuế GTGT ${ts}%` : 'Thuế GTGT') : 'Thuế GTGT không chịu thuế'

        const extra = mapPhieuExtra.get(so)
        const soHd = String(r.soHd || r._soHd || extra?.soHd || '')
        const kyHieuHd = String(r.kyHieuHd || r._kyHieuHd || extra?.kyHieuHd || '')
        const kho = String(r.kho || r._kho || extra?.kho || '')

        return {
          so,
          ngay,
          doiTuong,
          ma,
          ten,
          dvt,
          sl,
          gia,
          thanhTien,
          ck,
          truocThue,
          thue,
          tong,
          ts,
          thueNhan,
          soHd,
          kyHieuHd,
          kho,
        }
      })
  }, [rows, mapPhieuExtra])

  // Khối tổng chung
  const tongTienHang = useMemo(() => dsDongChuan.reduce((sum, d) => sum + d.thanhTien, 0), [dsDongChuan])
  const tongGiamGia = useMemo(() => dsDongChuan.reduce((sum, d) => sum + d.ck, 0), [dsDongChuan])
  const tongThue = useMemo(() => dsDongChuan.reduce((sum, d) => sum + d.thue, 0), [dsDongChuan])
  const tongGomThue = useMemo(() => tongTienHang - tongGiamGia + tongThue, [tongTienHang, tongGiamGia, tongThue])

  const soLuongPhieu = useMemo(() => new Set(dsDongChuan.map(d => d.so)).size, [dsDongChuan])
  const soLuongNcc = useMemo(() => new Set(dsDongChuan.map(d => d.doiTuong)).size, [dsDongChuan])
  const soLuongDong = dsDongChuan.length

  // Gom theo Nhà cung cấp
  const dsNccGroup = useMemo<NccGroup[]>(() => {
    const nccMap = new Map<string, { dong: DongHangChuan[]; phieuMap: Map<string, DongHangChuan[]> }>()
    for (const d of dsDongChuan) {
      let g = nccMap.get(d.doiTuong)
      if (!g) {
        g = { dong: [], phieuMap: new Map() }
        nccMap.set(d.doiTuong, g)
      }
      g.dong.push(d)
      let pList = g.phieuMap.get(d.so)
      if (!pList) {
        pList = []
        g.phieuMap.set(d.so, pList)
      }
      pList.push(d)
    }

    return Array.from(nccMap.entries()).map(([ten, g]) => {
      const nccItem = NCC.find(n => n.ten === ten)
      const mst = nccItem?.mst || ''
      const tongTien = g.dong.reduce((s, x) => s + x.thanhTien, 0)
      const tongGiam = g.dong.reduce((s, x) => s + x.ck, 0)
      const tongVat = g.dong.reduce((s, x) => s + x.thue, 0)
      const tongGom = tongTien - tongGiam + tongVat

      const phieuList: PhieuMuaGroup[] = Array.from(g.phieuMap.entries()).map(([so, pDong]) => {
        const d0 = pDong[0]
        const pTien = pDong.reduce((s, x) => s + x.thanhTien, 0)
        const pGiam = pDong.reduce((s, x) => s + x.ck, 0)
        const pVat = pDong.reduce((s, x) => s + x.thue, 0)
        const pGom = pTien - pGiam + pVat
        return {
          so,
          ngay: d0.ngay,
          doiTuong: d0.doiTuong,
          soHd: d0.soHd,
          kyHieuHd: d0.kyHieuHd,
          kho: d0.kho,
          tongTienHang: pTien,
          tongGiamGia: pGiam,
          tongThue: pVat,
          tongGomThue: pGom,
          dong: pDong,
        }
      })

      return {
        ten,
        mst,
        tongTienHang: tongTien,
        tongGiamGia: tongGiam,
        tongThue: tongVat,
        tongGomThue: tongGom,
        soDong: g.dong.length,
        phieuList,
      }
    })
  }, [dsDongChuan])

  // Gom theo Mặt hàng
  const dsMatHangGroup = useMemo<MatHangGroup[]>(() => {
    const mhMap = new Map<string, DongHangChuan[]>()
    for (const d of dsDongChuan) {
      const khoa = d.ma || d.ten
      const list = mhMap.get(khoa) ?? []
      list.push(d)
      mhMap.set(khoa, list)
    }

    return Array.from(mhMap.values()).map(dongList => {
      const d0 = dongList[0]
      const tongSl = dongList.reduce((s, x) => s + x.sl, 0)
      const tongTien = dongList.reduce((s, x) => s + x.thanhTien, 0)
      const tongGiam = dongList.reduce((s, x) => s + x.ck, 0)
      const tongVat = dongList.reduce((s, x) => s + x.thue, 0)
      const tongGom = tongTien - tongGiam + tongVat
      const giaTb = tongSl > 0 ? Math.round(tongTien / tongSl) : 0

      return {
        ma: d0.ma,
        ten: d0.ten,
        dvt: d0.dvt,
        tongSl,
        tongTienHang: tongTien,
        tongGiamGia: tongGiam,
        tongThue: tongVat,
        tongGomThue: tongGom,
        giaTb,
        dongList,
      }
    })
  }, [dsDongChuan])

  // Gom theo Phiếu
  const dsPhieuGroup = useMemo<PhieuMuaGroup[]>(() => {
    const pMap = new Map<string, DongHangChuan[]>()
    for (const d of dsDongChuan) {
      const list = pMap.get(d.so) ?? []
      list.push(d)
      pMap.set(d.so, list)
    }

    return Array.from(pMap.entries()).map(([so, pDong]) => {
      const d0 = pDong[0]
      const pTien = pDong.reduce((s, x) => s + x.thanhTien, 0)
      const pGiam = pDong.reduce((s, x) => s + x.ck, 0)
      const pVat = pDong.reduce((s, x) => s + x.thue, 0)
      const pGom = pTien - pGiam + pVat
      return {
        so,
        ngay: d0.ngay,
        doiTuong: d0.doiTuong,
        soHd: d0.soHd,
        kyHieuHd: d0.kyHieuHd,
        kho: d0.kho,
        tongTienHang: pTien,
        tongGiamGia: pGiam,
        tongThue: pVat,
        tongGomThue: pGom,
        dong: pDong,
      }
    })
  }, [dsDongChuan])

  const togglePhieu = (so: string) => {
    setPhieuMo(prev => ({ ...prev, [so]: !prev[so] }))
  }

  // Khối vẽ chi tiết một phiếu
  const renderChiTietPhieu = (p: PhieuMuaGroup) => (
    <div key={p.so} className="ph">
      <div className="ph-dau" onClick={() => togglePhieu(p.so)} style={{ cursor: 'pointer' }}>
        <Link
          to={layDuongDanPhieu(p.so) || '/app/mua-hang/4-1-1'}
          className="ma"
          onClick={e => e.stopPropagation()}
        >
          Phiếu {p.so} ›
        </Link>
        <span className="ph-ngay num">{p.ngay}</span>
        <span className="ph-hd">
          {p.soHd ? `Hoá đơn ${p.soHd}${p.kyHieuHd ? ` · ký hiệu ${p.kyHieuHd}` : ''}` : ''}
        </span>
        <span className="ph-hd2">{p.kho || ''}</span>
      </div>

      {p.dong.map((d, dIdx) => (
        <div key={`${p.so}-${d.ma || dIdx}`} className="mh m-bcd-item">
          <div className="mh-ten">
            <b>
              <i>{dIdx + 1}.</i>
              {d.ten}
            </b>
            <strong className="num">{money(d.tong)}</strong>
            <span className="mh-ma">
              {d.ma}
              {d.dvt ? ` · ${d.dvt}` : ''}
            </span>
          </div>
          <div className="kv">
            <div>
              <span>Số lượng × Đơn giá</span>
              <b className="num">{soLuong(d.sl)} × {money(d.gia)}</b>
            </div>
            <div>
              <span>Tiền hàng</span>
              <b className="num">{money(d.thanhTien)}</b>
            </div>
            <div className={d.ck > 0 ? 'am' : 'khong'}>
              <span>Giảm giá</span>
              <b className="num">{d.ck > 0 ? `(${money(d.ck)})` : '–'}</b>
            </div>
            <div className={d.thue > 0 ? '' : 'khong'}>
              <span>{d.thueNhan}</span>
              <b className="num">{d.thue > 0 ? money(d.thue) : '–'}</b>
            </div>
          </div>
        </div>
      ))}

      <div className="ph-chan">
        <div className="tk-dong">
          <span>Cộng tiền hàng</span>
          <span className="num">{money(p.tongTienHang)}</span>
        </div>
        <div className="tk-dong">
          <span>Giảm giá</span>
          <span className={`num ${p.tongGiamGia > 0 ? 'am' : ''}`}>
            {p.tongGiamGia > 0 ? `(${money(p.tongGiamGia)})` : '–'}
          </span>
        </div>
        <div className="tk-dong">
          <span>Thuế GTGT</span>
          <span className="num">{p.tongThue > 0 ? money(p.tongThue) : '–'}</span>
        </div>
        <div className="tk-tong">
          <span>Tổng thanh toán phiếu</span>
          <b className="num">{money(p.tongGomThue)}</b>
        </div>
      </div>
    </div>
  )

  return (
    <div className="m-bkm">
      {/* Khối tổng hợp đầu trang */}
      <div className="tk">
        <div className="tk-dong">
          <span>Tiền hàng</span>
          <span className="num">{money(tongTienHang)}</span>
        </div>
        <div className="tk-dong">
          <span>Giảm giá</span>
          <span className={`num ${tongGiamGia > 0 ? 'am' : ''}`}>
            {tongGiamGia > 0 ? `(${money(tongGiamGia)})` : '–'}
          </span>
        </div>
        <div className="tk-dong">
          <span>Thuế GTGT</span>
          <span className="num">{money(tongThue)}</span>
        </div>
        <div className="tk-tong">
          <span>Tổng tiền mua hàng (gồm thuế)</span>
          <b className="num">{money(tongGomThue)}</b>
        </div>
        <div className="tk-phu">
          {soLuongPhieu} phiếu mua · {soLuongNcc} nhà cung cấp · {soLuongDong} dòng hàng · đơn vị: đồng
        </div>
      </div>

      {/* Thanh tab gom nhóm */}
      <div className="tab">
        <span className={tab === 'ncc' ? 'on' : ''} onClick={() => setTab('ncc')}>
          Nhà cung cấp
        </span>
        <span className={tab === 'hang' ? 'on' : ''} onClick={() => setTab('hang')}>
          Mặt hàng
        </span>
        <span className={tab === 'phieu' ? 'on' : ''} onClick={() => setTab('phieu')}>
          Phiếu
        </span>
      </div>

      {/* Danh sách dữ liệu theo tab */}
      <div className="ds">
        {/* Tab 1: Gom Nhà cung cấp */}
        {tab === 'ncc' &&
          dsNccGroup.map((ncc, nccIdx) => (
            <details key={ncc.ten} className="ncc m-bcd-item" open={nccIdx === 0}>
              <summary>
                <span className="ncc-ten">{ncc.ten}</span>
                <span className="ncc-tien num">{money(ncc.tongGomThue)}</span>
                <span className="ncc-meta">
                  {ncc.mst ? `MST ${ncc.mst} · ` : ''}
                  {ncc.phieuList.length} phiếu · {ncc.soDong} dòng
                </span>
                <span className="ncc-meta2 num">
                  {ncc.tongThue > 0
                    ? `VAT ${money(ncc.tongThue)}`
                    : ncc.tongGiamGia > 0
                    ? `Giảm (${money(ncc.tongGiamGia)})`
                    : 'không VAT'}
                </span>
              </summary>

              {ncc.phieuList.map((p, pIdx) => {
                const laMacDinhBung = nccIdx === 0 && pIdx === 0
                const isBung = phieuMo[p.so] !== undefined ? phieuMo[p.so] : laMacDinhBung

                if (isBung) {
                  return renderChiTietPhieu(p)
                }

                return (
                  <div key={p.so} className="ph-gon" onClick={() => togglePhieu(p.so)}>
                    <Link
                      to={layDuongDanPhieu(p.so) || '/app/mua-hang/4-1-1'}
                      className="ma"
                      onClick={e => e.stopPropagation()}
                    >
                      Phiếu {p.so} ›
                    </Link>
                    <b className="num">{money(p.tongGomThue)}</b>
                    <span className="ph-hd">
                      {p.ngay} · {p.dong.length} dòng · {p.tongThue > 0 ? `VAT ${money(p.tongThue)}` : 'không VAT'}
                    </span>
                    <span></span>
                  </div>
                )
              })}
            </details>
          ))}

        {/* Tab 2: Gom Mặt hàng */}
        {tab === 'hang' &&
          dsMatHangGroup.map((mh, mhIdx) => (
            <details key={mh.ma || mh.ten} className="ncc m-bcd-item" open={mhIdx === 0}>
              <summary>
                <span className="ncc-ten">{mh.ten}</span>
                <span className="ncc-tien num">{money(mh.tongGomThue)}</span>
                <span className="ncc-meta">
                  {mh.ma}
                  {mh.dvt ? ` · ${mh.dvt}` : ''} · Tổng SL: {soLuong(mh.tongSl)}
                </span>
                <span className="ncc-meta2 num">Giá TB {money(mh.giaTb)}</span>
              </summary>

              {mh.dongList.map((d, dIdx) => (
                <div key={`${d.so}-${dIdx}`} className="ph">
                  <div className="ph-dau">
                    <Link to={layDuongDanPhieu(d.so) || '/app/mua-hang/4-1-1'} className="ma">
                      Phiếu {d.so} ›
                    </Link>
                    <span className="ph-ngay num">{d.ngay}</span>
                    <span className="ph-hd">{d.doiTuong}</span>
                    <span className="ph-hd2">{d.kho || ''}</span>
                  </div>
                  <div className="mh m-bcd-item">
                    <div className="mh-ten">
                      <b>
                        <i>{dIdx + 1}.</i>
                        {d.ten}
                      </b>
                      <strong className="num">{money(d.tong)}</strong>
                      <span className="mh-ma">
                        {d.ma}
                        {d.dvt ? ` · ${d.dvt}` : ''}
                      </span>
                    </div>
                    <div className="kv">
                      <div>
                        <span>Số lượng × Đơn giá</span>
                        <b className="num">{soLuong(d.sl)} × {money(d.gia)}</b>
                      </div>
                      <div>
                        <span>Tiền hàng</span>
                        <b className="num">{money(d.thanhTien)}</b>
                      </div>
                      <div className={d.ck > 0 ? 'am' : 'khong'}>
                        <span>Giảm giá</span>
                        <b className="num">{d.ck > 0 ? `(${money(d.ck)})` : '–'}</b>
                      </div>
                      <div className={d.thue > 0 ? '' : 'khong'}>
                        <span>{d.thueNhan}</span>
                        <b className="num">{d.thue > 0 ? money(d.thue) : '–'}</b>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </details>
          ))}

        {/* Tab 3: Gom Phiếu */}
        {tab === 'phieu' &&
          dsPhieuGroup.map((p, pIdx) => (
            <details key={p.so} className="ncc m-bcd-item" open={pIdx === 0}>
              <summary>
                <span className="ncc-ten">Phiếu {p.so}</span>
                <span className="ncc-tien num">{money(p.tongGomThue)}</span>
                <span className="ncc-meta">
                  {p.ngay} · {p.doiTuong} · {p.dong.length} dòng
                </span>
                <span className="ncc-meta2 num">
                  {p.tongThue > 0 ? `VAT ${money(p.tongThue)}` : 'không VAT'}
                </span>
              </summary>
              {renderChiTietPhieu(p)}
            </details>
          ))}
      </div>

      {/* Thanh ghim chân màn hình */}
      <div className="chan">
        <span>Tổng tiền mua hàng (gồm thuế)</span>
        <b className="num">{money(tongGomThue)} đ</b>
      </div>
    </div>
  )
}
