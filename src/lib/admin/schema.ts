/**
 * The database the admin panel and the website run on.
 *
 * This is the schema of the live www.valunxt.com database (the phpMyAdmin dump
 * imported on 2026-09-16), table for table and column for
 * column: the `vx_*` website CMS and the `pa_*` client portal. It is the
 * foundation — the tables the Next.js build created for itself before the
 * import (`users`, `enquiries`, `pages`, `seo_settings`, `blog_posts`) were
 * folded into their `vx_*` equivalents and retired (scripts/import-valunxt-db.mjs).
 *
 * Two things differ from the dump, both deliberately:
 *
 * 1. COLLATION. The dump's `vx_*` tables use utf8mb4_uca1400_ai_ci, which only
 *    exists on MariaDB 10.10+. A fresh install here uses utf8mb4_unicode_ci —
 *    the collation the dump's own `pa_*` tables already use — so the schema
 *    creates on MariaDB 10.4 (XAMPP), MariaDB 11 (Hostinger) and MySQL 8 alike.
 *    An imported database keeps whatever collation it arrived with.
 *
 * 2. ADDITIVE COLUMNS (EXTENSIONS below). Where a project table was folded into
 *    a `vx_*` table, the `vx_*` table gained the columns needed to hold what the
 *    project table carried, and nothing was renamed or removed. They are
 *    applied idempotently on every start, so an imported database upgrades in
 *    place and a fresh one matches it.
 *
 * Plain strings with no imports, so the import script and the panel can share
 * one definition of what "the schema" is.
 */

const T = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

