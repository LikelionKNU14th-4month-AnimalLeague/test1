"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, type DbRankingEntry } from "../lib/supabase";

type Category = "love" | "study" | "life";
type ResultType = "A" | "B";
type SpecialType = "continue" | "exit";
type Screen =
  | "intro"
  | "category"
  | "studySpecial"
  | "question"
  | "loading"
  | "warning"
  | "result";

type Question<T extends string = ResultType | SpecialType> = {
  text: string;
  choices: [string, string];
  types: [T, T];
};

type QuizQuestion = Question<ResultType>;

type ResultEntry = {
  code: string;
  name: string;
  desc: string;
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
  "유튜브 쇼츠 보다가 여기까지 흘러들어오신 거 다 압니다.",
  "진짜 공부할 거 아니면 지금 'X' 버튼 누르셔도 무죄입니다.",
  "에러 안 난 게 어디예요. 조금만 더 기다려 주세요.",
  "지금 로딩 바는 디자인입니다. 사실 데이터는 아직 안 왔어요.",
  "지금 핫식스 몇 캔째인가요? 심장 소리가 서버까지 들려요.",
  "방금 '이번 시험은 버릴까'라고 생각하셨죠? 서버가 읽었습니다.",
] as const;

const QUESTIONS: Record<Exclude<Category, "study">, QuizQuestion[]> & {
  study: {
    special: Question<SpecialType>;
    regular: QuizQuestion[];
  };
} = {
  love: [
    {
      text: "시험 기간에 연인(또는 좋아하는 사람)의 연락을 무시할 수 있나요?",
      choices: ["충분히 가능하다", "절대 불가능하다"],
      types: ["A", "B"],
    },
    {
      text: "오늘 상대방 SNS를 확인했나요?",
      choices: ["안 했다", "이미 3번 이상 확인했다"],
      types: ["A", "B"],
    },
    {
      text: "시험 공부 중 연락이 오면?",
      choices: ["나중에 확인한다", "즉시 확인한다"],
      types: ["A", "B"],
    },
    {
      text: "시험 전날 밤에 새벽까지 연락한 적 있나요?",
      choices: ["없다, 일찍 잔다", "있다, 거의 매번"],
      types: ["A", "B"],
    },
    {
      text: "상대방 생각에 공부가 안 된 적 있나요?",
      choices: ["없다", "오늘도 있다"],
      types: ["A", "B"],
    },
    {
      text: "성적 vs 관계, 지금 당신에게 더 중요한 건?",
      choices: ["지금은 성적", "당연히 관계"],
      types: ["A", "B"],
    },
    {
      text: "연인 / 좋아하는 사람 생각이 하루에 몇 번이나 나나요?",
      choices: ["10번 이하", "셀 수도 없다"],
      types: ["A", "B"],
    },
    {
      text: "시험 끝나고 제일 먼저 할 일은?",
      choices: ["쉬거나 잠 자기", "바로 연락하기"],
      types: ["A", "B"],
    },
    {
      text: "교실에서 상대방 프로필 사진을 멍하니 바라본 적 있나요?",
      choices: ["없다", "있다, 자주"],
      types: ["A", "B"],
    },
    {
      text: "지금 이 순간 상대방 생각이 나나요?",
      choices: ["별로 안 난다", "...지금 생각나고 있다"],
      types: ["A", "B"],
    },
  ],
  study: {
    special: {
      text: "지금 공부하고 있나요?",
      choices: ["하고 있다", "안 하고 있다"],
      types: ["continue", "exit"],
    },
    regular: [
      {
        text: "오늘 공부 계획을 세웠나요?",
        choices: ["세웠고, 지키고 있다", "세웠지만 이미 포기했다"],
        types: ["A", "B"],
      },
      {
        text: "지금 어디서 공부하고 있나요?",
        choices: ["독서실 또는 카페", "침대 위"],
        types: ["A", "B"],
      },
      {
        text: "오늘 집중한 시간이 총 몇 시간인가요?",
        choices: ["4시간 이상", "2시간 이하"],
        types: ["A", "B"],
      },
      {
        text: "시험 범위를 전부 파악하고 있나요?",
        choices: ["파악하고 있다", "아직 잘 모른다"],
        types: ["A", "B"],
      },
      {
        text: "오늘 유튜브나 릴스를 얼마나 봤나요?",
        choices: ["거의 안 봤다", "3시간 이상"],
        types: ["A", "B"],
      },
      {
        text: "이 테스트 이전에 마지막으로 한 행동은?",
        choices: ["공부", "유튜브 / SNS / 게임"],
        types: ["A", "B"],
      },
      {
        text: "지금 공부가 하고 싶은가요?",
        choices: ["재미없지만 하고 있다", "재미없어서 이걸 하고 있다"],
        types: ["A", "B"],
      },
      {
        text: "이 테스트 끝나면 바로 공부할 수 있나요?",
        choices: ["할 수 있다", "아마 다른 걸 볼 것 같다"],
        types: ["A", "B"],
      },
      {
        text: "벼락치기로 시험을 본 적 있나요?",
        choices: ["없다 또는 거의 없다", "매번 그렇게 한다"],
        types: ["A", "B"],
      },
      {
        text: "오늘 자신에게 솔직히 점수를 매기면?",
        choices: ["7점 이상", "5점 이하"],
        types: ["A", "B"],
      },
    ],
  },
  life: [
    {
      text: "오늘 기상 시간은?",
      choices: ["7시 이전", "10시 이후"],
      types: ["A", "B"],
    },
    {
      text: "오늘 밥은 제대로 챙겨 먹었나요?",
      choices: ["3끼 다 먹었다", "하나 이상 굶었다"],
      types: ["A", "B"],
    },
    {
      text: "시험 기간에 운동을 한 적 있나요?",
      choices: ["있다", "시험 끝나면 할 거다"],
      types: ["A", "B"],
    },
    {
      text: "현재 방 / 책상 상태는?",
      choices: ["나름 깔끔하다", "재앙 수준이다"],
      types: ["A", "B"],
    },
    {
      text: "하루 핸드폰 사용 시간은?",
      choices: ["3시간 이하", "6시간 이상"],
      types: ["A", "B"],
    },
    {
      text: "시험 전날 몇 시에 자나요?",
      choices: ["12시 이전", "새벽 2시 이후"],
      types: ["A", "B"],
    },
    {
      text: "시험 기간 배달음식을 자주 시키나요?",
      choices: ["거의 안 시킨다", "매일 시킨다"],
      types: ["A", "B"],
    },
    {
      text: "공부 중 의도치 않게 잠든 적 있나요?",
      choices: ["없다", "오늘도 잠들었다"],
      types: ["A", "B"],
    },
    {
      text: "지금 이 테스트 말고 해야 할 일이 있나요?",
      choices: ["없다, 다 했다", "있다, 엄청 많다"],
      types: ["A", "B"],
    },
    {
      text: "시험 기간 나의 생활 패턴을 스스로 평가하면?",
      choices: ["나름 잘 유지하고 있다", "완전히 무너졌다"],
      types: ["A", "B"],
    },
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

// 중간 로딩용 웨이포인트 (15초)
const WAYPOINTS_MID: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [1688, 38],
  [3188, 73],
  [4313, 82],
  [5063, 24],
  [6563, 59],
  [7688, 91],
  [8625, 34],
  [10125, 67],
  [11625, 88],
  [13125, 95],
  [15000, 100],
];

// 최종 로딩용 웨이포인트 (20초)
const WAYPOINTS_FINAL: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [2250, 38],
  [4250, 73],
  [5750, 82],
  [6750, 24],
  [8750, 59],
  [10250, 91],
  [11500, 34],
  [13500, 67],
  [15500, 88],
  [17500, 95],
  [20000, 100],
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

function interpPct(
  elapsed: number,
  waypoints: ReadonlyArray<readonly [number, number]>,
) {
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const [t0, p0] = waypoints[i];
    const [t1, p1] = waypoints[i + 1];
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
        <span className="paper-meta">
          2026학년도 시험기간 도파민 테스트 문제지
        </span>
        <span className="paper-big-num">{num}</span>
      </div>
      <hr className="div1" />
      <div className="paper-subject-row">
        <span
          className="paper-subject"
          dangerouslySetInnerHTML={{ __html: subjectHtml }}
        />
        <span className="paper-badge">홀수형</span>
      </div>
      <hr className="div2" />
    </>
  );
}

