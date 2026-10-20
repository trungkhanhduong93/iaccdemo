import { type FC } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/session'
import { anNgoaiGoi } from '../../app/plan'
import { moDuoc, timMan } from '../../app/registry'
import { AN_BC_GOI } from '../../modules/bao-cao/danh-sach'
import { Icon } from '../Icon'

export interface MucTheoDoi {
  ten: string
  path: string
  loai: 'dm' | 'bc'
  moTa?: string
}

export const MUC_THEO_DOI: Record<string, MucTheoDoi[]> = {
  kho: [
    { ten: 'Hàng hoá, dịch vụ', path: '/app/danh-muc/1-2', loai: 'dm' },
    { ten: 'Kho hàng', path: '/app/danh-muc/1-8', loai: 'dm' },
    { ten: 'Định mức tồn kho', path: '/app/kho/5-1-13', loai: 'dm' },
    { ten: 'Báo cáo xuất nhập tồn', path: '/app/kho/5-2-3', loai: 'bc' },
    { ten: 'Thẻ kho', path: '/app/kho/5-2-1', loai: 'bc' },
    { ten: 'Tồn kho tức thời', path: '/app/kho/5-2-4', loai: 'bc' },
    { ten: 'Tổng hợp nhập kho', path: '/app/kho/5-2-9', loai: 'bc' },
    { ten: 'Tổng hợp xuất kho', path: '/app/kho/5-2-11', loai: 'bc' },
  ],
  tien: [
    { ten: 'Danh mục Quỹ tiền', path: '/app/danh-muc/1-12', loai: 'dm' },
    { ten: 'Tài khoản ngân hàng', path: '/app/danh-muc/1-13', loai: 'dm' },
    { ten: 'Khách hàng, nhà cung cấp', path: '/app/danh-muc/1-5', loai: 'dm' },
    { ten: 'Lý do thu, chi', path: '/app/danh-muc/1-16', loai: 'dm' },
    { ten: 'Sổ quỹ tiền mặt', path: '/app/tien/2-2-1', loai: 'bc' },
    { ten: 'Sổ tiền gửi ngân hàng', path: '/app/tien/2-2-3', loai: 'bc' },
    { ten: 'Đối chiếu công nợ', path: '/app/tien/2-2-5', loai: 'bc' },
  ],
  'mua-hang': [
    { ten: 'Nhà cung cấp', path: '/app/danh-muc/1-5', loai: 'dm' },
    { ten: 'Hàng hoá, dịch vụ', path: '/app/danh-muc/1-2', loai: 'dm' },
    { ten: 'Sổ chi tiết mua hàng', path: '/app/mua-hang/4-2-1', loai: 'bc' },
    { ten: 'Công nợ phải trả', path: '/app/mua-hang/4-2-3', loai: 'bc' },
  ],
  'ban-hang': [
    { ten: 'Khách hàng', path: '/app/danh-muc/1-5', loai: 'dm' },
    { ten: 'Hàng hoá, dịch vụ', path: '/app/danh-muc/1-2', loai: 'dm' },
    { ten: 'Bảng giá', path: '/app/danh-muc/1-4', loai: 'dm' },
    { ten: 'Báo cáo doanh thu theo ngày', path: '/app/ban-hang/3-2-5', loai: 'bc' },
    { ten: 'Sổ chi tiết bán hàng', path: '/app/ban-hang/3-2-6', loai: 'bc' },
    { ten: 'Công nợ phải thu', path: '/app/ban-hang/3-2-9', loai: 'bc' },
  ],
  ccdc: [
    { ten: 'Hàng hoá (CCDC)', path: '/app/danh-muc/1-2', loai: 'dm' },
    { ten: 'Bảng chi tiết phân bổ chi phí', path: '/app/ccdc/bang-phan-bo', loai: 'bc' },
    { ten: 'Báo cáo tổng hợp CCDC', path: '/app/ccdc/8-2-1', loai: 'bc' },
    { ten: 'Báo cáo chi tiết CCDC', path: '/app/ccdc/8-2-2', loai: 'bc' },
  ],
  thue: [
    { ten: 'Tờ khai thuế GTGT', path: '/app/thue/6-2-3', loai: 'bc' },
    { ten: 'Bảng kê mua vào', path: '/app/thue/6-2-1', loai: 'bc' },
    { ten: 'Bảng kê bán ra', path: '/app/thue/6-2-2', loai: 'bc' },
  ],
  tscd: [
    { ten: 'Sổ tài sản cố định', path: '/app/tscd/7-2-1', loai: 'bc' },
    { ten: 'Bảng tính khấu hao', path: '/app/tscd/7-2-2', loai: 'bc' },
  ],
  'gia-thanh': [
    { ten: 'Bảng tính giá thành', path: '/app/gia-thanh/9-2-1', loai: 'bc' },
  ],
  'tong-hop': [
    { ten: 'Bảng cân đối số phát sinh', path: '/app/tong-hop/10-2-1', loai: 'bc' },
    { ten: 'Bảng cân đối kế toán', path: '/app/tong-hop/10-2-2', loai: 'bc' },
    { ten: 'Báo cáo kết quả kinh doanh', path: '/app/tong-hop/10-2-3', loai: 'bc' },
    { ten: 'Báo cáo lưu chuyển tiền tệ', path: '/app/tong-hop/10-2-4', loai: 'bc' },
  ],
}

