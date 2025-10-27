-- Seed data for predefined interest tags
INSERT INTO interest_tags (name) VALUES
    ('Sports'),
    ('Music'),
    ('Gaming'),
    ('Art'),
    ('Reading'),
    ('Movies'),
    ('Cooking'),
    ('Travel'),
    ('Photography'),
    ('Dancing'),
    ('Fitness'),
    ('Technology'),
    ('Fashion'),
    ('Nature'),
    ('Pets')
ON CONFLICT (name) DO NOTHING;
