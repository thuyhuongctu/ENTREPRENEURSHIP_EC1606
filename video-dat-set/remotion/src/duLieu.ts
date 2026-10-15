import mh01 from '../../du-lieu/minh_hoa_ch01.json';
import type { MinhHoa } from './minh-hoa/boCuc';

// Hình minh họa từng slide, khóa theo chương rồi theo số slide.
export const MINH_HOA: Record<number, Record<string, MinhHoa>> = {
  1: mh01.slides as Record<string, MinhHoa>,
};
