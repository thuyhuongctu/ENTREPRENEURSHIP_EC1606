/*
 * Chỗ miệng trên từng dáng Hương AI, để vẽ khẩu hình mấp máy theo giọng.
 * [x, y, rộng] tính bằng phần trăm khổ ảnh (x, rộng theo bề ngang, y theo bề
 * cao); `tl` = rộng/cao của tệp ảnh, cần để biết bề ngang khi ảnh đặt cao 750px.
 * Đo bằng mắt trên lưới phần trăm rồi chấm thử lên ảnh; đổi ảnh dáng nào thì
 * đo lại dáng ấy.
 */
export const MIENG: Record<string, { x: number; y: number; rong: number; tl: number }> = {
  cam_giay: { x: 47.5, y: 15.0, rong: 12, tl: 0.2916 },
  cam_khoa: { x: 46, y: 15.3, rong: 11, tl: 0.2977 },
  chao: { x: 49.5, y: 17.0, rong: 11, tl: 0.2911 },
  chi_gay: { x: 27, y: 14.5, rong: 6.5, tl: 0.537 },
  chi_len: { x: 40.8, y: 14.7, rong: 7, tl: 0.4536 },
  chi_ngang: { x: 46, y: 15.3, rong: 11, tl: 0.2963 },
  ghi_chep: { x: 50.5, y: 15.5, rong: 11, tl: 0.2921 },
  gioi_thieu: { x: 30.5, y: 14.9, rong: 7, tl: 0.4579 },
  kinh_lup: { x: 42, y: 15.9, rong: 10, tl: 0.3303 },
  om_sach: { x: 40, y: 15.9, rong: 11, tl: 0.2926 },
  suy_nghi: { x: 46, y: 13.9, rong: 11, tl: 0.2857 },
  vay_sen: { x: 55, y: 14.9, rong: 8, tl: 0.3727 },
};
