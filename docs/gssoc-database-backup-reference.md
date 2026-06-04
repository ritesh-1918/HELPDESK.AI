# GSSoC Database Backup Reference Manual

This guide covers database backup and restore procedures for HELPDESK.AI's Supabase-backed PostgreSQL database.

## Table of Contents

- [Overview](#overview)
- [Backup Methods](#backup-methods)
- [Restore Procedures](#restore-procedures)
- [Backup Schedule](#backup-schedule)
- [Security Considerations](#security-considerations)

---

## Overview

HELPDESK.AI uses Supabase (PostgreSQL) as its primary database. Backups are essential for:
- Disaster recovery
- Data migration between environments
- Compliance and audit requirements
- Development and testing with production-like data

## Backup Methods

### 1. Supabase Dashboard Backup

The simplest method for full database backups:

1. Navigate to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Database** → **Backups**
4. Click **Download** for the desired backup

### 2. pg_dump (Command Line)

For automated or scripted backups:

```bash
# Full database backup
pg_dump -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d_%H%M%S).dump

# Schema-only backup
pg_dump -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  -f schema_backup.sql

# Data-only backup
pg_dump -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  -f data_backup.sql
```

### 3. Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Create database dump
supabase db dump > backup.sql
```

## Restore Procedures

### Restore from pg_dump

```bash
pg_restore -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  backup.dump
```

### Restore from SQL

```bash
psql -h db.YOUR_PROJECT_REF.supabase.co \
  -U postgres \
  -d postgres \
  -f backup.sql
```

## Backup Schedule

Recommended backup frequency:

| Environment | Frequency | Retention |
|-------------|-----------|-----------|
| Production | Daily | 30 days |
| Staging | Weekly | 14 days |
| Development | On-demand | 7 days |

## Security Considerations

### Sensitive Data

- **Never** commit backup files to Git
- Encrypt backups before transferring
- Use `pg_dump` with `--no-owner` and `--no-acl` for portable backups
- Strip PII from development backups using the PII redaction utility

### Access Control

- Limit backup access to database administrators
- Use Supabase service role key (not anon key) for automated backups
- Rotate backup encryption keys quarterly

### Storage

- Store backups in encrypted cloud storage (S3, GCS)
- Set lifecycle policies for automatic cleanup
- Test restore procedures monthly

## Quick Reference

```bash
# Create backup
pg_dump $DATABASE_URL -F c -f backup.dump

# List backup contents
pg_restore -l backup.dump

# Restore specific table
pg_restore -d $DATABASE_URL -t tickets backup.dump

# Verify backup integrity
pg_restore --list backup.dump | head -20
```
