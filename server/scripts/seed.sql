-- 插入 AI 渠道（请替换为你的真实 API Key）
INSERT INTO ai_channels (name, base_url, api_key, model, is_active, priority)
VALUES ('wishub-x6-DG', 'https://wishub-x6.ctyun.cn/coding/v1', 'cp_a294192146614ecda05f0d5f19b333a0', 'glm-5', true, 10)
ON CONFLICT DO NOTHING;

-- 插入测试用密钥（50次额度）
INSERT INTO keys (key, total) VALUES ('YC-TEST00000001', 50)
ON CONFLICT DO NOTHING;

-- 插入测试用密钥（200次额度）
INSERT INTO keys (key, total) VALUES ('YC-TEST00000002', 200)
ON CONFLICT DO NOTHING;
