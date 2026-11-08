"""Build this book from repository root, using the same shared assets as CI."""
import argparse
import shutil
import subprocess
from pathlib import Path

book=Path(__file__).resolve().parents[1]
repo=book.parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--mdbook',default='mdbook')
args=parser.parse_args()
created=[]
try:
    for name in ('giscus.js','book.css'):
        target=book/name
        if not target.exists():
            shutil.copyfile(repo/'theme'/name,target)
            created.append(target)
    subprocess.run([args.mdbook,'build','books/smartglasses','-d',str(repo/'public/smartglasses')],cwd=repo,check=True)
finally:
    for target in created:
        target.unlink()
