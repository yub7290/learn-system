#!/usr/bin/env python3
"""Generate study card mapper XML files."""
import os

BASE = "d:/code/IdeaProjects/learn-system/yub-edu/yub-edu-biz/src/main/resources/mapper/edu"

def w(name, content):
    path = os.path.join(BASE, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Created {name}")

print("Script ready")
