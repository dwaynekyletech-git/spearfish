import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function tryLoadDotEnv(rootDir) {
  const envPath = path.join(rootDir, '.env')
  try {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      // Strip inline comments
      const hashIdx = val.indexOf('#')
      if (hashIdx !== -1) val = val.slice(0, hashIdx).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
        val = val.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = val
    }
  } catch (_) {
    // ignore if .env not found
  }
}

function getEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable: ${name}`)
  return v
}

function pickKnownFields(rec) {
  const mapped = {
    yc_id: rec.id,
    name: rec.name ?? null,
    slug: rec.slug ?? null,
    former_names: Array.isArray(rec.former_names) ? rec.former_names : (rec.former_names ?? null),
    small_logo_thumb_url: rec.small_logo_thumb_url ?? null,
    website: rec.website ?? null,
    all_locations: Array.isArray(rec.all_locations) ? rec.all_locations.join('; ') : (rec.all_locations ?? null),
    long_description: rec.long_description ?? null,
    one_liner: rec.one_liner ?? null,
    team_size: Number.isFinite(rec.team_size) ? rec.team_size : null,
    industry: rec.industry ?? null,
    subindustry: rec.subindustry ?? null,
    launched_at: Number.isFinite(rec.launched_at) ? rec.launched_at : null,
    tags: Array.isArray(rec.tags) ? rec.tags : null,
    top_company: typeof rec.top_company === 'boolean' ? rec.top_company : false,
    is_hiring: typeof rec.isHiring === 'boolean' ? rec.isHiring : (typeof rec.is_hiring === 'boolean' ? rec.is_hiring : false),
    nonprofit: typeof rec.nonprofit === 'boolean' ? rec.nonprofit : false,
    batch: rec.batch ?? null,
    status: rec.status ?? null,
    industries: Array.isArray(rec.industries) ? rec.industries : null,
    regions: Array.isArray(rec.regions) ? rec.regions : null,
    stage: rec.stage ?? null,
    app_video_public: typeof rec.app_video_public === 'boolean' ? rec.app_video_public : false,
    demo_day_video_public: typeof rec.demo_day_video_public === 'boolean' ? rec.demo_day_video_public : false,
    app_answers: buildAppAnswers(rec),
    question_answers: typeof rec.question_answers === 'boolean' ? rec.question_answers : (typeof rec.question_answers === 'string' ? rec.question_answers === 'true' : false),
    url: rec.url ?? null,
    api: rec.api ?? null,
  }
  return mapped
}

function buildAppAnswers(rec) {
  const extra = {}
  if (rec.app_answers && typeof rec.app_answers === 'object') extra.app_answers = rec.app_answers
  if (rec.github && typeof rec.github === 'object') extra.github = rec.github
  if (rec.huggingface && typeof rec.huggingface === 'object') extra.huggingface = rec.huggingface
  return Object.keys(extra).length ? extra : null
}

async function loadJsonArray(filePath) {
  const raw = await fs.promises.readFile(filePath, 'utf8')
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) throw new Error('JSON root is not an array')
    return arr
  } catch (e) {
    throw new Error(`Failed to parse JSON file ${filePath}: ${e.message}`)
  }
}

function chunk(arr, size) {
  const res = []
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size))
  return res
}

async function main() {
  const args = process.argv.slice(2)
  const input = args.find((a) => !a.startsWith('--'))
  const truncate = args.includes('--truncate')
  if (!input) {
    console.error('Usage: node scripts/import/import_yc_companies.mjs [--truncate] <path-to-json>')
    process.exit(1)
  }

  // Attempt to load .env from project root
  const projectRoot = path.resolve(__dirname, '../../')
  tryLoadDotEnv(projectRoot)

  const SUPABASE_URL = getEnv('VITE_SUPABASE_URL')
  const SERVICE_ROLE = getEnv('SUPABASE_SERVICE_ROLE_KEY')

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'spearfish-import-script' } },
  })

  const abs = path.isAbsolute(input) ? input : path.join(process.cwd(), input)
  console.log(`Reading: ${abs}`)
  const records = await loadJsonArray(abs)
  console.log(`Total records: ${records.length}`)

  // Filter: keep Active + Hiring + industry in curated set
  const techIndustries = new Set([
    'B2B',
    'Engineering, Product and Design',
    'Developer Tools',
    'Infrastructure',
    'SaaS',
    'AI',
    'Security',
    'Data',
    'Cloud',
    'Dev Tools',
    'Fintech',
  ])
  const filtered = records.filter((rec) => {
    const statusOk = (rec.status || '').toLowerCase() === 'active'
    const hiringOk = !!(rec.isHiring === true || rec.is_hiring === true)
    const inds = Array.isArray(rec.industries) ? rec.industries : (rec.industry ? [rec.industry] : [])
    const industryOk = inds.some((v) => techIndustries.has(v))
    return statusOk && hiringOk && industryOk
  })
  console.log(`Filtered records: ${filtered.length}`)

  // Map and filter valid records
  const mapped = filtered.map(pickKnownFields).filter(r => r.yc_id && r.name)
  // Deduplicate by yc_id to avoid ON CONFLICT multiple updates in same statement
  const byYcId = new Map()
  for (const rec of mapped) byYcId.set(rec.yc_id, rec)
  const unique = Array.from(byYcId.values())
  console.log(`Prepared records: ${mapped.length} | Unique by yc_id: ${unique.length}`)

  if (truncate) {
    console.log('Truncating companies table (deleting all rows)...')
    // Use created_at to target all rows reliably
    const { error: delErr } = await supabase.from('companies').delete().gt('created_at', '1970-01-01')
    if (delErr) {
      console.error('Failed to delete existing rows:', delErr.message)
      process.exit(1)
    }
  }

  let inserted = 0
  const batches = chunk(unique, 500)
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    const { error } = await supabase
      .from('companies')
      .upsert(batch, { onConflict: 'yc_id' })
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error(`Batch ${i + 1}/${batches.length} failed:`, error.message)
      process.exitCode = 1
      // Continue to next batch to try best-effort import
      continue
    }
    inserted += batch.length
    if ((i + 1) % 5 === 0 || i === batches.length - 1) {
      console.log(`Upserted ${inserted}/${unique.length} so far... (batch ${i + 1}/${batches.length})`)
    }
  }

  console.log(`Done. Imported ${inserted} filtered records.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})