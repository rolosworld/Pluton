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


-- Cron type of schedule (* * * * *) => (minute hour day_of_month month day_of_week)
-- minute (0 - 59)
-- hour (0 - 23)
-- day of month (1 - 31)
-- month (1 - 12)
-- day of week (0 - 6) (Sunday=0 or 7)
DROP TABLE IF EXISTS schedules CASCADE;
CREATE TABLE schedules (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    "creator" bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    "name" character varying(255) NOT NULL,
    "minute" smallint DEFAULT NULL,
    "hour" smallint DEFAULT NULL,
    "day_of_month" smallint DEFAULT NULL,
    "month" smallint DEFAULT NULL,
    "day_of_week" smallint DEFAULT NULL,
    UNIQUE( "name" ),
    UNIQUE( "minute", "hour", "day_of_month", "month", "day_of_week" )
);
CREATE TRIGGER update_schedules_updated BEFORE UPDATE
    ON schedules FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

-- name must be unique since that'll be the backup folder name
DROP TABLE IF EXISTS backups CASCADE;
CREATE TABLE backups (
    id bigserial NOT NULL PRIMARY KEY,
    created timestamp NOT NULL DEFAULT current_timestamp,
    updated timestamp NOT NULL DEFAULT current_timestamp,
    "creator" bigint NOT NULL REFERENCES users ON DELETE CASCADE,
    system_user bigint NOT NULL REFERENCES system_users ON DELETE CASCADE,
    schedule bigint NOT NULL REFERENCES schedules ON DELETE CASCADE,
    "name" character varying(255) NOT NULL,
    folders text NOT NULL,
    UNIQUE( "name" )
);
CREATE TRIGGER update_backups_updated BEFORE UPDATE
    ON backups FOR EACH ROW EXECUTE PROCEDURE
    update_updated_column();

