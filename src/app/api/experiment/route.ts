import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Get experiment variant for a session
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const sessionId = searchParams.get('sessionId');

        if (!slug || !sessionId) {
            return NextResponse.json(
                { error: 'slug and sessionId required' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ variant: null });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get variant from DB function
        const { data, error } = await supabase.rpc('get_experiment_variant', {
            p_experiment_slug: slug,
            p_session_id: sessionId
        });

        if (error) {
            console.error('[Experiment Error]:', error);
            return NextResponse.json({ variant: null });
        }

        return NextResponse.json({ variant: data });

    } catch (error) {
        console.error('[Experiment API Error]:', error);
        return NextResponse.json({ variant: null });
    }
}

// Record a conversion
export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: 'Not configured' }, { status: 500 });
        }

        const body = await request.json();
        const {
            experimentSlug,
            sessionId,
            conversionType,
            conversionValue,
            metadata
        } = body;

        if (!experimentSlug || !sessionId) {
            return NextResponse.json(
                { error: 'experimentSlug and sessionId required' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get the experiment and assignment
        const { data: experiment } = await supabase
            .from('experiments')
            .select('id')
            .eq('slug', experimentSlug)
            .single();

        if (!experiment) {
            return NextResponse.json({ error: 'Experiment not found' }, { status: 404 });
        }

        const { data: assignment } = await supabase
            .from('experiment_assignments')
            .select('id, variant_id')
            .eq('experiment_id', experiment.id)
            .eq('session_id', sessionId)
            .single();

        if (!assignment) {
            return NextResponse.json({ error: 'No assignment found' }, { status: 404 });
        }

        // Record conversion
        const { error } = await supabase.from('experiment_conversions').insert({
            experiment_id: experiment.id,
            assignment_id: assignment.id,
            session_id: sessionId,
            variant_id: assignment.variant_id,
            conversion_type: conversionType || 'conversion',
            conversion_value: conversionValue || 0,
            metadata: metadata || {}
        });

        if (error) {
            console.error('[Conversion Error]:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Conversion API Error]:', error);
        return NextResponse.json(
            { error: 'Failed to record conversion' },
            { status: 500 }
        );
    }
}
