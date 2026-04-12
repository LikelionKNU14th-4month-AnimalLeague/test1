"use client";

import { useEffect, useRef, useState } from "react";

type Category = "love" | "study" | "life";
type ResultType = "A" | "B";
type SpecialType = "continue" | "exit";
type Screen = "intro" | "category" | "studySpecial" | "question" | "loading" | "warning" | "result";

type Question<T extends string = ResultType | SpecialType> = {
  text: string;
  choices: [string, string];
  types: [T, T];
};

type ResultEntry = {
  code: string;
  name: string;
  desc: string;
};

type RankingEntry = {
  school: string;
  nickname: string;
  category: string;
  code: string;
  seconds: number;
  minutes: number;
  ts: number;
};

const LOADING_MESSAGES = [
  "진짜 공부할 생각 있으신가요?",
  "지금 이 테스트 왜 하고 계신가요?",
  "혹시... 공부하기 싫어서 들어오신 거죠?",
  "이거만 보고 한다 맞죠?",
  "유튜브 끄실 수 있으세요?",
  "지금 시간 확인해보셨나요?",
  "방금 전에도 딴짓하셨죠?",
  "이거 끝나고 공부하실 건가요?",
  "결과보다 과정이 더 재밌으신가요?",
  "지금 나가셔도 늦지 않았습니다... 나가실래요?",
  "로딩바가 80%까지 갔다가 마음을 바꿨습니다.",
  "곧 끝납니다. 이 말은 세 번째 쓰는 중입니다.",
] as const;

const QUESTIONS: Record<Exclude<Category, "study">, Question[]> & {
  study: {
    special: Question<SpecialType>;
    regular: Question[];
  };
} = {
  love: [
    { text: "시험 기간에 연인(또는 좋아하는 사람)의 연락을 무시할 수 있나요?", choices: ["충분히 가능하다", "절대 불가능하다"], types: ["A", "B"] },
    { text: "오늘 상대방 SNS를 확인했나요?", choices: ["안 했다", "이미 3번 이상 확인했다"], types: ["A", "B"] },
    { text: "시험 공부 중 연락이 오면?", choices: ["나중에 확인한다", "즉시 확인한다"], types: ["A", "B"] },
    { text: "시험 전날 밤에 새벽까지 연락한 적 있나요?", choices: ["없다, 일찍 잔다", "있다, 거의 매번"], types: ["A", "B"] },
    { text: "상대방 생각에 공부가 안 된 적 있나요?", choices: ["없다", "오늘도 있다"], types: ["A", "B"] },
    { text: "성적 vs 관계, 지금 당신에게 더 중요한 건?", choices: ["지금은 성적", "당연히 관계"], types: ["A", "B"] },
    { text: "연인 / 좋아하는 사람 생각이 하루에 몇 번이나 나나요?", choices: ["10번 이하", "셀 수도 없다"], types: ["A", "B"] },
    { text: "시험 끝나고 제일 먼저 할 일은?", choices: ["쉬거나 잠 자기", "바로 연락하기"], types: ["A", "B"] },
    { text: "교실에서 상대방 프로필 사진을 멍하니 바라본 적 있나요?", choices: ["없다", "있다, 자주"], types: ["A", "B"] },
    { text: "지금 이 순간 상대방 생각이 나나요?", choices: ["별로 안 난다", "...지금 생각나고 있다"], types: ["A", "B"] },
  ],
  study: {
    special: { text: "지금 공부하고 있나요?", choices: ["하고 있다", "안 하고 있다"], types: ["continue", "exit"] },
    regular: [
      { text: "오늘 공부 계획을 세웠나요?", choices: ["세웠고, 지키고 있다", "세웠지만 이미 포기했다"], types: ["A", "B"] },
      { text: "지금 어디서 공부하고 있나요?", choices: ["독서실 또는 카페", "침대 위"], types: ["A", "B"] },
      { text: "오늘 집중한 시간이 총 몇 시간인가요?", choices: ["4시간 이상", "2시간 이하"], types: ["A", "B"] },
      { text: "시험 범위를 전부 파악하고 있나요?", choices: ["파악하고 있다", "아직 잘 모른다"], types: ["A", "B"] },
      { text: "오늘 유튜브나 릴스를 얼마나 봤나요?", choices: ["거의 안 봤다", "3시간 이상"], types: ["A", "B"] },
      { text: "이 테스트 이전에 마지막으로 한 행동은?", choices: ["공부", "유튜브 / SNS / 게임"], types: ["A", "B"] },
      { text: "지금 공부가 하고 싶은가요?", choices: ["재미없지만 하고 있다", "재미없어서 이걸 하고 있다"], types: ["A", "B"] },
      { text: "이 테스트 끝나면 바로 공부할 수 있나요?", choices: ["할 수 있다", "아마 다른 걸 볼 것 같다"], types: ["A", "B"] },
      { text: "벼락치기로 시험을 본 적 있나요?", choices: ["없다 또는 거의 없다", "매번 그렇게 한다"], types: ["A", "B"] },
      { text: "오늘 자신에게 솔직히 점수를 매기면?", choices: ["7점 이상", "5점 이하"], types: ["A", "B"] },
    ],
  },
  life: [
    { text: "오늘 기상 시간은?", choices: ["7시 이전", "10시 이후"], types: ["A", "B"] },
    { text: "오늘 밥은 제대로 챙겨 먹었나요?", choices: ["3끼 다 먹었다", "하나 이상 굶었다"], types: ["A", "B"] },
    { text: "시험 기간에 운동을 한 적 있나요?", choices: ["있다", "시험 끝나면 할 거다"], types: ["A", "B"] },
    { text: "현재 방 / 책상 상태는?", choices: ["나름 깔끔하다", "재앙 수준이다"], types: ["A", "B"] },
    { text: "하루 핸드폰 사용 시간은?", choices: ["3시간 이하", "6시간 이상"], types: ["A", "B"] },
    { text: "시험 전날 몇 시에 자나요?", choices: ["12시 이전", "새벽 2시 이후"], types: ["A", "B"] },
    { text: "시험 기간 배달음식을 자주 시키나요?", choices: ["거의 안 시킨다", "매일 시킨다"], types: ["A", "B"] },
    { text: "공부 중 의도치 않게 잠든 적 있나요?", choices: ["없다", "오늘도 잠들었다"], types: ["A", "B"] },
    { text: "지금 이 테스트 말고 해야 할 일이 있나요?", choices: ["없다, 다 했다", "있다, 엄청 많다"], types: ["A", "B"] },
    { text: "시험 기간 나의 생활 패턴을 스스로 평가하면?", choices: ["나름 잘 유지하고 있다", "완전히 무너졌다"], types: ["A", "B"] },
  ],
};

