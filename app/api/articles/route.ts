// 읽기 전용 API: 현재 기사 목록과 점수를 돌려준다. 텔레그램 전송 기능은 여기에 없다.
import { getSnapshot } from "@/lib/snapshot";

export async function GET() {
  try {
    const s = await getSnapshot();
    return Response.json({ updatedAt: s.updatedAt, items: s.items, dropped: s.dropped });
  } catch {
    // 오류 상세는 숨긴다
    return Response.json({ error: "기사를 가져오지 못했습니다." }, { status: 502 });
  }
}
