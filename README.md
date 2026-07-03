# Ledger — Daily Task Card

색인 카드와 도서관 대출 스탬프에서 영감을 받은 미니멀 Todo 앱입니다.
Next.js 14 (App Router) + TypeScript + Tailwind CSS로 만들었고, 데이터는 브라우저의 `localStorage`에 저장됩니다 (별도 백엔드 없음).

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## GitHub에 올리기

```bash
git init
git add .
git commit -m "Initial commit: ledger todo app"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Vercel 배포

1. https://vercel.com 에 GitHub 계정으로 로그인
2. "Add New… → Project" 선택 후 방금 push한 GitHub 저장소를 Import
3. Framework Preset은 자동으로 "Next.js"로 감지됩니다. 별도 환경변수 필요 없음
4. "Deploy" 클릭 → 몇 분 뒤 `https://<프로젝트명>.vercel.app` 주소로 접속 가능

이후 `main` 브랜치에 push할 때마다 Vercel이 자동으로 재배포합니다.

## 폴더 구조

```
app/
  layout.tsx      루트 레이아웃, 폰트 로딩
  page.tsx        홈 페이지
  globals.css     전역 스타일 (종이 질감, 스탬프 애니메이션)
components/
  TodoApp.tsx      할 일 목록 핵심 로직/UI
```

## 기능

- 할 일 추가 / 완료 토글 / 삭제 / 텍스트 수정(클릭)
- 우선순위 태그(낮음·보통·긴급)
- 전체 / 진행중 / 완료 필터
- 완료 항목 일괄 삭제
- localStorage 자동 저장 (새로고침해도 유지)
