# Front Office Atlas: run once; schedule this script with Windows Task Scheduler.
# Requires BDL_API_KEY in the task's environment; never hardcode secrets here.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
python (Join-Path $root 'src/atlas_demo.py') sync-bdl --days 1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
python (Join-Path $root 'src/atlas_demo.py') export --out (Join-Path $root 'exports')
exit $LASTEXITCODE
