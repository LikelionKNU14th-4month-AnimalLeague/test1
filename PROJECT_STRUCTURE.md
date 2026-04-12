# 시험기간 도파민 테스트 - 프로젝트 구성 문서

## 1. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 15.x |
| 언어 | TypeScript | 5.x |
| UI 라이브러리 | React | 19.x |
| 스타일링 | Tailwind CSS | 4.x |
| 패키지 매니저 | pnpm | 10.28.2 |

---

## 2. 현재 프로젝트 구조

```text
/Users/shpark/Desktop/Github/test1
├── app/
│   ├── globals.css          # 전체 화면 스타일
│   ├── layout.tsx           # 루트 레이아웃, 메타데이터, 폰트 링크
│   └── page.tsx             # 메인 페이지, 상태 관리, 화면 전환, 데이터 포함
│
├── LOCAL_RUN_GUIDE.md       # 비개발자용 로컬 실행 안내
├── PROJECT_STRUCTURE.md     # 현재 프로젝트 구조 설명 문서
├── next-env.d.ts            # Next.js 타입 참조 파일
├── next.config.ts           # Next.js 설정 파일
├── package.json             # 프로젝트 메타 정보 및 의존성
├── pnpm-lock.yaml           # pnpm 잠금 파일
├── postcss.config.mjs       # PostCSS / Tailwind 설정
├── test1.html               # 원본 단일 HTML 파일(참조용)
└── tsconfig.json            # TypeScript 설정
```

---

## 3. 구조 특징

이 프로젝트는 현재 `단일 페이지 중심 구조`입니다.

- 화면 렌더링, 데이터, 상태 전이 로직이 대부분 `app/page.tsx`에 모여 있습니다.
- 별도의 `components/`, `lib/`, `public/` 폴더는 아직 없습니다.
- 기존 정적 HTML 파일인 `test1.html`을 기준으로 Next.js 구조로 이식한 상태입니다.
- UI와 CSS 표현을 유지하는 것이 우선이라, 스타일도 `app/globals.css`에 집중되어 있습니다.

즉, 지금 단계의 프로젝트는 컴포넌트 분리형 구조보다 `이식 우선형 구조`에 가깝습니다.

---

## 4. 주요 파일 설명

### 4.1 `app/page.tsx`

이 프로젝트의 핵심 파일입니다.

역할:

- 전체 테스트 화면 렌더링
- 질문 데이터 및 결과 데이터 관리
- 화면 전환 제어
- 로컬스토리지 저장/불러오기
- 타이머 및 로딩 상태 처리
- 결과 랭킹 계산 및 공유 문구 복사

현재 이 파일 안에는 아래 내용이 함께 들어 있습니다.

- 타입 정의
- 질문 데이터
- 결과 데이터
- 로딩 메시지
- 유틸리티 함수
- `Header`, `Footer` 보조 컴포넌트
- 메인 화면 컴포넌트

화면 상태는 아래 흐름으로 동작합니다.

```text
intro
→ category
→ studySpecial (공부 카테고리 선택 시만)
→ question
→ loading
→ question
→ loading
→ result
```

공부 카테고리에서 특수 문항에 따라 아래 흐름도 가능합니다.

```text
studySpecial
→ warning
→ intro
```

### 4.2 `app/layout.tsx`

앱 전체 공통 레이아웃을 담당합니다.

역할:

- `<html lang="ko">` 설정
- 메타데이터 설정
- 전역 CSS 연결
- Google Fonts의 `Nanum Gothic` 링크 삽입

현재는 매우 단순한 루트 레이아웃만 두고 있습니다.

### 4.3 `app/globals.css`

원본 `test1.html`의 인라인 CSS를 옮긴 전역 스타일 파일입니다.

역할:

- 시험지 레이아웃 스타일
- 버튼, 입력창, 결과 화면 스타일
- 로딩 화면, 경고 화면 스타일
- 카테고리 및 질문 화면 스타일

현재 스타일은 컴포넌트 단위 모듈 CSS가 아니라 전역 클래스 기반입니다.

### 4.4 `test1.html`

이 프로젝트의 원본 정적 HTML 파일입니다.

역할:

- 초기 UI/마크업/스타일/스크립트의 기준본
- Next.js 이식 전 원본 참조 파일

현재 앱 실행은 이 파일이 아니라 `app/page.tsx` 기준으로 동작합니다.

### 4.5 `package.json`

프로젝트 실행과 의존성 관리의 기준 파일입니다.

포함 내용:

- `next`, `react`, `react-dom`
- `typescript`
- `tailwindcss`, `@tailwindcss/postcss`
- `packageManager: pnpm@10.28.2`
- 실행 스크립트

