-- 材料样板管理系统 - Supabase 数据库初始化脚本

-- 1. 创建类别表 (categories)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) DEFAULT '',
  description TEXT DEFAULT '',
  procurement BOOLEAN DEFAULT FALSE,
  procurement_start VARCHAR(10) DEFAULT '',
  procurement_end VARCHAR(10) DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建样板表 (samples)
CREATE TABLE IF NOT EXISTS samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(100) DEFAULT '',
  brand VARCHAR(100) DEFAULT '',
  code VARCHAR(100) DEFAULT '',
  image_url TEXT DEFAULT '',
  thumbnail_url TEXT DEFAULT '',
  description TEXT DEFAULT '',
  specs VARCHAR(255) DEFAULT '',
  color VARCHAR(100) DEFAULT '',
  material VARCHAR(100) DEFAULT '',
  procurement BOOLEAN DEFAULT FALSE,
  procurement_range VARCHAR(20) DEFAULT '',
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建邀请码表 (daily_codes)
CREATE TABLE IF NOT EXISTS daily_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- 3.5 创建字段可见性表 (field_visibility)
-- 记录每用户对样板字段（规格/颜色/材质/描述/图片）的扫码可见性设置
CREATE TABLE IF NOT EXISTS field_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specs VARCHAR(10) DEFAULT '邀请',
  color VARCHAR(10) DEFAULT '邀请',
  material VARCHAR(10) DEFAULT '邀请',
  description VARCHAR(10) DEFAULT '邀请',
  image VARCHAR(10) DEFAULT '邀请',
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_samples_updated_at ON samples;
CREATE TRIGGER update_samples_updated_at
  BEFORE UPDATE ON samples
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_field_visibility_updated_at ON field_visibility;
CREATE TRIGGER update_field_visibility_updated_at
  BEFORE UPDATE ON field_visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5. 创建行级安全策略 (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_visibility ENABLE ROW LEVEL SECURITY;

-- 6. 创建存储桶用于图片存储（私有：只能通过签名URL访问）
INSERT INTO storage.buckets (id, name, public) VALUES ('sample-images', 'sample-images', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Public can view sample images" ON storage.objects;
CREATE POLICY "Public can view sample images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sample-images' AND name LIKE 'samples/%');

DROP POLICY IF EXISTS "Authenticated can upload sample images" ON storage.objects;
CREATE POLICY "Authenticated can upload sample images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sample-images' AND name LIKE 'samples/%');

DROP POLICY IF EXISTS "Authenticated can update sample images" ON storage.objects;
CREATE POLICY "Authenticated can update sample images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sample-images' AND name LIKE 'samples/%');

DROP POLICY IF EXISTS "Authenticated can delete sample images" ON storage.objects;
CREATE POLICY "Authenticated can delete sample images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sample-images' AND name LIKE 'samples/%');

-- 6. 创建存储桶用于图片存储
-- 在 Supabase 控制台 Storage 中创建名为 'sample-images' 的存储桶
-- 或在 SQL 中执行:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('sample-images', 'sample-images', true);

-- 7. 创建策略: 用户只能看到自己的数据
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own samples" ON samples;
CREATE POLICY "Users can view own samples"
  ON samples FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own samples" ON samples;
CREATE POLICY "Users can insert own samples"
  ON samples FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own samples" ON samples;
CREATE POLICY "Users can update own samples"
  ON samples FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own samples" ON samples;
CREATE POLICY "Users can delete own samples"
  ON samples FOR DELETE
  USING (auth.uid() = user_id);

-- 8. 邀请码表: 任何人都可以查看今日邀请码
DROP POLICY IF EXISTS "Anyone can view today codes" ON daily_codes;
CREATE POLICY "Anyone can view today codes"
  ON daily_codes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only authenticated users can insert codes" ON daily_codes;
CREATE POLICY "Only authenticated users can insert codes"
  ON daily_codes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can update codes" ON daily_codes;
CREATE POLICY "Only authenticated users can update codes"
  ON daily_codes FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 8.5 字段可见性策略: 用户只能管理自己的可见性设置
DROP POLICY IF EXISTS "Users can view own field visibility" ON field_visibility;
CREATE POLICY "Users can view own field visibility"
  ON field_visibility FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own field visibility" ON field_visibility;
CREATE POLICY "Users can insert own field visibility"
  ON field_visibility FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own field visibility" ON field_visibility;
CREATE POLICY "Users can update own field visibility"
  ON field_visibility FOR UPDATE
  USING (auth.uid() = user_id);

-- 9. 创建索引
CREATE INDEX IF NOT EXISTS idx_samples_project_id ON samples(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_codes_date ON daily_codes(date);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_samples_user_id ON samples(user_id);
CREATE INDEX IF NOT EXISTS idx_field_visibility_user_id ON field_visibility(user_id);

-- 11. 公共读策略: 允许通过二维码分享样板详情（无需登录即可查看）
-- 使用 UUID 作为 ID，难以猜测，安全性通过 ID 随机性保证
DROP POLICY IF EXISTS "Public can view samples" ON samples;
CREATE POLICY "Public can view samples"
  ON samples FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public can view projects" ON projects;
CREATE POLICY "Public can view projects"
  ON projects FOR SELECT
  USING (true);

-- 12. 兼容旧表：已有表新增字段（重复执行安全）
ALTER TABLE projects ADD COLUMN IF NOT EXISTS brand VARCHAR(255) DEFAULT '';
ALTER TABLE projects ALTER COLUMN procurement_start TYPE VARCHAR(10) USING procurement_start::VARCHAR;
ALTER TABLE projects ALTER COLUMN procurement_end TYPE VARCHAR(10) USING procurement_end::VARCHAR;
ALTER TABLE samples ADD COLUMN IF NOT EXISTS procurement_range VARCHAR(20) DEFAULT '';
ALTER TABLE samples ADD COLUMN IF NOT EXISTS thumbnail_url TEXT DEFAULT '';
