# 시험기간 도파민 테스트 - 프로젝트 구성 문서

## 1. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 15.x |
| 언어 | TypeScript | 5.x |
| UI 라이브러리 | React | 19.x |
| 스타일링 | Tailwind CSS | 4.x |
| 패키지 매니저 | pnpm | 10.28.2 |
| 데이터베이스 | Supabase | @supabase/supabase-js 2.x |

---

## 2. 현재 프로젝트 구조

```text
test1/
├── app/
│   ├── globals.css          # 전체 화면 스타일
│   ├── layout.tsx           # 루트 레이아웃, 메타데이터, 폰트 링크
│   └── page.tsx             # 메인 페이지, 상태 관리, 화면 전환, 데이터 포함
│
├── lib/
│   └── supabase.ts          # Supabase 클라이언트 및 DB 타입 정의
│
├── .env.local               # 환경 변수 (Git 미포함, 팀원 각자 생성 필요)
├── .gitignore               # Git 제외 파일 목록
├── LOCAL_RUN_GUIDE.md       # 비개발자용 로컬 실행 안내
├── PROJECT_STRUCTURE.md     # 현재 프로젝트 구조 설명 문서
├── next-env.d.ts            # Next.js 타입 참조 파일
├── next.config.ts           # Next.js 설정 파일
├── package.json             # 프로젝트 메타 정보 및 의존성
├── pnpm-lock.yaml           # pnpm 잠금 파일
├── pnpm-workspace.yaml      # pnpm 설정, 빌드 스크립트 허용 패키지 관리
├── postcss.config.mjs       # PostCSS / Tailwind 설정
├── test1.html               # 원본 단일 HTML 파일(참조용)
└── tsconfig.json            # TypeScript 설정
```

---

## 3. 구조 특징

이 프로젝트는 현재 `단일 페이지 중심 구조`입니다.

- 화면 렌더링, 데이터, 상태 전이 로직이 대부분 `app/page.tsx`에 모여 있습니다.
- Supabase 연동 코드는 `lib/supabase.ts`로 분리되어 있습니다.
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
- 로컬스토리지에서 학교명/닉네임 저장 및 불러오기
- 타이머 및 로딩 상태 처리
- 대학교 자동완성 (UNIVERSITIES 목록 기반)
- Supabase를 통한 전체/학교별 랭킹 조회 및 저장
- 결과 공유 문구 복사

현재 이 파일 안에는 아래 내용이 함께 들어 있습니다.

- 타입 정의
- 질문 데이터
- 결과 데이터
- 로딩 메시지
- 대학교 목록 (`UNIVERSITIES`)
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
→ category
```

### 4.2 `lib/supabase.ts`

Supabase 연동을 담당하는 파일입니다.

역할:

- Supabase 클라이언트 초기화 (`createClient`)
- 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`)에서 인증 정보 로드
- DB 행 타입 `DbRankingEntry` 정의

포함 타입:

```ts
type DbRankingEntry = {
  id: string;
  nickname: string;
  school: string;
  category: string;
  result_type: string;
  elapsed: number;
  minutes: number;
  created_at: string;
};
```

### 4.3 `.env.local`

Supabase 인증 정보를 담는 환경 변수 파일입니다.

- `.gitignore`에 등록되어 있어 GitHub에 올라가지 않습니다.
- 팀원 각자가 직접 생성해야 합니다.
- 생성 방법은 `LOCAL_RUN_GUIDE.md` 6번 항목을 참고하세요.

포함 내용:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_KEY=...
```

주의:

- 실제 값은 GitHub에 올리지 않고 각 팀원이 직접 설정합니다.
- 여기에는 공개용 키만 들어가야 하며 `service_role` 키는 사용하지 않습니다.

### 4.4 `app/layout.tsx`

앱 전체 공통 레이아웃을 담당합니다.

역할:

- `<html lang="ko">` 설정
- 메타데이터 설정
- 전역 CSS 연결
- Google Fonts의 `Nanum Gothic` 링크 삽입

현재는 매우 단순한 루트 레이아웃만 두고 있습니다.

### 4.5 `app/globals.css`

원본 `test1.html`의 인라인 CSS를 옮긴 전역 스타일 파일입니다.

역할:

- 시험지 레이아웃 스타일
- 버튼, 입력창, 결과 화면 스타일
- 로딩 화면, 경고 화면 스타일
- 카테고리 및 질문 화면 스타일
- 학교 자동완성 드롭다운 스타일 (`.school-suggestions`)
- 랭킹 2열 레이아웃 스타일 (`.ranking-cols`, `.ranking-col`)

현재 스타일은 컴포넌트 단위 모듈 CSS가 아니라 전역 클래스 기반입니다.

### 4.6 `test1.html`

이 프로젝트의 원본 정적 HTML 파일입니다.

역할:

- 초기 UI/마크업/스타일/스크립트의 기준본
- Next.js 이식 전 원본 참조 파일

현재 앱 실행은 이 파일이 아니라 `app/page.tsx` 기준으로 동작합니다.

### 4.7 `package.json`

프로젝트 실행과 의존성 관리의 기준 파일입니다.

포함 내용:

- `next`, `react`, `react-dom`
- `typescript`
- `tailwindcss`, `@tailwindcss/postcss`
- `@supabase/supabase-js`
- `packageManager: pnpm@10.28.2`
- 실행 스크립트

주요 스크립트:

```json
"dev": "next dev",
"build": "next build",
"start": "next start"
```

### 4.8 `postcss.config.mjs`

Tailwind CSS 4 사용을 위한 PostCSS 설정 파일입니다.

현재는 최소 설정만 포함합니다.

### 4.9 `pnpm-workspace.yaml`

pnpm 관련 프로젝트 설정 파일입니다.

역할:

- 워크스페이스 루트 지정
- 배포/설치 시 실행이 필요한 의존성 빌드 스크립트 허용

현재 설정:

```yaml
packages:
  - .

