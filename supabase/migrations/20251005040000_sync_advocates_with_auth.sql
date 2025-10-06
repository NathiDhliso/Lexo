INSERT INTO advocates (
    id, 
    email, 
    full_name, 
    initials,
    practice_number,
    bar,
    year_admitted,
    hourly_rate,
    created_at, 
    updated_at
)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    COALESCE(
        raw_user_meta_data->>'initials',
        LEFT(COALESCE(raw_user_meta_data->>'full_name', email), 2)
    ) as initials,
    COALESCE(raw_user_meta_data->>'practice_number', 'TEMP-' || LEFT(id::text, 8)) as practice_number,
    COALESCE((raw_user_meta_data->>'bar')::bar_association, 'johannesburg'::bar_association) as bar,
    COALESCE((raw_user_meta_data->>'year_admitted')::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer) as year_admitted,
    COALESCE((raw_user_meta_data->>'hourly_rate')::decimal, 1500.00) as hourly_rate,
    created_at,
    updated_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM advocates)
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.advocates (
        id, 
        email, 
        full_name, 
        initials,
        practice_number,
        bar,
        year_admitted,
        hourly_rate,
        created_at, 
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(
            NEW.raw_user_meta_data->>'initials',
            LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 2)
        ),
        COALESCE(NEW.raw_user_meta_data->>'practice_number', 'TEMP-' || LEFT(NEW.id::text, 8)),
        COALESCE((NEW.raw_user_meta_data->>'bar')::bar_association, 'johannesburg'::bar_association),
        COALESCE((NEW.raw_user_meta_data->>'year_admitted')::integer, EXTRACT(YEAR FROM CURRENT_DATE)::integer),
        COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::decimal, 1500.00),
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