const UNIVERSITIES: string[] = [
  "강남대학교",
  "건국대학교(서울캠퍼스)",
  "건국대학교(GLOCAL캠퍼스)",
  "경기대학교(수원캠퍼스)",
  "경기대학교(서울캠퍼스)",
  "경북대학교",
  "경상국립대학교",
  "경성대학교",
  "경인교육대학교",
  "경희대학교(서울캠퍼스)",
  "경희대학교(국제캠퍼스)",
  "계명대학교",
  "고려대학교(서울캠퍼스)",
  "고려대학교(세종캠퍼스)",
  "공주대학교",
  "광운대학교",
  "국민대학교",
  "군산대학교",
  "단국대학교(죽전캠퍼스)",
  "단국대학교(천안캠퍼스)",
  "대구가톨릭대학교",
  "대구대학교",
  "대전대학교",
  "덕성여자대학교",
  "동국대학교(서울캠퍼스)",
  "동국대학교(경주캠퍼스)",
  "동덕여자대학교",
  "동아대학교",
  "동의대학교",
  "목원대학교",
  "목포대학교",
  "명지대학교(서울캠퍼스)",
  "명지대학교(자연캠퍼스)",
  "부경대학교",
  "부산대학교",
  "삼육대학교",
  "상명대학교(서울캠퍼스)",
  "상명대학교(천안캠퍼스)",
  "서강대학교",
  "서울과학기술대학교",
  "서울대학교",
  "서울시립대학교",
  "서울여자대학교",
  "서울한양대학교",
  "성결대학교",
  "성균관대학교(인문사회과학캠퍼스)",
  "성균관대학교(자연과학캠퍼스)",
  "성신여자대학교",
  "세종대학교",
  "숙명여자대학교",
  "숭실대학교",
  "아주대학교",
  "안양대학교",
  "연세대학교(신촌캠퍼스)",
  "연세대학교(미래캠퍼스)",
  "영남대학교",
  "용인대학교",
  "우석대학교",
  "원광대학교",
  "을지대학교(성남캠퍼스)",
  "을지대학교(대전캠퍼스)",
  "이화여자대학교",
  "인하대학교",
  "인천대학교",
  "전남대학교",
  "전북대학교",
  "제주대학교",
  "조선대학교",
  "중앙대학교(서울캠퍼스)",
  "중앙대학교(안성캠퍼스)",
  "차의과학대학교",
  "청주대학교",
  "충남대학교",
  "충북대학교",
  "한경국립대학교",
  "한국교원대학교",
  "한국교통대학교",
  "한국외국어대학교(서울캠퍼스)",
  "한국외국어대학교(글로벌캠퍼스)",
  "한국항공대학교",
  "한림대학교",
  "한성대학교",
  "한신대학교",
  "한양대학교(서울캠퍼스)",
  "한양대학교(ERICA캠퍼스)",
  "홍익대학교(서울캠퍼스)",
  "홍익대학교(세종캠퍼스)",
  "KAIST",
  "POSTECH",
  "DGIST",
  "GIST",
  "UNIST",
];

