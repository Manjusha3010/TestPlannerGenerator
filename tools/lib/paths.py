from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def template_outline_path() -> Path:
    return repo_root() / "data" / "template_outline.json"


def tmp_dir() -> Path:
    d = repo_root() / ".tmp"
    d.mkdir(parents=True, exist_ok=True)
    return d
