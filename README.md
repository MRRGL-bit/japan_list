# 日本語学習 - 일본어 공부 사이트

일본어 단어 퀴즈, 플래시카드, 단어장으로 일본어를 공부할 수 있는 웹 사이트입니다.

## 기능

- **홈** – 학습 메뉴 소개 및 바로가기
- **단어 퀴즈** – 4지선다 / 주관식 퀴즈 (단어 개수 선택 가능)
- **플래시카드** – 카드를 탭해 뜻 확인, 이전/다음으로 넘기기
- **단어 목록** – 전체 단어 검색 및 보기
- **문의하기** – 메일 문의 폼 (Resend API 사용 시)

## 로컬 실행

```bash
# 의존성 설치 (문의 API 사용 시)
npm install

# 정적 사이트는 그냥 index.html을 브라우저로 열거나,
# 로컬 서버 예시 (선택)
npx serve .
```

브라우저에서 `index.html`을 열거나 `http://localhost:3000` (serve 사용 시)으로 접속하면 됩니다.

## GitHub에 올리기

1. GitHub에서 새 저장소 생성 (예: `japan-study`)
2. 프로젝트 폴더에서 터미널 실행 후:

```bash
git init
git add .
git commit -m "Initial commit: 일본어 공부 사이트"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/japan-study.git
git push -u origin main
```

`YOUR_USERNAME`과 `japan-study`를 본인 계정/저장소 이름으로 바꾸세요.

## Vercel로 배포하기

1. [Vercel](https://vercel.com)에 로그인
2. **Add New** → **Project** 선택
3. **Import Git Repository**에서 방금 올린 GitHub 저장소 선택
4. **Root Directory**: 그대로 (`.`)
5. **Build Command**: 비워두거나 `npm run build` (현재 `echo Done`)
6. **Output Directory**: 비워두기 (정적 사이트는 루트가 그대로 배포됨)
7. **Deploy** 클릭

배포가 끝나면 `https://프로젝트이름.vercel.app` 주소로 접속할 수 있습니다.

### 문의 메일 API (선택)

문의하기 기능을 쓰려면:

1. [Resend](https://resend.com)에서 API 키 발급
2. Vercel 프로젝트 **Settings** → **Environment Variables**에 `RESEND_API_KEY` 추가
3. `api/send-contact.js` 안의 수신 이메일 주소를 본인 주소로 수정

## 프로젝트 구조

```
├── index.html      # 메인 페이지 (홈, 퀴즈, 플래시카드, 단어 목록)
├── styles.css      # 스타일
├── app.js          # 라우팅, 퀴즈, 플래시카드, 단어 목록 로직
├── words.js        # 일본어 단어 데이터
├── api/
│   └── send-contact.js   # 문의 메일 전송 (Vercel Serverless)
├── vercel.json     # Vercel 설정 (API 라우트)
└── package.json
```

## 라이선스

MIT