주요 스크립트:

```json
"dev": "next dev",
"build": "next build",
"start": "next start"
```

### 4.6 `postcss.config.mjs`

Tailwind CSS 4 사용을 위한 PostCSS 설정 파일입니다.

현재는 최소 설정만 포함합니다.

### 4.7 `tsconfig.json`

TypeScript 컴파일 옵션을 담당합니다.

역할:

- Next.js 권장 설정 반영
- `.ts`, `.tsx` 파일 타입 검사
- 번들러 기반 모듈 해석 설정

### 4.8 `LOCAL_RUN_GUIDE.md`

비개발자도 실행할 수 있도록 정리한 안내 문서입니다.

포함 내용:

- Node.js 설치
- pnpm 설치
- VS Code에서 폴더 열기
- VS Code 내부 터미널 실행 방법
- `pnpm install`, `pnpm dev` 실행 절차
- 자주 발생하는 오류 대응

---

## 5. 현재 렌더링 구조

현재 렌더링은 `app/page.tsx` 내부 조건부 렌더링으로 처리됩니다.

화면 단위:

1. `intro`
2. `category`
3. `studySpecial`
4. `question`
5. `loading`
6. `warning`
7. `result`

즉, 화면별 컴포넌트를 파일로 나누지 않고 하나의 페이지 파일에서 분기하는 구조입니다.

---

## 6. 데이터 구조

현재 데이터는 별도 파일로 분리되어 있지 않고 `app/page.tsx` 안에 직접 선언되어 있습니다.

주요 데이터:

- `LOADING_MESSAGES`
- `QUESTIONS`
- `RESULTS`
- `WAYPOINTS`

설명:

- `LOADING_MESSAGES`: 로딩 화면 문구 배열
- `QUESTIONS`: 카테고리별 질문/선택지/결과 타입 정보
- `RESULTS`: 카테고리별 최종 결과 정보
- `WAYPOINTS`: 로딩 퍼센트 애니메이션 계산용 기준값

---

## 7. 상태 관리 방식

별도 상태 관리 라이브러리는 사용하지 않고 React 기본 훅으로 처리합니다.

주요 상태:

- `school`
- `nickname`
- `category`
- `questions`
- `qIndex`
- `answers`
- `elapsed`
- `startTime`
- `midLoadingDone`
- `screen`
- `warningCountdown`
- `loadingPct`
- `loadingMsg`
- `loadingFinal`
- `ranking`
- `copyMsg`
- `answerLocked`

보조 `ref`:

- `currentEntryTsRef`
- `resultSavedRef`

---

## 8. 브라우저 저장소 사용

현재 프로젝트는 서버나 DB 없이 브라우저 `localStorage`를 사용합니다.

사용 키:

- `animal_user`
- `animal_rankings`

역할:

- `animal_user`: 학교명, 닉네임 저장
- `animal_rankings`: 이 기기 기준 결과 랭킹 저장

즉, 데이터는 기기 단위로만 유지되며 다른 기기와 동기화되지는 않습니다.

---

## 9. 실행 기준 파일

실행에 직접 관여하는 핵심 파일은 아래와 같습니다.

```text
app/page.tsx
app/layout.tsx
app/globals.css
package.json
postcss.config.mjs
tsconfig.json
next.config.ts
```

참조용 파일:

```text
test1.html
LOCAL_RUN_GUIDE.md
PROJECT_STRUCTURE.md
```

---

## 10. 현재 구조의 장단점

### 장점

- 파일 수가 적어서 전체 흐름을 한 번에 보기 쉽습니다.
- 원본 HTML을 빠르게 Next.js로 옮기기에 적합합니다.
- UI와 동작을 원본과 가깝게 유지하기 쉽습니다.

### 단점

- `app/page.tsx`에 역할이 많이 몰려 있습니다.
- 질문 데이터, 결과 데이터, 화면 렌더링이 한 파일에 섞여 있습니다.
- 기능이 더 늘어나면 유지보수가 어려워질 수 있습니다.

---

## 11. 향후 분리 가능 영역

현재는 꼭 필요한 상태만 유지한 구조이지만, 추후 아래처럼 분리할 수 있습니다.

- `components/`
  화면 단위 UI 분리
- `lib/questions.ts`
  질문/결과 데이터 분리
- `lib/storage.ts`
  localStorage 처리 분리
- `lib/utils.ts`
  시간 포맷, 퍼센트 계산 함수 분리

다만 현재 프로젝트는 `UI와 CSS를 바꾸지 않고 이식하는 것`이 우선이므로, 아직은 단순 구조가 더 실용적입니다.
