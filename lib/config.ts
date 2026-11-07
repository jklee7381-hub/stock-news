// 설정 모음: 키워드, 배제어, 매체표, 점수표, RSS 주소.
// 규칙을 바꾸고 싶으면 이 파일만 고치면 된다.

// 필수 키워드: 제목에 하나 이상 있어야 통과 (대소문자 무시)
export const KEYWORDS: string[] = [
  // 미국 지수 및 매크로
  "나스닥", "QQQ", "S&P500", "S&P 500", "FOMC", "연준", "파월", "기준금리",
  "국채 금리", "국채금리", "10년물", "2년물", "CPI", "소비자물가", "PCE", "고용보고서",
  "빅테크", "M7", "매그니피센트", "경기침체", "연착륙",
  "뉴욕증시", "뉴욕 증시", "미국 증시", "미국증시", "다우", "금리인상", "금리인하", "금리 동결",
  "미국 고용", "美 고용", "미 고용", "비농업", "美 국채", "미국 국채",

  // 글로벌 & 국장 반도체 생태계
  "SOXX", "필라델피아 반도체", "HBM", "D램", "DRAM", "낸드", "파운드리", "패키징",
  "EUV", "ASML", "TSMC", "엔비디아", "CAPEX", "설비투자", "반도체 수출", "반도체 규제",
  "관세", "반도체주", "마이크론",
  // [국장 반도체 & 지수 키워드 추가]
  "삼성전자", "SK하이닉스", "하이닉스", "한미반도체", "소부장",
  "코스피", "코스닥", "외국인 순매수", "외인 순매수", "외국인 매수", "기관 매수",
];

// '관세청'처럼 뜻이 다른 단어에 붙은 경우는 키워드로 보지 않는다.
export const NOT_FOLLOWED_BY: Record<string, string[]> = { "관세": ["청", "사", "법인"] };

// '급등'은 개별 급등주를 걸러내는 단어지만, 제목에 아래 지수·거시 단어가 함께 있으면 시장 전체 기사로 보고 살려 준다.
// 단, 특징주·상한가·테마주·급등주 같은 다른 배제어가 하나라도 있으면 그대로 폐기한다.
export const SURGE_EXEMPT_TERMS = ["급등"];
export const SURGE_EXEMPT_WITH: string[] = [
  "나스닥", "S&P500", "S&P 500", "필라델피아 반도체", "다우", "뉴욕증시", "뉴욕 증시", "미국 증시", "미국증시",
  "국채", "기준금리", "FOMC", "연준", "CPI",
  // [국장 지수/대형주 급등 예외 추가]
  "코스피", "코스닥", "삼성전자", "SK하이닉스", "반도체",
];

// 배제 단어: 제목에 하나라도 있으면 즉시 폐기
export const BLACKLIST: string[] = [
  "급등", "상한가", "특징주", "테마주", "급등주", "동전주", "단타", "우선주",
  "수주", "공급계약", "공시", "유상증자", "CB", "BW", "품절주", "대장주",
  "카톡방", "리딩방", "무료 추천", "추천주",
];

// 영문 짧은 약어(CB, BW 등)는 다른 단어 속에 끼어 있어도 걸리지 않게 '단어 경계'로만 비교한다.
export const WORD_BOUNDARY_TERMS = new Set(["CB", "BW", "CPI", "PCE", "M7", "QQQ", "SOXX", "HBM", "EUV", "ASML", "TSMC", "CAPEX", "FOMC", "DRAM"]);

// 영향도(35점 만점): 위에서부터 먼저 맞는 것의 점수를 쓴다.
export const IMPACT_RULES: { score: number; label: string; terms: string[] }[] = [
  { score: 35, label: "매크로 핵심", terms: ["파월", "CPI", "소비자물가", "PCE", "FOMC", "기준금리", "금리 인하", "금리 인상", "금리 동결", "금리인하", "금리인상", "미국 고용", "美 고용", "미 고용", "비농업", "실업률", "고용보고서", "수출 통제", "수출 금지", "반도체 규제"] },
  { score: 25, label: "빅테크·반도체 대장 실적", terms: ["실적", "어닝", "CAPEX", "설비투자", "빅테크", "M7", "매그니피센트", "삼성전자", "SK하이닉스", "엔비디아", "TSMC"] },
  { score: 15, label: "업황·전망·수급", terms: ["D램", "DRAM", "낸드", "HBM", "파운드리", "반도체 수출", "전망", "가격", "외국인 순매수", "외인 순매수"] },
];

