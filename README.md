# 🏎️ Max Verstappen Fan Page | MV3

이안(Ian)을 위한 막스 베르스타펜 팬 페이지입니다.

## 🚀 배포 방법

### 방법 1: Vercel (가장 쉬움, 추천!)

1. **GitHub 계정 만들기**: https://github.com 에서 가입
2. **새 저장소 만들기**: "New repository" → 이름: `max-verstappen-fan` → Create
3. **파일 업로드**: 저장소 페이지에서 "uploading an existing file" 클릭 → 이 폴더의 모든 파일을 드래그 앤 드롭 → "Commit changes"
4. **Vercel 연결**: https://vercel.com 접속 → "Sign Up" → GitHub으로 로그인
5. **배포**: "Add New Project" → GitHub 저장소 선택 → "Deploy" 클릭
6. **완료!** `https://max-verstappen-fan.vercel.app` 같은 주소가 생성됩니다

### 방법 2: Netlify (드래그 앤 드롭)

1. 로컬에서 `npm install && npm run build` 실행
2. https://app.netlify.com 접속 → 가입
3. `dist` 폴더를 Netlify 대시보드에 드래그 앤 드롭
4. 즉시 배포 완료!

### 방법 3: 로컬에서 미리보기

```bash
npm install
npm run dev
```
브라우저에서 http://localhost:5173 접속

## 📁 프로젝트 구조

```
max-fan-site/
├── index.html          # HTML 진입점
├── package.json        # 프로젝트 설정
├── vite.config.js      # Vite 빌드 설정
├── public/
│   └── vite.svg        # 파비콘
└── src/
    ├── main.jsx        # React 진입점
    └── App.jsx         # 메인 앱 (전체 팬페이지)
```

## ✨ 기능

- 🏎️ Red Bull Racing 로고 & Max 프로필
- 🔍 Google 검색 + ⚡ 특별한 검색 (Easter Egg!)
- 📊 2026 시즌 레이스 결과 & 드라이버 순위
- 📅 커리어 타임라인 (2015~2026)
- 🧠 Max 퀴즈 (10문제 중 5문제 랜덤)
- 💬 응원 메시지 게시판

Made with 💙 by Super Fan 이안 (Ian)
