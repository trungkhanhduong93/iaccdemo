import type { ModuleDef } from '../types'
import { ThaoTacNhanhScreen } from './ThaoTacNhanhScreen'

const thaoTacNhanh: ModuleDef = {
  key: 'thao-tac-nhanh',
  ten: 'Thao tác nhanh',
  ngan: 'Thao tác nhanh',
  icon: 'sparkle',
  mota: 'Các thao tác nhanh thường dùng',
  screens: [
    {
      slug: 'danh-sach',
      ten: 'Thao tác nhanh',
      nhom: 'Thao tác nhanh',
      kind: 'custom',
      comp: ThaoTacNhanhScreen,
    },
  ],
}

export default thaoTacNhanh