const RESULTS: Record<Category, Record<ResultType, ResultEntry>> = {
  love: {
    A: {
      code: "LOVE-REALIST",
      name: "현실을 아는 냉철한 연인형",
      desc: "시험 기간만큼은 공부가 먼저라는 걸 아는 당신. 연락이 와도 참을 수 있고, 감정보다 성적을 선택합니다. 속으로는 보고 싶겠지만... 그게 진짜 성숙한 사랑 아닐까요? 시험 끝나고 실컷 연애하세요.",
    },
    B: {
      code: "LOVE-ADDICT",
      name: "사랑에 빠진 도파민 중독형",
      desc: "시험 기간에도 연애가 최우선. 메시지 하나에 집중력이 무너지고, 상대방 생각에 문제도 안 읽힙니다. 공부보다 감정이 먼저인 당신, 뺏긴 시험시간만큼 성적이 아프겠지만... 그래도 사랑이 예쁘긴 하네요.",
    },
  },
  study: {
    A: {
      code: "EXAM-WARRIOR",
      name: "의외로 열심히 하는 공부형",
      desc: "테스트도 했는데 공부도 하고 있다고요? 대단합니다. 계획도 세우고, 범위도 파악하고, 집중 시간도 길고. 이 테스트 하는 동안 뺏긴 시간이 아깝지만, 당신은 잘 하고 있어요. 파이팅.",
    },
    B: {
      code: "DOPAMINE-LOOP",
      name: "시험기간 도파민 루프형",
      desc: "공부해야 한다는 걸 알면서도 계속 딴짓. 유튜브, 테스트, SNS... 무한 루프 중입니다. 이 결과 보고 진짜 공부 시작하세요. 지금 당장. 이 결과 캡처하는 시간도 사실 낭비입니다.",
    },
  },
  life: {
    A: {
      code: "LIFE-MANAGER",
      name: "루틴 지키는 생활 관리형",
      desc: "시험 기간에도 규칙적인 생활을 유지하는 당신. 밥도 챙겨 먹고, 일찍 자고, 방도 깔끔하고. 이런 분이 결국 성적도 잘 나오더라고요. 계속 이 페이스 유지하세요. 진짜 대단합니다.",
    },
    B: {
      code: "LIFE-CHAOS",
      name: "시험기간 생활 붕괴형",
      desc: "수면도, 식사도, 운동도 전부 포기. 시험 기간에 인간의 기본을 잊어버린 당신. 몸이 망가지면 공부도 안 됩니다. 일단 밥부터 드세요. 그다음 물 한 잔. 시험보다 건강이 먼저입니다.",
    },
  },
};

const WAYPOINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [900, 38],
  [1700, 73],
  [2300, 82],
  [2700, 24],
  [3500, 59],
  [4100, 91],
  [4600, 34],
  [5400, 67],
  [6200, 88],
  [7000, 95],
  [8000, 100],
];

function fmt(sec: number) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function toMinutes(sec: number) {
  return Math.max(1, Math.ceil(sec / 60));
}

function catLabel(category: Category) {
  return { love: "연애", study: "공부", life: "생활" }[category];
}

function interpPct(elapsed: number) {
  for (let i = 0; i < WAYPOINTS.length - 1; i += 1) {
    const [t0, p0] = WAYPOINTS[i];
    const [t1, p1] = WAYPOINTS[i + 1];
    if (elapsed >= t0 && elapsed <= t1) {
      const ratio = (elapsed - t0) / (t1 - t0);
      return Math.round(p0 + (p1 - p0) * ratio);
    }
  }
  return 100;
}

function Header({ num, subjectHtml }: { num: number; subjectHtml: string }) {
  return (
    <>
      <div className="paper-top-bar">
        <span className="paper-meta">2025학년도 시험기간 도파민테스트 문제지</span>
        <span className="paper-big-num">{num}</span>
      </div>
      <hr className="div1" />
      <div className="paper-subject-row">
        <span className="paper-subject" dangerouslySetInnerHTML={{ __html: subjectHtml }} />
        <span className="paper-badge">홀수형</span>
      </div>
      <hr className="div2" />
    </>
  );
}

function Footer({ cur, total = 16 }: { cur: number; total?: number }) {
  return (
    <div className="paper-footer">
      <span>* 이 문제지에 관한 저작권은 시험기간도파민테스트에 있습니다.</span>
      <span>{cur} / {total}</span>
    </div>
  );
}

