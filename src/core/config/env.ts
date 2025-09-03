export const ENV = {
  API_BASE_URL: __DEV__
    ? 'http://222.97.59.189:4000' // Android 에뮬레이터
    : 'https://api.pass-through.app',
};
if (__DEV__) {
  console.log('개발 모드');  // 개발 중에만 실행
} else {
  console.log('프로덕션 모드'); // 빌드된 앱에서 실행
}