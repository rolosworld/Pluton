CREATE LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TABLE IF EXISTS user_registrations CASCADE;
CREATE TABLE user_registrations (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    token character varying(36) NOT NULL UNIQUE,
    username character varying(255) NOT NULL UNIQUE,
    password character varying(255) NOT NULL
);
CREATE TRIGGER update_user_registrations_updated BEFORE UPDATE
    ON user_registrations FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    active smallint NOT NULL DEFAULT 1,
    username character varying(255) NOT NULL UNIQUE,
    password character varying(255) NOT NULL
);
CREATE TRIGGER update_users_updated BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

DROP TABLE IF EXISTS roles CASCADE;
CREATE TABLE roles (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    name character varying(20) NOT NULL UNIQUE
);
CREATE TRIGGER update_roles_updated BEFORE UPDATE
    ON roles FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

DROP TABLE IF EXISTS memberships CASCADE;
CREATE TABLE memberships (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    "user" bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    "role" bigint NOT NULL REFERENCES roles ON DELETE CASCADE,
    UNIQUE( "user", "role" )
);
CREATE TRIGGER update_memberships_updated BEFORE UPDATE
    ON memberships FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

DROP TABLE IF EXISTS path_authorizations CASCADE;
CREATE TABLE path_authorizations (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    "role" bigint REFERENCES roles ON DELETE CASCADE,
    "path" character varying(250) NOT NULL,
    UNIQUE( "role", "path" )
);
CREATE TRIGGER update_path_authorizations_updated BEFORE UPDATE
    ON path_authorizations FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

INSERT INTO roles (name) VALUES
    ('admin'),
    ('user');

-- Protected paths
INSERT INTO path_authorizations ("role","path") VALUES
    (1, '/'),
    (2, '/account')
;
