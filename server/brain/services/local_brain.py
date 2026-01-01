"""
Local Vector Brain Service (HNSWLIB + SentenceTransformers)
===========================================================

Alternative to LEANN for local, private vector search.
Uses hnswlib for fast approximate nearest neighbor search.

Features:
- 100% local and private
- No API costs for search
- Fast sentence embeddings
- Persistent indexes

Usage:
    from local_brain import LocalBrain

    brain = LocalBrain()
    brain.add("Long Sang specializes in cooking oil distribution")
    results = brain.search("cooking oil")
"""

import json
import os
import pickle
import sys
from pathlib import Path
from typing import Any

import hnswlib
import numpy as np

# Try to import sentence-transformers for embeddings
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
    print("Warning: sentence-transformers not installed. Using simple hash embeddings.")


class LocalBrain:
    """Local vector brain using hnswlib for similarity search."""

    def __init__(
        self,
        index_path: str = None,
        model_name: str = "all-MiniLM-L6-v2",  # Small, fast model (384 dim)
        dim: int = 384,
        max_elements: int = 100000,
    ):
        self.index_path = Path(index_path) if index_path else Path.cwd() / ".leann" / "indexes"
        self.index_path.mkdir(parents=True, exist_ok=True)

        self.model_name = model_name
        self.dim = dim
        self.max_elements = max_elements

        # Initialize embedding model
        if HAS_SENTENCE_TRANSFORMERS:
            print(f"Loading embedding model: {model_name}...")
            self.model = SentenceTransformer(model_name)
            self.dim = self.model.get_sentence_embedding_dimension()
        else:
            self.model = None

        # Storage for documents and metadata
        self.documents = []
        self.metadata_list = []

        # HNSW index
        self.index = None
        self._init_index()

    def _init_index(self):
        """Initialize HNSW index."""
        self.index = hnswlib.Index(space="cosine", dim=self.dim)
        self.index.init_index(max_elements=self.max_elements, ef_construction=200, M=16)
        self.index.set_ef(50)  # ef should always be > k (number of results)

    def _get_embedding(self, text: str) -> np.ndarray:
        """Get embedding for text."""
        if self.model:
            return self.model.encode(text, normalize_embeddings=True)
        else:
            # Fallback: simple hash-based embedding (not recommended)
            import hashlib
            h = hashlib.sha256(text.encode()).digest()
            return np.frombuffer(h + h * (self.dim // 32), dtype=np.float32)[:self.dim]

    def add(self, text: str, metadata: dict[str, Any] = None) -> int:
        """Add a document to the index."""
        embedding = self._get_embedding(text)
        doc_id = len(self.documents)

        self.documents.append(text)
        self.metadata_list.append(metadata or {})

        self.index.add_items([embedding], [doc_id])

        return doc_id

    def add_batch(self, texts: list[str], metadata_list: list[dict[str, Any]] = None) -> list[int]:
        """Add multiple documents at once (faster)."""
        if metadata_list is None:
            metadata_list = [{}] * len(texts)

        embeddings = []
        doc_ids = []

        for i, (text, meta) in enumerate(zip(texts, metadata_list)):
            embedding = self._get_embedding(text)
            doc_id = len(self.documents)

            self.documents.append(text)
            self.metadata_list.append(meta)

            embeddings.append(embedding)
            doc_ids.append(doc_id)

        self.index.add_items(embeddings, doc_ids)

        return doc_ids

    def search(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        """Search for similar documents."""
        if len(self.documents) == 0:
            return []

        embedding = self._get_embedding(query)

        # Ensure k doesn't exceed number of documents
        k = min(top_k, len(self.documents))

        labels, distances = self.index.knn_query([embedding], k=k)

        results = []
        for idx, dist in zip(labels[0], distances[0]):
            if idx < len(self.documents):
                results.append({
                    "content": self.documents[idx],
                    "similarity": float(1 - dist),  # Convert to Python float
                    "metadata": self.metadata_list[idx],
                    "id": int(idx)
                })

        return results

    def save(self, name: str = "default"):
        """Save index and documents to disk."""
        save_path = self.index_path / name
        save_path.mkdir(parents=True, exist_ok=True)

        # Save HNSW index
        self.index.save_index(str(save_path / "index.bin"))

        # Save documents and metadata
        with open(save_path / "data.pkl", "wb") as f:
            pickle.dump({
                "documents": self.documents,
                "metadata": self.metadata_list,
                "dim": self.dim,
                "model_name": self.model_name
            }, f)

        print(f"Index saved to {save_path}")
        return str(save_path)

    def load(self, name: str = "default"):
        """Load index and documents from disk."""
        load_path = self.index_path / name

        if not load_path.exists():
            raise FileNotFoundError(f"Index not found: {load_path}")

        # Load documents and metadata
        with open(load_path / "data.pkl", "rb") as f:
            data = pickle.load(f)
            self.documents = data["documents"]
            self.metadata_list = data["metadata"]
            self.dim = data.get("dim", self.dim)

        # Reinitialize and load HNSW index
        self._init_index()
        self.index.load_index(str(load_path / "index.bin"), max_elements=self.max_elements)

        print(f"Index loaded from {load_path} ({len(self.documents)} documents)")
        return len(self.documents)

    def list_indexes(self) -> list[dict[str, Any]]:
        """List all saved indexes."""
        indexes = []
        for p in self.index_path.iterdir():
            if p.is_dir() and (p / "index.bin").exists():
                data_file = p / "data.pkl"
                doc_count = 0
                if data_file.exists():
                    with open(data_file, "rb") as f:
                        data = pickle.load(f)
                        doc_count = len(data.get("documents", []))

                indexes.append({
                    "name": p.name,
                    "path": str(p),
                    "documents": doc_count,
                    "size": sum(f.stat().st_size for f in p.iterdir() if f.is_file())
                })

        return indexes

    def clear(self):
        """Clear the index."""
        self.documents = []
        self.metadata_list = []
        self._init_index()

    def stats(self) -> dict[str, Any]:
        """Get index statistics."""
        return {
            "documents": len(self.documents),
            "dimension": self.dim,
            "model": self.model_name,
            "index_path": str(self.index_path),
            "has_sentence_transformers": HAS_SENTENCE_TRANSFORMERS
        }


# CLI interface
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Local Vector Brain CLI")
    parser.add_argument("command", choices=["init", "add", "search", "list", "stats"])
    parser.add_argument("--index", "-i", default="default", help="Index name")
    parser.add_argument("--text", "-t", help="Text to add or search")
    parser.add_argument("--metadata", "-m", help="JSON metadata for add")
    parser.add_argument("--top-k", "-k", type=int, default=5, help="Number of results")
    parser.add_argument("--path", "-p", help="Index storage path")

    args = parser.parse_args()

    brain = LocalBrain(index_path=args.path)

    if args.command == "init":
        # Create a new index with sample data
        brain.add("Long Sang specializes in commercial cooking oil distribution in Vietnam.")
        brain.add("Our cooking oil products include soybean oil, palm oil, and sunflower oil.")
        brain.add("Long Sang serves restaurants, hotels, and food manufacturers.")
        brain.add("We offer competitive pricing and reliable delivery across Vietnam.")
        brain.add("Contact Long Sang for bulk cooking oil orders.")
        brain.add("Long Sang Academy provides professional culinary training.")
        brain.add("Our investment opportunities focus on sustainable food industry growth.")
        brain.save(args.index)
        print(json.dumps({"success": True, "documents": len(brain.documents)}))

    elif args.command == "add":
        if not args.text:
            print(json.dumps({"error": "Text required for add command"}))
            sys.exit(1)

        try:
            brain.load(args.index)
        except FileNotFoundError:
            pass  # New index

        metadata = json.loads(args.metadata) if args.metadata else {}
        doc_id = brain.add(args.text, metadata)
        brain.save(args.index)
        print(json.dumps({"success": True, "id": doc_id}))

    elif args.command == "search":
        if not args.text:
            print(json.dumps({"error": "Text required for search command"}))
            sys.exit(1)

        try:
            brain.load(args.index)
            results = brain.search(args.text, top_k=args.top_k)
            print(json.dumps({"success": True, "results": results}))
        except FileNotFoundError:
            print(json.dumps({"error": f"Index not found: {args.index}"}))
            sys.exit(1)

    elif args.command == "list":
        indexes = brain.list_indexes()
        print(json.dumps({"success": True, "indexes": indexes}))

    elif args.command == "stats":
        try:
            brain.load(args.index)
            print(json.dumps({"success": True, **brain.stats()}))
        except FileNotFoundError:
            print(json.dumps({"success": True, **brain.stats(), "loaded": False}))
