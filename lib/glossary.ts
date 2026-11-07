// 용어 풀이 (규칙 기반): 기사 제목·본문에 나온 용어를 찾아 쉬운 설명을 붙인다.
// 주의: 아래 설명은 초안입니다. 정확한 정의와 다를 수 있으니 사용자가 검수해 고쳐 쓴다. (AI가 만든 설명이 아니라 사람이 고치는 목록)

export type GlossaryEntry = {
  term: string; // 대표 용어
  aliases?: readonly string[]; // 같은 뜻으로 쓰이는 다른 표기
  explanation: string;
};

export const GLOSSARY: readonly GlossaryEntry[] = [
  // 지수·시장
  { term: "나스닥", aliases: ["NASDAQ"], explanation: "미국의 기술주 중심 주식시장 또는 그 대표 지수. 엔비디아·애플·마이크로소프트 같은 빅테크가 많이 들어 있음" },
  { term: "QQQ", explanation: "나스닥 100 지수를 따라가도록 만든 대표 ETF(상장지수펀드)" },
  { term: "S&P500", aliases: ["S&P 500"], explanation: "미국 대형주 500개로 만든 대표 주가지수" },
  { term: "다우", aliases: ["다우지수"], explanation: "미국 대표 대형주 30개로 만든 주가지수" },
  { term: "필라델피아 반도체", aliases: ["SOX"], explanation: "미국에 상장된 주요 반도체 기업 30개로 만든 지수" },
  { term: "SOXX", explanation: "미국 반도체 기업에 분산 투자하는 ETF" },
  { term: "ETF", explanation: "주식처럼 사고팔 수 있는 펀드. 지수나 업종을 묶어서 따라가도록 만든 상품" },
  { term: "서킷브레이커", explanation: "주가가 급락할 때 시장 거래를 잠시 멈추는 안전장치" },
  { term: "레버리지", aliases: ["3배 ETF"], explanation: "지수 움직임의 2~3배로 오르내리도록 만든 상품. 이익도 손실도 커짐" },
  { term: "프리마켓", explanation: "정규 장이 열리기 전에 이뤄지는 거래" },
  { term: "시간외", explanation: "정규 장이 끝난 뒤에 이뤄지는 거래" },
  { term: "선물", explanation: "미래의 정해진 날짜에 정해진 가격으로 사고팔기로 미리 약속하는 거래. 지수 선물은 개장 전 분위기를 보여 줌" },
  { term: "VIX", explanation: "미국 증시의 불안 정도를 나타내는 변동성 지수. 높을수록 시장이 불안함" },
  // 금리·물가·고용
  { term: "FOMC", explanation: "미국 연준의 금리를 결정하는 회의. 연 8번 열림" },
  { term: "연준", aliases: ["Fed", "연방준비제도"], explanation: "미국의 중앙은행. 기준금리를 정해 물가와 고용을 관리함" },
  { term: "파월", explanation: "제롬 파월. 미국 연준의 의장" },
  { term: "기준금리", explanation: "중앙은행이 정하는 정책 금리. 다른 모든 금리의 기준이 됨" },
  { term: "금리인상", aliases: ["금리 인상"], explanation: "기준금리를 올리는 것. 대출이 비싸져 경기와 주가에는 부담이 되기 쉬움" },
  { term: "금리인하", aliases: ["금리 인하"], explanation: "기준금리를 내리는 것. 대출이 싸져 경기와 주가에는 도움이 되기 쉬움" },
  { term: "금리 동결", explanation: "기준금리를 올리지도 내리지도 않고 그대로 두는 것" },
  { term: "국채금리", aliases: ["국채 금리", "10년물", "2년물"], explanation: "정부가 발행한 채권의 금리. 미국 10년물은 전 세계 금리와 주가의 기준처럼 쓰임" },
  { term: "CPI", aliases: ["소비자물가"], explanation: "소비자가 사는 물건·서비스 가격의 변화를 보여 주는 소비자물가지수. 금리 결정의 핵심 지표" },
  { term: "PCE", explanation: "연준이 가장 중시하는 물가지표인 개인소비지출 물가지수" },
  { term: "고용보고서", aliases: ["비농업", "비농업 고용"], explanation: "미국의 한 달 일자리 증가·실업률을 발표하는 지표. 금리 전망에 큰 영향을 줌" },
  { term: "연착륙", explanation: "물가를 잡으면서도 경기침체는 피하는 이상적인 경제 흐름" },
  { term: "경기침체", explanation: "생산·소비·고용이 함께 줄어드는 경제 상태" },
  // 빅테크·반도체
  { term: "빅테크", explanation: "애플·마이크로소프트·구글·아마존 같은 거대 정보기술 기업" },
  { term: "M7", aliases: ["매그니피센트"], explanation: "미국 증시를 이끄는 7개 빅테크(애플·마이크로소프트·알파벳·아마존·엔비디아·메타·테슬라)" },
  { term: "CAPEX", aliases: ["설비투자"], explanation: "기업이 공장·장비·데이터센터 등에 쓰는 투자 비용. 빅테크의 AI 투자 규모는 반도체 수요를 가늠하는 신호" },
  { term: "어닝", aliases: ["실적 발표"], explanation: "기업이 분기마다 발표하는 실적. 예상보다 좋으면 서프라이즈, 나쁘면 쇼크라고 부름" },
  { term: "HBM", explanation: "여러 겹으로 쌓아 데이터를 빠르게 처리하는 고성능 메모리. AI 반도체에 필수" },
  { term: "D램", aliases: ["DRAM"], explanation: "컴퓨터·스마트폰이 작업할 때 임시로 쓰는 메모리 반도체" },
  { term: "낸드", aliases: ["NAND"], explanation: "전원을 꺼도 데이터가 남는 저장용 메모리 반도체 (SSD 등에 사용)" },
  { term: "파운드리", explanation: "다른 회사가 설계한 반도체를 대신 만들어 주는 위탁생산 사업" },
  { term: "패키징", explanation: "만들어진 반도체 칩을 보호하고 연결해 쓸 수 있는 부품으로 완성하는 공정" },
  { term: "EUV", explanation: "아주 미세한 반도체 회로를 그리는 첨단 노광 장비·기술" },
  { term: "ASML", explanation: "EUV 장비를 독점 생산하는 네덜란드의 반도체 장비 기업" },
  { term: "TSMC", explanation: "대만의 세계 최대 반도체 위탁생산(파운드리) 기업" },
  // 무역·규제
  { term: "관세", explanation: "수입품에 붙이는 세금. 올리면 수입품 가격과 기업 비용이 오름" },
  { term: "수출통제", aliases: ["수출 통제", "수출 금지", "반도체 규제"], explanation: "특정 국가나 기업에 첨단 기술·제품을 팔지 못하게 막는 정부 규제" },
];

