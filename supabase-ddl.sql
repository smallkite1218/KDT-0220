-- ============================================================
-- CarInsight (카인사이트) Supabase DDL
-- 기획서 / 화면설계서 / 스키마설계서 기준
-- Supabase 대시보드 > SQL Editor에서 전체 실행
-- ============================================================

-- [1] 사용자 프로필 테이블 (auth.users와 1:1 관계)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  preferred_lifestyle TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [2] 통합 차량 마스터 데이터 테이블 (국산 및 해외차 통합)
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  brand_origin TEXT NOT NULL,
  model_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  fuel_type TEXT NOT NULL,
  efficiency FLOAT,
  horsepower INTEGER,
  displacement INTEGER,
  price_score INTEGER DEFAULT 5,
  efficiency_score INTEGER DEFAULT 5,
  design_score INTEGER DEFAULT 5,
  space_score INTEGER DEFAULT 5,
  safety_score INTEGER DEFAULT 5,
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- [3] 찜하기 테이블
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- [4] Gemini 상담 로그 테이블
CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars (price);
CREATE INDEX IF NOT EXISTS idx_cars_origin_category ON cars (brand_origin, category);
CREATE INDEX IF NOT EXISTS idx_cars_fuel ON cars (fuel_type);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_cars_model_search ON cars USING gin (model_name gin_trgm_ops);

-- RLS (MVP: 비활성화)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs DISABLE ROW LEVEL SECURITY;

-- 가입 시 profiles 자동 생성
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
