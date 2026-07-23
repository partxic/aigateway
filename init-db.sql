-- D1 数据库初始化 SQL 脚本文件, 可用于一键清空数据或初始化一个 D1 数据库
DROP TABLE IF EXISTS users;

CREATE TABLE
    users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        auth TEXT NOT NULL, -- SHA256
        role TEXT NOT NULL DEFAULT 'user' -- admin | user
    );

INSERT INTO
    users (id, name, auth, role)
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        'admin',
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        'admin'
    );

DROP TABLE IF EXISTS providers;

CREATE TABLE
    providers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        key TEXT NOT NULL
    );