/** Every table, in dependency order (a table follows the tables it references). */
export const SCHEMA_TABLES: Array<[name: string, ddl: string]> = [
  /* ---- Website CMS (vx_*) ---------------------------------------------- */
  [
    'vx_users',
    `CREATE TABLE IF NOT EXISTS vx_users (
      id int(11) NOT NULL AUTO_INCREMENT,
      email varchar(190) NOT NULL,
      pass_hash varchar(255) NOT NULL,
      name varchar(120) NOT NULL DEFAULT 'Admin',
      role varchar(30) NOT NULL DEFAULT 'admin',
      last_login datetime DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY email (email)
    ) ${T}`,
  ],
  [
    'vx_authors',
    `CREATE TABLE IF NOT EXISTS vx_authors (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(120) NOT NULL,
      slug varchar(140) NOT NULL,
      title varchar(160) DEFAULT NULL,
      bio text DEFAULT NULL,
      avatar varchar(255) DEFAULT NULL,
      email varchar(190) DEFAULT NULL,
      linkedin varchar(255) DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY slug (slug)
    ) ${T}`,
  ],
  [
    'vx_posts',
    `CREATE TABLE IF NOT EXISTS vx_posts (
      id int(11) NOT NULL AUTO_INCREMENT,
      slug varchar(190) NOT NULL,
      title varchar(255) NOT NULL,
      excerpt text DEFAULT NULL,
      body_html mediumtext DEFAULT NULL,
      cover varchar(255) DEFAULT NULL,
      cover_alt varchar(255) DEFAULT NULL,
      cat varchar(80) NOT NULL DEFAULT 'Insights',
      tags varchar(500) DEFAULT NULL,
      status varchar(20) NOT NULL DEFAULT 'draft',
      in_sitemap tinyint(1) NOT NULL DEFAULT 1,
      featured tinyint(1) NOT NULL DEFAULT 0,
      seo_score tinyint(3) unsigned NOT NULL DEFAULT 0,
      meta_title varchar(255) DEFAULT NULL,
      meta_desc varchar(320) DEFAULT NULL,
      keywords varchar(500) DEFAULT NULL,
      focus_kw varchar(190) DEFAULT NULL,
      schema_type varchar(40) NOT NULL DEFAULT 'BlogPosting',
      faq_json mediumtext DEFAULT NULL,
      schema_jsonld mediumtext DEFAULT NULL,
      og_image varchar(255) DEFAULT NULL,
      og_title varchar(255) DEFAULT NULL,
      og_desc varchar(320) DEFAULT NULL,
      tw_card varchar(30) NOT NULL DEFAULT 'summary_large_image',
      tw_title varchar(255) DEFAULT NULL,
      tw_desc varchar(320) DEFAULT NULL,
      tw_image varchar(255) DEFAULT NULL,
      canonical varchar(255) DEFAULT NULL,
      robots varchar(60) DEFAULT NULL,
      author varchar(120) NOT NULL DEFAULT 'Valunxt',
      author_id int(11) DEFAULT NULL,
      read_mins tinyint(3) unsigned NOT NULL DEFAULT 5,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      published_at datetime DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY slug (slug)
    ) ${T}`,
  ],
  [
    'vx_leads',
    `CREATE TABLE IF NOT EXISTS vx_leads (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(190) NOT NULL,
      email varchar(190) NOT NULL,
      phone varchar(60) DEFAULT NULL,
      company varchar(190) DEFAULT NULL,
      service varchar(190) DEFAULT NULL,
      message text DEFAULT NULL,
      page varchar(255) DEFAULT NULL,
      ip varchar(45) DEFAULT NULL,
      country varchar(80) DEFAULT NULL,
      ua varchar(255) DEFAULT NULL,
      status varchar(20) NOT NULL DEFAULT 'new',
      score tinyint(3) unsigned NOT NULL DEFAULT 0,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_status (status),
      KEY idx_created (created_at)
    ) ${T}`,
  ],
  [
    'vx_lead_notes',
    `CREATE TABLE IF NOT EXISTS vx_lead_notes (
      id int(11) NOT NULL AUTO_INCREMENT,
      lead_id int(11) NOT NULL,
      note text NOT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_lead (lead_id)
    ) ${T}`,
  ],
  [
    'vx_page_seo',
    `CREATE TABLE IF NOT EXISTS vx_page_seo (
      id int(11) NOT NULL AUTO_INCREMENT,
      rel_path varchar(255) NOT NULL,
      meta_title varchar(255) DEFAULT NULL,
      meta_desc varchar(320) DEFAULT NULL,
      canonical varchar(255) DEFAULT NULL,
      robots varchar(60) DEFAULT NULL,
      og_title varchar(255) DEFAULT NULL,
      og_desc varchar(320) DEFAULT NULL,
      og_image varchar(255) DEFAULT NULL,
      tw_title varchar(255) DEFAULT NULL,
      tw_desc varchar(320) DEFAULT NULL,
      tw_image varchar(255) DEFAULT NULL,
      focus_kw varchar(190) DEFAULT NULL,
      h1 varchar(255) DEFAULT NULL,
      schema_jsonld mediumtext DEFAULT NULL,
      faq_json mediumtext DEFAULT NULL,
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      updated_by varchar(120) DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY rel_path (rel_path)
    ) ${T}`,
  ],
  [
    'vx_redirects',
    `CREATE TABLE IF NOT EXISTS vx_redirects (
      id int(11) NOT NULL AUTO_INCREMENT,
      from_path varchar(255) NOT NULL,
      to_url varchar(255) NOT NULL,
      code smallint(6) NOT NULL DEFAULT 301,
      active tinyint(1) NOT NULL DEFAULT 1,
      note varchar(190) DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY from_path (from_path)
    ) ${T}`,
  ],
  [
    'vx_settings',
    `CREATE TABLE IF NOT EXISTS vx_settings (
      k varchar(80) NOT NULL,
      v text DEFAULT NULL,
      PRIMARY KEY (k)
    ) ${T}`,
  ],
  [
    'vx_sitemap_urls',
    `CREATE TABLE IF NOT EXISTS vx_sitemap_urls (
      url varchar(500) NOT NULL,
      file varchar(255) NOT NULL,
      title varchar(255) DEFAULT NULL,
      lastmod char(10) NOT NULL,
      changefreq varchar(10) NOT NULL,
      priority varchar(4) NOT NULL,
      PRIMARY KEY (url)
    ) ${T}`,
  ],
  [
    'vx_sitemap_runs',
    `CREATE TABLE IF NOT EXISTS vx_sitemap_runs (
      id int(11) NOT NULL AUTO_INCREMENT,
      ts datetime NOT NULL DEFAULT current_timestamp(),
      status varchar(10) NOT NULL,
      total_urls int(11) NOT NULL DEFAULT 0,
      added int(11) NOT NULL DEFAULT 0,
      removed int(11) NOT NULL DEFAULT 0,
      modified int(11) NOT NULL DEFAULT 0,
      changed tinyint(1) NOT NULL DEFAULT 0,
      duration_ms int(11) NOT NULL DEFAULT 0,
      error varchar(500) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_ts (ts)
    ) ${T}`,
  ],
  [
    'vx_keywords',
    `CREATE TABLE IF NOT EXISTS vx_keywords (
      id int(11) NOT NULL AUTO_INCREMENT,
      keyword varchar(190) NOT NULL,
      target_page varchar(255) DEFAULT NULL,
      found_on int(11) NOT NULL DEFAULT 0,
      in_titles int(11) NOT NULL DEFAULT 0,
      last_checked datetime DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY keyword (keyword)
    ) ${T}`,
  ],
  [
    'vx_seo_audits',
    `CREATE TABLE IF NOT EXISTS vx_seo_audits (
      id int(11) NOT NULL AUTO_INCREMENT,
      ts datetime NOT NULL DEFAULT current_timestamp(),
      pages int(11) NOT NULL DEFAULT 0,
      score tinyint(3) unsigned NOT NULL DEFAULT 0,
      report mediumtext DEFAULT NULL,
      PRIMARY KEY (id)
    ) ${T}`,
  ],
  [
    'vx_psi',
    `CREATE TABLE IF NOT EXISTS vx_psi (
      id int(11) NOT NULL AUTO_INCREMENT,
      ts datetime NOT NULL DEFAULT current_timestamp(),
      url varchar(255) NOT NULL,
      strategy varchar(10) NOT NULL,
      performance tinyint(3) unsigned DEFAULT NULL,
      seo tinyint(3) unsigned DEFAULT NULL,
      accessibility tinyint(3) unsigned DEFAULT NULL,
      best_practices tinyint(3) unsigned DEFAULT NULL,
      lcp_ms int(11) DEFAULT NULL,
      cls int(11) DEFAULT NULL,
      inp_ms int(11) DEFAULT NULL,
      fcp_ms int(11) DEFAULT NULL,
      tbt_ms int(11) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_url (url)
    ) ${T}`,
  ],
  [
    'vx_hits',
    `CREATE TABLE IF NOT EXISTS vx_hits (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      ts datetime NOT NULL DEFAULT current_timestamp(),
      sid char(24) NOT NULL,
      path varchar(255) NOT NULL,
      ref varchar(255) DEFAULT NULL,
      ref_host varchar(120) DEFAULT NULL,
      utm_source varchar(120) DEFAULT NULL,
      device varchar(20) DEFAULT NULL,
      browser varchar(20) DEFAULT NULL,
      os varchar(20) DEFAULT NULL,
      country varchar(80) DEFAULT NULL,
      city varchar(120) DEFAULT NULL,
      lang varchar(12) DEFAULT NULL,
      screen_w smallint(5) unsigned DEFAULT NULL,
      load_ms mediumint(8) unsigned DEFAULT NULL,
      is_bot tinyint(1) NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      KEY idx_ts (ts),
      KEY idx_sid (sid),
      KEY idx_path (path)
    ) ${T}`,
  ],
  [
    'vx_geo_cache',
    `CREATE TABLE IF NOT EXISTS vx_geo_cache (
      ip varchar(45) NOT NULL,
      country varchar(80) DEFAULT NULL,
      city varchar(120) DEFAULT NULL,
      ts datetime NOT NULL,
      PRIMARY KEY (ip)
    ) ${T}`,
  ],
  [
    'vx_security_events',
    `CREATE TABLE IF NOT EXISTS vx_security_events (
      id bigint(20) NOT NULL AUTO_INCREMENT,
      ts datetime NOT NULL,
      ip varchar(45) DEFAULT NULL,
      type varchar(40) NOT NULL,
      detail varchar(500) DEFAULT NULL,
      ua varchar(255) DEFAULT NULL,
      path varchar(255) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_ts (ts),
      KEY idx_type (type)
    ) ${T}`,
  ],
  [
    'vx_scans',
    `CREATE TABLE IF NOT EXISTS vx_scans (
      id int(11) NOT NULL AUTO_INCREMENT,
      ts datetime NOT NULL DEFAULT current_timestamp(),
      kind varchar(20) NOT NULL,
      files_scanned int(11) NOT NULL DEFAULT 0,
      issues_found int(11) NOT NULL DEFAULT 0,
      report mediumtext DEFAULT NULL,
      PRIMARY KEY (id)
    ) ${T}`,
  ],
  [
    'vx_file_hashes',
    `CREATE TABLE IF NOT EXISTS vx_file_hashes (
      path varchar(255) NOT NULL,
      hash char(64) NOT NULL,
      size int(10) unsigned NOT NULL,
      seen datetime NOT NULL,
      PRIMARY KEY (path)
    ) ${T}`,
  ],

  /* ---- Client portal (pa_*) -------------------------------------------- */
  [
    'pa_clients',
    `CREATE TABLE IF NOT EXISTS pa_clients (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      legal_name varchar(190) NOT NULL,
      trade_name varchar(190) DEFAULT NULL,
      entity_type enum('Mainland','Free Zone','Offshore') NOT NULL DEFAULT 'Mainland',
      free_zone_name varchar(190) DEFAULT NULL,
      trade_licence_no varchar(100) DEFAULT NULL,
      licence_issue_date date DEFAULT NULL,
      licence_expiry_date date DEFAULT NULL,
      incorporation_date date DEFAULT NULL,
      financial_year_end varchar(20) DEFAULT NULL,
      vat_trn varchar(30) DEFAULT NULL,
      vat_cycle enum('Monthly','Quarterly') DEFAULT NULL,
      ct_reg_no varchar(30) DEFAULT NULL,
      ct_status varchar(60) DEFAULT NULL,
      qfzp tinyint(1) NOT NULL DEFAULT 0,
      first_ct_period_start date DEFAULT NULL,
      first_ct_period_end date DEFAULT NULL,
      tier enum('Starter','Growth','CFO') NOT NULL DEFAULT 'Starter',
      monthly_fee decimal(10,2) NOT NULL DEFAULT 0.00,
      assigned_accountant_id int(10) unsigned DEFAULT NULL,
      onboarding_status enum('Invited','Details pending','Documents pending','Active') NOT NULL DEFAULT 'Invited',
      engagement_start date DEFAULT NULL,
      notes text DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_clients_accountant (assigned_accountant_id),
      KEY idx_clients_status (onboarding_status)
    ) ${T}`,
  ],
  [
    'pa_users',
    `CREATE TABLE IF NOT EXISTS pa_users (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      email varchar(190) NOT NULL,
      password_hash varchar(255) DEFAULT NULL,
      role enum('firm_admin','accountant','client') NOT NULL DEFAULT 'client',
      full_name varchar(190) NOT NULL,
      phone varchar(40) DEFAULT NULL,
      client_id int(10) unsigned DEFAULT NULL,
      status enum('invited','active','disabled') NOT NULL DEFAULT 'invited',
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email),
      KEY idx_users_client (client_id),
      CONSTRAINT fk_users_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_client_contacts',
    `CREATE TABLE IF NOT EXISTS pa_client_contacts (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned NOT NULL,
      name varchar(190) NOT NULL,
      email varchar(190) DEFAULT NULL,
      phone varchar(40) DEFAULT NULL,
      role_label varchar(100) DEFAULT NULL,
      is_primary tinyint(1) NOT NULL DEFAULT 0,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_contacts_client (client_id),
      CONSTRAINT fk_contacts_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_deadlines',
    `CREATE TABLE IF NOT EXISTS pa_deadlines (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned NOT NULL,
      type varchar(80) NOT NULL,
      period varchar(60) DEFAULT NULL,
      due_date date NOT NULL,
      status enum('pending','filed') NOT NULL DEFAULT 'pending',
      penalty_note varchar(255) DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_deadlines_client (client_id),
      KEY idx_deadlines_due (status, due_date),
      CONSTRAINT fk_deadlines_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_documents',
    `CREATE TABLE IF NOT EXISTS pa_documents (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned NOT NULL,
      file_name varchar(255) NOT NULL,
      stored_name varchar(100) NOT NULL,
      category enum('Bank Statement','Invoice','Contract','Payroll','Tax Return','Other') NOT NULL DEFAULT 'Other',
      period varchar(60) DEFAULT NULL,
      status enum('Requested','Uploaded','Reviewed','Shared') NOT NULL DEFAULT 'Uploaded',
      uploaded_by int(10) unsigned DEFAULT NULL,
      shared_with_client tinyint(1) NOT NULL DEFAULT 0,
      size_bytes int(10) unsigned NOT NULL DEFAULT 0,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_documents_client (client_id),
      KEY idx_documents_status (status),
      CONSTRAINT fk_documents_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_document_requests',
    `CREATE TABLE IF NOT EXISTS pa_document_requests (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned NOT NULL,
      title varchar(190) NOT NULL,
      category enum('Bank Statement','Invoice','Contract','Payroll','Tax Return','Other') NOT NULL DEFAULT 'Other',
      period varchar(60) DEFAULT NULL,
      due_date date DEFAULT NULL,
      note varchar(500) DEFAULT NULL,
      status enum('Open','Fulfilled','Cancelled') NOT NULL DEFAULT 'Open',
      fulfilled_document_id int(10) unsigned DEFAULT NULL,
      created_by int(10) unsigned DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_requests_client (client_id, status),
      KEY fk_requests_document (fulfilled_document_id),
      CONSTRAINT fk_requests_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE,
      CONSTRAINT fk_requests_document FOREIGN KEY (fulfilled_document_id) REFERENCES pa_documents (id) ON DELETE SET NULL
    ) ${T}`,
  ],
  [
    'pa_ledger_entries',
    `CREATE TABLE IF NOT EXISTS pa_ledger_entries (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned NOT NULL,
      entry_date date NOT NULL,
      description varchar(255) NOT NULL,
      category enum('Revenue','Expense','VAT Input','VAT Output','Payroll','Other') NOT NULL DEFAULT 'Other',
      debit decimal(12,2) NOT NULL DEFAULT 0.00,
      credit decimal(12,2) NOT NULL DEFAULT 0.00,
      vat_amount decimal(12,2) NOT NULL DEFAULT 0.00,
      document_id int(10) unsigned DEFAULT NULL,
      notes varchar(500) DEFAULT NULL,
      created_by int(10) unsigned DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      updated_at datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_ledger_client_date (client_id, entry_date),
      KEY fk_ledger_document (document_id),
      CONSTRAINT fk_ledger_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE,
      CONSTRAINT fk_ledger_document FOREIGN KEY (document_id) REFERENCES pa_documents (id) ON DELETE SET NULL
    ) ${T}`,
  ],
  [
    'pa_messages',
    `CREATE TABLE IF NOT EXISTS pa_messages (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned NOT NULL,
      sender_id int(10) unsigned NOT NULL,
      body text NOT NULL,
      attachment_stored_name varchar(100) DEFAULT NULL,
      attachment_name varchar(255) DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_messages_client (client_id, created_at),
      CONSTRAINT fk_messages_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_thread_reads',
    `CREATE TABLE IF NOT EXISTS pa_thread_reads (
      user_id int(10) unsigned NOT NULL,
      client_id int(10) unsigned NOT NULL,
      last_read_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (user_id, client_id),
      KEY fk_reads_client (client_id),
      CONSTRAINT fk_reads_client FOREIGN KEY (client_id) REFERENCES pa_clients (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_tokens',
    `CREATE TABLE IF NOT EXISTS pa_tokens (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      user_id int(10) unsigned NOT NULL,
      token_hash char(64) NOT NULL,
      type enum('invite','reset') NOT NULL,
      expires_at datetime NOT NULL,
      used_at datetime DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_tokens_hash (token_hash),
      KEY idx_tokens_user (user_id),
      CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES pa_users (id) ON DELETE CASCADE
    ) ${T}`,
  ],
  [
    'pa_login_attempts',
    `CREATE TABLE IF NOT EXISTS pa_login_attempts (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      ip varchar(45) NOT NULL,
      email varchar(190) NOT NULL,
      attempted_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_attempts_ip (ip, attempted_at),
      KEY idx_attempts_email (email, attempted_at)
    ) ${T}`,
  ],
  [
    'pa_activity_log',
    `CREATE TABLE IF NOT EXISTS pa_activity_log (
      id int(10) unsigned NOT NULL AUTO_INCREMENT,
      client_id int(10) unsigned DEFAULT NULL,
      actor_id int(10) unsigned DEFAULT NULL,
      event_type varchar(60) NOT NULL,
      detail varchar(500) DEFAULT NULL,
      created_at datetime NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY idx_activity_client (client_id, created_at),
      KEY idx_activity_time (created_at)
    ) ${T}`,
  ],
];

/**
 * Columns added to imported tables so they can hold what the retired project
 * tables carried. Additive only: nothing in the imported schema is renamed,
 * narrowed or removed. [table, column, definition]
 */
export const SCHEMA_EXTENSIONS: Array<[table: string, column: string, definition: string]> = [
  /* `pages` folded into vx_page_seo: the page registry and its sitemap settings. */
  ['vx_page_seo', 'title', "varchar(200) NOT NULL DEFAULT ''"],
  ['vx_page_seo', 'file_path', "varchar(255) NOT NULL DEFAULT ''"],
  ['vx_page_seo', 'keywords', 'varchar(500) DEFAULT NULL'],
  ['vx_page_seo', 'status', "varchar(20) NOT NULL DEFAULT 'published'"],
  ['vx_page_seo', 'in_sitemap', 'tinyint(1) NOT NULL DEFAULT 1'],
  ['vx_page_seo', 'priority', 'decimal(2,1) NOT NULL DEFAULT 0.5'],
  ['vx_page_seo', 'changefreq', "varchar(20) NOT NULL DEFAULT 'monthly'"],
  ['vx_page_seo', 'is_cms', 'tinyint(1) NOT NULL DEFAULT 0'],
  ['vx_page_seo', 'hero_image', "varchar(255) NOT NULL DEFAULT ''"],
  ['vx_page_seo', 'created_at', 'datetime DEFAULT NULL'],
  /* `blog_posts` folded into vx_posts: a per-post byline role, over the author's own title. */
  ['vx_posts', 'author_role', 'varchar(160) DEFAULT NULL'],
  /* `enquiries` folded into vx_leads: which website form a lead came through. */
  ['vx_leads', 'source', 'varchar(80) DEFAULT NULL'],
  /* `users` folded into vx_users: when an administrator account was created. */
  ['vx_users', 'created_at', 'datetime DEFAULT NULL'],
];

