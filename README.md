# Ledger — Daily Task Card

색인 카드와 도서관 대출 스탬프에서 영감을 받은 Todo 앱입니다.
Next.js 14 (App Router) + TypeScript + Tailwind CSS로 만들었고, **Firebase Authentication으로 로그인**하고 **Firestore에 사용자별로 데이터를 저장**합니다.

## 1. Firebase 프로젝트 준비

1. https://console.firebase.google.com 접속 → "프로젝트 추가"로 새 프로젝트 생성
2. 왼쪽 메뉴 **Authentication → 시작하기 → Sign-in method** 에서
   - "이메일/비밀번호" 사용 설정
   - "Google" 사용 설정 (선택, 웹 SDK 구성용 지원 이메일 지정 필요)
3. 왼쪽 메뉴 **Firestore Database → 데이터베이스 만들기** (프로덕션 모드로 시작해도 무방, 아래에서 규칙을 직접 넣습니다)
4. **Firestore Database → 규칙(Rules)** 탭에 이 저장소의 `firestore.rules` 파일 내용을 그대로 붙여넣고 게시
5. 프로젝트 설정(⚙️) → "일반" 탭 → 하단 "내 앱"에서 웹 앱(</>) 추가 → 표시되는 `firebaseConfig` 값을 기록해두세요

## 2. 환경변수 설정

`.env.local.example` 파일을 복사해 `.env.local`로 만들고, 위에서 받은 Firebase 설정 값을 채웁니다.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

`.env.local`은 `.gitignore`에 포함되어 있어 GitHub에는 올라가지 않습니다.

## 3. 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속 → 회원가입 또는 Google 로그인 후 사용

## 4. GitHub에 올리기

`package.json`이 있는 이 폴더 안에서 실행하세요 (저장소 루트에 `package.json`이 오도록).

```bash
git init
git add .
git commit -m "Initial commit: ledger todo app with Firebase auth"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 5. Vercel 배포

1. https://vercel.com 에서 GitHub 저장소를 Import
2. **Settings → Environment Variables** 에 `.env.local`과 동일한 6개 키/값을 그대로 추가 (Production/Preview/Development 모두 체크)
3. Deploy

Google 로그인을 쓴다면 배포 후 나온 `https://<프로젝트명>.vercel.app` 도메인을
**Firebase Console → Authentication → Settings → 승인된 도메인**에 추가해야 정상 동작합니다.

## 폴더 구조

```
app/
  layout.tsx        루트 레이아웃, AuthProvider 적용
  page.tsx          로그인 상태에 따라 Login / TodoApp 분기
  globals.css        전역 스타일 (종이 질감, 스탬프 애니메이션)
components/
  Login.tsx          이메일/비밀번호 + Google 로그인 화면
  TodoApp.tsx         Firestore 연동 할 일 목록 UI
lib/
  firebase.ts         Firebase 앱/Auth/Firestore 초기화
  AuthContext.tsx      로그인 상태를 앱 전역에 제공하는 Context
firestore.rules        Firestore 보안 규칙 (Firebase 콘솔에 붙여넣기용)
```

## 데이터 구조

Firestore에 사용자별 서브컬렉션으로 저장됩니다.

```
users/{uid}/todos/{todoId}
  text: string
  done: boolean
  priority: "low" | "normal" | "high"
  createdAt: Timestamp
```

`firestore.rules`에 의해 본인(`request.auth.uid`)의 문서만 읽고 쓸 수 있습니다.

## 기능

- 이메일/비밀번호 회원가입·로그인, Google 로그인
- 할 일 추가 / 완료 토글 / 삭제 / 텍스트 수정(클릭) — Firestore 실시간 동기화
- 우선순위 태그(낮음·보통·긴급)
- 전체 / 진행중 / 완료 필터
- 완료 항목 일괄 삭제, 로그아웃
