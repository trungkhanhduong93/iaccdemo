import type { FC } from 'react'
import imgEmptyData from '../../assets/ivt/img_empty_data.svg'
import imgEmptyItem from '../../assets/ivt/img_empty_item.svg'
import imgEmptySupplier from '../../assets/ivt/img_empty_supplier.svg'
import imgEmptyInventory from '../../assets/ivt/img_empty_inventory.svg'
import imgSearchNoResult from '../../assets/ivt/img_search_no_result.png'

export type KieuMTrong = 'tim' | 'hang' | 'ncc' | 'kho' | 'chung'

export interface MTrongProps {
  kieu?: KieuMTrong
  hinh?: string
  tieuDe?: string
  moTa?: string
  className?: string
}

const HINH_THEO_KIEU: Record<KieuMTrong, string> = {
  tim: imgSearchNoResult,
  hang: imgEmptyItem,
  ncc: imgEmptySupplier,
  kho: imgEmptyInventory,
  chung: imgEmptyData,
}

export const MTrong: FC<MTrongProps> = ({
  kieu = 'tim',
  hinh,
  tieuDe = 'Không tìm thấy dữ liệu',
  moTa = 'Xin vui lòng thử lại với từ khóa khác',
  className = '',
}) => {
  const imgSrc = hinh ?? HINH_THEO_KIEU[kieu] ?? imgSearchNoResult

  return (
    <div className={`m-trong ${className}`.trim()}>
      <img src={imgSrc} alt="" className="m-trong-hinh" />
      <div className="m-trong-tieu">{tieuDe}</div>
      <div className="m-trong-mo-ta">{moTa}</div>
    </div>
  )
}
