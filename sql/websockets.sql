-- ------------ --
--  WEBSOCKETS  --
-- ------------ --
DROP TABLE IF EXISTS user_websockets CASCADE;
CREATE TABLE user_websockets (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    "user" bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    "websocket" character varying(255) NOT NULL,
    "server" smallint NOT NULL
);
CREATE TRIGGER update_user_websockets_updated BEFORE UPDATE
    ON user_websockets FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();