export default function Home() {
  const [school, setSchool] = useState("");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<ResultType[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [midLoadingDone, setMidLoadingDone] = useState(false);
  const [screen, setScreen] = useState<Screen>("intro");
  const [warningCountdown, setWarningCountdown] = useState(5);
  const [loadingPct, setLoadingPct] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [loadingFinal, setLoadingFinal] = useState(false);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [copyMsg, setCopyMsg] = useState("");
  const [answerLocked, setAnswerLocked] = useState(false);
  const currentEntryTsRef = useRef<number | null>(null);
  const resultSavedRef = useRef(false);

  useEffect(() => {
    const saved = JSON.parse(window.localStorage.getItem("animal_user") || "{}") as Partial<{
      school: string;
      nickname: string;
    }>;
    setSchool(saved.school || "");
    setNickname(saved.nickname || "");
  }, []);

  useEffect(() => {
    if (screen !== "question" && screen !== "studySpecial") {
      return;
    }
    if (startTime === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, startTime]);

  useEffect(() => {
    if (screen !== "warning") {
      return;
    }
    if (warningCountdown <= 0) {
      resetHome();
      return;
    }

    const timer = window.setInterval(() => {
      setWarningCountdown((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, warningCountdown]);

  useEffect(() => {
    if (screen !== "loading") {
      return;
    }

    setLoadingPct(0);
    setLoadingMsg(LOADING_MESSAGES[0]);

    const total = 8000;
    let elapsedMs = 0;
    let msgIdx = 0;

    const timer = window.setInterval(() => {
      elapsedMs += 100;
      const pct = interpPct(elapsedMs);
      setLoadingPct(pct);

      if (elapsedMs % 1800 === 0) {
        msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
        setLoadingMsg(LOADING_MESSAGES[msgIdx]);
      }

      if (elapsedMs >= total) {
        window.clearInterval(timer);
        setLoadingPct(100);
        window.setTimeout(() => {
          setScreen(loadingFinal ? "result" : "question");
        }, 600);
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [screen, loadingFinal]);

  useEffect(() => {
    if (screen !== "result" || !category) {
      return;
    }
    if (resultSavedRef.current) {
      return;
    }
    resultSavedRef.current = true;

    const result = getResult();
    const minutes = toMinutes(elapsed);
    const entry: RankingEntry = {
      school,
      nickname,
      category: catLabel(category),
      code: result.code,
      seconds: elapsed,
      minutes,
      ts: Date.now(),
    };
    currentEntryTsRef.current = entry.ts;

    const list = JSON.parse(window.localStorage.getItem("animal_rankings") || "[]") as RankingEntry[];
    list.push(entry);
    list.sort((a, b) => b.seconds - a.seconds);
    window.localStorage.setItem("animal_rankings", JSON.stringify(list));
    setRanking(list.slice(0, 5));
  }, [screen]);

  useEffect(() => {
    if (!copyMsg) {
      return;
    }
    const timer = window.setTimeout(() => setCopyMsg(""), 3000);
    return () => window.clearTimeout(timer);
  }, [copyMsg]);

  function saveUser(nextSchool: string, nextNickname: string) {
    window.localStorage.setItem(
      "animal_user",
      JSON.stringify({ school: nextSchool, nickname: nextNickname }),
    );
  }

  function getResult() {
    if (!category) {
      return RESULTS.love.A;
    }
    const cnt: Record<ResultType, number> = { A: 0, B: 0 };
    answers.forEach((answer) => {
      cnt[answer] += 1;
    });
    return RESULTS[category][cnt.B > cnt.A ? "B" : "A"];
  }

  function goCategory() {
    const nextSchool = school.trim();
    const nextNickname = nickname.trim();

    if (!nextSchool || !nextNickname) {
      window.alert("학교 이름과 닉네임을 모두 입력해 주세요.");
      return;
    }

    setSchool(nextSchool);
    setNickname(nextNickname);
    saveUser(nextSchool, nextNickname);
    resetCategoryScreen();
  }

  function resetCategoryScreen() {
    setQuestions([]);
    setQIndex(0);
    setAnswers([]);
    setElapsed(0);
    setMidLoadingDone(false);
    setCategory(null);
    setStartTime(null);
    setLoadingPct(0);
    setLoadingMsg(LOADING_MESSAGES[0]);
    setLoadingFinal(false);
    setRanking([]);
    setCopyMsg("");
    setAnswerLocked(false);
    currentEntryTsRef.current = null;
    resultSavedRef.current = false;
    setScreen("category");
  }

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setQuestions(nextCategory === "study" ? QUESTIONS.study.regular : QUESTIONS[nextCategory]);
    setQIndex(0);
    setAnswers([]);
    setElapsed(0);
    setMidLoadingDone(false);
    setStartTime(Date.now());
    setAnswerLocked(false);
    setScreen(nextCategory === "study" ? "studySpecial" : "question");
  }

  function showLoading(isFinal: boolean) {
    if (isFinal) {
      resultSavedRef.current = false;
    }
    setLoadingFinal(isFinal);
    setScreen("loading");
  }

  function handleStudySpecial(choice: SpecialType) {
    if (choice === "exit") {
      setWarningCountdown(5);
      setStartTime(null);
      setScreen("warning");
      return;
    }
    setScreen("question");
  }

  function handleAnswer(idx: 0 | 1) {
    if (answerLocked) {
      return;
    }
    setAnswerLocked(true);

    const question = questions[qIndex];
    const nextAnswers = [...answers, question.types[idx]];
    setAnswers(nextAnswers);

    const total = questions.length;

    if (qIndex === 4 && !midLoadingDone) {
      setQIndex((prev) => prev + 1);
      setMidLoadingDone(true);
      window.setTimeout(() => {
        setAnswerLocked(false);
        showLoading(false);
      }, 120);
      return;
    }

    if (qIndex === total - 1) {
      setQIndex((prev) => prev + 1);
      setStartTime(null);
      window.setTimeout(() => {
        setAnswerLocked(false);
        showLoading(true);
      }, 120);
      return;
    }

    setQIndex((prev) => prev + 1);
    window.setTimeout(() => {
      setAnswerLocked(false);
    }, 120);
  }

  function resetHome() {
    setCategory(null);
    setQuestions([]);
    setQIndex(0);
    setAnswers([]);
    setElapsed(0);
    setMidLoadingDone(false);
    setStartTime(null);
    setWarningCountdown(5);
    setLoadingPct(0);
    setLoadingMsg(LOADING_MESSAGES[0]);
    setLoadingFinal(false);
    setRanking([]);
    setCopyMsg("");
    setAnswerLocked(false);
    currentEntryTsRef.current = null;
    resultSavedRef.current = false;
    setScreen("intro");
  }

  async function doShare(code: string, minutes: number) {
    const text = `${school} ${nickname}님의 시험시간은 ${minutes}분 뺏겼고, 결과는 ${code}입니다.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg("공유 문구가 복사됐습니다!");
    } catch {
      setCopyMsg(text);
    }
  }

  const currentQuestion = questions[qIndex];
  const totalQuestions = questions.length;
  const currentNumber = qIndex + 1;
  const questionPct = totalQuestions ? (currentNumber / totalQuestions) * 100 : 0;
  const questionPage = category === "study" ? 3 + currentNumber + (midLoadingDone ? 1 : 0) : 2 + currentNumber + (midLoadingDone ? 1 : 0);
  const loadingPage = loadingFinal ? (category === "study" ? 15 : 14) : (category === "study" ? 9 : 8);
  const result = screen === "result" ? getResult() : null;
  const minutes = toMinutes(elapsed);

  return (
    <main id="paper">
      {screen === "intro" && (
        <>
          <Header num={1} subjectHtml={"제 1 교시&nbsp;&nbsp;&nbsp;도파민 영역"} />
          <div className="info-box">
            <div className="info-box-title">[안내문] 다음을 읽고, 정보를 입력하시오.</div>
            <div className="info-box-body">
              시험기간 도파민 테스트에 오신 것을 환영합니다. 본 테스트는 시험기간에 당신의 도파민 중독 수준을 측정하기 위해 설계되었습니다. <strong>솔직하게</strong> 답변해 주세요. 테스트 결과는 재미를 위한 것이며, 어떠한 학술적 근거도 없습니다.
              <p className="info-box-warn">※ 본 테스트를 진행하는 동안 뺏기는 시간은 측정됩니다.</p>
            </div>
          </div>
          <div className="q-item">
            <div className="q-label"><span className="q-num">1.</span><span>수험생의 <strong>학교 이름</strong>을 기입하시오.</span></div>
            <input className="q-input" type="text" placeholder="예: OO고등학교, OO대학교" value={school} onChange={(e) => setSchool(e.target.value)} />
          </div>
          <div className="q-item">
            <div className="q-label"><span className="q-num">2.</span><span>수험생의 <strong>닉네임</strong>을 기입하시오.</span></div>
            <input className="q-input" type="text" placeholder="닉네임을 입력하세요" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <button className="btn-next" onClick={goCategory}>다음 페이지로 →</button>
          <Footer cur={1} />
        </>
      )}

      {screen === "category" && (
        <>
          <Header num={2} subjectHtml={"제 2 교시&nbsp;&nbsp;&nbsp;카테고리 선택"} />
          <div className="info-box">
            <div className="info-box-title">[안내문] 다음을 읽고, 카테고리를 선택하시오.</div>
            <div className="info-box-body">
              아래 3개의 카테고리 중 <strong>하나를 선택</strong>하시오. 카테고리 선택 순간부터 뺏기는 시간이 측정됩니다. 가장 솔직하게 자신을 대변하는 카테고리를 선택하세요.
            </div>
          </div>
          <div className="category-grid">
            <button className="category-btn" onClick={() => selectCategory("love")}>
              <div className="cat-circle">①</div>
              <div className="cat-name">연애</div>
              <div className="cat-desc">연인 / 짝사랑 / 설렘</div>
            </button>
            <button className="category-btn" onClick={() => selectCategory("study")}>
              <div className="cat-circle">②</div>
              <div className="cat-name">공부</div>
              <div className="cat-desc">학습 / 집중 / 의지력</div>
            </button>
            <button className="category-btn" onClick={() => selectCategory("life")}>
              <div className="cat-circle">③</div>
              <div className="cat-name">생활</div>
              <div className="cat-desc">수면 / 식사 / 루틴</div>
            </button>
          </div>
          <Footer cur={2} />
        </>
      )}

      {screen === "studySpecial" && (
        <>
          <Header num={3} subjectHtml={"도파민 영역"} />
          <div className="stolen-time">⏱ 지금까지 뺏긴 시간: {fmt(elapsed)}</div>
          <div className="progress-bar"><div className="progress-bar-inner" style={{ width: "0%" }} /></div>
          <div className="question-box">
            <div className="question-num-label">[사전 확인 문항]</div>
            <div className="question-text">{QUESTIONS.study.special.text}</div>
          </div>
          <div className="choices-list">
            <button className="choice-btn" onClick={() => handleStudySpecial("continue")}>
              <span className="choice-sym">①</span><span>{QUESTIONS.study.special.choices[0]}</span>
            </button>
            <button className="choice-btn" onClick={() => handleStudySpecial("exit")}>
              <span className="choice-sym">②</span><span>{QUESTIONS.study.special.choices[1]}</span>
            </button>
          </div>
          <Footer cur={3} />
        </>
      )}

      {screen === "question" && currentQuestion && category && (
        <>
          <Header num={questionPage} subjectHtml={"도파민 영역"} />
          <div className="q-meta-row">
            <span>{currentNumber} / {totalQuestions} 문항</span>
            <span>{catLabel(category)} 카테고리</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: `${questionPct}%` }} />
          </div>
          <div className="stolen-time">⏱ 지금까지 뺏긴 시간: {fmt(elapsed)}</div>
          <div className="question-box">
            <div className="question-num-label">문항 {currentNumber}</div>
            <div className="question-text">{currentQuestion.text}</div>
          </div>
          <div className="choices-list">
            <button className="choice-btn" onClick={() => handleAnswer(0)} disabled={answerLocked}>
              <span className="choice-sym">①</span><span>{currentQuestion.choices[0]}</span>
            </button>
            <button className="choice-btn" onClick={() => handleAnswer(1)} disabled={answerLocked}>
              <span className="choice-sym">②</span><span>{currentQuestion.choices[1]}</span>
            </button>
          </div>
          <Footer cur={questionPage} />
        </>
      )}

      {screen === "loading" && (
        <>
          <div className="loading-wrap">
            <div className="loading-subtitle">{loadingFinal ? "최종 결과를 분석하는 중..." : "중간 분석 중..."}</div>
            <div className="loading-pct">{loadingPct}%</div>
            <div className="loading-bar-outer">
              <div className="loading-bar-inner" style={{ width: `${loadingPct}%` }} />
            </div>
            <div className="loading-msg">{loadingMsg}</div>
          </div>
          <Footer cur={loadingPage} />
        </>
      )}

      {screen === "warning" && (
        <div className="warn-wrap">
          <div className="warn-main">공부하러 가세요.</div>
          <div className="warn-sub">지금 당장 책을 펴세요.</div>
          <div className="warn-count">{warningCountdown}초 후 메인으로 이동합니다.</div>
        </div>
      )}

      {screen === "result" && result && category && (
        <>
          <Header num={16} subjectHtml={"제 최종 교시&nbsp;&nbsp;&nbsp;결과 발표"} />
          <div className="result-type-box">
            <div className="result-code">{result.code}</div>
            <div className="result-name">{result.name}</div>
            <div className="result-desc">{result.desc}</div>
          </div>
          <div className="result-meta-grid">
            <div className="meta-card">
              <div className="meta-label">수험생</div>
              <div className="meta-value">{nickname}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">학교</div>
              <div className="meta-value">{school}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">뺏긴 시험시간</div>
              <div className="meta-value stolen-red">{minutes}분</div>
            </div>
          </div>
          <div className="ranking-section">
            <div className="ranking-head">🏆 도파민 랭킹 TOP 5 (이 기기 기준)</div>
            {ranking.length > 0 ? (
              ranking.map((entry, index) => (
                <div className={`ranking-row ${entry.ts === currentEntryTsRef.current ? "rank-me" : ""}`} key={`${entry.ts}-${index}`}>
                  <span className="rank-num">{index + 1}</span>
                  <span className="rank-info">
                    <span>{entry.nickname}</span>
                    <span className="rank-school">({entry.school})</span>
                  </span>
                  <span className="rank-time">{entry.minutes}분</span>
                </div>
              ))
            ) : (
              <div className="ranking-empty">아직 기록이 없습니다.</div>
            )}
          </div>
          <button className="share-btn" onClick={() => void doShare(result.code, minutes)}>📋 결과 공유 문구 복사</button>
          <div className="copy-msg">{copyMsg}</div>
          <div className="result-actions">
            <button className="btn-act btn-white" onClick={resetCategoryScreen}>다른 카테고리 하기</button>
            <button className="btn-act btn-black" onClick={resetHome}>메인으로</button>
          </div>
          <Footer cur={16} />
        </>
      )}
    </main>
  );
}
