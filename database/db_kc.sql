DO $$
DECLARE
    v_audit JSONB := '{"record_status":"", "current_number":"", "overrides":[], "branch_code":"", "inputter":"SYSTEM.OWNER", "datetime":"20260101000001", "authorisers":[{"inputter":"SYSTEM.OWNER", "datetime":"20260101000001"}]}';
BEGIN


	DROP TABLE IF EXISTS sys_eb_lookup CASCADE;     CREATE TABLE sys_eb_lookup (recid CHARACTER VARYING(35) PRIMARY KEY, json_data JSONB DEFAULT NULL, json_audit JSONB DEFAULT NULL);
	DROP TABLE IF EXISTS sys_modules CASCADE;       CREATE TABLE sys_modules (recid CHARACTER VARYING(35) PRIMARY KEY, json_data JSONB DEFAULT NULL, json_audit JSONB DEFAULT NULL);
	DROP TABLE IF EXISTS sys_applications CASCADE;  CREATE TABLE sys_applications (recid CHARACTER VARYING(35) PRIMARY KEY, json_data JSONB DEFAULT NULL, json_audit JSONB DEFAULT NULL);
	DROP TABLE IF EXISTS sys_privileges CASCADE;    CREATE TABLE sys_privileges (recid CHARACTER VARYING(35) PRIMARY KEY, json_data JSONB DEFAULT NULL, json_audit JSONB DEFAULT NULL);
	DROP TABLE IF EXISTS sys_users CASCADE;         CREATE TABLE sys_users (recid CHARACTER VARYING(35) PRIMARY KEY, json_data JSONB DEFAULT NULL, json_audit JSONB DEFAULT NULL);
	DROP TABLE IF EXISTS sys_user_password CASCADE; CREATE TABLE sys_user_password (recid CHARACTER VARYING(35) PRIMARY KEY, json_data JSONB DEFAULT NULL, json_audit JSONB DEFAULT NULL);
	
	
	INSERT INTO sys_eb_lookup VALUES
	    ('APP.PERM*VIEW', '{"recid":"APPLICATION.PERMISSION*VIEW", "c1":"", "c2":"View", "c3":"Y"}', v_audit),
	    ('APP.PERM*CREATE', '{"recid":"APPLICATION.PERMISSION*CRETATE", "c1":"", "c2":"Create", "c3":"Y"}', v_audit),
	    ('APP.PERM*EDIT', '{"recid":"APPLICATION.PERMISSION*EDIT", "c1":"", "c2":"Edit", "c3":"Y"}', v_audit),
	    ('APP.PERM*REVERSE', '{"recid":"APPLICATION.PERMISSION*REVERSE", "c1":"", "c2":"Reverse", "c3":"Y"}', v_audit),
	    ('APP.PERM*DELETE', '{"recid":"APPLICATION.PERMISSION*DELETE", "c1":"", "c2":"Delete", "c3":"Y"}', v_audit),
	    ('APP.PERM*APPROVE', '{"recid":"APPLICATION.PERMISSION*APPROVE", "c1":"", "c2":"Approve", "c3":"Y"}', v_audit),
	    
	    ('USR.STATUS*ACTIVE', '{"recid":"USER.STATUS*ACTIVE", "c1":"", "c2":"Active", "c3":"Y"}', v_audit),
	    ('USR.STATUS*EXPIRED', '{"recid":"USER.STATUS*EXPIRED", "c1":"", "c2":"Expired", "c3":"Y"}', v_audit),
	    ('USR.STATUS*INACTIVE', '{"recid":"USER.STATUS*INACTIVE", "c1":"", "c2":"Inactive", "c3":"Y"}', v_audit),
	    ('USR.STATUS*LOCKED', '{"recid":"USER.STATUS*LOCKED", "c1":"", "c2":"Locked", "c3":"Y"}', v_audit),
	    ('USR.STATUS*RESET', '{"recid":"USER.STATUS*RESET", "c1":"", "c2":"Reset Password", "c3":"Y"}', v_audit);
	
	INSERT INTO sys_modules VALUES
	    ('CORE.SYSTEM', '{"recid":"CORE.SYSTEM", "c1":"Core System Module", "c2":"/core-system", "c3":"Y"}', v_audit);
	
	INSERT INTO sys_applications VALUES
	    ('SYSTEM.EBLOOKUP', '{"recid":"SYSTEM.EBLOOKUP", "c1":"CORE.SYSTEM", "c2":"System EB Lookup Item Lists", "c3":"/eb-lookup", "c4":["APP.PERM*VIEW", "APP.PERM*CRETATE", "APP.PERM*EDIT", "APP.PERM*REVERSE", "APP.PERM*DELETE", "APP.PERM*APPROVE"], "c5":"Y"}', v_audit),
	    ('SYSTEM.MODULES', '{"recid":"SYSTEM.MODULES", "c1":"CORE.SYSTEM", "c2":"System Modules", "c3":"/modules", "c4":["APP.PERM*VIEW", "APP.PERM*CRETATE", "APP.PERM*EDIT", "APP.PERM*REVERSE", "APP.PERM*DELETE", "APP.PERM*APPROVE"], "c5":"Y"}', v_audit),
	    ('SYSTEM.APPLICATIONS', '{"recid":"SYSTEM.APPLICATIONS", "c1":"CORE.SYSTEM", "c2":"System Applications", "c3":"/applications", "c4":["APP.PERM*VIEW", "APP.PERM*CRETATE", "APP.PERM*EDIT", "APP.PERM*REVERSE", "APP.PERM*DELETE", "APP.PERM*APPROVE"], "c5":"Y"}', v_audit),
	    ('SYSTEM.PRIVILEGES', '{"recid":"SYSTEM.PRIVILEGES", "c1":"CORE.SYSTEM", "c2":"System Privileges", "c3":"/privileges", "c4":["APP.PERM*VIEW", "APP.PERM*CRETATE", "APP.PERM*EDIT", "APP.PERM*REVERSE", "APP.PERM*DELETE", "APP.PERM*APPROVE"], "c5":"Y"}', v_audit),
	    ('SYSTEM.USERS', '{"recid":"SYSTEM.USERS", "c1":"CORE.SYSTEM", "c2":"System Users", "c3":"/users", "c4":["APP.PERM*VIEW", "APP.PERM*CRETATE", "APP.PERM*EDIT", "APP.PERM*REVERSE", "APP.PERM*DELETE", "APP.PERM*APPROVE"], "c5":"Y"}', v_audit);
	
	INSERT INTO sys_privileges VALUES
	    ('CORE.SYSTEM', '{"recid":"CORE.SYSTEM", "c1":"System Owner", "c2":"Y", "c3":{ "Core System":{ "SYSTEM.EBLOOKUP":{"label":"EB Lookup", "no_auth":"0"}, "SYSTEM.MODULES":{"label":"Modules", "no_auth":"0"}, "SYSTEM.APPLICATIONS":{"label":"Applications", "no_auth":"0"}, "SYSTEM.PRIVILEGES":{"label":"Privileges", "no_auth":"0"}, "SYSTEM.USERS":{"label":"User Setup", "no_auth":"0"} }}}', v_audit),
	    ('20260010001', '{"recid":"20260010001", "c1":"System Administrator", "c2":"Y", "c3":{ "Core System":{ "SYSTEM.MODULES":{"label":"Modules", "no_auth":"0"}, "SYSTEM.APPLICATIONS":{"label":"Applications", "no_auth":"0"}, "SYSTEM.PRIVILEGES":{"label":"Privileges", "no_auth":"0"}, "SYSTEM.USERS":{"label":"User Setup", "no_auth":"0"} }}}', v_audit);
	
	INSERT INTO sys_users VALUES
	    ('SYSTEM.OWNER', '{"recid":"SYSTEM.OWNER", "c1":"00000000000001", "c2":"SYSTEM.OWNER", "c3":"System Owner User", "c4":"20260101", "c5":"29991231", "c6":"00", "c7":"24", "c8":"KH0010001", "c9":["KH0010001", "KH0010002", "KH0010003"], "c10":"CORE.SYSTEM", "c11":"Active", "c12":"0"}', v_audit),
	    ('U2026001000001', '{"recid":"U2026001000001", "c1":"STAFFID-000001", "c2":"BRANCH.TELLER", "c3":"User Branch Teller", "c4":"20260101", "c5":"29991231", "c6":"00", "c7":"24", "c8":"KH0010001", "c9":[], "c10":"20260010001", "c11":"Active", "c12":"0"}', v_audit),
	    ('U2026001000002', '{"recid":"U2026001000002", "c1":"STAFFID-000002", "c2":"BRANCH.SUPERVISOR", "c3":"User Branch Supervisor", "c4":"20260101", "c5":"29991231", "c6":"00", "c7":"24", "c8":"KH0010001", "c9":[], "c10":"20260010001", "c11":"Active", "c12":"0"}', v_audit),
	    ('U2026001000003', '{"recid":"U2026001000003", "c1":"STAFFID-000003", "c2":"BRANCH.MANAGER", "c3":"User Branch Manager", "c4":"20260101", "c5":"29991231", "c6":"00", "c7":"24", "c8":"KH0010001", "c9":[], "c10":"20260010001", "c11":"Active", "c12":"0"}', v_audit);

	INSERT INTO sys_user_password VALUES
	    ('SYSTEM.OWNER', '{"recid":"SYSTEM.OWNER", "c1":"00000000000001", "c2":"20260101000001", "c3":"123456789"}', v_audit),
	    ('U2026001000001', '{"recid":"U2026001000001", "c1":"STAFFID-000001", "c2":"20260101000001", "c3":"123456789"}', v_audit),
	    ('U2026001000002', '{"recid":"U2026001000002", "c1":"STAFFID-000002", "c2":"20260101000001", "c3":"123456789"}', v_audit),
	    ('U2026001000003', '{"recid":"U2026001000003", "c1":"STAFFID-000003", "c2":"20260101000001", "c3":"123456789"}', v_audit);





	DROP VIEW IF EXISTS vw_sys_user_password;
	CREATE OR REPLACE VIEW vw_sys_user_password AS
	SELECT
		recid AS id_item,
		COALESCE(json_data->>'c2', '') AS date_change,
		COALESCE(json_data->>'c3', '') AS user_password
	FROM sys_user_password;


	DROP VIEW IF EXISTS vw_sys_eblookup;
	CREATE OR REPLACE VIEW vw_sys_eblookup AS
	SELECT
		recid AS id_item,
		COALESCE(json_data->>'c1', '') AS item_link,
		COALESCE(json_data->>'c2', '') AS item_narrative,
		COALESCE(json_data->>'c3', '') AS enable_status
	FROM sys_eb_lookup;
	
	
	DROP VIEW IF EXISTS vw_sys_modules;
	CREATE OR REPLACE VIEW vw_sys_modules AS
	SELECT
		recid AS id_module,
		COALESCE(json_data->>'c1', '') AS full_name,
		COALESCE(json_data->>'c2', '') AS base_url,
		COALESCE(json_data->>'c3', '') AS enable_status
	FROM sys_modules;
	
	
	DROP VIEW IF EXISTS vw_sys_applications;
	CREATE OR REPLACE VIEW vw_sys_applications AS
	SELECT
		m.id_module,
		m.full_name AS module_full_name,

		a.recid                          AS id_application,
		COALESCE(a.json_data->>'c2', '') AS full_name,
		CASE a.json_data->>'c3'
			WHEN NULL THEN ''
			ELSE m.base_url || COALESCE(a.json_data->>'c3', '')
		END                              AS base_url,
		COALESCE(a.json_data->>'c5', '') AS enable_status
	FROM sys_applications AS a
		INNER JOIN vw_sys_modules AS m ON COALESCE(a.json_data->>'c1', '') = m.id_module
	;


	DROP VIEW IF EXISTS vw_sys_application_permissions;
	CREATE OR REPLACE VIEW vw_sys_application_permissions AS
	SELECT
	    u.recid                                      AS id_application,
		COALESCE(u.json_data->>'c5', '')             AS application_status,
		COALESCE(split_part(it.id_item, '*', 2), '') AS id_permission,
	    it.item_narrative                            AS permission_name,
		it.enable_status                             AS permission_status
	FROM sys_applications AS u
		INNER JOIN LATERAL jsonb_array_elements_text(
		    CASE jsonb_typeof(u.json_data->'c4')
		        WHEN 'array'  THEN u.json_data->'c4'
		        WHEN 'string' THEN jsonb_build_array(u.json_data->>'c4')
		        ELSE '[]'::jsonb
		    END
		) AS p(id_permission) ON true
		INNER JOIN vw_sys_eblookup AS it ON it.id_item = p.id_permission
	WHERE it.id_item ILIKE 'APP.PERM*%'
	ORDER BY u.recid, p.id_permission;
	
	
	DROP VIEW IF EXISTS vw_sys_privilges;
	CREATE OR REPLACE VIEW vw_sys_privilges AS
	SELECT
	    p.recid             AS id_privilege,
	    p.json_data->>'c1'  AS full_name,
	    p.json_data->>'c2'  AS module_status,
	    m.key               AS main_label,
	    a.key               AS id_application,
		a2.enable_status    AS applciation_status,
		a2.base_url         AS base_url,
	    a.value->>'label'   AS labels,
	    a.value->>'no_auth' AS no_auth
	FROM sys_privileges AS p
		CROSS JOIN LATERAL jsonb_each(p.json_data->'c3') AS m(key, value)
		CROSS JOIN LATERAL jsonb_each(m.value) AS a(key, value)
		INNER JOIN vw_sys_applications AS a2 ON a.key = a2.id_application
	;


	DROP VIEW IF EXISTS vw_sys_users;
	CREATE OR REPLACE VIEW vw_sys_users AS
	SELECT
		recid AS id_user,
		COALESCE(json_data->>'c1', '')  AS staff_id,
		COALESCE(json_data->>'c2', '')  AS signon_name,
		COALESCE(json_data->>'c3', '')  AS full_name,
		COALESCE(TO_CHAR((json_data->>'c4')::DATE, 'YYYY-MM-DD'), '') AS date_start,
		COALESCE(TO_CHAR((json_data->>'c5')::DATE, 'YYYY-MM-DD'), '') AS date_end,
		COALESCE(json_data->>'c6', '')  AS time_start,
		COALESCE(json_data->>'c7', '')  AS time_end,
		COALESCE(json_data->>'c8', '')  AS id_branch,
		COALESCE(json_data->>'c10', '') AS id_privilege,
		COALESCE(json_data->>'c11', '') AS user_status,
		COALESCE(json_data->>'c12', '') AS current_attempts
	FROM sys_users;


	DROP VIEW IF EXISTS vw_sys_useraccess_branch;
	CREATE OR REPLACE VIEW vw_sys_useraccess_branch AS
	SELECT u.recid AS id_user, COALESCE(br.value, u.json_data->>'c8')  AS branch_code
	FROM sys_users AS u
	LEFT JOIN LATERAL jsonb_array_elements_text(
	    CASE jsonb_typeof(u.json_data->'c9')
	        WHEN 'array' THEN u.json_data->'c9' ELSE '[]'::jsonb END
	) AS br(value) ON true
	WHERE br.value IS NOT NULL
	   OR NOT EXISTS (
	        SELECT 1
	        FROM jsonb_array_elements_text(
	            CASE jsonb_typeof(u.json_data->'c9')
	                WHEN 'array' THEN u.json_data->'c9' ELSE '[]'::jsonb END
	        )
	   )
	;



END $$;








SELECT
    m.recid,
    'INPUT'       AS input_type,
    m.json_audit->>'inputter' AS inputter,
    m.json_audit->>'datetime' AS datetime
FROM sys_modules AS m
UNION ALL
SELECT
    m.recid,
    'AUTHORISER'  AS input_type,
    a.value->>'inputter' AS inputter,
    a.value->>'datetime' AS datetime
FROM sys_modules AS m
CROSS JOIN LATERAL jsonb_array_elements(
    CASE jsonb_typeof(m.json_audit->'authorisers')
        WHEN 'array' THEN m.json_audit->'authorisers'
        ELSE '[]'::jsonb
    END
) AS a(value)

ORDER BY recid, input_type DESC, datetime;

