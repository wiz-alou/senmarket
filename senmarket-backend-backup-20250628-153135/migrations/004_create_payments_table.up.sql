CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 200.00,
    currency VARCHAR(3) DEFAULT 'XOF',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('orange_money', 'wave', 'free_money', 'card')),
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_listing_id ON payments(listing_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_payments_method ON payments(payment_method);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX idx_payments_completed ON payments(completed_at DESC) WHERE status = 'completed';
