-- ==============================================================================
-- V12__add_chinese_admin_user.sql: Seed Chinese Administrator Account
-- Username: 管理员
-- Password: 管理员密码
-- Roles: ADMIN, MANAGER
-- ==============================================================================

INSERT INTO users (username, password_hash, full_name, email, phone, status)
VALUES (
    '管理员',
    '$2a$10$qnaGs/Kj/AaZ4v2E161YfO/UWfCHzYQ2h.6WWKK82khjt5SjkLkWq',
    '系统管理员',
    'admin_zh@wifim-factory.com',
    '+86-13800000000',
    'ACTIVE'
)
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    status = 'ACTIVE',
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username = '管理员'
  AND r.name IN ('ADMIN', 'MANAGER')
ON CONFLICT DO NOTHING;
