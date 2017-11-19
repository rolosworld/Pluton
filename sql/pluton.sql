-- Public paths
INSERT INTO path_authorizations ("path") VALUES
    ('/account/login'),
    ('/account/logout'),
    ('/jsonrpcv2')
;

INSERT INTO path_authorizations ("role","path") VALUES
    (2, '/ws')
;

-- These are the linux users in which the backups will run
-- The password will be encrypted with a SHA1 of the user password generated everytime the user logs in
--   The decrypt password will be split between the Session and Cookie
--   To decrypt the system_users password we need to join the Session + Cookie parts and decrypt
--   The user should be able to reset the system_users passwords on the 'edit' form.
DROP TABLE IF EXISTS system_users CASCADE;
CREATE TABLE system_users (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    "owner" bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    UNIQUE( "owner", "username" )
);
CREATE TRIGGER update_system_users_updated BEFORE UPDATE
    ON system_users FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

