// Báo cáo tổng hợp theo mẫu D trên điện thoại cho 4.2.3, 5.2.9, 5.2.3 (T624)
import React, { useEffect, useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { Row } from '../../modules/types'
import { money, soLuong } from '../format'
import { useSession } from '../../app/session'
import { nhomCuaMa } from '../../modules/bao-cao/loc-nguon'

export interface MBaoCaoTongHopMauDProps {
  maBc: string
  rows: Row[]
  q?: string
}

interface ItemChuan {
  ma: string
  ten: string
  dvt: string
  nhom: string
  // Tiền chính hoặc số cuối
  tongTien: number
  // Công nợ (4.2.3)
  dau: number
  ps: number
  tra: number
  tt: number
  cuoi: number
  soDon: number
  thang?: number
  cn?: string
  // Nhập kho (5.2.9)
  slNhap: number
  tienNhap: number
  l0?: number
  l1?: number
  l2?: number
  l3?: number
  // Xuất nhập tồn (5.2.3)
  sl0: number
  gt0: number
  sln: number
  gtn: number
  slx: number
  gtx: number
  sl1: number
  gt1: number
  kho?: string
}

interface NhomItem {
  tenNhom: string
  tongTien: number
  tongSl: number
  items: ItemChuan[]
}

export const MBaoCaoTongHopMauD: FC<MBaoCaoTongHopMauDProps> = ({ maBc, rows, q = '' }) => {
  const { s } = useSession()
  const [itemMo, setItemMo] = useState<Record<string, boolean>>({})

  const maNorm = (maBc || '').replace(/-/g, '.').split('/').pop() || ''
  const is423 = maNorm === '4.2.3'
  const is529 = maNorm === '5.2.9'
  const is523 = maNorm === '5.2.3'
  const isStandard = s.goi === 'S'

  // Đặt tiêu đề thanh trên
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.m-thanh-tren-tieu-de')
    if (!el) return
    const textGoc = el.textContent
    const ten = is423
      ? 'Công nợ nhà cung cấp'
      : is529
      ? 'Tổng hợp nhập kho'
      : 'Báo cáo xuất nhập tồn'
    el.textContent = ten
    return () => {
      if (el && textGoc) el.textContent = textGoc
    }
  }, [is423, is529, is523])

  // Chuẩn hoá dữ liệu
  const dsChuan = useMemo<ItemChuan[]>(() => {
    const qTrim = q.trim().toLowerCase()
    return rows
      .filter(r => !r._t && !r._b && !r._con)
      .filter(r => {
        if (!qTrim) return true
        const text = `${r.ma || ''} ${r.ten || ''} ${r.tenHang || ''} ${r.doiTuong || ''} ${r.ncc || ''}`.toLowerCase()
        return text.includes(qTrim)
      })
      .map(r => {
        const ma = String(r.ma || '')
        const ten = String(r.ten || r.tenHang || r.doiTuong || r.ncc || '')
        const dvt = String(r.dvt || '')
        const nhom = is423
          ? (Number(r.cuoi ?? 0) > 0 ? 'Nhà cung cấp còn nợ' : 'Đã tất toán')
          : String(r.nhom || nhomCuaMa(ma) || 'Hàng hoá, nguyên vật liệu')

        // 4.2.3 Công nợ
        const dau = Number(r.dau ?? 0)
        const ps = Number(r.ps ?? r.psNo ?? r.tienHang ?? 0)
        const tra = Number(r.tra ?? 0)
        const tt = Number(r.tt ?? r.psCo ?? 0)
        const cuoi = Number(r.cuoi ?? 0)
        const soDon = Number(r.soDon ?? 0)

        // 5.2.9 Nhập kho
        const slNhap = Number(r.sl ?? 0)
        const tienNhap = Number(r.tien ?? 0)
        const l0 = Number(r.l0 ?? 0)
        const l1 = Number(r.l1 ?? 0)
        const l2 = Number(r.l2 ?? 0)
        const l3 = Number(r.l3 ?? 0)

        // 5.2.3 Xuất nhập tồn
        const sl0 = Number(r.sl0 ?? 0)
        const gt0 = Number(r.gt0 ?? 0)
        const sln = Number(r.sln ?? 0)
        const gtn = Number(r.gtn ?? 0)
        const slx = Number(r.slx ?? 0)
        const gtx = Number(r.gtx ?? 0)
        const sl1 = Number(r.sl1 ?? 0)
        const gt1 = Number(r.gt1 ?? 0)
        const kho = r._kho ? (Array.isArray(r._kho) ? r._kho[0] : String(r._kho)) : 'Kho bếp Lê Lợi'

        let tongTien = 0
        if (is423) tongTien = cuoi
        else if (is529) tongTien = tienNhap
        else if (is523) tongTien = isStandard ? sl1 : gt1

        return {
          ma,
          ten,
          dvt,
          nhom,
          tongTien,
          dau,
          ps,
          tra,
          tt,
          cuoi,
          soDon,
          thang: r._thang ? Number(r._thang) : undefined,
          cn: r._cn ? String(r._cn) : undefined,
          slNhap,
          tienNhap,
          l0,
          l1,
          l2,
          l3,
          sl0,
          gt0,
          sln,
          gtn,
          slx,
          gtx,
          sl1,
          gt1,
          kho,
        }
      })
  }, [rows, q, is423, is529, is523, isStandard])

  // Gom theo nhóm
  const dsNhom = useMemo<NhomItem[]>(() => {
    const map = new Map<string, ItemChuan[]>()
    for (const d of dsChuan) {
      const list = map.get(d.nhom) ?? []
      list.push(d)
      map.set(d.nhom, list)
    }

    return Array.from(map.entries()).map(([tenNhom, items]) => {
      let tongTien = 0
      let tongSl = 0
      if (is423) {
        tongTien = items.reduce((s, x) => s + x.cuoi, 0)
        tongSl = items.reduce((s, x) => s + x.soDon, 0)
      } else if (is529) {
        tongTien = items.reduce((s, x) => s + x.tienNhap, 0)
        tongSl = items.reduce((s, x) => s + x.slNhap, 0)
      } else if (is523) {
        tongTien = isStandard ? 0 : items.reduce((s, x) => s + x.gt1, 0)
        tongSl = isStandard ? 0 : items.reduce((s, x) => s + x.sl1, 0)
      }

      return {
        tenNhom,
        tongTien,
        tongSl,
        items,
      }
    })
  }, [dsChuan, is423, is529, is523, isStandard])

  // Tổng ghim đáy màn hình
  const tongTienTatCa = useMemo(() => {
    if (is423) return dsChuan.reduce((s, x) => s + x.cuoi, 0)
    if (is529) return dsChuan.reduce((s, x) => s + x.tienNhap, 0)
    if (is523) return isStandard ? 0 : dsChuan.reduce((s, x) => s + x.gt1, 0)
    return 0
  }, [dsChuan, is423, is529, is523, isStandard])

  const toggleItem = (ma: string, macDinhMo: boolean) => {
    setItemMo(prev => {
      const hienTai = prev[ma] !== undefined ? prev[ma] : macDinhMo
      return { ...prev, [ma]: !hienTai }
    })
  }

  return (
    <div className={`m-bkm-d m-bkm-327 ${is523 ? 'm-bkm-523' : ''}`}>
      {dsNhom.length === 0 ? (
        <div className="m-so-dong-trong">
          {q.trim() ? 'Không tìm thấy kết quả phù hợp' : 'Không có dữ liệu trong kỳ'}
        </div>
      ) : (
        dsNhom.map((nhom, nIdx) => (
          <div key={nhom.tenNhom} className="m-bkm-nhom-ngay">
            {/* Tiêu đề nhóm */}
            <div className="m-bkm-ngay-head">
              <span className="m-bkm-ngay-ten">{nhom.tenNhom}</span>
              <span className="m-bkm-ngay-phai">
                {nhom.items.length} {is423 ? 'nhà cung cấp' : 'mặt hàng'}
                {(!is523 || !isStandard) && (
                  <>
                    {' · '}
                    <b className="m-bkm-ngay-tong num">{money(nhom.tongTien)}</b>
                  </>
                )}
              </span>
            </div>

            {/* Các thẻ đối tượng / mặt hàng */}
            <div className="m-bkm-ds-phieu">
              {nhom.items.map((it, itIdx) => {
                const laMacDinhBung = nIdx === 0 && itIdx === 0
                const isBung = itemMo[it.ma] !== undefined ? itemMo[it.ma] : laMacDinhBung

                // Link mở chi tiết
                let linkTo: string | undefined = undefined
                if (is529) {
                  linkTo = '/app/bao-cao/5-2-10'
                } else if (is523) {
                  linkTo = `/app/bao-cao/5-2-1?ma=${it.ma}&kho=${encodeURIComponent(it.kho || 'Kho bếp Lê Lợi')}`
                }

                return (
                  <div
                    key={it.ma || itIdx}
                    className="m-bkm-card m-bcd-item"
                    onClick={() => toggleItem(it.ma, laMacDinhBung)}
                  >
                    {/* Hàng 1: Mã bên trái, Tiền/SL + Mũi tên bên phải */}
                    <div className="m-bkm-card-h1">
                      {linkTo ? (
                        <Link
                          to={linkTo}
                          className="m-bkm-so-phieu"
                          onClick={e => e.stopPropagation()}
                          title="Xem chi tiết"
                        >
                          {it.ma}
                        </Link>
                      ) : (
                        <span className="m-bkm-so-phieu">{it.ma}</span>
                      )}
                      <div className="m-bkm-card-h1-phai">
                        <span className="m-bkm-card-tong num">
                          {is523 && isStandard ? `${soLuong(it.sl1)} ${it.dvt}` : money(it.tongTien)}
                        </span>
                        <span className="m-bkm-card-chev">
                          {isBung ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Hàng 2: Tên đối tượng / mặt hàng */}
                    <div className="m-bkm-ncc-ten">{it.ten}</div>

                    {/* Chi tiết khi bung */}
                    {isBung && (
                      <div className="m-bkm-chi-tiet">
                        {/* 1. Màn 4.2.3: Công nợ NCC */}
                        {is423 && (
                          <div className="m-bkm-ds-hang">
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Nợ đầu kỳ</span>
                                <span className="m-bkm-hang-tien num">{money(it.dau)}</span>
                              </div>
                            </div>
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Mua nợ trong kỳ</span>
                                <span className="m-bkm-hang-tien num m-so-dong-duong">+{money(it.ps)}</span>
                              </div>
                            </div>
                            {it.tra > 0 && (
                              <div className="m-bkm-hang-item">
                                <div className="m-bkm-hang-top">
                                  <span className="m-bkm-hang-ten">Tiền trả hàng</span>
                                  <span className="m-bkm-hang-tien num m-so-dong-am">−{money(it.tra)}</span>
                                </div>
                              </div>
                            )}
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Đã thanh toán</span>
                                <span className="m-bkm-hang-tien num m-so-dong-am">−{money(it.tt)}</span>
                              </div>
                            </div>

                            {/* Chân thẻ 4.2.3 */}
                            <div className="m-bkm-ct-chan">
                              <div className="m-bkm-ct-chan-trai">
                                <span>Số đơn phát sinh <b className="num">{it.soDon}</b></span>
                              </div>
                              <div className="m-bkm-ct-chan-phai" style={{ display: 'flex', gap: 6 }}>
                                {it.cuoi > 0 && (
                                  <Link
                                    to={`/app/tien/2-1-1/moi?loai=chi&ly=CHI02&dt=${encodeURIComponent(it.ten)}`}
                                    className="btn pri sm"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    Thanh toán
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Màn 5.2.9: Tổng hợp nhập kho */}
                        {is529 && (
                          <div className="m-bkm-ds-hang">
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Số lượng nhập</span>
                                <span className="m-bkm-hang-tien num">{soLuong(it.slNhap)} {it.dvt}</span>
                              </div>
                            </div>
                            <div className="m-bkm-hang-item">
                              <div className="m-bkm-hang-top">
                                <span className="m-bkm-hang-ten">Tiền vốn hàng nhập</span>
                                <span className="m-bkm-hang-tien num">{money(it.tienNhap)}</span>
                              </div>
                            </div>
                            {(it.l0 ?? 0) > 0 && (
                              <div className="m-bkm-hang-item">
                                <div className="m-bkm-hang-top">
                                  <span className="m-bkm-hang-ten">Nhập mua</span>
                                  <span className="m-bkm-hang-tien num">{money(it.l0 ?? 0)}</span>
                                </div>
                              </div>
                            )}
                            {(it.l1 ?? 0) > 0 && (
                              <div className="m-bkm-hang-item">
                                <div className="m-bkm-hang-top">
                                  <span className="m-bkm-hang-ten">Nhập khác</span>
                                  <span className="m-bkm-hang-tien num">{money(it.l1 ?? 0)}</span>
                                </div>
                              </div>
                            )}
                            {(it.l2 ?? 0) > 0 && (
                              <div className="m-bkm-hang-item">
                                <div className="m-bkm-hang-top">
                                  <span className="m-bkm-hang-ten">Khách trả lại</span>
                                  <span className="m-bkm-hang-tien num">{money(it.l2 ?? 0)}</span>
                                </div>
                              </div>
                            )}
                            {(it.l3 ?? 0) > 0 && (
                              <div className="m-bkm-hang-item">
                                <div className="m-bkm-hang-top">
                                  <span className="m-bkm-hang-ten">Nhập điều chuyển</span>
                                  <span className="m-bkm-hang-tien num">{money(it.l3 ?? 0)}</span>
                                </div>
                              </div>
                            )}

                            {/* Chân thẻ 5.2.9 */}
                            <div className="m-bkm-ct-chan">
                              <div className="m-bkm-ct-chan-trai">
                                <span>ĐVT <b className="num">{it.dvt}</b></span>
                                <span>Tổng SL <b className="num">{soLuong(it.slNhap)}</b></span>
                              </div>
                              <div className="m-bkm-ct-chan-phai">
                                <Link to="/app/bao-cao/5-2-10" className="m-bkm-tt-badge da" onClick={e => e.stopPropagation()}>
                                  Chi tiết nhập kho
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Màn 5.2.3: Báo cáo xuất nhập tồn */}
                        {is523 && (
                          <div className="m-bkm-ds-hang">
                            {isStandard ? (
                              /* Gói Free: chỉ số lượng, không cột, không dòng, không số tiền nào */
                              <>
                                <div className="m-bkm-hang-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Tồn đầu kỳ</span>
                                    <span className="m-bkm-hang-tien num">{soLuong(it.sl0)} {it.dvt}</span>
                                  </div>
                                </div>
                                <div className="m-bkm-hang-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Nhập trong kỳ</span>
                                    <span className="m-bkm-hang-tien num m-so-dong-duong">+{soLuong(it.sln)} {it.dvt}</span>
                                  </div>
                                </div>
                                <div className="m-bkm-hang-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Xuất trong kỳ</span>
                                    <span className="m-bkm-hang-tien num m-so-dong-am">−{soLuong(it.slx)} {it.dvt}</span>
                                  </div>
                                </div>
                                <div className="m-bkm-hang-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Tồn cuối kỳ</span>
                                    <span className="m-bkm-hang-tien num" style={{ fontWeight: 700 }}>{soLuong(it.sl1)} {it.dvt}</span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* Gói S, PL, PR: mỗi nhóm hiện cùng lúc 2 dòng, số lượng trên, tiền dưới */
                              <>
                                <div className="m-bkm-hang-item m-xnt-2dong-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Đầu kỳ</span>
                                    <div className="m-xnt-2dong-phai">
                                      <div className="m-xnt-dong-sl num">{soLuong(it.sl0)} {it.dvt}</div>
                                      <div className="m-xnt-dong-tien num">{money(it.gt0)} đ</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="m-bkm-hang-item m-xnt-2dong-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Nhập trong kỳ</span>
                                    <div className="m-xnt-2dong-phai">
                                      <div className="m-xnt-dong-sl num m-so-dong-duong">+{soLuong(it.sln)} {it.dvt}</div>
                                      <div className="m-xnt-dong-tien num m-so-dong-duong">+{money(it.gtn)} đ</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="m-bkm-hang-item m-xnt-2dong-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Xuất trong kỳ</span>
                                    <div className="m-xnt-2dong-phai">
                                      <div className="m-xnt-dong-sl num m-so-dong-am">−{soLuong(it.slx)} {it.dvt}</div>
                                      <div className="m-xnt-dong-tien num m-so-dong-am">−{money(it.gtx)} đ</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="m-bkm-hang-item m-xnt-2dong-item">
                                  <div className="m-bkm-hang-top">
                                    <span className="m-bkm-hang-ten">Cuối kỳ</span>
                                    <div className="m-xnt-2dong-phai">
                                      <div className="m-xnt-dong-sl num" style={{ fontWeight: 700 }}>{soLuong(it.sl1)} {it.dvt}</div>
                                      <div className="m-xnt-dong-tien num" style={{ fontWeight: 700 }}>{money(it.gt1)} đ</div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Chân thẻ 5.2.3 */}
                            <div className="m-bkm-ct-chan">
                              <div className="m-bkm-ct-chan-trai">
                                <span>ĐVT <b className="num">{it.dvt}</b></span>
                                {it.kho && <span>Kho <b className="num">{it.kho}</b></span>}
                              </div>
                              <div className="m-bkm-ct-chan-phai">
                                <Link
                                  to={`/app/bao-cao/5-2-1?ma=${it.ma}&kho=${encodeURIComponent(it.kho || 'Kho bếp Lê Lợi')}`}
                                  className="m-bkm-tt-badge da"
                                  onClick={e => e.stopPropagation()}
                                >
                                  Xem thẻ kho
                                </Link>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Tổng ghim đáy màn */}
      {!(is523 && isStandard) && (
        <div className="m-bkm-chan">
          <div className="m-bkm-chan-trai">
            <div className="m-bkm-chan-nhan">
              {is423
                ? 'Tổng nợ phải trả NCC'
                : is529
                ? 'Tổng tiền nhập kho'
                : 'Tổng giá trị tồn kho cuối kỳ'}
            </div>
          </div>
          <div className="m-bkm-chan-phai">
            <span className="m-bkm-chan-tien num">
              {money(tongTienTatCa)} đ
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
