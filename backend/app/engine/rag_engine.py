import os
import re
from typing import Dict, Any, List, Optional
from pathlib import Path
from pypdf import PdfReader
from app.core.security import isolate_document_context

class DocumentChunk:
    def __init__(self, doc_id: str, doc_name: str, chunk_id: int, content: str):
        self.doc_id = doc_id
        self.doc_name = doc_name
        self.chunk_id = chunk_id
        self.content = content.strip()

class RAGEngine:
    """
    RAG Engine for Business Documentation.
    Provides document ingestion, chunking, keyword-density retrieval,
    and strict prompt-injection isolation wrappers.
    """

    def __init__(self):
        self.chunks: List[DocumentChunk] = []

    def index_text_document(self, doc_id: str, doc_name: str, text: str, chunk_size: int = 500, overlap: int = 100):
        words = text.split()
        chunk_idx = 0
        i = 0
        while i < len(words):
            chunk_words = words[i:i + chunk_size]
            chunk_text = " ".join(chunk_words)
            self.chunks.append(DocumentChunk(doc_id, doc_name, chunk_idx, chunk_text))
            chunk_idx += 1
            i += (chunk_size - overlap)

    def index_file(self, doc_id: str, file_path: str) -> int:
        p = Path(file_path)
        doc_name = p.name
        text = ""
        if p.suffix.lower() == ".pdf":
            try:
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text += (page.extract_text() or "") + "\n"
            except Exception as e:
                text = f"Error reading PDF: {e}"
        else:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

        before_count = len(self.chunks)
        self.index_text_document(doc_id, doc_name, text)
        return len(self.chunks) - before_count

    def search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Keyword-weighted retrieval across indexed chunks."""
        if not self.chunks:
            return []

        query_terms = set(re.findall(r'\w+', query.lower()))
        scored = []
        for chunk in self.chunks:
            chunk_terms = re.findall(r'\w+', chunk.content.lower())
            overlap = sum(1 for term in query_terms if term in chunk_terms)
            if overlap > 0:
                score = overlap / (math_len := max(len(chunk_terms), 1)) * 100
                # Extra boost for exact phrase match
                if query.lower() in chunk.content.lower():
                    score += 50
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scored[:top_k]:
            results.append({
                "doc_id": chunk.doc_id,
                "doc_name": chunk.doc_name,
                "chunk_id": chunk.chunk_id,
                "score": round(score, 2),
                "content": chunk.content,
                "safe_context": isolate_document_context(chunk.content, chunk.doc_name)
            })
        return results

# Shared RAG instance
rag_engine = RAGEngine()
