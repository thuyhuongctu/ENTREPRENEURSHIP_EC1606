import * as THREE from 'three';

/*
 * Bố cục hình minh họa và máy quay của nó — dùng chung cho HAI nơi: lúc dựng
 * ảnh từng lớp (MinhHoa.tsx) và lúc đặt nhãn chữ trong video (BaiGiang.tsx).
 * Hai nơi phải chiếu cùng một phép chiếu thì nhãn mới nằm đúng dưới biểu
 * tượng; vì thế cả máy quay lẫn vị trí chỉ khai ở đây.
 */

export const KHUNG = { trai: 640, tren: 236, rong: 1210, cao: 400 };

export type Kieu = 'hang' | 'duong' | 'vong' | 'chuoi' | 'trung_tam';
export type Muc = { bt: string; nhan: string };
export type MinhHoa = { kieu: Kieu; muc: Muc[]; theo_the?: boolean; giua?: string };
export type V3 = [number, number, number];

// Máy quay trực giao, nghiêng xuống ~25°: biểu tượng không bị phối cảnh bóp
// méo ở hai mép, và phép chiếu là tuyến tính nên nhãn đặt rất chính xác.
export const DON_VI_PX = 112;
export const MAY_VI_TRI: V3 = [0, 9, 10];
export const MAY_NHIN: V3 = [0, 0.9, 0];
export const mayQuay = () => {
  const c = new THREE.OrthographicCamera(
    -KHUNG.rong / 2 / DON_VI_PX, KHUNG.rong / 2 / DON_VI_PX,
    KHUNG.cao / 2 / DON_VI_PX, -KHUNG.cao / 2 / DON_VI_PX, 0.1, 100);
  c.position.set(...MAY_VI_TRI);
  c.lookAt(...MAY_NHIN);
  c.updateMatrixWorld();
  c.updateProjectionMatrix();
  return c;
};

/** Vị trí và cỡ từng mục. Bậc thang ("duong") nâng dần bệ để đọc ra thứ tự. */
export const viTri = (mh: MinhHoa): { p: V3; to: number; nang: number }[] => {
  const n = mh.muc.length;
  const rong = KHUNG.rong / DON_VI_PX; // bề ngang khung, tính bằng đơn vị cảnh
  if (mh.kieu === 'vong') {
    return mh.muc.map((_, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return { p: [Math.cos(a) * 3.2, 0, Math.sin(a) * 2.3 - 0.3] as V3, to: 0.74, nang: 0 };
    });
  }
  if (mh.kieu === 'trung_tam') {
    // Vệ tinh xếp thành nửa vòng phía sau người ở giữa: cả vòng thì mục ở
    // phía trước che mất người khởi nghiệp, mà đó mới là nhân vật chính.
    return mh.muc.map((_, i) => {
      if (i === 0) return { p: [0, 0, 0.2] as V3, to: 0.9, nang: 0 };
      const k = n - 1;
      const a = Math.PI + ((i - 1 + 0.5) / k) * Math.PI;
      return { p: [Math.cos(a) * 3.9, 0, Math.sin(a) * 1.3 - 0.1] as V3, to: 0.7, nang: 0 };
    });
  }
  const buoc = Math.min(2.9, (rong - 1.4) / n);
  const to = Math.min(1, buoc / 2.6);
  return mh.muc.map((_, i) => ({
    p: [(i - (n - 1) / 2) * buoc, 0, 0] as V3,
    to,
    nang: mh.kieu === 'duong' ? i * 0.3 : 0,
  }));
};

/** Điểm chân nhãn của mục i, quy ra pixel trong khung hình video. */
export const chanNhan = (mh: MinhHoa, i: number): [number, number] => {
  const v = viTri(mh)[i];
  const c = mayQuay();
  const q = new THREE.Vector3(v.p[0], -0.05, v.p[2] + 0.9 * v.to).project(c);
  return [KHUNG.trai + ((q.x + 1) / 2) * KHUNG.rong, KHUNG.tren + ((1 - q.y) / 2) * KHUNG.cao];
};

/** Tâm của bố cục vòng, quy ra pixel: chỗ đặt chữ ở giữa vòng (vd "MVP"). */
export const diemGiua = (mh: MinhHoa): [number, number] => {
  const vt = viTri(mh);
  const tb = vt.reduce((a, v) => [a[0] + v.p[0] / vt.length, a[1] + v.p[2] / vt.length], [0, 0]);
  const q = new THREE.Vector3(tb[0], 0.4, tb[1]).project(mayQuay());
  return [KHUNG.trai + ((q.x + 1) / 2) * KHUNG.rong, KHUNG.tren + ((1 - q.y) / 2) * KHUNG.cao];
};