const isAscii = (s: string) => /^[\x20-\x7e]+$/.test(s);

function hasEntry(text: string, word: string): boolean {
  const t = text.toLowerCase();
  const w = word.toLowerCase();
  if (!isAscii(word)) return t.includes(w);
  // 영문은 다른 영문·숫자 사이에 낀 경우를 제외한다 (예: ETF가 'BETFAIR' 안에 있는 경우)
  let from = 0;
  for (;;) {
    const i = t.indexOf(w, from);
    if (i < 0) return false;
    if (!/[a-z0-9]/.test(t[i - 1] ?? "") && !/[a-z0-9]/.test(t[i + w.length] ?? "")) return true;
    from = i + 1;
  }
}

// 글에 나온 용어 풀이를 찾는다 (처음 나온 순서, 최대 max개)
export function findGlossary(text: string, max = 6): { term: string; explanation: string }[] {
  const hits: { term: string; explanation: string; at: number }[] = [];
  const lower = text.toLowerCase();
  for (const e of GLOSSARY) {
    const words = [e.term, ...(e.aliases ?? [])];
    const found = words.filter((w) => hasEntry(text, w)).map((w) => lower.indexOf(w.toLowerCase()));
    if (found.length) hits.push({ term: e.term, explanation: e.explanation, at: Math.min(...found.filter((i) => i >= 0), Infinity) });
  }
  return hits.sort((a, b) => a.at - b.at).slice(0, max).map(({ term, explanation }) => ({ term, explanation }));
}
