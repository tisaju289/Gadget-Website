ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS auto_image_optimization boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS image_quality integer NOT NULL DEFAULT 78;

ALTER TABLE public.site_settings
ADD CONSTRAINT site_settings_image_quality_range
CHECK (image_quality BETWEEN 45 AND 90);