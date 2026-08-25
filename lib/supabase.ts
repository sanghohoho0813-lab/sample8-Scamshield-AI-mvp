/**
 * Supabase 연동 지점.
 *
 * MVP에서는 환경변수가 없으면 로컬 저장소(lib/storage.ts) 기반 데모 모드로 동작한다.
 * 실제 연동 시 `@supabase/supabase-js`를 설치하고 아래 팩토리에서 클라이언트를 생성해
 * storage.ts와 동일한 인터페이스(getHistory/saveAnalysis 등)로 교체하면 된다.
 * 스키마는 supabase/schema.sql 참고.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
