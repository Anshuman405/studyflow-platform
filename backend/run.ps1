# run.ps1
$env:ENCORE_POSTGRES_DSN = "postgresql://neondb_owner:npg_ZIYk7C9JDduO@ep-blue-pond-afadr79r-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require"
$env:ENCORE_DONT_USE_DOCKER = "1"
encore run
