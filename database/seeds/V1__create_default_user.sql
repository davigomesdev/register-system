INSERT INTO users (
    id,
    name,
    enc_cpf_cnpj,
    email,
    phone,
    password_hash,
    type,
    status,
    created_at,
    updated_at
) VALUES (
    7516570974217568256,
    'Default User',
    'Jn0UJPNHdg/KyqdCScNkIa8T9vQQzE4ghLOTbTD5B07Tx5QCJanl',
    'user@email.local',
    '85999999999',
    '$argon2id$v=19$m=65536,p=4,t=3$nxvY6heL6juhOP3uSSZ5BQ$YLr7r5Sj8UAKGhpFua2tVqeAFP7u8k9UTb+5IgWZEtY',
    'MASTER',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