export interface MBaoCaoTheoDoiProps {
  mo: boolean
  onDong: () => void
  modKey: string
  tieuDe?: string
}

export const MBaoCaoTheoDoi: FC<MBaoCaoTheoDoiProps> = ({
  mo,
  onDong,
  modKey,
  tieuDe = 'Báo cáo theo dõi & Danh mục',
}) => {
  const { s } = useSession()
  if (!mo) return null
  const dsRaw = MUC_THEO_DOI[modKey] ?? []
  const ds = dsRaw.filter(item => {
    const [, mKey, slug] = item.path.split('/').filter(Boolean)
    if (AN_BC_GOI[s.goi]?.includes(slug.replace(/-/g, '.'))) return false   // báo cáo ẩn hẳn ở gói (T506)
    if (!anNgoaiGoi(s.goi)) return true
    const { sc } = timMan(mKey, slug)
    return sc ? moDuoc(sc, s.goi) : true
  })
  const dsBc = ds.filter(x => x.loai === 'bc')
  const dsDm = ds.filter(x => x.loai === 'dm')

  return (
    <div className="m-loc-overlay" onClick={onDong}>
      <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
        <div className="m-loc-dau">
          <h2 className="m-loc-tieu-de">{tieuDe}</h2>
          <button type="button" className="m-loc-btn-dong" onClick={onDong} aria-label="Đóng">
            <Icon n="x" className="ic sm" />
          </button>
        </div>

        <div className="m-loc-than" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {dsBc.length > 0 && (
            <div className="m-bctd-nhom">
              <div className="m-bctd-nhom-ten">Báo cáo theo dõi</div>
              {dsBc.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="m-bctd-item"
                  onClick={onDong}
                >
                  <div className="m-bctd-item-trai">
                    <Icon n="doc" className="ic sm m-bctd-ic" />
                    <span className="m-bctd-item-ten">{item.ten}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-bctd-arr" />
                </Link>
              ))}
            </div>
          )}

          {dsDm.length > 0 && (
            <div className="m-bctd-nhom" style={{ marginTop: 12 }}>
              <div className="m-bctd-nhom-ten">Danh mục liên quan</div>
              {dsDm.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="m-bctd-item"
                  onClick={onDong}
                >
                  <div className="m-bctd-item-trai">
                    <Icon n="folder" className="ic sm m-bctd-ic" />
                    <span className="m-bctd-item-ten">{item.ten}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-bctd-arr" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="m-loc-day">
          <button type="button" className="m-loc-btn-apply" onClick={onDong}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
