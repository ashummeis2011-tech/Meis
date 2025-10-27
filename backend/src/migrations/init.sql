-- Meis Friend-Finding App Database Schema
-- PostgreSQL Database Migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    age INTEGER,
    bio TEXT,
    photo_url VARCHAR(500),
    custom_interests TEXT,
    is_active BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT age_range CHECK (age IS NULL OR (age >= 13 AND age <= 20))
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_profile_completed ON users(profile_completed);

-- Table: interest_tags
CREATE TABLE interest_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Table: user_interest_tags (junction table)
CREATE TABLE user_interest_tags (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_tag_id INTEGER NOT NULL REFERENCES interest_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, interest_tag_id)
);

-- Indexes for user_interest_tags
CREATE INDEX idx_user_interest_tags_user_id ON user_interest_tags(user_id);
CREATE INDEX idx_user_interest_tags_tag_id ON user_interest_tags(interest_tag_id);

-- Table: swipes
CREATE TABLE swipes (
    id SERIAL PRIMARY KEY,
    swiper_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    swiped_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('left', 'right')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_user_id, swiped_user_id)
);

-- Indexes for swipes table
CREATE INDEX idx_swipes_swiper_user_id ON swipes(swiper_user_id);
CREATE INDEX idx_swipes_swiped_user_id ON swipes(swiped_user_id);
CREATE INDEX idx_swipes_composite ON swipes(swiper_user_id, swiped_user_id);

-- Table: matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (user1_id != user2_id)
);

-- Indexes for matches table
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_composite ON matches(user1_id, user2_id);

-- Unique constraint to prevent duplicate matches (regardless of order)
CREATE UNIQUE INDEX idx_matches_unique ON matches(
    LEAST(user1_id, user2_id),
    GREATEST(user1_id, user2_id)
);

-- Table: messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(10) NOT NULL CHECK (message_type IN ('text', 'image', 'emoji')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages table
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_match_created ON messages(match_id, created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
