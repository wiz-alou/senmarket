CREATE TABLE sms_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sms_phone ON sms_verifications(phone);
CREATE INDEX idx_sms_code ON sms_verifications(code);
CREATE INDEX idx_sms_expires ON sms_verifications(expires_at) WHERE verified = FALSE;
