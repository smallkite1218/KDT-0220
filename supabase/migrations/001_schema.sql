-- ============================================================
-- CarInsight (카인사이트) Supabase 스키마
-- 기획서 / 화면설계서 / 스키마설계서 기준
-- ============================================================

-- [1] 사용자 프로필 테이블 (auth.users와 1:1 관계)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  preferred_lifestyle TEXT[], -- 사용자 선호 라이프스타일 키워드 (출퇴근, 차박 등)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [2] 통합 차량 마스터 데이터 테이블 (국산 및 해외차 통합)
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,          -- 브랜드 (현대, BMW, 테슬라, 포르쉐 등)
  brand_origin TEXT NOT NULL,   -- 'Domestic'(국산), 'Imported'(해외) 구분
  model_name TEXT NOT NULL,     -- 모델명 (아반떼, 911 카레라 등)
  price INTEGER NOT NULL,       -- 차량 가격 (만원 단위, 55,000까지 수용)
  category TEXT NOT NULL,       -- SUV, 세단, 쿠페, 컨버터블 등
  fuel_type TEXT NOT NULL,      -- 가솔린, 디젤, 전기, 하이브리드, 수소
  efficiency FLOAT,             -- 연비 (km/L 또는 km/kWh)
  horsepower INTEGER,           -- 출력 (hp)
  displacement INTEGER,         -- 배기량 (cc, 전기차는 0)
  -- Gemini 분석 지표 (1~10점 사이 AI 산출 결과)
  price_score INTEGER DEFAULT 5,      -- 예산 대비 가치 점수
  efficiency_score INTEGER DEFAULT 5, -- 에너지 효율 점수
  design_score INTEGER DEFAULT 5,     -- 디자인 및 브랜드 이미지 점수
  space_score INTEGER DEFAULT 5,      -- 거주성 및 적재 공간 점수
  safety_score INTEGER DEFAULT 5,     -- 안전 사양 및 기술 점수
  image_url TEXT,               -- 차량 고해상도 이미지 URL
  view_count INTEGER DEFAULT 0, -- 실시간 인기 지표 산출용 조회수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [3] 찜하기 (Favorites) 테이블
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id) -- 중복 찜 방지
);

-- [4] Gemini 상담 로그 테이블
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 인덱스 (Index) 설계
-- ============================================================

-- 1. 광범위 가격 검색 최적화 (0~5억 5천 구간 검색 속도 향상)
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars (price);

-- 2. 국산/해외 및 차종 복합 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_cars_origin_category ON cars (brand_origin, category);

-- 3. 연료 타입 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_cars_fuel ON cars (fuel_type);

-- 4. 사용자별 찜 목록(북마크) 로딩 최적화
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);

-- 5. 차량 모델명 부분 일치 검색 최적화 (Fuzzy Search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_cars_model_search ON cars USING gin (model_name gin_trgm_ops);

-- ============================================================
-- RLS (Row Level Security) 설정
-- MVP 개발 단계의 속도를 위해 보안 정책을 일시적으로 해제합니다.
-- 프로덕션에서는 RLS를 활성화하고 정책을 정의하세요.
-- ============================================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- (선택) auth.users 가입 시 profiles 자동 생성 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
