import 'dotenv/config' // loads all the environemnt variables in
import fs from 'fs' // nodes built in file system module (used for checking a files existance or reading the file)
import path from 'path'
//import { supabase } from './supabase'
import { pipeline } from '@xenova/transformers' // gives us access to the hugging face transformer running locally in node
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
// okay so this is a local embeddings model lol meaning we arent calling a third party API to run our
const embedPipeline = await pipeline(
  'feature-extraction', // tells our transformers we want embeddings not text generation
  'Xenova/all-MiniLM-L6-v2', // hugging face model | produces 384 dimensional embeddings. The more numbers in the embeddings the semantic search gets better
  { quantized: true }
)

// helper function for breaking up text
function chunkText(text, chunkSize = 100, overlap = 20) {
  const words = text.split(' ')
  const chunks = []
  let i = 0
  while (i < words.length) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    chunks.push(chunk)
    i += chunkSize - overlap
  }
  return chunks
}

async function getEmbeddings(texts) {
  // takes the array of text chunks and process each chunk one at a time
  const vectors = []

  for (const t of texts) {
    const output = await embedPipeline(t, {
      pooling: 'mean', // pooling we are taking all the tokens for our embedding and averaging them to create and average embedding
      normalize: true, //
    })

    // Xenova returns a Float32Array in `data`
    const vector = Array.from(output.data)

    if (vector.length !== 384) {
      console.warn(`⚠️ Invalid vector length: ${vector.length}`)
    }

    vectors.push(vector)
  }

  return vectors
}

// cleaner function
function cleanText(text) {
  return text
    .replace(/\*\*/g, '') // remove bold markers
    .replace(/[\r\n]+/g, ' ') // replace newlines with space
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim()
}

//orchestration function
async function ingestText(text, baseMetadata = {}) {
  const chunks = chunkText(cleanText(text)) // running the chunking function over the text

  console.log(`🔹 Chunked into ${chunks.length} pieces`) // gonna be an array of embedding objects

  console.log('🔹 Creating embeddings…')
  const vectors = await getEmbeddings(chunks) // creates the embeddings for each chunk

  // Sanity check
  vectors.forEach((v, i) => {
    if (!v || v.length !== 384) {
      console.warn(`⚠️ Vector at index ${i} has invalid length: ${v?.length}`)
    }
  })

  console.log('✅ Embeddings created successfully')

  // Prepare rows for Supabase
  const rows = chunks.map((chunk, i) => ({
    content: chunk,
    embedding: vectors[i],
    metadata: {
      ...baseMetadata,
      chunk_index: i,
      chunk_count: chunks.length,
      source: 'matthew_profile',
    },
  }))

  console.log('🔹 Inserting into Supabase…')
  const { error } = await supabase.from('documents').insert(rows) // inserting the rows into supabase

  if (error) {
    console.error('❌ Supabase insert error:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully ingested ${chunks.length} chunks`)
}

async function main() {
  const filePath = path.resolve('./data/matthew.txt') // resolves abosolute file path

  // error handling
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  const cvText = fs.readFileSync(filePath, 'utf-8') // reading the entire file as astring
  await ingestText(cvText, { type: 'profile', person: 'Matthew Foley' }) // calls the pipeline on long string

  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Ingest failed:', err)
  process.exit(1)
})
