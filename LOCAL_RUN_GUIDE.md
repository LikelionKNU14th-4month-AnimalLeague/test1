# 로컬 실행 안내

이 문서는 누구든 이 프로젝트를 자신의 컴퓨터에서 실행할 수 있도록 정리한 안내서입니다.

## 1. 이 프로젝트가 무엇인지

이 프로젝트는 웹 브라우저에서 실행되는 페이지입니다.
로컬에서 실행하려면 `Node.js`와 `pnpm`이 필요합니다.
현재 프로젝트 기준 권장 `pnpm` 버전은 `10.28.2`입니다.

## 2. 먼저 준비할 것

아래 2가지를 먼저 설치해야 합니다.

1. `Node.js`
2. `pnpm`

## 3. Node.js 설치

1. 브라우저에서 `https://nodejs.org`에 접속합니다.
2. `LTS` 버전을 설치합니다.
3. 설치가 끝나면 터미널을 새로 엽니다.

### Mac에서 터미널 여는 방법

`Spotlight`에서 `Terminal`을 검색해서 실행하면 됩니다.

### Windows에서 터미널 여는 방법

`시작 메뉴`에서 `PowerShell` 또는 `Windows Terminal`을 실행하면 됩니다.

## 4. pnpm 설치

터미널에 아래 명령어를 입력합니다.

```bash
npm install -g pnpm
```

설치가 끝났는지 확인하려면 아래 명령어를 입력합니다.

```bash
pnpm -v
```

숫자 버전이 나오면 정상입니다.

예시:

```bash
10.28.2
```

## 5. VS Code에서 프로젝트 폴더 열고 내부 터미널 열기

이 단계부터는 일반 터미널이 아니라 `VS Code 내부 터미널`에서 진행합니다.

### 5-1. VS Code에서 프로젝트 폴더 열기

1. `VS Code`를 실행합니다.
2. 메뉴에서 `File` → `Open Folder...`를 누릅니다.
3. 이 프로젝트 폴더를 선택합니다.

예시 폴더:

```text
/Users/Desktop/Github/test1
```

중요:
본인 컴퓨터에서 프로젝트가 저장된 위치가 다르면 위 경로도 다를 수 있습니다.

### 5-2. VS Code에서 내부 터미널 여는 방법

#### macOS

아래 방법 중 하나를 사용하면 됩니다.

1. 상단 메뉴에서 `Terminal` → `New Terminal`
2. 단축키 `Control + Shift + `` ``

#### Windows

아래 방법 중 하나를 사용하면 됩니다.

1. 상단 메뉴에서 `Terminal` → `New Terminal`
2. 단축키 `Ctrl + Shift + `` ``

### 5-3. 폴더가 맞게 열렸는지 확인

보통 `VS Code 내부 터미널`은 현재 열어둔 프로젝트 폴더 위치에서 바로 시작됩니다.

필요하면 아래 명령어로 직접 해당 폴더로 이동할 수 있습니다.

```bash
cd /Users/Desktop/Github/test1
```

## 6. 필요한 파일 설치

프로젝트 폴더에 들어간 뒤 아래 명령어를 입력합니다.

```bash
pnpm install
```

이 과정은 처음 한 번은 시간이 조금 걸릴 수 있습니다.

## 7. 프로젝트 실행

아래 명령어를 입력합니다.

```bash
pnpm dev
```

정상 실행되면 터미널에 보통 아래와 비슷한 주소가 나옵니다.

```bash
http://localhost:3000
```

브라우저에서 그 주소를 열면 됩니다.

## 8. 실행 후 확인 방법

1. 브라우저에서 `http://localhost:3000` 열기
2. 화면이 보이면 정상 실행
3. 종료하려면 터미널에서 `Ctrl + C`

## 9. 다시 실행할 때

처음 설치 이후에는 아래 순서로 하면 됩니다.

1. `VS Code` 실행
2. `File` → `Open Folder...`로 이 프로젝트 폴더 열기
3. `Terminal` → `New Terminal`로 내부 터미널 열기
4. 아래 명령어 실행

```bash
pnpm dev
```

만약 내부 터미널이 다른 위치에서 열렸다면 먼저 아래 명령어로 프로젝트 폴더로 이동한 뒤 실행하면 됩니다.

```bash
cd /Users/Desktop/Github/test1
pnpm dev
```

## 10. 자주 있는 문제

### `pnpm: command not found`

의미:
`pnpm`이 설치되지 않았거나 터미널이 설치 내용을 아직 반영하지 못한 상태입니다.

해결:

```bash
npm install -g pnpm
```

그래도 안 되면 터미널을 완전히 종료했다가 다시 열어 보세요.

### `Cannot switch to pnpm@10: "10" is not a valid version`

의미:
배포 환경이나 실행 환경이 `pnpm` 버전을 `10`처럼 큰 버전 숫자만으로는 인식하지 못한 상태입니다.

해결:

- `package.json`의 `packageManager` 값이 정확한 버전인지 확인합니다.
- 현재 프로젝트 기준 값은 아래와 같습니다.

```json
"packageManager": "pnpm@10.28.2"
```

배포 서비스에서 계속 같은 오류가 나면 캐시를 지운 뒤 다시 배포해 보세요.

### `Ignored build scripts: sharp@0.34.5`

의미:
`pnpm 10`은 보안상 일부 패키지의 설치 스크립트를 자동으로 막을 수 있습니다.
이 프로젝트에서는 `sharp`가 그 대상이 될 수 있습니다.

현재 프로젝트 대응:

이 프로젝트에는 아래 설정이 이미 포함되어 있습니다.

```yaml
allowBuilds:
  sharp: true
```

위 설정은 `pnpm-workspace.yaml`에 들어 있으며, `sharp`의 빌드 스크립트를 허용합니다.

배포 환경에서 계속 같은 경고가 보이면 아래를 순서대로 확인하세요.

1. 최신 코드가 배포에 반영됐는지 확인
2. 배포 캐시 삭제 후 재배포
3. 배포 서비스가 정말 `pnpm`으로 설치 중인지 확인

### `node: command not found`

의미:
`Node.js`가 설치되지 않았습니다.

해결:
`https://nodejs.org`에서 `LTS` 버전을 설치하세요.

### `Port 3000 is in use`

의미:
이미 다른 프로그램이 `3000`번 포트를 사용 중입니다.

해결:
터미널에서 아래처럼 실행합니다.

```bash
pnpm dev -- --port 3001
```

그다음 브라우저에서 아래 주소를 엽니다.

```bash
http://localhost:3001
```

### 글꼴이나 화면이 이상하게 보이는 경우

의미:
인터넷 연결 상태나 브라우저 캐시 영향일 수 있습니다.

해결:
1. 브라우저 새로고침
2. 다른 브라우저로 열기
3. 인터넷 연결 확인

## 11. 가장 간단한 실행 순서 요약

아래 순서만 기억하면 됩니다.

```bash
cd /Users/Desktop/Github/test1
pnpm install
pnpm dev
```

그다음 브라우저에서 `http://localhost:3000`을 열면 됩니다.
