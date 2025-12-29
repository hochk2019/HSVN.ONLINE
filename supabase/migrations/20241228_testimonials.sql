-- Testimonials table for dynamic homepage section
-- Replaces hardcoded testimonials in Testimonials.tsx

CREATE TABLE IF NOT EXISTS testimonials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name text NOT NULL,
    author_title text,
    author_avatar text,
    content text NOT NULL,
    rating int DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    is_active boolean DEFAULT true,
    display_order int DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS Policy
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read active testimonials
CREATE POLICY "Public read active testimonials" ON testimonials
    FOR SELECT USING (is_active = true);

-- Admins can do anything
CREATE POLICY "Admins manage testimonials" ON testimonials
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials(display_order, created_at DESC);

-- Add some sample data
INSERT INTO testimonials (author_name, author_title, content, rating, display_order) VALUES
('Anh Minh', 'Nhân viên XNK, Công ty ABC', 'Phần mềm rất hữu ích, giúp tôi tiết kiệm nhiều thời gian khai báo hải quan. Giao diện đơn giản, dễ sử dụng.', 5, 1),
('Chị Lan', 'Kế toán, Công ty DEF', 'Tra cứu mã HS cực nhanh và chính xác. Đã dùng nhiều phần mềm khác nhưng đây là tiện lợi nhất.', 5, 2),
('Anh Hùng', 'Giám đốc, Công ty GHI', 'Đội ngũ hỗ trợ nhiệt tình. Phần mềm update liên tục theo quy định mới. Rất recommend!', 5, 3)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE testimonials IS 'Customer testimonials for homepage display';