// 매체 신뢰도(30점 만점)
export const TRUST_TOP: string[] = [
  "로이터", "reuters", "블룸버그", "bloomberg", "cnbc", "wsj", "월스트리트저널",
  "연합뉴스", "연합인포맥스", "한국경제", "매일경제", "한경", "매경",
];
export const TRUST_MID: string[] = [
  "조선일보", "중앙일보", "동아일보", "한겨레", "경향신문", "서울경제", "머니투데이",
  "이데일리", "파이낸셜뉴스", "헤럴드경제", "아시아경제", "kbs", "mbc", "sbs", "ytn", "jtbc",
];
export const TRUST_SCORE = { top: 30, mid: 15, low: 0 };

// 점수 규칙
export const MULTI_MIN_SOURCES = 3; // 서로 다른 매체 3곳 이상이면 +20
export const MULTI_SCORE = 20;
export const RECENCY_RULES = [
  { withinMinutes: 60, score: 15 },
  { withinMinutes: 180, score: 8 },
];

// 긴급 알림 조건 (제목 기준). 배제어 규칙은 긴급에도 그대로 적용된다.
export const URGENT_MACRO_TERMS = ["CPI", "FOMC", "금리 인하", "금리 인상", "금리인하", "금리인상", "파월", "실업률"];
export const URGENT_INDEX_TERMS = ["나스닥", "필라델피아 반도체", "코스피"];
export const URGENT_INDEX_MOVE_TERMS = ["급락", "폭락", "2% 하락", "2% 상승", "2% 이상", "서킷브레이커", "사이드카"];
export const URGENT_POLICY_TERMS = ["상무부", "대중 반도체", "반도체 규제", "수출 금지", "수출 통제", "엔비디아 칩"];
export const URGENT_M7_TERMS = ["엔비디아", "마이크로소프트", "애플", "구글", "알파벳", "아마존", "메타", "테슬라", "삼성전자", "SK하이닉스"];
export const URGENT_EARNINGS_TERMS = ["서프라이즈", "쇼크", "어닝"];

// 구글뉴스 검색어 (키워드를 묶어서 요청 수를 줄인다)
export const GOOGLE_QUERIES: string[] = [
  "나스닥 QQQ", "S&P500 나스닥 마감", "FOMC 연준 파월", "CPI 소비자물가 PCE",
  "국채 금리 기준금리", "빅테크 CAPEX 설비투자", "필라델피아 반도체 SOXX",
  "HBM D램 낸드", "엔비디아 TSMC", "ASML EUV 파운드리", "미중 반도체 규제 관세", "반도체 수출",
  // [국장 쿼리 추가]
  "삼성전자 SK하이닉스 반도체", "코스피 반도체 외국인", "HBM 한미반도체",
];

// 언론사 RSS
export const PUBLISHER_FEEDS: string[] = [
  "https://www.yna.co.kr/rss/economy.xml",
  "https://www.hankyung.com/feed/finance",
  "https://www.mk.co.kr/rss/50200011/",
];

// 접속을 허용하는 주소
export const ALLOWED_HOSTS = new Set([
  "news.google.com", "www.yna.co.kr", "www.hankyung.com", "www.mk.co.kr",
]);

export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_FEED_BYTES = 2_000_000;

// 카테고리: 위에서부터 먼저 맞는 것으로 정한다 (제목 기준). 하나도 안 맞으면 '기타'.
export const CATEGORIES: { name: string; terms: string[] }[] = [
  { name: "정책·규제", terms: ["관세", "수출 통제", "수출통제", "수출 금지", "반도체 규제", "대중 반도체", "상무부", "제재", "보조금"] },
  { name: "금리·물가·고용", terms: ["연준", "FOMC", "파월", "기준금리", "금리", "국채", "CPI", "PCE", "물가", "고용", "실업률", "비농업", "경기침체", "연착륙"] },
  { name: "반도체", terms: ["삼성전자", "SK하이닉스", "하이닉스", "한미반도체", "소부장", "HBM", "D램", "DRAM", "낸드", "파운드리", "패키징", "EUV", "ASML", "TSMC", "SOXX", "필라델피아 반도체", "마이크론", "반도체"] },
  { name: "빅테크·AI", terms: ["엔비디아", "빅테크", "M7", "매그니피센트", "애플", "마이크로소프트", "구글", "알파벳", "아마존", "메타", "테슬라", "CAPEX", "설비투자"] },
  { name: "지수·시장", terms: ["코스피", "코스닥", "외국인 순매수", "외인 순매수", "나스닥", "QQQ", "S&P500", "S&P 500", "다우", "뉴욕증시", "뉴욕 증시", "미국 증시", "미국증시"] },
];
export const CATEGORY_OTHER = "기타";
