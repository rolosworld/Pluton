-- Public paths
INSERT INTO path_authorizations ("path") VALUES
    ('/account/login'),
    ('/account/logout'),
    ('/jsonrpcv2')
;

INSERT INTO path_authorizations ("role","path") VALUES
    (2, '/ws')
;
