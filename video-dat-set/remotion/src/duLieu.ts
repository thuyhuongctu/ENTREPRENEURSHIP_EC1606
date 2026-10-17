import mh01 from '../../du-lieu/minh_hoa_ch01.json';
import mh02 from '../../du-lieu/minh_hoa_ch02.json';
import mh03 from '../../du-lieu/minh_hoa_ch03.json';
import mh04 from '../../du-lieu/minh_hoa_ch04.json';
import mh05 from '../../du-lieu/minh_hoa_ch05.json';
import type { MinhHoa } from './minh-hoa/boCuc';

// Hình minh họa từng slide, khóa theo chương rồi theo số slide.
export const MINH_HOA: Record<number, Record<string, MinhHoa>> = Object.fromEntries(
  [mh01, mh02, mh03, mh04, mh05].map((m) => [m.chuong, m.slides as Record<string, MinhHoa>]),
);
