-- ============================================================
-- CarInsight (카인사이트) Supabase DDL
-- 앱 구조 기준: defaultCars(danawa-default-cars.json) + 찜 목록/찜한 차량 비교
-- Supabase 대시보드 > SQL Editor에서 전체 실행
-- ============================================================

-- [1] 사용자 프로필 (auth.users와 1:1)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  preferred_lifestyle TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [2] 차량 마스터 (앱 Car 타입 / danawa-default-cars.json 구조)
-- id: 앱·다나와에서 사용하는 문자열 ID (예: danawa-4563-0, tucson-hybrid)
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price INTEGER NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'ev', 'lpg')),
  category TEXT NOT NULL CHECK (category IN ('sedan', 'suv', 'mpv')),
  year INTEGER NOT NULL,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  lifestyles TEXT[] DEFAULT '{}',
  origin TEXT NOT NULL CHECK (origin IN ('domestic', 'import')),
  spec_price INTEGER DEFAULT 5 CHECK (spec_price >= 0 AND spec_price <= 100),
  spec_fuel INTEGER DEFAULT 5 CHECK (spec_fuel >= 0 AND spec_fuel <= 100),
  spec_design INTEGER DEFAULT 5 CHECK (spec_design >= 0 AND spec_design <= 100),
  spec_space INTEGER DEFAULT 5 CHECK (spec_space >= 0 AND spec_space <= 100),
  spec_safety INTEGER DEFAULT 5 CHECK (spec_safety >= 0 AND spec_safety <= 100),
  ai_comment TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE cars IS '앱 defaultCars / danawa-default-cars.json과 동일 구조. id는 문자열(다나와 ID 또는 슬러그).';

-- [3] 찜하기 (찜 목록·찜한 차량 비교용)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id TEXT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_car_id ON favorites (car_id);

-- [4] 채팅(상담) 로그
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 cars 테이블에 컬럼이 없을 수 있음(이전 스키마) → 없으면 추가
ALTER TABLE cars ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS lifestyles TEXT[] DEFAULT '{}';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS spec_price INTEGER DEFAULT 5;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS spec_fuel INTEGER DEFAULT 5;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS spec_design INTEGER DEFAULT 5;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS spec_space INTEGER DEFAULT 5;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS spec_safety INTEGER DEFAULT 5;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS ai_comment TEXT;

-- 인덱스 (검색·필터·정렬)
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars (price);
CREATE INDEX IF NOT EXISTS idx_cars_origin ON cars (origin) WHERE origin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cars_category ON cars (category);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars (fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_view_count ON cars (view_count DESC);
CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON cars (brand, model);

-- 텍스트 검색 (선택)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_cars_model_trgm ON cars USING gin (model gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cars_brand_trgm ON cars USING gin (brand gin_trgm_ops);

-- RLS (MVP: 비활성화. 필요 시 테이블별로 ENABLE 후 정책 추가)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs DISABLE ROW LEVEL SECURITY;

-- 가입 시 profiles 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 시드 예시 (선택): danawa-default-cars.json 일부를 INSERT
-- 실제 시드는 scripts/seed-cars-from-json.ts 등으로 bulk insert 권장
-- ============================================================
/*
INSERT INTO cars (
  id, brand, model, price, fuel_type, category, year, image_url,
  tags, lifestyles, origin, spec_price, spec_fuel, spec_design, spec_space, spec_safety,
  ai_comment, view_count
) VALUES
  ('danawa-4563-0', 'KIA', '쏘렌토', 3580, 'hybrid', 'suv', 2023, 'http://autoimg.danawa.com/photo/4563/model_200.png',
   ARRAY['KIA','SUV'], ARRAY[]::TEXT[], 'domestic', 70, 50, 5, 5, 5,
   '2023년 출시. 중형SUV 가솔린/디젤.', 0),
  ('danawa-4684-1', 'KIA', '스포티지', 2793, 'hybrid', 'suv', 2024, 'http://autoimg.danawa.com/photo/4684/model_200.png',
   ARRAY['KIA','SUV'], ARRAY[]::TEXT[], 'domestic', 70, 40, 5, 5, 5,
   '2024년 출시. 중형SUV.', 0)
ON CONFLICT (id) DO NOTHING;
*/