allowBuilds:
  sharp: true
```

이 설정은 pnpm 10 계열에서 `sharp`의 설치 스크립트가 차단되어 배포 경고가 발생하는 상황을 줄이기 위한 목적입니다.

### 4.10 `tsconfig.json`

TypeScript 컴파일 옵션을 담당합니다.

역할:

- Next.js 권장 설정 반영
- `.ts`, `.tsx` 파일 타입 검사
- 번들러 기반 모듈 해석 설정

### 4.11 `LOCAL_RUN_GUIDE.md`

비개발자도 실행할 수 있도록 정리한 안내 문서입니다.

포함 내용:

- Node.js 설치
- pnpm 설치
- VS Code에서 폴더 열기
- VS Code 내부 터미널 실행 방법
- `.env.local` 환경 변수 파일 설정 방법 (Supabase 키 포함)
- `pnpm install`, `pnpm dev` 실행 절차
- 자주 발생하는 오류 대응

---

## 5. 현재 렌더링 구조

현재 렌더링은 `app/page.tsx` 내부 조건부 렌더링으로 처리됩니다.

화면 단위:

1. `intro` — 학교명 / 닉네임 입력
2. `category` — 카테고리 선택 (연애 / 공부 / 생활)
3. `studySpecial` — 공부 카테고리 사전 확인 문항
4. `question` — 질문 화면
5. `loading` — 중간 / 최종 로딩 화면
6. `warning` — 공부하러가세요 경고 화면
7. `result` — 최종 결과 및 랭킹 화면

즉, 화면별 컴포넌트를 파일로 나누지 않고 하나의 페이지 파일에서 분기하는 구조입니다.

---

## 6. 데이터 구조

현재 데이터는 별도 파일로 분리되어 있지 않고 `app/page.tsx` 안에 직접 선언되어 있습니다.

주요 데이터:

- `LOADING_MESSAGES`
- `QUESTIONS`
- `RESULTS`
- `WAYPOINTS`
- `UNIVERSITIES`

설명:

- `LOADING_MESSAGES`: 로딩 화면 문구 배열
- `QUESTIONS`: 카테고리별 질문/선택지/결과 타입 정보
- `RESULTS`: 카테고리별 최종 결과 정보
- `WAYPOINTS`: 로딩 퍼센트 애니메이션 계산용 기준값
- `UNIVERSITIES`: 학교 자동완성에 사용되는 국내 대학교 목록 (캠퍼스 구분 포함)

---

## 7. 상태 관리 방식

별도 상태 관리 라이브러리는 사용하지 않고 React 기본 훅으로 처리합니다.

주요 상태:

- `school` — 입력된 학교명
- `showSchoolSuggestions` — 학교 자동완성 드롭다운 표시 여부
- `schoolError` — 유효하지 않은 학교명 입력 오류 표시 여부
- `nickname` — 입력된 닉네임
- `category` — 선택된 카테고리
- `questions` — 현재 카테고리의 질문 배열
- `qIndex` — 현재 질문 인덱스
- `answers` — 누적 답변 배열
- `elapsed` — 경과 시간(초)
- `startTime` — 타이머 시작 기준 시각
- `midLoadingDone` — 중간 로딩 완료 여부
- `screen` — 현재 화면 상태
- `warningCountdown` — 경고 화면 카운트다운
- `loadingPct` — 로딩 퍼센트
- `loadingMsg` — 로딩 화면 메시지
- `loadingFinal` — 최종 로딩 여부
- `globalRanking` — 전체 랭킹 데이터 (Supabase)
- `schoolRanking` — 학교별 랭킹 데이터 (Supabase)
- `copyMsg` — 공유 문구 복사 완료 메시지
- `answerLocked` — 답변 중복 클릭 방지

보조 `ref`:

- `currentEntryIdRef` — 현재 사용자의 Supabase 행 id (랭킹 강조 표시용)
- `resultSavedRef` — 결과 중복 저장 방지 플래그

---

## 8. 데이터 저장 방식

### 브라우저 localStorage

사용 키:

- `animal_user`: 학교명, 닉네임 저장 (다음 방문 시 자동 입력용)

### Supabase (외부 DB)

- 결과 화면 진입 시 테스트 기록을 Supabase `rankings` 테이블에 저장합니다.
- 저장 후 전체 랭킹 TOP 5, 해당 학교 랭킹 TOP 5를 불러와 화면에 표시합니다.
- 다른 사용자의 기록도 실시간으로 확인 가능합니다.

저장 컬럼:

| 컬럼 | 설명 |
|------|------|
| `id` | 행 고유 ID |
| `nickname` | 사용자 닉네임 |
| `school` | 학교명 |
| `category` | 카테고리 (연애 / 공부 / 생활) |
| `result_type` | 결과 코드 (예: LOVE-ADDICT) |
| `elapsed` | 경과 시간 (초) |
| `minutes` | 경과 시간 (분, 올림) |
| `created_at` | 기록 생성 시각 |

---

## 9. 실행 기준 파일

실행에 직접 관여하는 핵심 파일은 아래와 같습니다.

```text
app/page.tsx
app/layout.tsx
app/globals.css
lib/supabase.ts
.env.local
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
- Supabase를 통해 사용자 간 랭킹 공유가 가능합니다.

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
- `lib/universities.ts`
  대학교 목록 분리
- `lib/utils.ts`
  시간 포맷, 퍼센트 계산 함수 분리

다만 현재 프로젝트는 `UI와 CSS를 바꾸지 않고 이식하는 것`이 우선이므로, 아직은 단순 구조가 더 실용적입니다.