function Footer({ cur, total }: { cur: number; total?: number }) {
  return (
    <div className="paper-footer">
      <span>
        * 이 문제지에 관한 저작권은 시험기간 도파민 테스트에 있습니다.
      </span>
      <span>{total != null ? `${cur} / ${total}` : `${cur}`}</span>
    </div>
  );
}

export default function Home() {
  const [school, setSchool] = useState("");
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
  const [schoolError, setSchoolError] = useState(false);
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<ResultType[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [midLoadingDone, setMidLoadingDone] = useState(false);
  const [screen, setScreen] = useState<Screen>("intro");
  const [warningCountdown, setWarningCountdown] = useState(5);
  const [loadingPct, setLoadingPct] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState<
    (typeof LOADING_MESSAGES)[number]
  >(LOADING_MESSAGES[0]);
  const [loadingFinal, setLoadingFinal] = useState(false);
  const [globalRanking, setGlobalRanking] = useState<DbRankingEntry[]>([]);
  const [schoolRanking, setSchoolRanking] = useState<DbRankingEntry[]>([]);
  const [copyMsg, setCopyMsg] = useState("");
  const [answerLocked, setAnswerLocked] = useState(false);
  const currentEntryIdRef = useRef<string | null>(null);
  const resultSavedRef = useRef(false);

  useEffect(() => {
    const saved = JSON.parse(
      window.localStorage.getItem("animal_user") || "{}",
    ) as Partial<{
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
      resetCategoryScreen();
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

    const total = loadingFinal ? 20000 : 15000;
    const waypoints = loadingFinal ? WAYPOINTS_FINAL : WAYPOINTS_MID;
    let elapsedMs = 0;
    let msgIdx = 0;

    const timer = window.setInterval(() => {
      elapsedMs += 100;
      const pct = interpPct(elapsedMs, waypoints);
      setLoadingPct(pct);

      if (elapsedMs % 1800 === 0) {
        let nextIdx;
        do {
          nextIdx = Math.floor(Math.random() * LOADING_MESSAGES.length);
        } while (nextIdx === msgIdx);
        msgIdx = nextIdx;
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

    void (async () => {
      const { data, error } = await supabase
        .from("rankings")
        .insert({
          school,
          nickname,
          category: catLabel(category),
          result_type: result.code,
          elapsed,
          minutes,
        })
        .select("id")
        .single();

      if (error) {
        console.error("insert 오류:", error.message);
      } else if (data) {
        currentEntryIdRef.current = data.id as string;
      }

      const [globalRes, schoolRes] = await Promise.all([
        supabase
          .from("rankings")
          .select("*")
          .order("elapsed", { ascending: false })
          .limit(5),
        supabase
          .from("rankings")
          .select("*")
          .eq("school", school)
          .order("elapsed", { ascending: false })
          .limit(5),
      ]);

      if (globalRes.error)
        console.error("전체 랭킹 오류:", globalRes.error.message);
      else if (globalRes.data)
        setGlobalRanking(globalRes.data as DbRankingEntry[]);

      if (schoolRes.error)
        console.error("학교 랭킹 오류:", schoolRes.error.message);
      else if (schoolRes.data)
        setSchoolRanking(schoolRes.data as DbRankingEntry[]);
    })();
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

    if (!UNIVERSITIES.includes(nextSchool)) {
      setSchoolError(true);
      return;
    }

    setSchoolError(false);
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
    setGlobalRanking([]);
    setSchoolRanking([]);
    setCopyMsg("");
    setAnswerLocked(false);
    currentEntryIdRef.current = null;
    resultSavedRef.current = false;
    setScreen("category");
  }

  function selectCategory(nextCategory: Category) {
    setCategory(nextCategory);
    setQuestions(
      nextCategory === "study"
        ? QUESTIONS.study.regular
        : QUESTIONS[nextCategory],
    );
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
    setGlobalRanking([]);
    setSchoolRanking([]);
    setCopyMsg("");
    setAnswerLocked(false);
    currentEntryIdRef.current = null;
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
  const questionPct = totalQuestions
    ? (currentNumber / totalQuestions) * 100
    : 0;
  const totalPages = category === "study" ? 16 : 15;
  const questionPage =
    category === "study"
      ? 3 + currentNumber + (midLoadingDone ? 1 : 0)
      : 2 + currentNumber + (midLoadingDone ? 1 : 0);
  const loadingPage = loadingFinal
    ? category === "study"
      ? 15
      : 14
    : category === "study"
      ? 9
      : 8;
  const result = screen === "result" ? getResult() : null;
  const minutes = toMinutes(elapsed);

  return (
    <main id="paper">
      {screen === "intro" && (
        <>
          <Header
            num={1}
            subjectHtml={"제 1 교시&nbsp;&nbsp;&nbsp;도파민 영역"}
          />
          <div className="info-box">
            <div className="info-box-title">
              [안내문] 다음을 읽고, 정보를 입력하시오.
            </div>
            <div className="info-box-body">
              시험기간 도파민 테스트에 오신 것을 환영합니다. 본 테스트는
              시험기간에 당신의 도파민 중독 수준을 측정하기 위해 설계되었습니다.{" "}
              <strong>솔직하게</strong> 답변해 주세요. 테스트 결과는 재미를 위한
              것이며, 어떠한 학술적 근거도 없습니다.
              <p className="info-box-warn">
                ※ 본 테스트를 진행하는 동안 뺏기는 시간은 측정됩니다.
              </p>
            </div>
          </div>
          <div className="q-item">
            <div className="q-label">
              <span className="q-num">1.</span>
              <span>
                수험생의 <strong>학교 이름</strong>을 기입하시오.
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                className="q-input"
                type="text"
                placeholder="예: OO대학교"
                value={school}
                autoComplete="off"
                onChange={(e) => {
                  setSchool(e.target.value);
                  setShowSchoolSuggestions(true);
                  setSchoolError(false);
                }}
                onFocus={() => setShowSchoolSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowSchoolSuggestions(false), 150)
                }
              />
              {showSchoolSuggestions &&
                school.trim().length > 0 &&
                (() => {
                  const suggestions = UNIVERSITIES.filter((u) =>
                    u.includes(school.trim()),
                  ).slice(0, 8);
                  return suggestions.length > 0 ? (
                    <div className="school-suggestions">
                      {suggestions.map((u) => (
                        <button
                          key={u}
                          className="school-suggestion-item"
                          onMouseDown={() => {
                            setSchool(u);
                            setShowSchoolSuggestions(false);
                          }}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  ) : null;
                })()}
            </div>
            {schoolError && (
              <p
                style={{
                  color: "#cc0000",
                  fontSize: "12.5px",
                  fontWeight: 700,
                  marginTop: "6px",
                }}
              >
                ※ 목록에 있는 학교명을 선택해 주세요.
              </p>
            )}
          </div>
          <div className="q-item">
            <div className="q-label">
              <span className="q-num">2.</span>
              <span>
                수험생의 <strong>닉네임</strong>을 기입하시오.
              </span>
            </div>
            <input
              className="q-input"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <button className="btn-next" onClick={goCategory}>
            다음 페이지로 →
          </button>
          <Footer cur={1} />
        </>
      )}

      {screen === "category" && (
        <>
          <Header
            num={2}
            subjectHtml={"제 2 교시&nbsp;&nbsp;&nbsp;카테고리 선택"}
          />
          <div className="info-box">
            <div className="info-box-title">
              [안내문] 다음을 읽고, 카테고리를 선택하시오.
            </div>
            <div className="info-box-body">
              아래 3개의 카테고리 중 <strong>하나를 선택</strong>하시오.
              카테고리 선택 순간부터 뺏기는 시간이 측정됩니다. 가장 솔직하게
              자신을 대변하는 카테고리를 선택하세요.
            </div>
          </div>
          <div className="category-grid">
            <button
              className="category-btn"
              onClick={() => selectCategory("love")}
            >
              <div className="cat-circle">①</div>
              <div className="cat-name">연애</div>
              <div className="cat-desc">연인 / 짝사랑 / 설렘</div>
            </button>
            <button
              className="category-btn"
              onClick={() => selectCategory("study")}
            >
              <div className="cat-circle">②</div>
              <div className="cat-name">공부</div>
              <div className="cat-desc">학습 / 집중 / 의지력</div>
            </button>
            <button
              className="category-btn"
              onClick={() => selectCategory("life")}
            >
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
          <div className="stolen-time">
            ⏱ 지금까지 뺏긴 시간: {fmt(elapsed)}
          </div>
          <div className="progress-bar">
            <div className="progress-bar-inner" style={{ width: "0%" }} />
          </div>
          <div className="question-box">
            <div className="question-num-label">[사전 확인 문항]</div>
            <div className="question-text">{QUESTIONS.study.special.text}</div>
          </div>
          <div className="choices-list">
            <button
              className="choice-btn"
              onClick={() => handleStudySpecial("continue")}
            >
              <span className="choice-sym">①</span>
              <span>{QUESTIONS.study.special.choices[0]}</span>
            </button>
            <button
              className="choice-btn"
              onClick={() => handleStudySpecial("exit")}
            >
              <span className="choice-sym">②</span>
              <span>{QUESTIONS.study.special.choices[1]}</span>
            </button>
          </div>
          <Footer cur={3} total={16} />
        </>
      )}

      {screen === "question" && currentQuestion && category && (
        <>
          <Header num={questionPage} subjectHtml={"도파민 영역"} />
          <div className="q-meta-row">
            <span>
              {currentNumber} / {totalQuestions} 문항
            </span>
            <span>{catLabel(category)} 카테고리</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-inner"
              style={{ width: `${questionPct}%` }}
            />
          </div>
          <div className="stolen-time">
            ⏱ 지금까지 뺏긴 시간: {fmt(elapsed)}
          </div>
          <div className="question-box">
            <div className="question-num-label">문항 {currentNumber}</div>
            <div className="question-text">{currentQuestion.text}</div>
          </div>
          <div className="choices-list">
            <button
              className="choice-btn"
              onClick={() => handleAnswer(0)}
              disabled={answerLocked}
            >
              <span className="choice-sym">①</span>
              <span>{currentQuestion.choices[0]}</span>
            </button>
            <button
              className="choice-btn"
              onClick={() => handleAnswer(1)}
              disabled={answerLocked}
            >
              <span className="choice-sym">②</span>
              <span>{currentQuestion.choices[1]}</span>
            </button>
          </div>
          <Footer cur={questionPage} total={totalPages} />
        </>
      )}

      {screen === "loading" && (
        <>
          <div className="loading-wrap">
            <div className="loading-subtitle">
              {loadingFinal ? "최종 결과를 분석하는 중..." : "중간 분석 중..."}
            </div>
            <div className="loading-pct">{loadingPct}%</div>
            <div className="loading-bar-outer">
              <div
                className="loading-bar-inner"
                style={{ width: `${loadingPct}%` }}
              />
            </div>
            <div className="loading-msg">{loadingMsg}</div>
          </div>
          <Footer cur={loadingPage} total={totalPages} />
        </>
      )}

      {screen === "warning" && (
        <div className="warn-wrap">
          <div className="warn-main">공부하러 가세요. </div>
          <div className="warn-sub">지금 당장 책을 펴세요.</div>
          <div className="warn-count">
            {warningCountdown}초 후 카테고리 선택으로 이동합니다.
          </div>
        </div>
      )}

      {screen === "result" && result && category && (
        <>
          <Header
            num={16}
            subjectHtml={"제 최종 교시&nbsp;&nbsp;&nbsp;결과 발표"}
          />
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
              <div className="meta-value stolen-red">{fmt(elapsed)}</div>
            </div>
          </div>
          <div className="ranking-section">
            <div className="ranking-cols">
              <div className="ranking-col">
                <div className="ranking-head">🌍 전체 랭킹 TOP 5</div>
                {globalRanking.length > 0 ? (
                  globalRanking.map((entry, index) => (
                    <div
                      className={`ranking-row ${entry.id === currentEntryIdRef.current ? "rank-me" : ""}`}
                      key={entry.id}
                    >
                      <span className="rank-num">{index + 1}</span>
                      <span className="rank-info">
                        <span>{entry.nickname}</span>
                        <span className="rank-school">({entry.school})</span>
                      </span>
                      <span className="rank-time">{fmt(entry.elapsed)}</span>
                    </div>
                  ))
                ) : (
                  <div className="ranking-empty">아직 기록이 없습니다.</div>
                )}
              </div>
              <div className="ranking-col">
                <div className="ranking-head">🏫 {school} 랭킹</div>
                {schoolRanking.length > 0 ? (
                  schoolRanking.map((entry, index) => (
                    <div
                      className={`ranking-row ${entry.id === currentEntryIdRef.current ? "rank-me" : ""}`}
                      key={entry.id}
                    >
                      <span className="rank-num">{index + 1}</span>
                      <span className="rank-info">
                        <span>{entry.nickname}</span>
                        <span className="rank-school">({entry.school})</span>
                      </span>
                      <span className="rank-time">{fmt(entry.elapsed)}</span>
                    </div>
                  ))
                ) : (
                  <div className="ranking-empty">아직 기록이 없습니다.</div>
                )}
              </div>
            </div>
          </div>
          <button
            className="share-btn"
            onClick={() => void doShare(result.code, minutes)}
          >
            📋 결과 공유 문구 복사
          </button>
          <div className="copy-msg">{copyMsg}</div>
          <div className="result-actions">
            <button className="btn-act btn-white" onClick={resetCategoryScreen}>
              다른 카테고리 하기
            </button>
            <button className="btn-act btn-black" onClick={resetHome}>
              메인으로
            </button>
          </div>
          <Footer cur={totalPages} total={totalPages} />
        </>
      )}
    </main>
  );
}
