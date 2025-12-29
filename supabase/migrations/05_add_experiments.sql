-- A/B Testing Infrastructure
-- Experiments and feature flags for testing UI variations

-- Experiments table
CREATE TABLE IF NOT EXISTS experiments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic info
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Variants configuration
    variants JSONB NOT NULL DEFAULT '[
        {"id": "control", "name": "Control", "weight": 50},
        {"id": "variant", "name": "Variant", "weight": 50}
    ]',
    
    -- Targeting
    target_element VARCHAR(100), -- 'hero_cta', 'pricing_section', 'nav_layout'
    target_page VARCHAR(200), -- '/phan-mem', '/', etc. or null for all pages
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'running', 'paused', 'completed'
    
    -- Goals/Metrics
    primary_metric VARCHAR(50), -- 'click', 'conversion', 'time_on_page'
    
    -- Timeline
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Metadata
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiment assignments (which user sees which variant)
CREATE TABLE IF NOT EXISTS experiment_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(experiment_id, session_id)
);

-- Experiment conversions (track when goals are achieved)
CREATE TABLE IF NOT EXISTS experiment_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experiment_id UUID REFERENCES experiments(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES experiment_assignments(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    
    conversion_type VARCHAR(50), -- 'click', 'signup', 'download', 'purchase'
    conversion_value NUMERIC(10, 2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    converted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_slug ON experiments(slug);
CREATE INDEX IF NOT EXISTS idx_exp_assignments_experiment ON experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_exp_assignments_session ON experiment_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_exp_conversions_experiment ON experiment_conversions(experiment_id);

-- Enable RLS
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiment_conversions ENABLE ROW LEVEL SECURITY;

-- Policies for experiments (admin only)
CREATE POLICY "Admins can manage experiments"
    ON experiments
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Policies for assignments (public insert, admin read)
CREATE POLICY "Public can get assignments"
    ON experiment_assignments
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can read assignments"
    ON experiment_assignments
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policies for conversions
CREATE POLICY "Public can record conversions"
    ON experiment_conversions
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can read conversions"
    ON experiment_conversions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- View: Experiment results
CREATE OR REPLACE VIEW experiment_results AS
SELECT 
    e.id as experiment_id,
    e.name as experiment_name,
    e.slug,
    e.status,
    ea.variant_id,
    COUNT(DISTINCT ea.session_id) as participants,
    COUNT(DISTINCT ec.session_id) as conversions,
    ROUND(
        COUNT(DISTINCT ec.session_id)::NUMERIC / 
        NULLIF(COUNT(DISTINCT ea.session_id), 0) * 100, 
        2
    ) as conversion_rate,
    SUM(COALESCE(ec.conversion_value, 0)) as total_value
FROM experiments e
LEFT JOIN experiment_assignments ea ON e.id = ea.experiment_id
LEFT JOIN experiment_conversions ec ON ea.id = ec.assignment_id
GROUP BY e.id, e.name, e.slug, e.status, ea.variant_id
ORDER BY e.name, ea.variant_id;

-- Function: Get or create experiment assignment
CREATE OR REPLACE FUNCTION get_experiment_variant(
    p_experiment_slug VARCHAR(100),
    p_session_id VARCHAR(100)
)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_experiment experiments%ROWTYPE;
    v_variant_id VARCHAR(50);
    v_random NUMERIC;
    v_cumulative NUMERIC := 0;
    v_variant JSONB;
BEGIN
    -- Get experiment
    SELECT * INTO v_experiment 
    FROM experiments 
    WHERE slug = p_experiment_slug 
      AND status = 'running';
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Check existing assignment
    SELECT variant_id INTO v_variant_id
    FROM experiment_assignments
    WHERE experiment_id = v_experiment.id
      AND session_id = p_session_id;
    
    IF FOUND THEN
        RETURN v_variant_id;
    END IF;
    
    -- Assign new variant based on weights
    v_random := random() * 100;
    
    FOR v_variant IN SELECT * FROM jsonb_array_elements(v_experiment.variants)
    LOOP
        v_cumulative := v_cumulative + (v_variant->>'weight')::NUMERIC;
        IF v_random <= v_cumulative THEN
            v_variant_id := v_variant->>'id';
            EXIT;
        END IF;
    END LOOP;
    
    -- Fallback to first variant
    IF v_variant_id IS NULL THEN
        v_variant_id := v_experiment.variants->0->>'id';
    END IF;
    
    -- Save assignment
    INSERT INTO experiment_assignments (experiment_id, session_id, variant_id)
    VALUES (v_experiment.id, p_session_id, v_variant_id)
    ON CONFLICT (experiment_id, session_id) DO NOTHING;
    
    RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default experiment for testing
INSERT INTO experiments (name, slug, description, target_element, variants, status)
VALUES (
    'Hero CTA Test',
    'hero-cta-test',
    'Test different CTA button text on homepage',
    'hero_cta',
    '[
        {"id": "control", "name": "Xem phần mềm", "weight": 50},
        {"id": "variant", "name": "Tải miễn phí ngay", "weight": 50}
    ]',
    'draft'
) ON CONFLICT (slug) DO NOTHING;
