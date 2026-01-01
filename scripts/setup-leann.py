"""
LEANN Setup Script for Long Sang Portfolio
==========================================

This script sets up LEANN (Lightweight Embedding-Augmented Neural Networked Index)
for local, private vector search.

Usage:
  python scripts/setup-leann.py

Requirements:
  - Python 3.8+
  - pip or uv

Features:
  - 97% storage savings compared to traditional vector DBs
  - 100% local & private - no data leaves your machine
  - Fast graph-based vector search
  - Works offline
"""

import subprocess
import sys
import os

def check_python_version():
    """Check if Python version is 3.8+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True

def install_leann():
    """Install LEANN package"""
    print("\n📦 Installing LEANN...")
    try:
        # Try uv first (faster)
        result = subprocess.run(
            ["uv", "pip", "install", "leann"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("✅ LEANN installed via uv")
            return True
    except FileNotFoundError:
        pass

    # Fallback to pip
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "leann"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("✅ LEANN installed via pip")
            return True
        else:
            print(f"❌ pip install failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Installation failed: {e}")
        return False

def install_ollama_optional():
    """Optionally install ollama for local LLM"""
    print("\n🤖 Ollama (optional - for local LLM)")
    print("   Visit: https://ollama.ai/download")
    print("   After installing, run: ollama pull llama2")

def create_index_directory():
    """Create directory for LEANN indexes"""
    index_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "leann")
    os.makedirs(index_dir, exist_ok=True)
    print(f"\n📁 Created index directory: {index_dir}")
    return index_dir

def verify_installation():
    """Verify LEANN is installed correctly"""
    print("\n🔍 Verifying LEANN installation...")
    try:
        import leann
        print(f"✅ LEANN version: {getattr(leann, '__version__', 'unknown')}")
        return True
    except ImportError:
        print("❌ LEANN not found. Please install manually: pip install leann")
        return False

def create_sample_index():
    """Create a sample LEANN index with Long Sang data"""
    print("\n📚 Creating sample index...")
    try:
        from leann import VectorIndex

        index_dir = create_index_directory()
        index_path = os.path.join(index_dir, "long-sang-brain")

        # Sample documents about Long Sang
        documents = [
            "Long Sang specializes in commercial cooking oil distribution in Vietnam.",
            "Our cooking oil products include soybean oil, palm oil, and sunflower oil.",
            "Long Sang serves restaurants, hotels, and food manufacturers.",
            "We offer competitive pricing and reliable delivery across Vietnam.",
            "Contact Long Sang for bulk cooking oil orders.",
            "Long Sang Academy provides professional culinary training.",
            "Our investment opportunities focus on sustainable food industry growth.",
        ]

        # Create index
        index = VectorIndex()
        for i, doc in enumerate(documents):
            index.add(doc, metadata={"id": i, "source": "sample"})

        # Save index
        index.save(index_path)
        print(f"✅ Sample index created at: {index_path}")
        print(f"   Documents: {len(documents)}")

        # Test search
        results = index.search("cooking oil products", top_k=3)
        print(f"\n🔍 Test search for 'cooking oil products':")
        for i, result in enumerate(results):
            print(f"   {i+1}. {result.text[:50]}...")

        return True
    except Exception as e:
        print(f"⚠️ Sample index creation failed: {e}")
        print("   This is optional - LEANN is still installed.")
        return False

def update_env_file():
    """Update .env file with LEANN settings"""
    print("\n⚙️ Updating .env configuration...")
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

    if not os.path.exists(env_path):
        print("   .env file not found, skipping...")
        return

    with open(env_path, "r") as f:
        content = f.read()

    # Check if LEANN_ENABLED is already set
    if "LEANN_ENABLED=true" in content:
        print("   LEANN already enabled in .env")
        return

    # Enable LEANN
    content = content.replace("# LEANN_ENABLED=true", "LEANN_ENABLED=true")

    with open(env_path, "w") as f:
        f.write(content)

    print("✅ LEANN enabled in .env")

def main():
    print("=" * 50)
    print("🧠 LEANN Setup for Long Sang Portfolio")
    print("=" * 50)

    # Check Python version
    if not check_python_version():
        return 1

    # Install LEANN
    if not install_leann():
        return 1

    # Verify installation
    if not verify_installation():
        return 1

    # Create sample index
    create_sample_index()

    # Update .env
    update_env_file()

    # Optional info
    install_ollama_optional()

    print("\n" + "=" * 50)
    print("✅ LEANN Setup Complete!")
    print("=" * 50)
    print("""
Next steps:
1. Restart the API server: npm run dev
2. Check LEANN status: GET /api/brain/leann/status
3. Add your data: POST /api/brain/leann/add
4. Search locally: POST /api/brain/leann/search
5. Use hybrid mode: POST /api/brain/hybrid/chat

For more info: https://github.com/yichuan-w/LEANN
    """)

    return 0

if __name__ == "__main__":
    sys.exit(main())
