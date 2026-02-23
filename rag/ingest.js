import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { supabase } from './supabase'
import { pipeline } from '@xenova/transformers'

const embedPipeline = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2',
  { quantized: true }
)

// helper function for breaking up text
function chunkText(text, chunkSize = 600, overlap = 100) {
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
  const vectors = []

  for (const t of texts) {
    const output = await embedPipeline(t, {
      pooling: 'mean',
      normalize: true,
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

//
async function ingestText(text, baseMetadata = {}) {
  const chunks = chunkText(text) // running the chunking function over the text

  console.log(`🔹 Chunked into ${chunks.length} pieces`) // gonna be an array of embedding objects

  console.log('🔹 Creating embeddings…')
  const vectors = await getEmbeddings(chunks) // embed them

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
      source: 'don_foley_cv',
    },
  }))

  console.log('🔹 Inserting into Supabase…')
  const { error } = await supabase.from('documents').insert(rows)

  if (error) {
    console.error('❌ Supabase insert error:', error)
    process.exit(1)
  }

  console.log(`✅ Successfully ingested ${chunks.length} chunks`)
}

async function main() {
  const filePath = path.resolve('./data/dad-cv.txt')

  // error handling
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    process.exit(1)
  }

  const cvText = fs.readFileSync(filePath, 'utf-8')
  await ingestText(cvText, { type: 'cv', person: 'Don Foley' })

  process.exit(0)
}
