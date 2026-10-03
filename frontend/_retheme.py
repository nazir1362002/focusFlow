from pathlib import Path

root = Path(r"F:/focusFlow/frontend")
files = list(root.glob("*.html"))
repls = [
    ("#38bdf8", "#0f766e"),
    ("#0ea5e9", "#0d9488"),
    ("#1e293b", "#ffffff"),
    ("#f1f5f9", "#12203a"),
    ("#cbd5e1", "#475569"),
    ("#94a3b8", "#64748b"),
    ("#334155", "#e2e8f0"),
    ("#0c4a6e", "#ccfbf1"),
    ("#7dd3fc", "#0f766e"),
    ("#14532d", "#dcfce7"),
    ("#86efac", "#166534"),
    ("#7f1d1d", "#fee2e2"),
]
for f in files:
    t = f.read_text(encoding="utf-8")
    orig = t
    for a, b in repls:
        t = t.replace(a, b)
    t = t.replace("color: #0f172a", "color: #ffffff")
    t = t.replace("color:#0f172a", "color:#ffffff")
    t = t.replace("background: #0f172a", "background: #f8fafc")
    t = t.replace("background:#0f172a", "background:#f8fafc")
    t = t.replace("#0f172a", "#12203a")
    if t != orig:
        f.write_text(t, encoding="utf-8")
        print("updated", f.name)
    else:
        print("unchanged", f.name)
